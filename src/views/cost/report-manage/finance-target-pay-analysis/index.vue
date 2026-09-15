<!-- 财务目标成本支付分析 -->
<template>
    <div class="target-cost-payment-analysis-wrapper">
        <!-- 查询卡片 -->
        <BaseSearchCard>
            <template #form>
                <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="90px" class="search-form">
                    <el-form-item label="业务归属" prop="seg">
                        <el-select v-model="queryParams.seg" placeholder="请选择业务板块" :clearable="false"
                            style="width: 150px" @change="handleSegChange">
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

                    <el-form-item label="目标成本版本" prop="versionNo">
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

                    <el-form-item label="金额类型" prop="amountType">
                        <el-select v-model="queryParams.amountType" placeholder="请选择类型" :clearable="false"
                            style="width: 150px" @change="handleSearch">
                            <el-option label="含税" value="TAX" />
                            <el-option label="不含税" value="EXCL" />
                        </el-select>
                    </el-form-item>

                    <!-- <el-form-item label="单位" prop="unit">
                        <el-select v-model="queryParams.unit" placeholder="请选择单位" :clearable="false"
                            style="width: 150px" @change="handleSearch">
                            <el-option label="万元" value="万元" />
                            <el-option label="元" value="元" />
                        </el-select>
                    </el-form-item> -->

                    <el-form-item label="截止月份" prop="statMonth">
                        <el-date-picker v-model="queryParams.statMonth" type="month" value-format="YYYY-MM"
                            placeholder="请选择截止月份" :clearable="false" style="width: 150px" @change="handleSearch" />
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
                    :disabled="!menuStore.hasExactPermission(PERMISSIONS.FIN_PAY_ANALYSIS_EXPORT)">
                    <el-icon>
                        <Download />
                    </el-icon>
                    导出
                </el-button>
            </template>
        </BaseSearchCard>

        <!-- 表格卡片 -->
        <div class="table-card">
            <div class="demo-controls">
                <!-- <div class="unit-badge">
                    <el-icon>
                        <Money />
                    </el-icon>
                    <span>单位：{{ queryParams.unit }}</span>
                </div> -->
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

                <!-- 单位切换 -->
                <div class="unit-switch">
                    <span class="unit-label">单位</span>
                    <el-radio-group v-model="queryParams.unit" size="small" text-color="#fff" fill="#4096cc"
                        @change="handleSearch">
                        <el-radio-button value="万元">万元</el-radio-button>
                        <el-radio-button value="元">元</el-radio-button>
                    </el-radio-group>
                </div>
            </div>

            <vxe-editable-table ref="vxeTableRef" v-model="tableData" :columns="columns" :rowKey="'id'"
                :treeConfig="treeConfig" :loading="tableLoading" :readonly="true" :pagination="false"
                :footer-data="footerData" :show-footer="true" />
        </div>

        <!-- 选择目标成本版本弹窗 -->
        <ChooseCostMDialog v-model="costMDialogVisible" :projId="queryParams?.projId" @select="handleVersionSelect" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from "vue";
import { Search, Refresh, Download, CircleClose } from '@element-plus/icons-vue';
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";
import { reportManageApi } from "@/api/cost/contract-manage/report-manage-api";
import { goalCostApi } from "@/api/cost/cost-setting/goal-cost-api";
import { bigSum, formatPercent, formatThousandWithPlaces, roundToTwo } from "@/utils/big-number";
import { ElMessage } from "element-plus";
import ChooseCostMDialog from '@/components/business/choose-costM-dialog.vue';
import dayjs from "dayjs";
import BaseSearchCard from "@/components/base/base-search-card.vue";
import { buildTreeFromFlatList } from "../utils/finance-target-pay-analysis.ts";
import { calcMaxDepth, levelMap, segEnum } from '../utils/common.ts'
import { useRoute, useRouter } from "vue-router";
import { PERMISSIONS } from "@/constants/permission.ts";
import { useMenuStore } from "@/stores/menu-store";

defineOptions({ name: "target-cost-payment-analysis" });

const router = useRouter();
const menuStore = useMenuStore();

// ---------- 树形配置 ----------
const treeConfig = {
    childrenField: 'children',
    hasChildrenField: 'hasChildren',
    expandAll: false,
    accordion: false,
};

const queryParams = ref({
    seg: undefined,              // 业务归属：'ALL' | 'DC' | 'JZ'
    projId: undefined,           // 项目ID
    projName: undefined,         // 项目名称
    versionNo: undefined,        // 版本号（显示用）
    costMid: undefined,          // 目标成本版本ID（实际传参用）
    amountType: 'TAX',           // 金额类型：TAX-含税, EXCL-不含税
    unit: '万元',
    statMonth: dayjs().format("YYYY-MM"), // 截止月份
});

const projectOptions = ref([]);       // 全部项目树
const projectCascaderRef = ref();

const costMDialogVisible = ref(false);

const vxeTableRef = ref();
const tableLoading = ref(false);
const tableData = ref([]);
const submitLoading = ref(false);
const exportLoading = ref(false);

const maxDepth = ref(0);
const expandLevel = ref(1);

// 根据单位保留小数位数
const deci = computed(() => {
    const unit = queryParams.value.unit; // 获取单位
    return unit === '万元' ? 4 : 2; // 根据单位设置小数位数
})

// 自定义合计行数据
const footerData = computed(() => {
    const r = tableData.value

    const f = (k: string) => {
        // 每项先四舍五入到 2 位，再用 BigNumber 精确求和
        const total = bigSum(r.map((x) => roundToTwo(x[k])))
        return formatThousandWithPlaces(total.toNumber(), deci.value)
    }
    return [[
        '合计',                    // subCode
        '',                 // subName
        f('targetAmt'),
        f('factReqAmt'),
        f('paidAmt'),
        f('unpaidAmt'),
        f('paidDiffAmt'),
        '',                    // paidRate 比率不算合计
        f('unpaidDiffAmt'),
        '',                    // unpaidRate 比率不算合计
    ]]
})

//  计算属性：根据板块过滤项目树 
const projectData = computed(() => {
    const seg = queryParams.value.seg;
    if (!seg) return [];
    switch (seg) {
        case 'ALL':
            // 业务板块选择全部时，查地产下的项目
            return projectOptions.value.filter((item) => item.orgId === 2) || [];
        case 'DC':
            return projectOptions.value.filter((item) => item.orgId === 2) || [];
        case 'JZ':
            return projectOptions.value.filter((item) => item.orgId === 7) || [];
        default:
            return [];
    }
});

const columns: any = computed(() => {
    return [
        { prop: "subCode", label: "财务科目编码", width: 100, fixed: "left" },
        {
            prop: "subName",
            label: "财务科目名称",
            minWidth: 200,
            fixed: "left",
            align: 'left',
            treeNode: true,
        },
        {
            prop: "targetAmt",
            label: "目标成本金额",
            minWidth: 130,
            formatter: (value: any) => formatThousandWithPlaces(value, deci.value),
        },
        {
            label: "请款及支付",
            children: [
                {
                    prop: "factReqAmt",
                    label: "实际请款金额",
                    minWidth: 130,
                    formatter: (value: any) => formatThousandWithPlaces(value, deci.value),
                    clickable: true, // 点击单元格触发 onClick 事件
                    onClick: (row, column) => {
                        handleCellEventClick(row, column);
                    },
                },
                {
                    prop: "paidAmt",
                    label: "已支付金额",
                    minWidth: 130,
                    formatter: (value: any) => formatThousandWithPlaces(value, deci.value),
                    clickable: true, // 点击单元格触发 onClick 事件
                    onClick: (row, column) => {
                        handleCellEventClick(row, column);
                    },
                },
                {
                    prop: "unpaidAmt",
                    label: "未支付金额",
                    minWidth: 120,
                    formatter: (value: any) => formatThousandWithPlaces(value, deci.value),
                    headerTip: {
                        icon: "QuestionFilled",
                        content: "未支付金额=实际请款金额−已支付金额",
                        placement: "top",
                        width: "200px",
                    },
                },
            ],
        },
        {
            label: "目标成本对比",
            children: [
                {
                    prop: "paidDiffAmt",
                    label: "目标成本与已付差异",
                    minWidth: 160,
                    formatter: (value: any) => formatThousandWithPlaces(value, deci.value),
                    headerTip: {
                        icon: "QuestionFilled",
                        content: "目标成本与已付差异=目标成本金额−已支付金额",
                        placement: "top",
                        width: "200px",
                    },
                },
                {
                    prop: "paidRate",
                    label: "已付占目标成本比例",
                    minWidth: 160,
                    headerTip: {
                        icon: "QuestionFilled",
                        content: "已付占目标成本比例=已支付金额÷目标成本金额",
                        placement: "top",
                        width: "200px",
                    },
                    formatter: (value) => formatPercent(value, 2),
                },
                {
                    prop: "unpaidDiffAmt",
                    label: "目标成本与未付差异",
                    minWidth: 160,
                    formatter: (value: any) => formatThousandWithPlaces(value, deci.value),
                    headerTip: {
                        icon: "QuestionFilled",
                        content: "目标成本与未付差异=目标成本金额−未支付金额",
                        placement: "top",
                        width: "200px",
                    },
                },
                {
                    prop: "unpaidRate",
                    label: "未付占目标成本比例",
                    minWidth: 160,
                    headerTip: {
                        icon: "QuestionFilled",
                        content: "未付占目标成本比例=未支付金额÷目标成本金额",
                        placement: "top",
                        width: "200px",
                    },
                    formatter: (value) => formatPercent(value, 2),
                },
            ],
        },
    ];
})
// 跳转到请款执行明细表
const handleCellEventClick = (row, column) => {
    console.log("点击单元格事件:", row, column);
    if (row) {
        const timestamp = new Date().getTime();
        let segId = 9999;
        if (queryParams.value.seg === 'ALL') {
            segId = 9999; // 匹配请款执行明细的业务板块 全部
        } else if (queryParams.value.seg === 'DC') {
            segId = 2; // 匹配请款执行明细的业务板块 地产
        } else if (queryParams.value.seg === 'JZ') {
            segId = 7; // 匹配请款执行明细的业务板块 建筑
        }
        const month = queryParams.value.statMonth || dayjs().format('YYYY-MM');
        const endDate = dayjs(month).endOf('month').format('YYYY-MM-DD');
        const params = {
            segId: segId,
            projId: queryParams.value.projId,
            subId: row.subId,
            applyDate: column.prop === 'factReqAmt' ? endDate : null, // 请款日期
            payDate: column.prop === 'paidAmt' ? endDate : null, // 支付日期
        };
        router.push({
            path: "/report/pay-detail",
            query: {
                data: JSON.stringify(params),
                _t: timestamp.toString(),
            },
        });
    }
}
const buildParams = () => {
    const { seg, projId, costMid, amountType, statMonth, unit } = queryParams.value;
    return {
        seg,
        projId: projId || undefined,
        costMid,
        amountType,
        statMonth,
        unit
    };
};

// 更新最大深度
const updateMaxDepth = () => {
    const depth = calcMaxDepth(tableData.value);
    maxDepth.value = Math.max(0, depth);
    // 如果当前选中的层级大于最大深度，修正为1
    if (expandLevel.value > maxDepth.value && maxDepth.value > 0) {
        expandLevel.value = 1;
    } else if (maxDepth.value === 0) {
        expandLevel.value = 0;
    }
};

//  展开层级变更 
const handleExpandLevel = (level: number) => {
    if (!vxeTableRef.value) {
        ElMessage.warning('暂无数据');
        return;
    }
    expandLevel.value = level;
    if (level === 999) {
        vxeTableRef.value.expandAll();
    } else if (level === 0) {
        vxeTableRef.value.collapseAll();
    } else {
        vxeTableRef.value.expandToLevel(level);
    }
};

// 获取列表数据
const getDataList = async () => {
    tableData.value = [];
    if (!queryParams.value.projId) {
        ElMessage.warning("请先选择项目");
        return;
    }
    try {
        submitLoading.value = true;
        tableLoading.value = true;
        const params = buildParams();
        const res = await reportManageApi.getFinaTargetCost(params);
        if (res.code === 200) {
            const list = res.data || [];
            // 转换为树形结构
            const treeData = buildTreeFromFlatList(list);
            tableData.value = treeData;

            // 数据加载完成后，计算深度并默认展开第1级
            await nextTick();
            updateMaxDepth();
            if (maxDepth.value > 0) {
                expandLevel.value = 1;
                await nextTick();
                handleExpandLevel(1);
            }
        }
    } catch (error) {
        console.error("获取数据失败:", error);
    } finally {
        submitLoading.value = false;
        tableLoading.value = false;
    }
};

//  搜索 
const handleSearch = () => {
    getDataList();
};

//  重置 
const handleReset = async () => {
    queryParams.value.projId = undefined;
    queryParams.value.projName = undefined;
    queryParams.value.versionNo = undefined;
    queryParams.value.costMid = undefined;
    queryParams.value.amountType = 'TAX';
    queryParams.value.unit = '万元';
    queryParams.value.statMonth = dayjs().format("YYYY-MM");
    // 恢复默认板块
    setDefaultSeg();
    await nextTick();
    getDataList();
};

//  导出 
const handleExport = async () => {
    if (!queryParams.value.projId) {
        ElMessage.warning("请先选择项目");
        return;
    }
    try {
        exportLoading.value = true;
        const params = buildParams();
        const fileBlob = await reportManageApi.exportFinaTargetCost({ ...params, isExport: true });
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
};

//  获取项目树 
const getProjectOptions = async () => {
    try {
        const res = await projectAreaApi.getSegMguProjList();
        if (res.code === 200) {
            projectOptions.value = res.data || [];
        }
    } catch (error) {
        console.error("获取项目列表失败:", error);
    }
};

//  设置默认板块 
const setDefaultSeg = async () => {
    if (segEnum.length > 0) {
        queryParams.value.seg = segEnum[0].value;
    }
};

//  板块变更 
const handleSegChange = async (val: string) => {
    // 清空项目
    queryParams.value.projId = undefined;
    queryParams.value.projName = undefined;
    // 清空目标成本版本
    queryParams.value.versionNo = undefined;
    queryParams.value.costMid = undefined;
    await nextTick();
};

//  项目变更 
const handleProjectChange = async (val: number) => {
    if (val) {
        const checkedNodes = projectCascaderRef.value?.getCheckedNodes();
        if (checkedNodes && checkedNodes.length) {
            const node = checkedNodes[0];
            queryParams.value.projName = node.label;
        }
        // 清空目标成本版本
        queryParams.value.versionNo = undefined;
        queryParams.value.costMid = undefined;
        // 加载目标成本版本列表并默认选中生效版本
        await loadCostVersionList(val);
        await nextTick();
        handleSearch();
    }
};

//  加载版本列表 
const loadCostVersionList = async (projId: number) => {
    if (!projId) return;
    try {
        const res = await goalCostApi.getProjectCostMList({ projId });
        if (res.code === 200) {
            const list = res.data || [];
            // 默认选中生效版本
            if (list.length > 0) {
                const enabled = list.find((item: any) => item.isEnabled);
                if (enabled) {
                    queryParams.value.costMid = enabled.id;
                    queryParams.value.versionNo = enabled.versionNo;
                }
            }
        }
    } catch (error) {
        console.error("获取目标成本版本列表失败:", error);
    }
};

//  目标成本版本弹窗 
const handleChooseVersion = () => {
    if (!queryParams.value.projId) {
        ElMessage.warning("请先选择项目");
        return;
    }
    costMDialogVisible.value = true;
};

const clearVersion = () => {
    queryParams.value.costMid = undefined;
    queryParams.value.versionNo = undefined;
};

const handleVersionSelect = (data: any) => {
    if (data && data.length > 0) {
        const firstData = data[0];
        queryParams.value.costMid = firstData?.id;
        queryParams.value.versionNo = firstData?.versionNo;
        handleSearch();
    }
};

onMounted(async () => {
    await getProjectOptions();
    await setDefaultSeg();
    getDataList();
});
</script>

<style lang="scss" scoped>
.target-cost-payment-analysis-wrapper {
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

    .table-card {
        flex: 1;
        min-height: 0;
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06);
        border: 1px solid #edf2f7;
        display: flex;
        flex-direction: column;
        overflow: hidden;

        .demo-controls {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-shrink: 0;
            padding: 15px 20px 0;
            background: #fafbfc;
            position: relative;

            .unit-badge {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 4px 12px;
                font-size: 13px;
                font-weight: 500;
                color: #b26a00; // 深琥珀，字清晰
                background: #fff7e6; // 极浅暖黄
                border: 1px solid #ffd591; // 柔和橙边
                border-radius: 14px;
                white-space: nowrap;
                user-select: none;
                position: absolute;
                right: 15px;
                top: 15px;

                .el-icon {
                    font-size: 14px;
                }
            }

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

            .unit-switch {
                margin-left: auto;
                display: inline-flex;
                align-items: center;
                gap: 8px;

                .unit-label {
                    font-size: 14px;
                    font-weight: 500;
                    color: #4a5568;
                    user-select: none;
                }

                :deep(.el-radio-button__inner) {
                    padding: 5px 14px;
                    font-size: 13px;
                }
            }
        }

        :deep(.vxe-table--render-default) {
            flex: 1;
        }
    }
}
</style>