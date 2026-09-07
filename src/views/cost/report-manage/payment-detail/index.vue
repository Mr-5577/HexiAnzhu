<!-- 请款执行明细 -->
<template>
    <div class="payment-overview-wrapper">
        <!-- 查询卡片 -->
        <div class="search-card">
            <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="90px" class="search-form">
                <el-form-item label="业务板块" prop="segId">
                    <el-select v-model="queryParams.segId" placeholder="请选择业务板块" style="width: 180px"
                        @change="changeSeg">
                        <el-option v-for="item in segOptions" :key="item.id" :label="item.segName" :value="item.id" />
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

                <el-form-item label="支付日期" prop="payDate">
                    <el-date-picker v-model="queryParams.payDate" type="daterange" range-separator="至"
                        value-format="YYYY-MM-DD" start-placeholder="开始日期" end-placeholder="结束日期"
                        style="width: 220px" />
                </el-form-item>

                <el-form-item label="支付公司" prop="payCompId">
                    <el-select v-model="queryParams.payCompId" placeholder="请选择公司" clearable filterable
                        style="width: 200px">
                        <el-option v-for="item in companyOptions" :key="item.id" :label="item.compName"
                            :value="item.id" />
                    </el-select>
                </el-form-item>

                <el-form-item label="费用所属组织" prop="finaOrgId">
                    <el-cascader v-model="queryParams.finaOrgId" :options="orgOptions" :collapse-tags="true"
                        :collapse-tags-tooltip="true" :max-collapse-tags="1" :show-all-levels="false" :props="{
                            expandTrigger: 'hover',
                            emitPath: false,
                            checkStrictly: false,
                            value: 'id',
                            label: 'orgName',
                            children: 'children',
                            multiple: false,
                        }" placeholder="请选择组织" style="width: 220px" clearable filterable />
                </el-form-item>

                <el-form-item label="请款单号" prop="reqNo">
                    <el-input v-model="queryParams.reqNo" placeholder="请输入请款单号" clearable style="width: 180px" />
                </el-form-item>

                <el-form-item class="action-buttons">
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
                        :disabled="!menuStore.hasExactPermission(PERMISSIONS.PAY_DETAIL_EXPORT)">
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
                :loading="tableLoading" :readonly="true" :pagination="true" :total="total" :page-size="pageSize"
                :current-page="currentPage" @pagination-change="handlePaginationChange" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { Search, Refresh, Download } from '@element-plus/icons-vue';
import type { TableColumnItem } from "@/components/base/base-table.vue";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api";
import dayjs from "dayjs";
import mdApi from "@/api/system/md-api";
import { reportManageApi } from "@/api/cost/contract-manage/report-manage-api";
import { ElMessage } from "element-plus";
import { buildTree } from "@/utils/tree";
import { useRoute, useRouter } from "vue-router";
import { formatThousandWithPlaces } from "@/utils/big-number";
import { PERMISSIONS } from "@/constants/permission";
import { useMenuStore } from "@/stores/menu-store";

defineOptions({ name: "payment-detail" });

const route = useRoute();
const router = useRouter();
const menuStore = useMenuStore();

const queryParams = ref({
    reqNo: undefined,
    segId: undefined,
    projIds: [],
    payCompId: undefined,
    payDate: [],
    finaOrgId: undefined,
    conId: undefined,
});

const segOptions = ref([]);
const projectOptions = ref([]);
const companyOptions = ref([]);
const orgOptions = ref([]);

// 保存初始查询参数快照（不包含 conId）
const initialFilters = ref<any>({});

// 辅助：获取当前查询参数的深拷贝副本（排除 conId）
const getSnapshot = (params: any) => {
    // 使用 JSON 序列化/反序列化实现深拷贝，简单可靠
    const { conId, ...rest } = params;
    return JSON.parse(JSON.stringify(rest));
};

const projectData = computed(() => {
    const segId = queryParams.value.segId;
    if (segId) {
        if (segId === 9999) {
            // 选择“全部” → 返回地产板块（orgId=2）的项目
            return projectOptions.value.filter((item) => item.orgId === 2) || [];
        } else {
            return projectOptions.value.filter((item) => item.orgId === segId) || [];
        }
    } else {
        return [];
    }
});

const tableLoading = ref(false);
const tableData = ref([]);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const submitLoading = ref(false);
const exportLoading = ref(false);

const columns: TableColumnItem[] = [
    { type: "index", label: "序号", width: 60, fixed: "left" },
    { prop: "reqNo", label: "请款单号", width: 150, fixed: "left" },
    { prop: "segName", label: "业务板块", width: 80, fixed: "left" },
    { prop: "projName", label: "项目名称", width: 120, fixed: "left" },
    { prop: "reqAmt", label: "请款金额", width: 120, formatter: (v) => formatThousandWithPlaces(v) },
    { prop: "payAmt", label: "支付金额", width: 120, formatter: (v) => formatThousandWithPlaces(v) },
    { prop: "lastPayDate", label: "支付日期", width: 100 },
    { prop: "reqDesc", label: "摘要", width: 200 },
    { prop: "applyUser", label: "申请人", width: 90 },
    { prop: "finaOrgName", label: "费用所属组织", width: 130 },
    { prop: "finaTypeName", label: "费用类型", width: 100 },
    { prop: "finaSubName", label: "科目", width: 120 },
    { prop: "payWayName", label: "支付方式", width: 100 },
    { prop: "compName", label: "支付公司", width: 150 },
    { prop: "bankName", label: "收款方开户行", width: 150 },
    { prop: "accountName", label: "收款方账户名", width: 150 },
    { prop: "bankAccount", label: "收款方账号", width: 150 },

];

const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return tableData.value.slice(start, end);
});

const buildParams = () => {
    const { payDate, segId, ...rest } = queryParams.value;
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
        segIds: segIdList,
        payDateStart: payDate?.[0],
        payDateEnd: payDate?.[1],

    };
    return params;
}
// 获取列表数据
const getDataList = async () => {
    try {
        submitLoading.value = true;
        tableLoading.value = true;
        const params = buildParams();
        const res = await reportManageApi.getReportSub({ ...params });
        if (res.code === 200) {
            const list = res.data || [];
            tableData.value = list;
            total.value = list?.length || 0;
        }
    } catch (error) {
        console.error("获取请款执行概览列表失败:", error);
    } finally {
        submitLoading.value = false;
        tableLoading.value = false;
    }
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
        if (key === "statMonth") {
            queryParams.value[key] = dayjs().format("YYYY-MM");
        } else if (Array.isArray(queryParams.value[key])) {
            queryParams.value[key] = [];
        } else {
            queryParams.value[key] = undefined;
        }
    });
    router.replace({ path: route.path, query: {} })
    // 恢复默认板块（同时刷新公司列表）
    selectedDefaultSeg();
    getDataList();
};

const handlePaginationChange = (params: any) => {
    currentPage.value = params.currentPage;
    pageSize.value = params.pageSize;
};

const handleExport = async () => {
    try {
        exportLoading.value = true;
        const params = buildParams();
        const fileBlob = await reportManageApi.exportReportSub({ ...params, isExport: true });
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
// 项目数据
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
const getSegOptions = async () => {
    try {
        const res = await dictionaryApi.getsegmentList({ isAuth: true });
        if (res.code === 200 && res.data) {
            const list = res.data || [];
            // 判断是否同时存在“地产”和“建筑”
            const hasDiChan = list.some(item => item.id === 2);
            const hasJianZhu = list.some(item => item.id === 7);
            if (hasDiChan && hasJianZhu) {
                // 构造“全部”选项
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
const selectedDefaultSeg = () => {
    if (segOptions.value && segOptions.value.length > 0) {
        const firstSeg = segOptions.value[0];
        if (firstSeg) {
            queryParams.value.segId = firstSeg.id;
            changeSeg(firstSeg.id);
        }
    }
}
// 板块切换
const changeSeg = (val: number) => {
    queryParams.value.projIds = [];        // 清空项目
    queryParams.value.payCompId = undefined;
    companyOptions.value = [];
    queryParams.value.finaOrgId = undefined;
    orgOptions.value = [];
    if (val) {
        if (val === 9999) {
            // 选择全部 → 加载地产板块的公司
            getCompanyList(2);
            // 加载地产板块的费用组织
            getFinaOrgListBySegId(2);
        } else {
            getCompanyList(val);
            getFinaOrgListBySegId(val);
        }
    }
};
// 获取板块下的公司
const getCompanyList = async (segId: number) => {
    try {
        const res = await mdApi.getProjCompanyList({ segId });
        if (res.code === 200) {
            companyOptions.value = res.data || [];
        }
    } catch (error) {
        console.error("获取公司列表失败:", error);
    }
};
// 获取板块下的费用组织
const getFinaOrgListBySegId = async (segId: number) => {
    if (!segId) return;
    try {
        const res = await dictionaryApi.getFinaOrgList({ segId: segId });
        if (res.code === 200) {
            const list = res.data || [];
            const orgTreeData: any = buildTree(list);
            orgOptions.value = orgTreeData || [];
        }
    } catch (error) {
        console.error("获取项目列表失败:", error);
    }
};
// 处理查询参数
const initQueryParams = () => {
    // 如果有路由参数，使用路由参数
    if (route.query?.data) {
        try {
            const routeData = JSON.parse(route.query.data as string);
            console.log("解析路由参数成功", routeData);
            if (routeData) {
                queryParams.value.segId = routeData.segId;
                queryParams.value.projIds = [routeData.projId];
                queryParams.value.payCompId = routeData.compId;
                queryParams.value.reqNo = routeData.reqNo;
                queryParams.value.conId = routeData?.conId;
                // 加载地产板块的公司
                getCompanyList(routeData.segId);
                // 加载地产板块的费用组织
                getFinaOrgListBySegId(routeData.segId);
            }
        } catch (error) {
            console.error("解析路由参数失败，使用默认值", error);
        }
    } else {
        // 没有路由参数，默认
        selectedDefaultSeg();
    }
};
onMounted(async () => {
    await Promise.all([getProjectOptions(), getSegOptions()]);
    // // 先设置默认板块
    // selectedDefaultSeg();
    // 先解析参数
    initQueryParams();
    // 再获取数据
    getDataList();
});
</script>

<style lang="scss" scoped>
.payment-overview-wrapper {
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

    // ===== 查询卡片 =====
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
            :deep(.el-cascader .el-input__wrapper),
            :deep(.el-date-editor .el-input__wrapper) {
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

            // 强制 el-cascader 多选保持单行，不被撑高
            :deep(.el-cascader) {

                // 1. 限制输入框整体高度，并禁止换行
                .el-input__wrapper {
                    flex-wrap: nowrap !important;
                    overflow: hidden !important;
                    height: 32px !important; // 与默认高度保持一致
                    min-height: 32px !important;
                    align-items: center !important;
                }

                // 2. 核心：让 tags 容器也不换行，并裁剪溢出
                .el-cascader__tags {
                    flex-wrap: nowrap !important;
                    overflow: hidden !important;
                    flex: 1 1 auto !important;
                    min-width: 0 !important; // 防止 flex 溢出父容器
                    height: 100% !important; // 继承父容器高度
                    align-items: center !important;

                    // 3. 对单个标签做文字溢出省略（可选）
                    .el-tag {
                        flex-shrink: 0 !important; // 防止标签被压缩变形
                        max-width: 100px; // 限制单个标签宽度，避免占用太多空间
                        height: 22px !important; // 与默认 tag 高度一致
                        line-height: 22px !important;

                        .el-tag__content {
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        }
                    }

                    // 4. “+N” 折叠标签也保持同行
                    .el-tag--info {
                        flex-shrink: 0 !important;
                    }
                }
            }
        }
    }

    // ===== 表格卡片 =====
    .table-card {
        flex: 1;
        min-height: 0;
        background: #ffffff;
        border-radius: 12px;
        padding: 15px 15px 8px 15px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06);
        border: 1px solid #edf2f7;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    // ===== 响应式适配 =====
    @media screen and (max-width: 1200px) {
        .search-card .search-form .action-buttons {
            margin-left: 0;
            width: 100%;
            justify-content: flex-end;
            padding-top: 4px;
        }
    }
}
</style>