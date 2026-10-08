<!-- 产值申报明细表 -->
<template>
    <div class="output-value-detail-wrapper">
        <!-- 查询卡片 -->
        <BaseSearchCard>
            <template #form>
                <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="90px" class="search-form">
                    <el-form-item label="业务板块" prop="segId">
                        <el-select v-model="queryParams.segId" placeholder="请选择业务板块" style="width: 220px"
                            @change="changeSeg">
                            <el-option v-for="item in segOptions" :key="item.id" :label="item.segName"
                                :value="item.id" />
                        </el-select>
                    </el-form-item>

                    <el-form-item label="项目名称" prop="projIdList">
                        <el-cascader v-model="queryParams.projIdList" :options="projectData"
                            :collapse-tags-tooltip="true" :show-all-levels="false" :props="{
                                expandTrigger: 'hover',
                                emitPath: false,
                                checkStrictly: false,
                                value: 'orgId',
                                label: 'orgName',
                                children: 'children',
                                multiple: true,
                            }" placeholder="请选择项目" style="width: 220px" clearable filterable collapse-tags />
                    </el-form-item>
                    <!-- <el-form-item label="合同编号" prop="conSysNo">
                        <el-input v-model="queryParams.conSysNo" placeholder="请输入合同编号" clearable style="width: 220px" />
                    </el-form-item> -->
                    <!-- <el-form-item label="合同名称" prop="conName">
                        <el-input v-model="queryParams.conName" placeholder="请输入合同名称" clearable style="width: 220px" />
                    </el-form-item> -->
                    <!-- <el-form-item label="供应商名称" prop="supName">
                        <el-input v-model="queryParams.supName" placeholder="请输入供应商名称" clearable style="width: 220px" />
                    </el-form-item> -->
                    <el-form-item label="申报期间" prop="reqDate">
                        <el-date-picker v-model="queryParams.reqDate" value-format="YYYY-MM" type="monthrange"
                            range-separator="至" start-placeholder="开始月份" end-placeholder="结束月份" style="width: 220px" />
                    </el-form-item>
                    <el-form-item label="施工期间" prop="buildPeriod">
                        <el-date-picker v-model="queryParams.buildPeriod" value-format="YYYY-MM" type="monthrange"
                            range-separator="至" start-placeholder="开始月份" end-placeholder="结束月份" style="width: 220px" />
                    </el-form-item>
                    <el-form-item label="产值期间" prop="prodValPeriod">
                        <el-date-picker v-model="queryParams.prodValPeriod" value-format="YYYY-MM" type="monthrange"
                            range-separator="至" start-placeholder="开始月份" end-placeholder="结束月份" style="width: 220px" />
                    </el-form-item>
                    <el-form-item label="解锁期间" prop="payDate">
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
                <el-input v-model="queryParams.keyWord" placeholder="请输入合同名称、合同编号、供应商名称、产值单据号、单据标题" clearable
                    style="width:636px" />
                <el-button type="primary" @click="handleSearch" :loading="submitLoading">搜索</el-button>
                <el-button @click="handleReset" :loading="submitLoading">重置</el-button>
                <el-button type="primary" :loading="exportLoading" @click="handleExport" class="btn-export" plain
                    :disabled="!menuStore.hasExactPermission(PERMISSIONS.OUTPUT_DETAIL_EXPORT)">
                    <el-icon>
                        <Download />
                    </el-icon>
                    导出
                </el-button>
            </template>
        </BaseSearchCard>

        <!-- 表格卡片 -->
        <div class="table-card">
            <vxe-editable-table ref="vxeTableRef" v-model="paginatedData" :columns="columns" :rowKey="'id'"
                :loading="tableLoading" :readonly="true" :show-footer="true" :pagination="true" :total="total"
                :page-size="pageSize" :current-page="currentPage" @pagination-change="handlePageChange">
            </vxe-editable-table>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api";
import { reportManageApi } from "@/api/cost/contract-manage/report-manage-api";
import { formatThousandWithPlaces } from "@/utils/big-number";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import dayjs from "dayjs";
import { PERMISSIONS } from "@/constants/permission";
import { useMenuStore } from "@/stores/menu-store";
import BaseSearchCard from "@/components/base/base-search-card.vue";

defineOptions({ name: "output-value-detail" });

const route = useRoute();
const router = useRouter();
const menuStore = useMenuStore();

const queryParams = ref({
    segId: undefined,
    projIdList: [], // 项目ID列表
    // conSysNo: undefined, // 合同编号
    // conName: undefined, // 合同名称
    // supName: undefined, // 供应商名称
    reqDate: [], // 申报期间
    buildPeriod: [], // 施工期间
    prodValPeriod: [], // 产值期间
    payDate: [], // 解锁期间
    unit: "万元", // 单位
    conId: undefined, // 合同ID
    keyWord: undefined, // 关键字
});

const projectOptions = ref([]);
const segOptions = ref([]);
const tableLoading = ref(false);
const tableData = ref([]);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const submitLoading = ref(false);
const exportLoading = ref(false);

// 保存初始查询参数快照（不包含 conId）
const initialFilters = ref<any>({});

// 辅助：获取当前查询参数的深拷贝副本（排除 conId）
const getSnapshot = (params: any) => {
    // 使用 JSON 序列化/反序列化实现深拷贝，简单可靠
    const { conId, ...rest } = params;
    return JSON.parse(JSON.stringify(rest));
};

// 计算项目数据（根据板块过滤）
const projectData = computed(() => {
    const segId = queryParams.value.segId;
    if (segId) {
        if (segId == 9999) {
            // 选择全部，返回地产项目（orgId==2）
            return projectOptions.value.filter((item) => item.orgId == 2) || [];
        } else {
            return projectOptions.value.filter((item) => item.orgId == segId) || [];
        }
    } else {
        return [];
    }
});

const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return tableData.value.slice(start, end);
});
const columns: any = computed(() => {
    const unit = queryParams.value.unit; // 获取单位
    const decimalPlaces = unit === '万元' ? 4 : 2; // 根据单位设置小数位数
    return [
        { type: "index", label: "序号", width: 60 },
        { prop: 'prodBillNo', label: '产值单据号', minWidth: 140 },
        { prop: 'bizTitle', label: '标题', minWidth: 150 },
        { prop: 'projName', label: '项目', minWidth: 120 },
        { prop: 'segName', label: '板块', width: 90 },
        { prop: 'conSysNo', label: '合同编号', minWidth: 130 },
        { prop: 'conName', label: '合同名称', minWidth: 150 },
        { prop: 'supName', label: '供应商名称', minWidth: 150 },
        { prop: 'conTypeName', label: '合同分类', minWidth: 120 },
        { prop: 'applyProdVal', label: `申报产值(${unit})`, width: 120, showSummary: true, decimalPlaces: decimalPlaces, formatter: (v) => formatThousandWithPlaces(v, decimalPlaces) },
        { prop: 'applyPayAmt', label: `申报应付(${unit})`, width: 120, showSummary: true, decimalPlaces: decimalPlaces, formatter: (v) => formatThousandWithPlaces(v, decimalPlaces) },
        { prop: 'costProdVal', label: `成本确认产值(${unit})`, width: 130, showSummary: true, decimalPlaces: decimalPlaces, formatter: (v) => formatThousandWithPlaces(v, decimalPlaces) },
        { prop: 'costPayAmt', label: `成本确认应付(${unit})`, width: 130, showSummary: true, decimalPlaces: decimalPlaces, formatter: (v) => formatThousandWithPlaces(v, decimalPlaces) },
        { prop: 'unlockPayAmt', label: `解锁应付(${unit})`, width: 120, showSummary: true, decimalPlaces: decimalPlaces, formatter: (v) => formatThousandWithPlaces(v, decimalPlaces) },
    ];
})

const changeSeg = (val: number) => {
    queryParams.value.projIdList = [];
};

const handleSearch = () => {
    currentPage.value = 1;
    pageSize.value = 20;

    // 比较当前条件与初始快照是否一致
    const currentSnapshot = getSnapshot(queryParams.value);
    if (JSON.stringify(currentSnapshot) !== JSON.stringify(initialFilters.value)) {
        // 条件已变化 → 清除隐藏的 conId
        queryParams.value.conId = undefined;
    }

    getDataList();
};

const handleReset = () => {
    currentPage.value = 1;
    pageSize.value = 20;
    Object.keys(queryParams.value).forEach((key) => {
        queryParams.value[key] = Array.isArray(queryParams.value[key]) ? [] : undefined;
    });
    queryParams.value.unit = "万元";
    router.replace({ path: route.path, query: {} })
    // 默认选中第一个板块
    selectedDefaultSeg();
    handleSearch();
};
const handlePageChange = (params: {
    currentPage: number;
    pageSize: number;
}) => {
    currentPage.value = params.currentPage;
    pageSize.value = params.pageSize;
};

// 获取业务板块
const getSegOptions = async () => {
    try {
        const res = await dictionaryApi.getsegmentList({ isAuth: true });
        if (res.code === 200 && res.data) {
            const list = res.data || [];
            const hasDiChan = list.some(item => item.id === 2);
            const hasJianZhu = list.some(item => item.id === 7);
            if (hasDiChan && hasJianZhu) {
                const allOption = { id: 9999, segName: '全部' };
                segOptions.value = [allOption, ...list];
            } else {
                segOptions.value = list;
            }
        }
    } catch (error) {
        console.error("获取业务板块列表失败:", error);
    }
};

// 设置默认选中第一个业务归属
const selectedDefaultSeg = async () => {
    if (segOptions.value && segOptions.value.length > 0) {
        const firstSeg = segOptions.value[0];
        if (firstSeg) {
            queryParams.value.segId = firstSeg.id;
            changeSeg(firstSeg.id);
        }
    }
};

// 获取项目
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
const buildParams = () => {
    const { segId, reqDate, buildPeriod, prodValPeriod, payDate, ...rest } = queryParams.value;
    let segIdList = []
    if (segId) {
        if (segId == 9999) {
            // segIdList = segOptions.value.map((item) => item.id).filter((vi) => vi != 9999);
            // 全部传空数组
            segIdList = [];
        } else {
            segIdList = [segId];
        }
    }

    const params = {
        ...rest,
        segIdList: segIdList,
        payDateStart: formatDateRange(payDate, 'start'),
        payDateEnd: formatDateRange(payDate, 'end'),
        reqDateStart: formatDateRange(reqDate, 'start'),
        reqDateEnd: formatDateRange(reqDate, 'end'),
        buildPeriodStart: formatDateRange(buildPeriod, 'start'),
        buildPeriodEnd: formatDateRange(buildPeriod, 'end'),
        prodValPeriodStart: formatDateRange(prodValPeriod, 'start'),
        prodValPeriodEnd: formatDateRange(prodValPeriod, 'end'),
    };
    return params;
}
const getDataList = async () => {
    try {
        submitLoading.value = true;
        tableLoading.value = true;
        const params = buildParams();
        const res = await reportManageApi.getProdValDetailReport(params);
        if (res.code === 200) {
            const list = res.data || [];
            tableData.value = list;
            total.value = list.length;
        }
    } catch (error) {
        console.error("获取项目产值列表失败:", error);
    } finally {
        submitLoading.value = false;
        tableLoading.value = false;
    }
}
const handleExport = async () => {
    try {
        exportLoading.value = true;
        const params = buildParams();
        const fileBlob = await reportManageApi.exportProdValDetailReport({ ...params, isExport: true });
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
// 处理查询参数
const initQueryParams = async () => {
    console.log("解析路由参数", route.query);
    if (route.query?.data) {
        try {
            const routeData = JSON.parse(route.query.data as string);
            console.log("解析路由参数成功", routeData);
            if (routeData) {
                queryParams.value.segId = routeData.segId;
                queryParams.value.projIdList = routeData.projId ? [routeData.projId] : [];
                queryParams.value.conId = routeData?.conId;
                queryParams.value.unit = routeData?.unit || '元';
            }
        } catch (error) {
            console.error("解析路由参数失败，使用默认值", error);
        }
    } else {
        // 没有路由参数，默认
        selectedDefaultSeg();
    }
    // 保存初始快照（在完成所有默认值赋值之后）
    initialFilters.value = getSnapshot(queryParams.value);
};

onMounted(async () => {
    await Promise.all([getProjectOptions(), getSegOptions()]);
    await selectedDefaultSeg();
    await initQueryParams();
    getDataList();
});
</script>

<style lang="scss" scoped>
.output-value-detail-wrapper {
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
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;

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

    }
}
</style>