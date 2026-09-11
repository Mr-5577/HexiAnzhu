<!-- 目标成本执行分析 -->
<template>
    <div class="target-cost-execution-analysis-wrapper">
        <!-- 查询卡片 -->
        <BaseSearchCard>
            <template #form>
                <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="90px" class="search-form">
                    <el-form-item label="业务归属" prop="seg">
                        <el-select v-model="queryParams.seg" placeholder="请选择业务板块" :clearable="false"
                            style="width: 220px" @change="handleSegChange">
                            <el-option v-for="item in segEnum" :key="item.value" :label="item.label"
                                :value="item.value" />
                        </el-select>
                    </el-form-item>

                    <el-form-item label="项目名称" prop="projId">
                        <el-cascader ref="projectCascaderRef" v-model="queryParams.projId" :options="projectData"
                            :show-all-levels="false" :props="{
                                expandTrigger: 'hover',
                                emitPath: false,
                                checkStrictly: false,
                                value: 'orgId',
                                label: 'orgName',
                                children: 'children',
                            }" placeholder="请选择项目" style="width: 220px" :clearable="false" filterable
                            @change="handleProjectChange" />
                    </el-form-item>

                    <el-form-item label="产品业态" prop="prodIds">
                        <el-select v-model="queryParams.prodIds" placeholder="请选择产品业态" multiple collapse-tags clearable
                            style="width: 220px">
                            <el-option v-for="item in productOptions" :key="item.id" :label="item.prodName"
                                :value="item.id" />
                        </el-select>
                    </el-form-item>

                    <el-form-item label="目标成本版本" prop="costMid">
                        <!-- <el-select v-model="queryParams.costMid" placeholder="请选择版本" clearable style="width: 220px">
                            <el-option v-for="item in costVersionOptions" :key="item.id" :label="item.versionNo"
                                :value="item.id" />
                        </el-select> -->

                        <el-input v-model="queryParams.versionNo" placeholder="请选择版本" readonly style="width: 220px"
                            @click="handleChooseVersion">
                            <template #suffix>
                                <el-icon style="cursor: pointer;" v-if="queryParams.versionNo"
                                    @click.stop="clearVersion">
                                    <CircleClose />
                                </el-icon>
                            </template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </template>
            <template #actions>
                <el-button type="primary" @click="handleSearch" class="btn-search" :loading="submitLoading">
                    <el-icon>
                        <Search />
                    </el-icon>
                    搜索
                </el-button>
                <el-button @click="handleReset" class="btn-reset" :loading="submitLoading">
                    <el-icon>
                        <Refresh />
                    </el-icon>
                    重置
                </el-button>
                <el-button type="primary" :loading="exportLoading" @click="handleExport" class="btn-export" plain
                    :disabled="!menuStore.hasExactPermission(PERMISSIONS.EXEC_ANALYSIS_EXPORT)">
                    <el-icon>
                        <Download />
                    </el-icon>
                    导出
                </el-button>
            </template>
        </BaseSearchCard>

        <div class="content-placeholder">
            <div class="demo-controls">
                <span class="control-label">科目层级</span>
                <div class="level-btn-group">
                    <el-button size="small" :type="expandLevel === 999 ? 'primary' : ''"
                        @click="handleExpandLevel(999)">
                        全部展开
                    </el-button>
                    <el-button size="small" :type="expandLevel === 0 ? 'primary' : ''" @click="handleExpandLevel(0)">
                        全部收起
                    </el-button>
                    <el-button v-for="level in maxDepth" :key="level" size="small"
                        :type="expandLevel === level ? 'primary' : ''" @click="handleExpandLevel(level)">
                        {{ levelMap[level] || level + '级' }}
                    </el-button>
                </div>
            </div>

            <vxe-editable-table ref="vxeTableRef" v-model="tableData" :columns="columns" :rowKey="'id'"
                :loading="tableLoading" :treeConfig="treeConfig" :readonly="true" :pagination="false">
                <!-- 状态标签 -->
                <template #warn="{ row }">
                    <span class="status-dot" :style="{ backgroundColor: getEnumColor(warnEnum, row.warn) }"></span>
                </template>
            </vxe-editable-table>
        </div>
        <!-- 明细弹窗 -->
        <detail-dialog v-model="dialogVisible" :params="currentRow" />
        <!-- 选择目标成本版本 -->
        <ChooseCostMDialog v-model="costMDialogVisible" :projId="queryParams?.projId" @select="getSelectData" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { Search, Refresh, CircleClose } from '@element-plus/icons-vue'
import VxeEditableTable from '@/components/base/vxe-editable-table.vue'
import { projectAreaApi } from '@/api/cost/master-data/project-area-api'
import { reportManageApi } from '@/api/cost/contract-manage/report-manage-api'
import { productTypeApi } from '@/api/cost/master-data/product-type-api'
import { goalCostApi } from '@/api/cost/cost-setting/goal-cost-api'
import { formatPercent, formatThousandWithPlaces } from '@/utils/big-number'
import { ElMessage } from 'element-plus'
import { getEnumColor } from '@/utils/enum'
import DetailDialog from './detail-dialog.vue'
import ChooseCostMDialog from '@/components/business/choose-costM-dialog.vue'
import BaseSearchCard from "@/components/base/base-search-card.vue";
import { buildTreeFromList } from '../utils/target-cost-exec-analysis.ts'
import { calcMaxDepth, levelMap, warnEnum, segEnum } from '../utils/common.ts'
import { useMenuStore } from "@/stores/menu-store";
import { PERMISSIONS } from '@/constants/permission.ts'

defineOptions({ name: 'target-cost-execution-analysis' })

const menuStore = useMenuStore();

// ---------- 树形配置 ----------
const treeConfig = {
    childrenField: 'children',
    hasChildrenField: 'hasChildren',
    expandAll: false,
    accordion: false,
}

const queryParams = ref({
    seg: undefined,
    projId: undefined,
    projName: undefined,
    prodIds: [],
    costMid: undefined,
    versionNo: undefined,
})
const costMDialogVisible = ref(false)

const projectCascaderRef = ref()
const vxeTableRef = ref<InstanceType<typeof VxeEditableTable>>()
const projectOptions = ref([])
const productOptions = ref([])
const costVersionOptions = ref([])
const maxDepth = ref(0)
const expandLevel = ref(1)
const tableData = ref([])
const tableLoading = ref(false)
const submitLoading = ref(false)
const exportLoading = ref(false)
const dialogVisible = ref(false)
const currentRow = ref(null)

// ---------- 计算属性：根据板块过滤项目树 ----------
const projectData = computed(() => {
    const seg = queryParams.value.seg
    if (!seg) return []
    switch (seg) {
        // 全部取地产项目
        case 'ALL':
            return projectOptions.value.filter((item) => item.orgId === 2) || []
        // 地产项目
        case 'DC':
            return projectOptions.value.filter((item) => item.orgId === 2) || []
        // 建筑项目
        case 'JZ':
            return projectOptions.value.filter((item) => item.orgId === 7) || []
        default:
            return [];
    }
})

// ---------- 展开层级变更 ----------
const handleExpandLevel = (level: number) => {
    if (!vxeTableRef.value) return
    if (!tableData.value.length) {
        ElMessage.warning('暂无数据')
        return
    }
    expandLevel.value = level
    if (level === 999) {
        vxeTableRef.value.expandAll()
    } else if (level === 0) {
        vxeTableRef.value.collapseAll()
    } else {
        vxeTableRef.value.expandToLevel(level)
    }
}

// ---------- 更新最大深度 ----------
const updateMaxDepth = () => {
    const depth = calcMaxDepth(tableData.value)
    maxDepth.value = Math.max(0, depth)  // 确保非负
    // 如果当前选中的层级大于最大深度，修正为1
    if (expandLevel.value > maxDepth.value && maxDepth.value > 0) {
        expandLevel.value = 1
    } else if (maxDepth.value === 0) {
        expandLevel.value = 0
    }
}

const columns: any = [
    {
        prop: 'subCode',
        label: '科目编码',
        width: 90,
        fixed: 'left',
    },
    {
        prop: 'subName',
        label: '成本科目',
        width: 240,
        fixed: 'left',
        align: 'left',
        treeNode: true,
    },
    {
        prop: 'warn',
        label: '预警状态',
        width: 80,
        slots: { default: "warn" },
    },
    {
        label: '目标成本',
        children: [
            {
                prop: 'costAmt',
                label: '含税',
                minWidth: 100,
                formatter: (value) => formatThousandWithPlaces(value),
            },
            {
                prop: 'costExclAmt',
                label: '不含税',
                minWidth: 100,
                formatter: (value) => formatThousandWithPlaces(value),
            },
        ],
    },
    {
        label: '已发生',
        children: [
            {
                prop: 'dynAmt',
                label: '含税',
                minWidth: 100,
                formatter: (value) => formatThousandWithPlaces(value),
                clickable: true, // 点击单元格触发 onClick 事件
                onClick: (data) => {
                    console.log("点击了已发生数据:", data);
                    const { children, ...rest } = data
                    const newParams = {
                        ...queryParams.value,
                        ...rest,
                    }
                    currentRow.value = newParams
                    dialogVisible.value = true; // 打开弹窗
                },
            },
            {
                prop: 'dynExclAmt',
                label: '不含税',
                minWidth: 100,
                formatter: (value) => formatThousandWithPlaces(value),
            },
        ],
    },
    {
        label: '未发生',
        children: [
            {
                prop: 'notDynAmt',
                label: '含税',
                minWidth: 100,
                formatter: (value) => formatThousandWithPlaces(value)
            },
            {
                prop: 'notDynExclAmt',
                label: '不含税',
                minWidth: 100,
                formatter: (value) => formatThousandWithPlaces(value),
            },
        ],
    },
    {
        prop: 'occurRate',
        label: '发生率',
        width: 100,
        formatter: (value) => formatPercent(value, 2),
        headerTip: {
            icon: "QuestionFilled",
            content: "发生率=已发生不含税÷目标不含税",
            placement: "top",
        },
    },
]

// ---------- 获取项目数据 ----------
const getProjectOptions = async () => {
    try {
        const res = await projectAreaApi.getSegMguProjList()
        if (res.code === 200) {
            projectOptions.value = res.data || []
        }
    } catch (error) {
        console.error('获取项目列表失败:', error)
    }
}
// 获取项目产品类型
const getProductList = async (projId: number) => {
    if (!projId) return
    try {
        const res = await productTypeApi.getProductProjList({
            projId: projId,
            withDetail: true,
        });
        if (res.code === 200) {
            productOptions.value = res.data || [];
            // 默认全选
            queryParams.value.prodIds = productOptions.value.map(item => item.id)
        }
    } catch (error) {
        throw error;
    }
};
// --------- 获取目标成本版本列表 ----------
const getCostVersionList = async (projId: number) => {
    if (!projId) return
    try {
        const res = await goalCostApi.getProjectCostMList({ projId: projId });
        if (res.code === 200) {
            const costVerList = res.data || [];
            costVersionOptions.value = costVerList
            // 默认选中生效版本
            if (costVerList.length) {
                const enabledCostVer = costVerList.find(item => item.isEnabled)
                queryParams.value.costMid = enabledCostVer?.id
                queryParams.value.versionNo = enabledCostVer?.versionNo
            }
        }
    } catch (error) {
        throw error;
    }
};

// ---------- 递归查找树中第一个叶子节点（项目） ----------
const findFirstProjectId = (tree: any[]) => {
    if (!tree || tree.length === 0) return undefined
    for (const node of tree) {
        if (node.children && node.children.length > 0) {
            const found = findFirstProjectId(node.children)
            if (found) return found
        } else {
            return node
        }
    }
    return undefined
}

// ---------- 更新当前板块下的第一个项目 ----------
const updateFirstProject = async () => {
    const firstProj = findFirstProjectId(projectData.value)
    console.log("当前板块下的第一个项目:", firstProj)
    if (firstProj) {
        const { orgId, orgName } = firstProj
        queryParams.value.projId = orgId
        queryParams.value.projName = orgName
        // 查询项目下的产品类型
        await getProductList(orgId as number)
        // 查询项目下的目标成本版本
        await getCostVersionList(orgId as number)
    }
}

// ---------- 设置默认选中第一个板块和项目 ----------
const selectedDefaultSeg = async () => {
    if (segEnum.length) {
        const firstSeg = segEnum[0]
        if (firstSeg) {
            queryParams.value.seg = firstSeg.value
            // await updateFirstProject()
        }
    }
}

// ---------- 板块变更事件 ----------
const handleSegChange = async (val: number) => {
    queryParams.value.projId = undefined
    queryParams.value.projName = undefined
    // 清除产品业态和目标成本版本的选中值
    queryParams.value.prodIds = []
    productOptions.value = []
    queryParams.value.costMid = undefined
    queryParams.value.versionNo = undefined
    costVersionOptions.value = []

    // await updateFirstProject()
    await nextTick()
    handleSearch()
}
const handleProjectChange = async (val: number) => {
    if (val) {
        console.log("选中的项目ID:", val, projectCascaderRef.value.getCheckedNodes());
        const checkedNodes = projectCascaderRef.value.getCheckedNodes()
        if (checkedNodes.length) {
            const node = checkedNodes[0]
            queryParams.value.projName = node.label
        }
    }
    // 清除产品业态和目标成本版本的选中值
    queryParams.value.prodIds = []
    productOptions.value = []
    queryParams.value.costMid = undefined
    queryParams.value.versionNo = undefined
    costVersionOptions.value = []

    await getProductList(val)
    await getCostVersionList(val)
    await nextTick()
    handleSearch()
}

// ---------- 搜索 ----------
const handleSearch = () => {
    getDataList()
}

// ---------- 重置 ----------
const handleReset = async () => {
    Object.keys(queryParams.value).forEach((key) => {
        if (Array.isArray(queryParams.value[key])) {
            queryParams.value[key] = [];
        } else {
            queryParams.value[key] = undefined;
        }
    });
    await selectedDefaultSeg()
    handleSearch()
}
const handleExport = async () => {
    try {
        exportLoading.value = true;
        const { projName, ...rest } = queryParams.value
        const params = { ...rest, level: 99, isExport: true }
        const fileBlob = await reportManageApi.exportDynamicReport(params);
        if (!fileBlob || fileBlob.size === 0) {
            ElMessage.warning("导出文件为空，请检查数据");
        } else {
            ElMessage.success("导出成功！");
        }
    } catch (error) {
        console.error("导出失败:", error);
    } finally {
        exportLoading.value = false;
    }
}
// 获取列表数据
const getDataList = async () => {
    tableData.value = [];
    if (!queryParams.value.projId) {
        ElMessage.warning("请先选择项目");
        return
    }
    try {
        submitLoading.value = true;
        tableLoading.value = true;
        const { projName, ...rest } = queryParams.value
        const params = { ...rest, level: 99 }
        const res = await reportManageApi.getDynamicReport(params);
        if (res.code === 200) {
            const list = res.data || [];
            // 转换为树形结构
            const treeData = buildTreeFromList(list, 'subCode', 'children');
            tableData.value = treeData;

            // 数据加载完成后，计算深度并默认展开第1级
            await nextTick()
            updateMaxDepth()
            if (maxDepth.value > 0) {
                expandLevel.value = 1
                await nextTick()
                handleExpandLevel(1)
            }
        }
    } catch (error) {
        console.error("获取列表失败:", error);
    } finally {
        submitLoading.value = false;
        tableLoading.value = false;
    }
};
const handleChooseVersion = () => {
    if (!queryParams.value.projId) {
        ElMessage.warning("请先选择项目");
        return
    }
    costMDialogVisible.value = true
}
const clearVersion = () => {
    queryParams.value.costMid = undefined
    queryParams.value.versionNo = undefined
    // 关闭弹窗
    // costMDialogVisible.value = false;
};
const getSelectData = (data: any) => {
    console.log("选中的数据:", data);
    if (data && data.length) {
        const [firstData] = data
        queryParams.value.costMid = firstData?.id
        queryParams.value.versionNo = firstData?.versionNo
    }
}

onMounted(async () => {
    await getProjectOptions()
    await selectedDefaultSeg()
    await getDataList()
})
</script>

<style lang="scss" scoped>
.target-cost-execution-analysis-wrapper {
    height: 100%;
    min-height: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 15px 16px;
    box-sizing: border-box;
    background: #f5f7fa;
    overflow-y: auto;

    .content-placeholder {
        display: flex;
        flex-direction: column;
        flex: 1;
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        overflow: hidden;

        .status-dot {
            display: inline-block;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            flex-shrink: 0;
        }
    }

    .demo-controls {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-shrink: 0;
        padding: 15px 20px 0;
        background: #fafbfc;

        .control-label {
            font-size: 14px;
            font-weight: 500;
            color: #4a5568;
            white-space: nowrap;
            user-select: none;
        }

        .level-btn-group {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-wrap: wrap;
        }
    }
}
</style>