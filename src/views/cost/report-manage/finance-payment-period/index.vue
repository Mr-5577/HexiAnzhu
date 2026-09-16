<!-- 财务支付分析-期间维度 -->
<template>
    <div class="finance-payment-period-wrapper">
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

                    <el-form-item label="付款期间" prop="payDate">
                        <el-date-picker v-model="queryParams.payDate" value-format="YYYY-MM" type="monthrange"
                            range-separator="至" start-placeholder="开始月份" end-placeholder="结束月份" style="width: 220px" />
                    </el-form-item>

                    <!-- <el-form-item label="单位" prop="unit">
                        <el-select v-model="queryParams.unit" placeholder="请选择单位" :clearable="false"
                            style="width: 220px" @change="handleSearch">
                            <el-option label="万元" value="万元" />
                            <el-option label="元" value="元" />
                        </el-select>
                    </el-form-item> -->

                    <el-form-item label="支付公司" prop="payCompId">
                        <el-select v-model="queryParams.payCompId" placeholder="请选择公司" clearable filterable
                            style="width: 220px">
                            <el-option v-for="item in companyOptions" :key="item.id" :label="item.compName"
                                :value="item.id" />
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
                    :disabled="!menuStore.hasExactPermission(PERMISSIONS.PERIOD_PAY_EXPORT)">
                    <el-icon>
                        <Download />
                    </el-icon>
                    导出
                </el-button>
            </template>
        </BaseSearchCard>

        <!-- 统计卡片 -->
        <statistics-info :summary="summaryData" :unit="queryParams.unit"></statistics-info>

        <div class="content-placeholder">
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
                        @click="handleExpandLevel(999)">全部展开</el-button>
                    <el-button size="small" :type="expandLevel === 0 ? 'primary' : ''"
                        @click="handleExpandLevel(0)">全部收起</el-button>
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
                :loading="tableLoading" :treeConfig="treeConfig" :readonly="true" :pagination="false">
            </vxe-editable-table>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { Search, Refresh, Download } from '@element-plus/icons-vue'
import VxeEditableTable from '@/components/base/vxe-editable-table.vue'
import { projectAreaApi } from '@/api/cost/master-data/project-area-api'
import { dictionaryApi } from '@/api/cost/master-data/dictionary-api'
import { reportManageApi } from '@/api/cost/contract-manage/report-manage-api'
import { formatPercent, formatThousandWithPlaces } from '@/utils/big-number'
import { ElMessage } from 'element-plus'
import dayjs from "dayjs";
import { calcMaxDepth, formatDateRange, getSummaryData, levelMap } from '../utils/common.ts'
import StatisticsInfo from "../components/finan-pay-statistics-card.vue";
import mdApi from '@/api/system/md-api.ts'
import { buildTreeAndFillData } from '../utils/finance-payment-period.ts'
import { PERMISSIONS } from '@/constants/permission.ts'
import { useMenuStore } from "@/stores/menu-store";

defineOptions({ name: 'finance-payment-period' })

const menuStore = useMenuStore();

// ---------- 树形配置 ----------
const treeConfig = {
    childrenField: 'children',
    hasChildrenField: 'hasChildren',
    expandAll: false,
    accordion: false,
}

const queryParams = ref({
    segId: undefined,
    projIds: [],
    payDate: [],
    payCompId: undefined,
    unit: '万元',
})

const vxeTableRef = ref<InstanceType<typeof VxeEditableTable>>()
const segOptions = ref([])      // 存储板块列表（含"全部"）
const projectOptions = ref([])  // 全部项目树
const companyOptions = ref([])  // 当前板块下的公司
const maxDepth = ref(0)
const expandLevel = ref(1)
const tableData = ref([])
const headerList = ref([])
const tableLoading = ref(false)
const exportLoading = ref(false)
const summaryData = ref({
    all: '0',
    land: '0',
    engineering: '0',
    expense: '0',
    expenseDetails: [],
})

// 根据单位保留小数位数
const deci = computed(() => {
    const unit = queryParams.value.unit; // 获取单位
    return unit === '万元' ? 4 : 2; // 根据单位设置小数位数
})

// ---------- 计算属性：根据板块过滤项目树 ----------
const projectData = computed(() => {
    const segId = queryParams.value.segId
    if (!segId) return []
    if (segId === 9999) {
        // "全部" → 返回地产板块（orgId=2）的项目
        return projectOptions.value.filter((item) => item.orgId === 2) || []
    } else {
        return projectOptions.value.filter((item) => item.orgId === segId) || []
    }
})

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

const updateMaxDepth = () => {
    const depth = calcMaxDepth(tableData.value)
    maxDepth.value = Math.max(0, depth)
    if (expandLevel.value > maxDepth.value && maxDepth.value > 0) {
        expandLevel.value = 1
    } else if (maxDepth.value === 0) {
        expandLevel.value = 0
    }
}

// 动态构建 columns
const columns: any = computed(() => {
    // 固定列：科目编码、科目名称
    const fixedCols = [
        { prop: 'sub_code', label: '科目编码', width: 120, fixed: 'left' },
        { prop: 'sub_name', label: '科目名称', width: 200, fixed: 'left', align: 'left', treeNode: true },
        { prop: 'total', label: '汇总', width: 130, formatter: (val) => formatThousandWithPlaces(val, deci.value), },
    ];

    // 动态月份列
    const monthCols = headerList.value.map((month) => ({
        prop: month,                    // 列属性名，如 '2026-01'
        label: month,                   // 列头显示，如 '2026-01'
        minWidth: 120,
        formatter: (val) => formatThousandWithPlaces(val, deci.value),
    }));

    return [...fixedCols, ...monthCols];
});

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

// ---------- 获取板块下的公司 ----------
const getCompanyList = async (segId: number) => {
    try {
        // 如果是"全部"，加载地产板块的公司
        const targetSegId = segId === 9999 ? 2 : segId
        const res = await mdApi.getProjCompanyList({ segId: targetSegId })
        if (res.code === 200) {
            companyOptions.value = res.data || []
        }
    } catch (error) {
        console.error('获取公司列表失败:', error)
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
const handleSegChange = async (val: number) => {
    // 清空项目多选
    queryParams.value.projIds = []
    // 清空支付公司
    queryParams.value.payCompId = undefined
    companyOptions.value = []
    // 加载公司列表
    if (val) {
        await getCompanyList(val)
    }
}

// ---------- 搜索 ----------
const handleSearch = () => {
    getDataList()
}

// ---------- 重置 ----------
const handleReset = async () => {
    queryParams.value.projIds = []
    queryParams.value.payCompId = undefined
    queryParams.value.payDate = []
    queryParams.value.unit = '万元'
    setDefaultSeg()
    // 等待板块切换完成后再搜索
    await nextTick()
    handleSearch()
}

// ---------- 导出 ----------
const handleExport = async () => {
    try {
        exportLoading.value = true
        const params = buildParams()
        const fileBlob = await reportManageApi.exportFinaPeriod({ ...params, isExport: true })
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
    const { segId, payDate, ...rest } = queryParams.value
    // 处理 segId：如果是 9999（全部），传 undefined 或不传，后端可能做特殊处理，这里传空数组表示全部
    let segIds = []
    if (segId) {
        if (segId === 9999) {
            segIds = [] // 全部
        } else {
            segIds = [segId]
        }
    }
    return {
        ...rest,
        segIds,
        payDateStart: formatDateRange(payDate, 'start'),
        payDateEnd: formatDateRange(payDate, 'end'),
        level: 99,
    }
}

// ---------- 获取列表数据 ----------
const getDataList = async () => {
    try {
        tableLoading.value = true
        const params = buildParams()
        const res = await reportManageApi.getFinaPeriod(params)
        if (res.code === 200 && res.data) {
            const { header, rows } = res.data;
            // 保存 header 用于生成 columns
            headerList.value = header;
            // 转换为树形结构并填充数据
            const treeData = buildTreeAndFillData(header, rows);
            tableData.value = treeData;
            // 获取统计数据
            const summyData = getSummaryData(treeData, deci.value)
            summaryData.value = summyData
            await nextTick()
            updateMaxDepth()
            if (maxDepth.value > 0) {
                expandLevel.value = 1
                await nextTick()
                handleExpandLevel(1)
            }
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
.finance-payment-period-wrapper {
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
        padding: 15px 15px 0;
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
}
</style>