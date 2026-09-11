<!-- 目标成本对比分析 -->
<template>
    <div class="target-cost-comparison-analysis-wrapper">
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

                    <el-form-item label="项目名称" prop="projIds">
                        <el-cascader v-model="queryParams.projIds" :options="projectData" :collapse-tags="true"
                            :collapse-tags-tooltip="true" :max-collapse-tags="1" :show-all-levels="false" :props="{
                                expandTrigger: 'hover',
                                emitPath: false,
                                checkStrictly: false,
                                value: 'orgId',
                                label: 'orgName',
                                children: 'children',
                                multiple: true,
                            }" placeholder="请选择项目" style="width: 220px" clearable filterable
                            @change="handleProjectChange" />
                    </el-form-item>
                    <el-form-item label="基准版期间" prop="basePeriodDate">
                        <el-date-picker v-model="queryParams.basePeriodDate" type="daterange" range-separator="至"
                            value-format="YYYY-MM-DD" start-placeholder="开始日期" end-placeholder="结束日期"
                            style="width: 220px" />
                    </el-form-item>
                    <el-form-item label="目标版期间" prop="targetPeriodDate">
                        <el-date-picker v-model="queryParams.targetPeriodDate" type="daterange" range-separator="至"
                            value-format="YYYY-MM-DD" start-placeholder="开始日期" end-placeholder="结束日期"
                            style="width: 220px" />
                    </el-form-item>
                    <el-form-item label="金额类型" prop="amountType">
                        <el-select v-model="queryParams.amountType" placeholder="请选择类型" :clearable="false"
                            style="width: 220px" @change="handleSearch">
                            <el-option label="含税" value="TAX" />
                            <el-option label="不含税" value="EXCL" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="基准版类型" prop="baseVersionType">
                        <el-select v-model="queryParams.baseVersionType" placeholder="请选择类型" :clearable="true"
                            style="width: 220px" @change="handleSearch">
                            <el-option v-for="item in verTypeOptions" :key="item.value" :label="item.label"
                                :value="item.value" />

                        </el-select>
                    </el-form-item>
                    <el-form-item label="目标版类型" prop="targetVersionType">
                        <el-select v-model="queryParams.targetVersionType" placeholder="请选择类型" :clearable="true"
                            style="width: 220px" @change="handleSearch">
                            <el-option v-for="item in verTypeOptions" :key="item.value" :label="item.label"
                                :value="item.value" />

                        </el-select>
                    </el-form-item>
                </el-form>
            </template>
            <template #actions>
                <el-button type="primary" @click="handleSearch" class="btn-search" :loading="submitLoading">
                    <el-icon>
                        <Search />
                    </el-icon> 搜索
                </el-button>
                <el-button @click="handleReset" class="btn-reset" :loading="submitLoading">
                    <el-icon>
                        <Refresh />
                    </el-icon> 重置
                </el-button>
                <el-button type="primary" :loading="exportLoading" @click="handleExport" class="btn-export" plain>
                    <el-icon>
                        <Download />
                    </el-icon>
                    导出
                </el-button>
            </template>
        </BaseSearchCard>

        <!-- 统计卡片组件 -->
        <!-- <TargetCostStatistics :data="statistics" /> -->

        <!-- 表格区域 -->
        <div class="content-placeholder">
            <vxe-editable-table ref="vxeTableRef" v-model="tableData" :columns="columns" :rowKey="'id'"
                :loading="tableLoading" :readonly="true" :show-footer="true" :pagination="false" :total="total"
                :page-size="pageSize" :current-page="currentPage" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import VxeEditableTable from '@/components/base/vxe-editable-table.vue'
import { projectAreaApi } from '@/api/cost/master-data/project-area-api'
import { reportManageApi } from '@/api/cost/contract-manage/report-manage-api'
import { BigNumber, formatThousandWithPlaces, toBig } from '@/utils/big-number'
import { useDict } from '@/composables/use-dict'
import { dictMapping } from '@/utils/dict-mapping'
import TargetCostStatistics from './target-cost-statistics.vue'
import { ElMessage } from 'element-plus'
import BaseSearchCard from "@/components/base/base-search-card.vue";
import { segEnum } from '../utils/common.ts'

defineOptions({ name: 'target-cost-comparison-analysis' })

const queryParams = ref({
    seg: 'ALL',     // 业务归属
    projIds: [],  // 项目ID
    basePeriodDate: [],   // 基准版期间
    targetPeriodDate: [], // 目标版期间
    amountType: 'EXCL',   // 金额类型：含税(TAX) / 不含税(EXCL)
    baseVersionType: undefined, // 基准版类型
    targetVersionType: undefined, // 目标版类型
})

const vxeTableRef = ref<InstanceType<typeof VxeEditableTable>>()
// 目标成本版本类型
// const verTypeOptions = computed(() => {
//     const dictList = getDictList(dictMapping.goalCostVersionType) || []
//     return dictList
// })
const verTypeOptions = ref([
    { value: '最新', label: '最新' },
    { value: '上一版', label: '上一版' },
    { value: '投资版', label: '投资版' },
    { value: '考核版', label: '考核版' },
    { value: '执行版', label: '执行版' },
]);
const projectOptions = ref([])
const tableLoading = ref(false)
const tableData = ref([])
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const submitLoading = ref(false)
const exportLoading = ref(false)

// ---------- 统计卡片数据 ----------
const statistics = ref({
    baseJianAnCost: 0,
    baseShiFanCost: 0,
    baseYuLiuCost: 0,
    baseSubtotal: 0,
    targetJianAnCost: 0,
    targetShiFanCost: 0,
    targetYuLiuCost: 0,
    targetSubtotal: 0,
    diffJianAnCost: 0,
    diffPricePerSqm: 0,
})

// ---------- 计算统计数据 ----------
const calcStatistics = (data: any[]) => {
    if (!data || data.length === 0) {
        statistics.value = {
            baseJianAnCost: 0,
            baseShiFanCost: 0,
            baseYuLiuCost: 0,
            baseSubtotal: 0,
            targetJianAnCost: 0,
            targetShiFanCost: 0,
            targetYuLiuCost: 0,
            targetSubtotal: 0,
            diffJianAnCost: 0,
            diffPricePerSqm: 0,
        }
        return
    }

    let baseJianAn = new BigNumber(0)
    let baseShiFan = new BigNumber(0)
    let baseYuLiu = new BigNumber(0)
    let baseSub = new BigNumber(0)
    let targetJianAn = new BigNumber(0)
    let targetShiFan = new BigNumber(0)
    let targetYuLiu = new BigNumber(0)
    let targetSub = new BigNumber(0)
    let diffJianAn = new BigNumber(0)
    let diffPrice = new BigNumber(0)

    for (const item of data) {
        baseJianAn = baseJianAn.plus(toBig(item.baseJianAnCost))
        baseShiFan = baseShiFan.plus(toBig(item.baseShiFanCost))
        baseYuLiu = baseYuLiu.plus(toBig(item.baseYuLiuCost))
        baseSub = baseSub.plus(toBig(item.baseSubtotal))
        targetJianAn = targetJianAn.plus(toBig(item.targetJianAnCost))
        targetShiFan = targetShiFan.plus(toBig(item.targetShiFanCost))
        targetYuLiu = targetYuLiu.plus(toBig(item.targetYuLiuCost))
        targetSub = targetSub.plus(toBig(item.targetSubtotal))
        diffJianAn = diffJianAn.plus(toBig(item.diffJianAnCost))
        diffPrice = diffPrice.plus(toBig(item.diffPricePerSqm))
    }

    statistics.value = {
        baseJianAnCost: baseJianAn.toNumber(),
        baseShiFanCost: baseShiFan.toNumber(),
        baseYuLiuCost: baseYuLiu.toNumber(),
        baseSubtotal: baseSub.toNumber(),
        targetJianAnCost: targetJianAn.toNumber(),
        targetShiFanCost: targetShiFan.toNumber(),
        targetYuLiuCost: targetYuLiu.toNumber(),
        targetSubtotal: targetSub.toNumber(),
        diffJianAnCost: diffJianAn.toNumber(),
        diffPricePerSqm: diffPrice.toNumber(),
    }
}

// ---------- 计算属性：根据板块过滤项目树 ----------
const projectData = computed(() => {
    const seg = queryParams.value.seg
    if (!seg) return []
    switch (seg) {
        // 全部和地产板块，显示地产板块下的项目
        case 'ALL':
        case 'DC':
            return projectOptions.value.filter((item) => item.orgId === 2) || []
        // 建筑板块，显示建筑板块下的项目
        case 'JZ':
            return projectOptions.value.filter((item) => item.orgId === 7) || []
        default:
            return []
    }
})

const columns: any = [
    { type: 'index', title: '序号', fixed: 'left', },
    { prop: 'projName', label: '项目名称', width: 150, fixed: 'left', },
    {
        label: '基准版',
        children: [
            { prop: 'baseVersionNo', label: '版本号', minWidth: 140, formatter: (v) => v ? v : '-' },
            { prop: 'baseArea', label: '建筑面积(㎡)', minWidth: 100, formatter: (v) => formatThousandWithPlaces(v) },
            {
                prop: 'baseJianAnCost', label: '建安成本(万元)', minWidth: 130, showSummary: true,
                // 表头提示
                headerTip: {
                    content: '不含示范区、预留费',
                    icon: 'QuestionFilled',
                    placement: 'top',
                },
                formatter: (v) => formatThousandWithPlaces(v)
            },
            { prop: 'baseShiFanCost', label: '示范区(万元)', minWidth: 100, showSummary: true, formatter: (v) => formatThousandWithPlaces(v) },
            { prop: 'baseYuLiuCost', label: '预留费用(万元)', minWidth: 110, showSummary: true, formatter: (v) => formatThousandWithPlaces(v) },
            {
                // 小计列=建安成本+示范区+预留费用
                prop: 'baseSubtotal',
                label: '小计(万元)',
                minWidth: 100,
                headerTip: {
                    content: '建安成本+示范区+预留费用',
                    icon: 'QuestionFilled',
                    placement: 'top',
                },
                showSummary: true,
                formatter: (v) => formatThousandWithPlaces(v),
            },
            {
                prop: 'basePricePerSqm',
                label: '建筑单方(元/㎡)',
                minWidth: 110,
                showSummary: true,
                formatter: (v) => formatThousandWithPlaces(v),
            },
        ],
    },
    {
        label: '目标版',
        children: [
            { prop: 'targetVersionNo', label: '版本号', minWidth: 140, formatter: (v) => v ? v : '-' },
            { prop: 'targetArea', label: '建筑面积(㎡)', minWidth: 100, formatter: (v) => formatThousandWithPlaces(v) },
            {
                prop: 'targetJianAnCost', label: '建安成本(万元)', minWidth: 130,
                showSummary: true,
                headerTip: {
                    content: '不含示范区、预留费',
                    icon: 'QuestionFilled',
                    placement: 'top',
                },
                formatter: (v) => formatThousandWithPlaces(v)
            },
            { prop: 'targetShiFanCost', label: '示范区(万元)', minWidth: 100, showSummary: true, formatter: (v) => formatThousandWithPlaces(v) },
            { prop: 'targetYuLiuCost', label: '预留费用(万元)', minWidth: 110, showSummary: true, formatter: (v) => formatThousandWithPlaces(v) },
            {
                // 小计列=建安成本+示范区+预留费用
                prop: 'targetSubtotal',
                label: '小计(万元)',
                minWidth: 110,
                showSummary: true,
                headerTip: {
                    content: '建安成本+示范区+预留费用',
                    icon: 'QuestionFilled',
                    placement: 'top',
                },
                formatter: (v) => formatThousandWithPlaces(v),
            },
            {
                prop: 'targetPricePerSqm',
                label: '建筑单方(元/㎡)',
                minWidth: 110,
                showSummary: true,
                formatter: (v) => formatThousandWithPlaces(v),
            },
        ],
    },
    {
        label: '差额',
        children: [
            {
                // 成本差异=目标版小计-基准版小计
                prop: 'diffJianAnCost',
                label: '成本差异(万元)',
                minWidth: 130,
                headerTip: {
                    content: '成本差异=目标版小计-基准版小计',
                    icon: 'QuestionFilled',
                    placement: 'top',
                },
                showSummary: true,
                formatter: (v) => formatThousandWithPlaces(v),
            },
            {
                // 单方差异=目标版建筑单方-基准版建筑单方
                prop: 'diffPricePerSqm',
                label: '单方差异(元/㎡)',
                minWidth: 130,
                headerTip: {
                    content: '单方差异=目标版建筑单方-基准版建筑单方',
                    icon: 'QuestionFilled',
                    placement: 'top',
                },
                showSummary: true,
                formatter: (v) => formatThousandWithPlaces(v),
            },
        ],
    },
]
// 数据字典
const { getDictList, loadDicts } = useDict(
    [
        dictMapping.goalCostVersionType, // 目标成本版本类型
    ],
);
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

// ---------- 板块变更事件 ----------
const handleSegChange = async () => {
    queryParams.value.projIds = [];  // 清空项目
    await nextTick()
    handleSearch()
}

// ---------- 项目变更事件 ----------
const handleProjectChange = () => {
    handleSearch()
}

// ---------- 搜索 ----------
const handleSearch = () => {
    getDataList()
}

// ---------- 重置 ----------
const handleReset = () => {
    queryParams.value = {
        seg: 'ALL',
        projIds: [],
        basePeriodDate: [],
        targetPeriodDate: [],
        amountType: 'EXCL',
        baseVersionType: undefined,
        targetVersionType: undefined,
    }
    handleSearch()
}
const buildParams = () => {
    const { basePeriodDate, targetPeriodDate, ...rest } = queryParams.value;
    const params = {
        ...rest,
        basePeriodStart: basePeriodDate?.[0],
        basePeriodEnd: basePeriodDate?.[1],
        targetPeriodStart: targetPeriodDate?.[0],
        targetPeriodEnd: targetPeriodDate?.[1],
    };
    return params;
}
// ---------- 获取列表数据 ----------
const getDataList = async () => {
    try {
        submitLoading.value = true;
        tableLoading.value = true
        const params = buildParams()
        const res = await reportManageApi.getTargetCostAnalyze(params)
        if (res.code === 200) {
            tableData.value = res.data || []
            total.value = tableData.value.length
            // 计算统计数据
            calcStatistics(tableData.value)
        }
    } catch (error) {
        console.error('获取对比分析数据失败:', error)
    } finally {
        submitLoading.value = false;
        tableLoading.value = false
    }
}
const handleExport = async () => {
    try {
        exportLoading.value = true;
        const params = buildParams()
        const fileBlob = await reportManageApi.exportTargetCostAnalyze({ ...params, isExport: true })
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

// ---------- 生命周期 ----------
onMounted(async () => {
    await getProjectOptions()
    // await loadDicts();
    getDataList()
})
</script>

<style lang="scss" scoped>
.target-cost-comparison-analysis-wrapper {
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
        padding: 0 4px 4px 4px;
    }

}
</style>