<!-- 目标成本执行分析 -->
<template>
    <div class="target-cost-execution-analysis-wrapper">
        <!-- 查询卡片 -->
        <div class="search-card">
            <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="90px" class="search-form">
                <el-form-item label="业务归属" prop="seg">
                    <el-select v-model="queryParams.seg" placeholder="请选择业务板块" :clearable="false" style="width: 150px"
                        @change="handleSegChange">
                        <el-option v-for="item in segOptions" :key="item.value" :label="item.label"
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
                        }" placeholder="请选择项目" style="width: 200px" :clearable="false" filterable
                        @change="handleProjectChange" />
                </el-form-item>

                <el-form-item label="产品业态" prop="prodIds">
                    <el-select v-model="queryParams.prodIds" placeholder="请选择产品业态" multiple collapse-tags clearable
                        style="width: 200px">
                        <el-option v-for="item in productOptions" :key="item.id" :label="item.prodName"
                            :value="item.id" />
                    </el-select>
                </el-form-item>

                <el-form-item label="目标成本版本" prop="costMid">
                    <el-select v-model="queryParams.costMid" placeholder="请选择版本" clearable style="width: 200px">
                        <el-option v-for="item in costVersionOptions" :key="item.id" :label="item.versionNo"
                            :value="item.id" />
                    </el-select>
                </el-form-item>

                <el-form-item class="action-buttons">
                    <el-button type="primary" @click="handleSearch" class="btn-search">
                        <el-icon>
                            <Search />
                        </el-icon>
                        搜索
                    </el-button>
                    <el-button @click="handleReset" class="btn-reset">
                        <el-icon>
                            <Refresh />
                        </el-icon>
                        重置
                    </el-button>
                    <el-button type="primary" :loading="exportLoading" @click="handleExport" class="btn-export" plain>
                        <el-icon>
                            <Download />
                        </el-icon>
                        导出
                    </el-button>
                </el-form-item>
            </el-form>
        </div>

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
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import VxeEditableTable from '@/components/base/vxe-editable-table.vue'
import { projectAreaApi } from '@/api/cost/master-data/project-area-api'
import { reportManageApi } from '@/api/cost/contract-manage/report-manage-api'
import { productTypeApi } from '@/api/cost/master-data/product-type-api'
import { goalCostApi } from '@/api/cost/cost-setting/goal-cost-api'
import { formatPercent, formatThousandWithPlaces } from '@/utils/big-number'
import { ElMessage } from 'element-plus'
import { buildTreeFromList, warnEnum } from './tree-helper'
import { getEnumColor } from '@/utils/enum'
import DetailDialog from './detail-dialog.vue'

defineOptions({ name: 'target-cost-execution-analysis' })

// ---------- 树形配置 ----------
const treeConfig = {
    childrenField: 'children',
    hasChildrenField: 'hasChildren',
    expandAll: false,
    accordion: false,
}
const levelMap: Record<number, string> = {
    1: '一级科目',
    2: '二级科目',
    3: '三级科目',
    4: '四级科目',
    5: '五级科目',
    6: '六级科目',
    7: '七级科目',
    8: '八级科目',
}

const queryParams = ref({
    seg: undefined,
    projId: undefined,
    projName: undefined,
    prodIds: [],
    costMid: undefined,
})

const projectCascaderRef = ref()
const vxeTableRef = ref<InstanceType<typeof VxeEditableTable>>()
const segOptions = ref([
    { value: 'ALL', label: '全部' },
    { value: 'DC', label: '地产' },
    { value: 'JZ', label: '建筑' },
])
const projectOptions = ref([])
const productOptions = ref([])
const costVersionOptions = ref([])
const maxDepth = ref(0)
const expandLevel = ref(1)
const tableData = ref([])
const tableLoading = ref(false)
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

// ---------- 计算树形数据最大深度 ----------
const calcMaxDepth = (data: any[], depth: number = 0): number => {
    if (!data || data.length === 0) return depth - 1
    let max = depth
    for (const node of data) {
        if (node.children && node.children.length > 0) {
            const childDepth = calcMaxDepth(node.children, depth + 1)
            max = Math.max(max, childDepth)
        }
    }
    return max
}

// ---------- 展开层级变更 ----------
const handleExpandLevel = (level: number) => {
    if (!vxeTableRef.value) return
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
        field: 'subCode',
        title: '科目编码',
        width: 90,
        fixed: 'left',
    },
    {
        field: 'subName',
        title: '成本科目',
        width: 240,
        fixed: 'left',
        align: 'left',
        treeNode: true,
    },
    {
        field: 'warn',
        title: '预警状态',
        width: 80,
        slots: { default: "warn" },
    },
    {
        title: '目标成本',
        children: [
            {
                field: 'costAmt',
                title: '含税',
                minWidth: 100,
                formatter: (value) => formatThousandWithPlaces(value),
            },
            {
                field: 'costExclAmt',
                title: '不含税',
                minWidth: 100,
                formatter: (value) => formatThousandWithPlaces(value),
            },
        ],
    },
    {
        title: '已发生',
        children: [
            {
                field: 'dynAmt',
                title: '含税',
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
                field: 'dynExclAmt',
                title: '不含税',
                minWidth: 100,
                formatter: (value) => formatThousandWithPlaces(value),
            },
        ],
    },
    {
        title: '未发生',
        children: [
            {
                field: 'notDynAmt',
                title: '含税',
                minWidth: 100,
                formatter: (value) => formatThousandWithPlaces(value)
            },
            {
                field: 'notDynExclAmt',
                title: '不含税',
                minWidth: 100,
                formatter: (value) => formatThousandWithPlaces(value),
            },
        ],
    },
    {
        field: 'occurRate',
        title: '发生率',
        width: 100,
        formatter: (value) => formatPercent(value, 2),
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
            // if (costVerList.length) {
            //     queryParams.value.costMid = costVerList.find(item => item.isEnabled)?.id
            // }
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
    if (segOptions.value.length) {
        const firstSeg = segOptions.value[0]
        if (firstSeg) {
            queryParams.value.seg = firstSeg.value
            await updateFirstProject()
        }
    }
}

// ---------- 板块变更事件 ----------
const handleSegChange = async (val: number) => {
    await updateFirstProject()
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
    queryParams.value.costMid = null
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
    await selectedDefaultSeg()
    handleSearch()
}
const handleExport = async () => {
    try {
        exportLoading.value = true;
        const params = {
            ...queryParams.value,
            level: 99
        }
        const fileBlob = await reportManageApi.exportDynamicReport({ ...params, isExport: true });
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
    try {
        tableLoading.value = true;
        const params = {
            ...queryParams.value,
            level: 99
        }
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
        tableLoading.value = false;
    }
};

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

    .search-card {
        background: #ffffff;
        border-radius: 12px;
        padding: 18px 24px 12px 24px;
        margin-bottom: 16px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06);
        flex-shrink: 0;
        border: 1px solid #edf2f7;

        .search-form {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 4px 0;

            :deep(.el-form-item) {
                margin-bottom: 8px;
                margin-right: 16px;

                .el-form-item__label {
                    font-size: 13px;
                    color: #4a5568;
                    font-weight: 500;
                    padding-right: 8px;
                }
            }

            :deep(.el-input__wrapper),
            :deep(.el-select .el-input__wrapper),
            :deep(.el-cascader .el-input__wrapper) {
                border-radius: 8px;
                box-shadow: 0 0 0 1px #e2e8f0 inset;
                transition: box-shadow 0.2s;

                &:hover {
                    box-shadow: 0 0 0 1px #b7c0d0 inset;
                }

                &.is-focus {
                    box-shadow: 0 0 0 2px rgba(79, 110, 247, 0.25), 0 0 0 1px #4f6ef7 inset !important;
                }
            }

            .action-buttons {
                display: flex;
                gap: 8px;

                .btn-search,
                .btn-reset {
                    border-radius: 8px;
                }
            }
        }
    }

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