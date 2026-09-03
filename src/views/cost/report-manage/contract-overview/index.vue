<!-- 合同执行概览 -->
<template>
    <div class="contract-overview-wrapper">
        <!-- 查询卡片 -->
        <div class="search-card">
            <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="90px" class="search-form">
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

                <el-form-item label="签约日期" prop="signDate">
                    <el-date-picker v-model="queryParams.signDate" type="daterange" range-separator="至"
                        value-format="YYYY-MM-DD" start-placeholder="开始日期" end-placeholder="结束日期"
                        style="width: 220px" />
                </el-form-item>

                <el-form-item label="甲方签约公司" prop="companyId">
                    <el-select v-model="queryParams.companyId" placeholder="请选择公司" clearable filterable
                        style="width: 220px">
                        <el-option v-for="item in companyOptions" :key="item.id" :label="item.compName"
                            :value="item.id" />
                    </el-select>
                </el-form-item>

                <el-form-item label="供应商名称" prop="supName">
                    <el-input v-model="queryParams.supName" placeholder="请输入供应商名称" clearable style="width: 220px" />
                </el-form-item>

                <el-form-item label="合同类型" prop="conProperty">
                    <EnumSelect v-model="queryParams.conProperty" :options="ConPropertyEnum" clearable
                        placeholder="请选择合同类型" :width="'220px'" />
                </el-form-item>

                <el-form-item label="合同分类" prop="conTypeIdList">
                    <el-cascader v-model="queryParams.conTypeIdList" :show-all-levels="false"
                        :collapse-tags-tooltip="true" :options="conCategoryOptions" :props="{
                            expandTrigger: 'hover',
                            emitPath: false,
                            checkStrictly: false,
                            value: 'id',
                            label: 'conTypeName',
                            children: 'children',
                            multiple: true,
                        }" placeholder="请选择合同分类" style="width: 220px" clearable filterable collapse-tags />
                </el-form-item>

                <el-form-item label="产值确认方式" prop="payMethod">
                    <EnumSelect v-model="queryParams.payMethod" :options="PayTypeEnum" clearable placeholder="请选择产值确认方式"
                        :width="'220px'" />
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
                    <el-button type="primary" :loading="exportLoading" @click="handleExport" class="btn-export" plain>
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
            <base-table :columns="columns" :tableData="paginatedData" :loading="tableLoading" :rowKey="'id'"
                :total="total" :current-page="currentPage" :page-size="pageSize"
                @pagination-change="handlePaginationChange" class="custom-table" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api";
import { exportExcel } from "@/utils/export-excel";
import { formatThousandWithPlaces } from "@/utils/big-number";
import { useMDStore } from "@/stores/md-store";
import { ConPropertyEnum, PayTypeEnum } from "@/constants/contract-manage/enums";
import EnumSelect from "@/components/base/base-enum-select.vue";
import { reportManageApi } from "@/api/cost/contract-manage/report-manage-api";
import mdApi from "@/api/system/md-api";

defineOptions({ name: "contract-overview" });

const router = useRouter();
const mdStore = useMDStore();

// ============ 查询参数 ============
const queryParams = ref({
    segId: undefined,
    projIdList: [],      // 项目ID列表（多选级联）
    signDate: [],      // 签约日期范围 [开始, 结束]
    companyId: undefined,      // 甲方签约公司
    supName: undefined,          // 供应商名称
    conProperty: undefined,      // 合同类型
    conTypeIdList: undefined,       // 合同分类（多选级联）
    payMethod: undefined,        // 产值确认方式
});

const projectOptions = ref([]);
const segOptions = ref([]);
const conCategoryOptions = ref([]);
const companyOptions = ref([]);

const tableLoading = ref(false);
const tableData = ref([]);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const submitLoading = ref(false);
const exportLoading = ref(false);

const projectData = computed(() => {
    const segId = queryParams.value.segId;
    if (segId) {
        if (segId == 9999) {
            // 选择全部，返回地产项目
            return projectOptions.value.filter((item) => item.orgId == 2) || [];
        } else {
            return projectOptions.value.filter((item) => item.orgId == segId) || [];
        }
    } else {
        return [];
    }
});

const columns: TableColumnItem[] = [
    { type: "index", label: "序号", width: 60, fixed: "left" },
    { prop: "segName", label: "业务板块", width: 80, fixed: "left" },
    { prop: "projName", label: "项目名称", width: 120, fixed: "left" },
    { prop: "conName", label: "合同名称", width: 150, fixed: "left" },
    { prop: "conSysNo", label: "合同编号", width: 150, fixed: "left" },
    {
        label: "合同基本信息",
        children: [
            { prop: "supName", label: "供应商名称", width: 120 },
            {
                prop: "conProperty",
                label: "合同类型",
                width: 80,
            },
            { prop: "conTypeName", label: "合同分类", width: 120 },
            { prop: "conTypeOwner", label: "合同分类归属", width: 120 },
            {
                prop: "payMethod",
                label: "产值确认方式",
                width: 120,
            },
            { prop: "companyName", label: "甲方签约公司", width: 120 },
            { prop: "agentName", label: "甲方经办人", width: 100 },
            { prop: "signDate", label: "签订日期", width: 100 },
            {
                prop: "taxRate",
                label: "税率",
                width: 80,
                formatter: (row) => row.taxRate ? `${row.taxRate}%` : "-",
            },
            {
                prop: "pbAmt",
                label: "应交履约保证金",
                width: 120,
                formatter: (row) => formatThousandWithPlaces(row.pbAmt || 0),
            },
            {
                prop: "pbRecvAmt",
                label: "已交履约保证金",
                width: 120,
                formatter: (row) => formatThousandWithPlaces(row.pbRecvAmt || 0),
            },
            {
                prop: "pbRefundAmt",
                label: "已退履约保证金",
                width: 120,
                formatter: (row) => formatThousandWithPlaces(row.pbRefundAmt || 0),
            },
            { prop: "needSettle", label: "是否需办结算", width: 110 },
        ],
    },
    {
        label: "履约过程",
        children: [
            {
                prop: "signAmt",
                label: "合同签约金额",
                width: 120,
                formatter: (row) => formatThousandWithPlaces(row.signAmt || 0),
            },
            {
                prop: "addAmt",
                label: "补充合同金额",
                width: 120,
                formatter: (row) => formatThousandWithPlaces(row.addAmt || 0),
            },
            {
                prop: "changeAmt",
                label: "变更金额",
                width: 100,
                formatter: (row) => formatThousandWithPlaces(row.changeAmt || 0),
            },
            {
                prop: "visaAmt",
                label: "签证金额",
                width: 100,
                formatter: (row) => formatThousandWithPlaces(row.visaAmt || 0),
            },
            {
                prop: "estConAmt",
                label: "系统预估合同金额",
                width: 160,
                formatter: (row) => formatThousandWithPlaces(row.estConAmt || 0),
                headerTip: {
                    icon: "QuestionFilled",
                    content: "合同+补充+变更+签证的金额",
                    placement: "top",
                    width: "200px",
                },
            },
            {
                prop: "settleAmt",
                label: "结算金额",
                width: 110,
                formatter: (row) => formatThousandWithPlaces(row.settleAmt || 0),
            },
        ],
    },
    {
        label: "支付情况",
        children: [
            {
                prop: "prodAmt",
                label: "产值金额",
                width: 100,
                formatter: (row) => formatThousandWithPlaces(row.prodAmt || 0),
            },
            {
                prop: "payAmt",
                label: "应付金额",
                width: 100,
                formatter: (row) => formatThousandWithPlaces(row.payAmt || 0),
            },
            {
                prop: "unlockPayAmt",
                label: "解锁应付金额",
                width: 120,
                formatter: (row) => formatThousandWithPlaces(row.unlockPayAmt || 0),
            },
            {
                prop: "reqAmt",
                label: "请款金额",
                width: 100,
                formatter: (row) => formatThousandWithPlaces(row.reqAmt || 0),
            },
            {
                prop: "prepayReqAmt",
                label: "其中预付款请款金额",
                width: 140,
                formatter: (row) => formatThousandWithPlaces(row.prepayReqAmt || 0),
            },
            {
                prop: "dedAmt",
                label: "款项调整金额",
                width: 120,
                formatter: (row) => formatThousandWithPlaces(row.dedAmt || 0),
            },
            {
                prop: "factReqAmt",
                label: "实际请款金额",
                width: 120,
                formatter: (row) => formatThousandWithPlaces(row.factReqAmt || 0),
            },
            {
                prop: "paidAmt",
                label: "已付金额",
                width: 100,
                formatter: (row) => formatThousandWithPlaces(row.paidAmt || 0),
            },
            {
                prop: "reqOweAmt",
                label: "请款欠款金额",
                width: 120,
                formatter: (row) => formatThousandWithPlaces(row.reqOweAmt || 0),
            },
            {
                prop: "payOweAmt",
                label: "应付欠款金额",
                width: 120,
                formatter: (row) => formatThousandWithPlaces(row.payOweAmt || 0),
            },
        ],
    },
    {
        label: "发票",
        children: [
            {
                prop: "invcAmt",
                label: "开票金额(含税)",
                width: 120,
                formatter: (row) => formatThousandWithPlaces(row.invcAmt || 0),
            },
            {
                prop: "invcNotTaxAmt",
                label: "开票金额(不含税)",
                width: 140,
                formatter: (row) => formatThousandWithPlaces(row.invcNotTaxAmt || 0),
            },
            {
                prop: "reqInvOweAmt",
                label: "请款欠票额",
                width: 120,
                formatter: (row) => formatThousandWithPlaces(row.reqInvOweAmt || 0),
            },
            {
                prop: "payInvOweAmt",
                label: "应付欠票额",
                width: 120,
                formatter: (row) => formatThousandWithPlaces(row.payInvOweAmt || 0),
            },
            {
                prop: "paidInvOweAmt",
                label: "已付欠票额",
                width: 120,
                formatter: (row) => formatThousandWithPlaces(row.paidInvOweAmt || 0),
            },
        ],
    },
];

const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return tableData.value.slice(start, end);
});

const buildParams = () => {
    let segIdList = []
    if (queryParams.value.segId) {
        if (queryParams.value.segId == 9999) {
            segIdList = segOptions.value.map((item) => item.id).filter((vi) => vi != 9999);
        } else {
            segIdList = [queryParams.value.segId];
        }
    }
    const params = {
        segIdList: segIdList,
        projIdList: queryParams.value.projIdList,
        signDateStart: queryParams.value.signDate?.[0],
        signDateEnd: queryParams.value.signDate?.[1],
        companyId: queryParams.value.companyId,
        supName: queryParams.value.supName,
        conProperty: queryParams.value.conProperty,
        conTypeIdList: queryParams.value.conTypeIdList,
        payMethod: queryParams.value.payMethod,
    };
    return params;
}
// 获取列表
const getDataList = async () => {
    try {
        submitLoading.value = true;
        tableLoading.value = true;
        const params = buildParams();
        const res = await reportManageApi.getExecutionReport(params);
        if (res.code === 200) {
            tableData.value = res.data || [];
            total.value = res.data?.length || 0;
        }
    } catch (error) {
        console.error("获取列表失败:", error);
    } finally {
        submitLoading.value = false;
        tableLoading.value = false;
    }
};
// 选中业务板块
const changeSeg = (val: number) => {
    queryParams.value.projIdList = [];
    queryParams.value.companyId = undefined;
    companyOptions.value = [];
    if (val) {
        if (val === 9999) {
            // 选择全部，查询地产下的公司
            getCompanyList(2);
        } else {
            // 否则，查询选中业务板块下的公司
            getCompanyList(val);
        }
    }
}
const handleSearch = () => {
    currentPage.value = 1;
    pageSize.value = 20;
    getDataList();
};

const handleReset = () => {
    currentPage.value = 1;
    pageSize.value = 20;
    Object.keys(queryParams.value).forEach((key) => {
        queryParams.value[key] = Array.isArray(queryParams.value[key]) ? [] : undefined;
    });
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
        const res = await reportManageApi.getExecutionReport({ ...params, isExport: true });
        if (res.code === 200) {
            const list = res.data || [];
            const headerMap = {
                segName: "业务板块",
                projName: "项目名称",
                conName: "合同名称",
                conSysNo: "合同编号",
                supName: "供应商名称",
                conProperty: "合同类型",
                conTypeName: "合同分类",
                conTypeOwner: "合同分类归属",
                payMethod: "产值确认方式",
                companyName: "甲方签约公司",
                agentName: "甲方经办人",
                signDate: "签订日期",
                pbAmt: "应交履约保证金",
                pbRecvAmt: "已交履约保证金",
                pbRefundAmt: "已退履约保证金",
                taxRate: "税率",
                needSettle: "是否需办结算",
                signAmt: "合同签约金额",
                addAmt: "补充合同金额",
                changeAmt: "变更金额",
                visaAmt: "签证金额",
                estConAmt: "系统预估合同金额",
                settleAmt: "结算金额",
                prodAmt: "产值金额",
                payAmt: "应付金额",
                unlockPayAmt: "解锁应付金额",
                reqAmt: "请款金额",
                prepayReqAmt: "其中预付款请款金额",
                dedAmt: "款项调整金额",
                factReqAmt: "实际请款金额",
                paidAmt: "已付金额",
                reqOweAmt: "请款欠款金额",
                payOweAmt: "应付欠款金额",
                invcAmt: "开票金额(含税)",
                invcNotTaxAmt: "开票金额(不含税)",
                reqInvOweAmt: "请款欠票额",
                payInvOweAmt: "应付欠票额",
                paidInvOweAmt: "已付欠票额"
            };
            exportExcel({
                data: list,
                headerMap: headerMap,
                fileName: '合同执行概览'
            });
        }
    } catch (error) {
        console.error("导出失败:", error);
    } finally {
        exportLoading.value = false;
    }
};
// 获取业务板块
const getSegOptions = async () => {
    try {
        const res = await dictionaryApi.getsegmentList({ isAuth: true });
        if (res.code === 200 && res.data) {
            const list = res.data || [];
            // 判断是否同时存在“地产”和“建筑”
            const hasDiChan = list.some(item => item.id === 2); // 地产
            const hasJianZhu = list.some(item => item.id === 7); // 建筑
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
// 获取合同分类
const getConCategoryOptions = async () => {
    try {
        const data = await mdStore.getConTypeTree();
        conCategoryOptions.value = data || [];
    } catch (error) {
        console.error("加载合同分类失败:", error);
        conCategoryOptions.value = [];
    }
};
// 获取板块下的签约公司
const getCompanyList = async (segId: number) => {
    try {
        const res = await mdApi.getProjCompanyList({ segId: segId });
        if (res.code === 200) {
            companyOptions.value = res.data || [];
        }
    } catch (error) {
        console.error("获取公司列表失败:", error);
    }
}

onMounted(async () => {
    await Promise.all([getProjectOptions(), getSegOptions(), getConCategoryOptions()]);
    // 先设置设置默认板块
    selectedDefaultSeg();
    // 再加载表格数据
    getDataList();
});
</script>

<style lang="scss" scoped>
.contract-overview-wrapper {
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

            :deep(.enum-select .el-input__wrapper) {
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
                margin-left: auto;
                display: flex;
                gap: 6px;

                :deep(.el-form-item__content) {
                    display: flex;
                    gap: 8px;
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

        .custom-table {
            flex: 1;
            min-height: 0;
        }
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