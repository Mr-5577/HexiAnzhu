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
                            }" placeholder="请选择项目" style="width: 220px" clearable filterable />
                    </el-form-item>

                    <el-form-item label="供应商名称" prop="supName">
                        <el-input v-model="queryParams.supName" placeholder="请输入供应商名称" clearable style="width: 220px" />
                    </el-form-item>

                    <el-form-item label="签约月份" prop="payDate">
                        <el-date-picker v-model="queryParams.payDate" value-format="YYYY-MM" type="monthrange"
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
                <el-button type="primary" :loading="exportLoading" @click="handleExport" class="btn-export" plain>
                    <el-icon>
                        <Download />
                    </el-icon>
                    导出
                </el-button>
            </template>
        </BaseSearchCard>

        <div class="content-placeholder">
            <vxe-editable-table ref="vxeTableRef" v-model="tableData" :columns="tableColumns" :rowKey="'id'"
                :loading="tableLoading" :treeConfig="treeConfig" :readonly="true" :pagination="false"
                :virtual-scroll="true" :virtual-threshold="20" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, shallowRef } from 'vue'
import { Search, Refresh, Download } from '@element-plus/icons-vue'
import VxeEditableTable from '@/components/base/vxe-editable-table.vue'
import { projectAreaApi } from '@/api/cost/master-data/project-area-api'
import { dictionaryApi } from '@/api/cost/master-data/dictionary-api'
import { reportManageApi } from '@/api/cost/contract-manage/report-manage-api'
import { formatThousandWithPlaces } from '@/utils/big-number'
import { ElMessage } from 'element-plus'
import BaseSearchCard from "@/components/base/base-search-card.vue";
import { buildSupPerformTree } from '../utils/supplier-performance'

defineOptions({ name: 'supplier-performance' })

// ---------- 树形配置 ----------
const treeConfig = {
    childrenField: 'children',
    hasChildrenField: 'hasChildren',
    expandAll: false,
    accordion: false,
}

// ---------- 查询参数 ----------
const queryParams = ref({
    segId: undefined,
    projIds: [],
    supName: '',
    payDate: [],
    unit: '万元',
})

// ---------- 引用与状态 ----------
const queryRef = ref()
const vxeTableRef = ref<InstanceType<typeof VxeEditableTable>>()
const segOptions = ref([])
const projectOptions = ref([])
const tableData = ref([])
const tableLoading = ref(false)
const exportLoading = ref(false)

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
const tableColumns: any = [
    { prop: 'supName', label: '供应商', minWidth: 200, align: 'left', fixed: "left", treeNode: true },
    { prop: 'projName', label: '项目', minWidth: 180, fixed: "left" },
    {
        label: '合同基本信息',
        children: [
            { prop: 'conSysNo', label: '合同编号', minWidth: 180 },
            { prop: 'conName', label: '合同名称', minWidth: 240 },
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
            { prop: 'signAmt', label: '签约金额', minWidth: 100 },
            { prop: 'addAmt', label: '补充合同', minWidth: 100 },
            { prop: 'changeAmt', label: '变更', minWidth: 120 },
            { prop: 'visaAmt', label: '签证', minWidth: 100 },
            { prop: 'estConAmt', label: '系统预结算', minWidth: 100 },
            { prop: 'settleAmt', label: '结算金额', minWidth: 100 },
        ],
    },
    {
        label: '产值与付款情况',
        children: [
            { prop: 'prodAmt', label: '产值', minWidth: 100 },
            { prop: 'payAmt', label: '应付', minWidth: 100 },
            { prop: 'reqAmt', label: '请款金额', minWidth: 100 },
            { prop: 'dedAmt', label: '款项调整', minWidth: 100 },
            { prop: 'factReqAmt', label: '实际请款', minWidth: 100 },
            { prop: 'paidAmt', label: '已支付', minWidth: 100 },
        ],
    },
    {
        label: '发票情况',
        children: [
            { prop: 'invcAmt', label: '已开票(含税)', minWidth: 120 },
            { prop: 'invcNotTaxAmt', label: '已开票(不含税)', minWidth: 120 },
            { prop: 'payInvOweAmt', label: '产值欠票', minWidth: 120 },
            { prop: 'factReqInvOweAmt', label: '请款欠票', minWidth: 120 },
        ],
    },
]

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
    queryParams.value.projIds = []
}

// ---------- 搜索 ----------
const handleSearch = () => {
    getDataList()
}

// ---------- 重置 ----------
const handleReset = async () => {
    queryParams.value.projIds = []
    queryParams.value.supName = ''
    queryParams.value.payDate = []
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

// ---------- 构建查询参数 ----------
const buildParams = () => {
    const { segId, projIds, supName, payDate } = queryParams.value
    let segIds = []
    if (segId) {
        if (segId === 9999) {
            segIds = []
        } else {
            segIds = [segId]
        }
    }
    return {
        segIds,
        projIds: projIds || [],
        supName: supName || undefined,
        payDateStart: payDate?.[0],
        payDateEnd: payDate?.[1],
        level: 99,
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
            console.log('treeData:', treeData)
            tableData.value = treeData
        }
    } catch (error) {
        console.error('获取列表失败:', error)
    } finally {
        tableLoading.value = false
    }
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