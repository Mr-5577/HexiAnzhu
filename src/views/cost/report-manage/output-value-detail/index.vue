<!-- 产值申报明细表 -->
<template>
    <div class="output-value-detail-wrapper">
        <!-- 查询卡片 -->
        <div class="search-card">
            <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="80px" class="search-form">
                <el-form-item label="业务板块" prop="segId">
                    <el-select v-model="queryParams.segId" placeholder="请选择业务板块" style="width: 220px"
                        @change="changeSeg">
                        <el-option v-for="item in segOptions" :key="item.id" :label="item.segName" :value="item.id" />
                    </el-select>
                </el-form-item>

                <el-form-item label="项目名称" prop="projIdList">
                    <el-cascader v-model="queryParams.projIdList" :options="projectData" :collapse-tags-tooltip="true"
                        :show-all-levels="false" :props="{
                            expandTrigger: 'hover',
                            emitPath: false,
                            checkStrictly: false,
                            value: 'orgId',
                            label: 'orgName',
                            children: 'children',
                            multiple: true,
                        }" placeholder="请选择项目" style="width: 220px" clearable filterable collapse-tags />
                </el-form-item>
                <el-form-item label="合同编号" prop="conSysNo">
                    <el-input v-model="queryParams.conSysNo" placeholder="请输入合同编号" clearable style="width: 220px" />
                </el-form-item>
                <el-form-item label="合同名称" prop="conName">
                    <el-input v-model="queryParams.conName" placeholder="请输入合同名称" clearable style="width: 220px" />
                </el-form-item>
                <el-form-item label="供应商名称" prop="supName">
                    <el-input v-model="queryParams.supName" placeholder="请输入供应商名称" clearable style="width: 220px" />
                </el-form-item>
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

                <el-form-item>
                    <el-button type="primary" @click="handleSearch" :loading="submitLoading">搜索</el-button>
                    <el-button @click="handleReset" :loading="submitLoading">重置</el-button>
                    <el-button type="primary" :loading="exportLoading" @click="handleExport" class="btn-export" plain
                        :disabled="!menuStore.hasExactPermission(PERMISSIONS.OUTPUT_DETAIL_EXPORT)">
                        <el-icon>
                            <Download />
                        </el-icon>
                        导出
                    </el-button>
                </el-form-item>
            </el-form>
        </div>

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

defineOptions({ name: "output-value-detail" });

const route = useRoute();
const router = useRouter();
const menuStore = useMenuStore();

const queryParams = ref({
    segId: undefined,
    projIdList: [], // 项目ID列表
    conSysNo: undefined, // 合同编号
    conName: undefined, // 合同名称
    supName: undefined, // 供应商名称
    reqDate: [], // 申报期间
    buildPeriod: [], // 施工期间
    prodValPeriod: [], // 产值期间
    payDate: [], // 解锁期间
    conId: undefined, // 合同ID
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

const columns: any = [
    { type: "index", label: "序号", width: 60 },
    { prop: 'prodBillNo', label: '产值单据号', minWidth: 140 },
    { prop: 'bizTitle', label: '标题', minWidth: 150 },
    { prop: 'projName', label: '项目', minWidth: 120 },
    { prop: 'segName', label: '板块', width: 90 },
    { prop: 'conSysNo', label: '合同编号', minWidth: 130 },
    { prop: 'conName', label: '合同名称', minWidth: 150 },
    { prop: 'supName', label: '供应商名称', minWidth: 150 },
    { prop: 'conTypeName', label: '合同分类', minWidth: 120 },
    { prop: 'applyProdVal', label: '申报产值', width: 120, showSummary: true, formatter: (v) => formatThousandWithPlaces(v) },
    { prop: 'applyPayAmt', label: '申报应付', width: 120, showSummary: true, formatter: (v) => formatThousandWithPlaces(v) },
    { prop: 'costProdVal', label: '成本确认产值', width: 120, showSummary: true, formatter: (v) => formatThousandWithPlaces(v) },
    { prop: 'costPayAmt', label: '成本确认应付', width: 120, showSummary: true, formatter: (v) => formatThousandWithPlaces(v) },
    { prop: 'unlockPayAmt', label: '解锁应付', width: 120, showSummary: true, formatter: (v) => formatThousandWithPlaces(v) },
];

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
const buildParams = () => {
    const { segId, reqDate, buildPeriod, prodValPeriod, payDate, ...rest } = queryParams.value;
    let segIdList = []
    if (segId) {
        if (segId == 9999) {
            // 全部传空数组
            segIdList = [];
        } else {
            segIdList = [segId];
        }
    }

    const params = {
        ...rest,
        segIdList: segIdList,
        payDateStart: payDate?.[0] ? dayjs(payDate?.[0]).startOf('month').format('YYYY-MM-DD') : undefined,
        payDateEnd: payDate?.[1] ? dayjs(payDate?.[1]).endOf('month').format('YYYY-MM-DD') : undefined,
        reqDateStart: reqDate?.[0] ? dayjs(reqDate?.[0]).startOf('month').format('YYYY-MM-DD') : undefined,
        reqDateEnd: reqDate?.[1] ? dayjs(reqDate?.[1]).endOf('month').format('YYYY-MM-DD') : undefined,
        buildPeriodStart: buildPeriod?.[0] ? dayjs(buildPeriod?.[0]).startOf('month').format('YYYY-MM-DD') : undefined,
        buildPeriodEnd: buildPeriod?.[1] ? dayjs(buildPeriod?.[1]).endOf('month').format('YYYY-MM-DD') : undefined,
        prodValPeriodStart: prodValPeriod?.[0] ? dayjs(prodValPeriod?.[0]).startOf('month').format('YYYY-MM-DD') : undefined,
        prodValPeriodEnd: prodValPeriod?.[1] ? dayjs(prodValPeriod?.[1]).endOf('month').format('YYYY-MM-DD') : undefined,
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

            // 强制 el-cascader 多选保持单行
            :deep(.el-cascader) {
                .el-input__wrapper {
                    flex-wrap: nowrap !important;
                    overflow: hidden !important;
                    height: 32px !important;
                    min-height: 32px !important;
                    align-items: center !important;
                }

                .el-cascader__tags {
                    flex-wrap: nowrap !important;
                    overflow: hidden !important;
                    flex: 1 1 auto !important;
                    min-width: 0 !important;
                    height: 100% !important;
                    align-items: center !important;

                    .el-tag {
                        flex-shrink: 0 !important;
                        max-width: 100px;
                        height: 22px !important;
                        line-height: 22px !important;

                        .el-tag__content {
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        }
                    }

                    .el-tag--info {
                        flex-shrink: 0 !important;
                    }
                }
            }
        }
    }

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