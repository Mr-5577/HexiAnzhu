<!-- 供应商履约及支付报表 -->
<template>
    <div class="supplier-performance-wrapper">
        <!-- 查询卡片 -->
        <BaseSearchCard>
            <template #form>
                <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="90px" class="search-form">
                    <el-form-item label="业务板块" prop="segId">
                        <el-select v-model="queryParams.segId" placeholder="请选择业务板块" style="width: 220px"
                            @change="handleSegChange">
                            <el-option v-for="item in segOptions" :key="item.id" :label="item.segName"
                                :value="item.id" />
                        </el-select>
                    </el-form-item>

                    <el-form-item label="项目名称" prop="projIdList">
                        <el-cascader v-model="queryParams.projIdList" :options="projectData" :collapse-tags="true"
                            :collapse-tags-tooltip="true" :max-collapse-tags="1" :show-all-levels="false" :props="{
                                expandTrigger: 'hover',
                                emitPath: false,
                                checkStrictly: false,
                                value: 'orgId',
                                label: 'orgName',
                                children: 'children',
                                multiple: true,
                            }" placeholder="请选择项目" style="width: 220px" clearable filterable />
                    </el-form-item>

                    <el-form-item label="供应商名称" prop="supName">
                        <el-input v-model="queryParams.supName" placeholder="请输入供应商名称" clearable style="width: 220px" />
                    </el-form-item>

                    <el-form-item label="签约月份" prop="signMonth">
                        <el-date-picker v-model="queryParams.signMonth" value-format="YYYY-MM" type="monthrange"
                            range-separator="至" start-placeholder="开始月份" end-placeholder="结束月份" style="width: 220px" />
                    </el-form-item>

                    <el-form-item label="单位" prop="unit">
                        <el-select v-model="queryParams.unit" placeholder="请选择单位" :clearable="false"
                            style="width: 150px" @change="handleSearch">
                            <el-option label="万元" value="万元" />
                            <el-option label="元" value="元" />
                        </el-select>
                    </el-form-item>

                </el-form>
            </template>
            <template #actions>
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
                <el-button type="primary" :loading="exportLoading" @click="handleExport" class="btn-export" plain
                    :disabled="!menuStore.hasExactPermission(PERMISSIONS.SUP_PERFORM_EXPORT)">
                    <el-icon>
                        <Download />
                    </el-icon>
                    导出
                </el-button>
            </template>
        </BaseSearchCard>

        <!-- 统计卡片 -->
        <supplier-summary-card :stats="summaryStats" :unit="queryParams.unit" />

        <div class="content-placeholder">
            <vxe-editable-table ref="vxeTableRef" v-model="tableData" :columns="tableColumns" :rowKey="'id'"
                :loading="tableLoading" :treeConfig="treeConfig" :readonly="true" :pagination="false"
                :virtualScroll="true" :span-method="spanMethod">
            </vxe-editable-table>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, shallowRef, markRaw } from 'vue'
import {
    Search, Refresh, Download,
    Tickets, TrendCharts, Money, Wallet,
    CreditCard, Warning, BellFilled,
    Document as DocumentIcon,
} from '@element-plus/icons-vue'
import dayjs from "dayjs";
import VxeEditableTable from '@/components/base/vxe-editable-table.vue'
import { projectAreaApi } from '@/api/cost/master-data/project-area-api'
import { dictionaryApi } from '@/api/cost/master-data/dictionary-api'
import { reportManageApi } from '@/api/cost/contract-manage/report-manage-api'
import { formatThousandWithPlaces, toBig } from '@/utils/big-number'
import { ElMessage } from 'element-plus'
import BaseSearchCard from "@/components/base/base-search-card.vue";
import SupplierSummaryCard, { type StatItem } from './supplier-summary-card.vue'
import { buildSupPerformTree } from '../utils/supplier-performance'
import { PERMISSIONS } from '@/constants/permission.ts';
import { useMenuStore } from "@/stores/menu-store";

defineOptions({ name: 'supplier-performance' })

const menuStore = useMenuStore();
// ---------- 树形配置 ----------
const treeConfig = {
    childrenField: 'children',
    hasChildrenField: 'hasChildren',
    expandAll: false,
    accordion: false,
    transform: true,
    rowField: 'id',
    parentField: 'parentId',
}

// ---------- 查询参数 ----------
const queryParams = ref({
    segId: undefined,
    projIdList: [],
    supName: '',
    signMonth: [],
    unit: '万元',
})

// ---------- 引用与状态 ----------
const queryRef = ref()
const vxeTableRef = ref<InstanceType<typeof VxeEditableTable>>()
const segOptions = ref([])
const projectOptions = ref([])
const tableData = shallowRef([])
const tableLoading = ref(false)
const exportLoading = ref(false)
const summaryStats = shallowRef<StatItem[]>([])
// 合同编号 / 合同名称：逐行展示
const PER_ROW_FIELDS = ['conSysNo', 'conName'];

// ---------- 计算属性：根据板块过滤项目树 ----------
const projectData = computed(() => {
    const segId = queryParams.value.segId
    if (!segId) return []
    if (segId === 9999) {
        return projectOptions.value.filter((item) => item.orgId === 2) || []
    } else {
        return projectOptions.value.filter((item) => item.orgId === segId) || []
    }
})

// ---------- 动态生成 columns ----------
const tableColumns: any = computed(() => {
    const unit = queryParams.value.unit
    const dec = unit === '万元' ? 4 : 2
    return [
        { type: "index", title: "序号", width: 60, fixed: "left" },
        { prop: 'supName', label: '供应商', minWidth: 200, align: 'left', fixed: "left", treeNode: true },
        { prop: 'projName', label: '项目', minWidth: 180, fixed: "left" },
        {
            label: '合同基本信息',
            children: [
                {
                    prop: 'conSysNo', label: '合同编号', minWidth: 180, formatter: (value) => {
                        if (!value) return "";
                        return value.split("\n")?.join("，");
                    },
                },
                {
                    prop: 'conName', label: '合同名称', minWidth: 240, formatter: (value) => {
                        if (!value) return "";
                        return value.split("\n")?.join("，");
                    },
                },
                { prop: 'conProperty', label: '合同类型', minWidth: 90 },
                { prop: 'conTypeName', label: '合同分类', minWidth: 90 },
                { prop: 'conTypeOwner', label: '合同分类归属', minWidth: 100 },
                { prop: 'payMethod', label: '产值确认方式', minWidth: 100 },
                { prop: 'companyName', label: '甲方签约公司', minWidth: 200 },
                { prop: 'agentName', label: '甲方经办人', minWidth: 100 },
                { prop: 'signDate', label: '签订日期', minWidth: 100 },
            ],
        },
        {
            label: '合同履约情况',
            children: [
                { prop: 'signAmt', label: `签约金额(${unit})`, minWidth: 120, formatter: (v) => formatThousandWithPlaces(v, dec) },
                { prop: 'addAmt', label: `补充合同(${unit})`, minWidth: 120, formatter: (v) => formatThousandWithPlaces(v, dec) },
                { prop: 'changeAmt', label: `变更(${unit})`, minWidth: 120, formatter: (v) => formatThousandWithPlaces(v, dec) },
                { prop: 'visaAmt', label: `签证(${unit})`, minWidth: 120, formatter: (v) => formatThousandWithPlaces(v, dec) },
                { prop: 'estConAmt', label: `系统预结算(${unit})`, minWidth: 120, formatter: (v) => formatThousandWithPlaces(v, dec) },
                { prop: 'settleAmt', label: `结算金额(${unit})`, minWidth: 120, formatter: (v) => formatThousandWithPlaces(v, dec) },
            ],
        },
        {
            label: '产值与付款情况',
            children: [
                { prop: 'prodAmt', label: `产值(${unit})`, minWidth: 120, formatter: (v) => formatThousandWithPlaces(v, dec) },
                { prop: 'payAmt', label: `应付(${unit})`, minWidth: 120, formatter: (v) => formatThousandWithPlaces(v, dec) },
                { prop: 'reqAmt', label: `请款金额(${unit})`, minWidth: 120, formatter: (v) => formatThousandWithPlaces(v, dec) },
                { prop: 'dedAmt', label: `款项调整(${unit})`, minWidth: 120, formatter: (v) => formatThousandWithPlaces(v, dec) },
                { prop: 'factReqAmt', label: `实际请款(${unit})`, minWidth: 120, formatter: (v) => formatThousandWithPlaces(v, dec) },
                { prop: 'paidAmt', label: `已支付(${unit})`, minWidth: 120, formatter: (v) => formatThousandWithPlaces(v, dec) },
            ],
        },
        {
            label: '发票情况',
            children: [
                { prop: 'invcAmt', label: `已开票-含税(${unit})`, minWidth: 140, formatter: (v) => formatThousandWithPlaces(v, dec) },
                { prop: 'invcNotTaxAmt', label: `已开票-不含税(${unit})`, minWidth: 140, formatter: (v) => formatThousandWithPlaces(v, dec) },
                { prop: 'payInvOweAmt', label: `产值欠票(${unit})`, minWidth: 120, formatter: (v) => formatThousandWithPlaces(v, dec) },
                { prop: 'factReqInvOweAmt', label: `请款欠票(${unit})`, minWidth: 120, formatter: (v) => formatThousandWithPlaces(v, dec) },
            ],
        },
    ]
})
/**
 * 合并单元格：
 * - 合同编号、合同名称：每行独立展示（不合并）
 * - 其他列：同一 _groupId 内仅首行展示，跨 _groupSize 行
 */
const spanMethod = ({ row, column }: any) => {
    // 非拆分行不处理
    if (!row._groupId || !row._groupSize || row._groupSize <= 1) return;

    if (PER_ROW_FIELDS.includes(column.field)) return;

    // 其他列：首行合并，其余行隐藏
    if (row._groupIndex === 0) {
        return { rowspan: row._groupSize, colspan: 1 };
    }
    return { rowspan: 0, colspan: 0 };
};
// ---------- 获取业务板块（含"全部"） ----------
const getSegOptions = async () => {
    try {
        const res = await dictionaryApi.getsegmentList({ isAuth: true })
        if (res.code === 200 && res.data) {
            const list = res.data || []
            const hasDiChan = list.some(item => item.id === 2)
            const hasJianZhu = list.some(item => item.id === 7)
            if (hasDiChan && hasJianZhu) {
                segOptions.value = [{ id: 9999, segName: '全部' }, ...list]
            } else {
                segOptions.value = list
            }
        }
    } catch (error) {
        console.error('获取业务板块列表失败:', error)
    }
}

// ---------- 获取项目树 ----------
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

// ---------- 设置默认选中第一个板块 ----------
const setDefaultSeg = () => {
    if (segOptions.value && segOptions.value.length > 0) {
        const first = segOptions.value[0]
        if (first) {
            queryParams.value.segId = first.id
            handleSegChange(first.id)
        }
    }
}

// ---------- 板块变更 ----------
const handleSegChange = (_val: number) => {
    queryParams.value.projIdList = []
}

// ---------- 搜索 ----------
const handleSearch = () => {
    getDataList()
}

// ---------- 重置 ----------
const handleReset = async () => {
    queryParams.value.projIdList = []
    queryParams.value.supName = ''
    queryParams.value.signMonth = []
    queryParams.value.unit = '万元'
    setDefaultSeg()
    await nextTick()
    handleSearch()
}

// ---------- 导出 ----------
const handleExport = async () => {
    try {
        exportLoading.value = true
        const params = buildParams()
        const fileBlob = await reportManageApi.exportSupPerformReport({ ...params, isExport: true })
        if (!fileBlob || fileBlob.size === 0) {
            ElMessage.warning('导出文件为空，请检查数据')
        } else {
            ElMessage.success('导出成功！')
        }
    } catch (error) {
        console.error('导出失败:', error)
    } finally {
        exportLoading.value = false
    }
}
/**
 * 日期范围格式化辅助函数
 * @param dates 日期范围数组
 * @param type 类型（start: 起始日期，end: 结束日期）
 */
const formatDateRange = (dates, type) => {
    if (!dates || !Array.isArray(dates) || dates.length < 2) return undefined;
    const [start, end] = dates;
    if (type === 'start') {
        return start ? dayjs(start).startOf('month').format('YYYY-MM-DD') : undefined;
    }
    if (type === 'end') {
        return end ? dayjs(end).endOf('month').format('YYYY-MM-DD') : undefined;
    }
    return undefined;
};
// ---------- 构建查询参数 ----------
const buildParams = () => {
    const { segId, signMonth, ...rest } = queryParams.value
    let segIds = []
    if (segId) {
        if (segId === 9999) {
            segIds = []
        } else {
            segIds = [segId]
        }
    }
    return {
        ...rest,
        segIdList: segIds,
        signDateStart: formatDateRange(signMonth, 'start'),
        signDateEnd: formatDateRange(signMonth, 'end'),
    }
}

// ---------- 获取列表数据 ----------
const getDataList = async () => {
    try {
        tableLoading.value = true
        const params = buildParams()
        const res = await reportManageApi.getSupPerformReport(params)
        if (res.code === 200) {
            const list = res.data || []
            // 构建树形数据
            const treeData = buildSupPerformTree(list)
            // console.log('treeData:', treeData)
            tableData.value = treeData
            getSummaryStats()
        }
    } catch (error) {
        console.error('获取列表失败:', error)
    } finally {
        tableLoading.value = false
    }
}

/**
 * 统计卡片数据
 * 数据源：tableData 中的合计行（rowType === 3）
 * 说明：
 * 1. 合计行是后端返回的全量汇总，数值已是目标单位，无需再计算
 * 2. 万元保留 4 位小数，元保留 2 位小数
 */
const getSummaryStats = () => {
    const list = (tableData.value as any[]) || []
    const totalRow = list.find((r) => r.rowType === 3) || {}

    const unit = queryParams.value.unit
    const dec = unit === '万元' ? 4 : 2

    const signTotal = toBig(totalRow.signAmt ?? 0)
        .plus(toBig(totalRow.addAmt ?? 0))
        .toNumber()

    summaryStats.value = [
        {
            key: 'signAmt',
            label: '签约金额',
            value: formatThousandWithPlaces(signTotal ?? 0, dec),
            icon: markRaw(Tickets),        // ✅
            className: 'theme-blue',
            desc: '主合同+补充合同',
        },
        {
            key: 'prodAmt',
            label: '产值',
            value: formatThousandWithPlaces(totalRow.prodAmt ?? 0, dec),
            icon: markRaw(TrendCharts),
            className: 'theme-purple',
            desc: '履约累计',
        },
        {
            key: 'payAmt',
            label: '应付',
            value: formatThousandWithPlaces(totalRow.payAmt ?? 0, dec),
            icon: markRaw(Money),
            className: 'theme-indigo',
            desc: '产值×比例',
        },
        {
            key: 'factReqAmt',
            label: '实际请款',
            value: formatThousandWithPlaces(totalRow.factReqAmt ?? 0, dec),
            icon: markRaw(Wallet),
            className: 'theme-cyan',
            desc: '请款+调整',
        },
        {
            key: 'paidAmt',
            label: '已支付',
            value: formatThousandWithPlaces(totalRow.paidAmt ?? 0, dec),
            icon: markRaw(CreditCard),
            className: 'theme-green',
            desc: '累计付款',
        },
        {
            key: 'invcAmt',
            label: '已开票(含税)',
            value: formatThousandWithPlaces(totalRow.invcAmt ?? 0, dec),
            icon: markRaw(DocumentIcon),
            className: 'theme-orange',
            desc: '含税',
        },
        {
            key: 'payInvOweAmt',
            label: '产值欠票',
            value: formatThousandWithPlaces(totalRow.payInvOweAmt ?? 0, dec),
            icon: markRaw(Warning),
            className: 'theme-red',
            desc: '应付−开票',
        },
        {
            key: 'factReqInvOweAmt',
            label: '请款欠票',
            value: formatThousandWithPlaces(totalRow.factReqInvOweAmt ?? 0, dec),
            icon: markRaw(BellFilled),
            className: 'theme-rose',
            desc: '请款−开票',
        },
    ]
}


// ---------- 初始化 ----------
onMounted(async () => {
    await getSegOptions()
    await getProjectOptions()
    setDefaultSeg()
    await getDataList()
})
</script>

<style lang="scss" scoped>
.supplier-performance-wrapper {
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
    }
}
</style>