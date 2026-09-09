<!-- 合同执行概览 -->
<template>
    <div class="contract-overview-wrapper">
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

                    <el-form-item label="签约日期" prop="signDate">
                        <el-date-picker v-model="queryParams.signDate" type="daterange" range-separator="至"
                            value-format="YYYY-MM-DD" start-placeholder="开始日期" end-placeholder="结束日期"
                            style="width: 220px" />
                    </el-form-item>

                    <!-- <el-form-item label="甲方签约公司" prop="companyId">
                        <el-select v-model="queryParams.companyId" placeholder="请选择公司" clearable filterable
                            style="width: 220px">
                            <el-option v-for="item in companyOptions" :key="item.id" :label="item.compName"
                                :value="item.id" />
                        </el-select>
                    </el-form-item> -->

                    <!-- <el-form-item label="供应商名称" prop="supName">
                        <el-input v-model="queryParams.supName" placeholder="请输入供应商名称" clearable style="width: 220px" />
                    </el-form-item> -->

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
                            }" placeholder="请选择合同分类" style="width: 220px" clearable filterable
                            collapse-tags />
                    </el-form-item>

                    <el-form-item label="合同类型" prop="conProperty">
                        <EnumSelect v-model="queryParams.conProperty" :options="ConPropertyEnum" clearable
                            placeholder="请选择合同类型" :width="'220px'" />
                    </el-form-item>

                    <el-form-item label="产值确认方式" prop="payMethod">
                        <EnumSelect v-model="queryParams.payMethod" :options="PayTypeEnum" clearable
                            placeholder="请选择产值确认方式" :width="'220px'" />
                    </el-form-item>

                    <el-form-item label="合同状态" prop="conStatusList">
                        <EnumSelect v-model="queryParams.conStatusList" :options="conStatusList" clearable multiple
                            placeholder="请选择合同状态" :width="'220px'" />
                    </el-form-item>
                </el-form>
            </template>
            <!-- 操作栏插槽：关键字输入框 + 按钮 -->
            <template #actions>
                <el-input v-model="queryParams.keyWord" placeholder="请输入合同名称、合同编号、供应商名称、甲方签约公司、甲方经办人" clearable
                    style="width:636px" />
                <el-button type="primary" :loading="submitLoading" @click="handleSearch">
                    <el-icon>
                        <Search />
                    </el-icon> 搜索
                </el-button>
                <el-button :loading="submitLoading" @click="handleReset">
                    <el-icon>
                        <Refresh />
                    </el-icon> 重置
                </el-button>
                <el-button type="primary" plain :loading="exportLoading" @click="handleExport"
                    :disabled="!menuStore.hasExactPermission(PERMISSIONS.CON_OVERVIEW_EXPORT)">
                    <el-icon>
                        <Download />
                    </el-icon> 导出
                </el-button>
            </template>
        </BaseSearchCard>

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
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api";
import { formatThousandWithPlaces } from "@/utils/big-number";
import { useMDStore } from "@/stores/md-store";
import { ConPropertyEnum, ConStatusEnum, PayTypeEnum } from "@/constants/contract-manage/enums";
import EnumSelect from "@/components/base/base-enum-select.vue";
import BaseSearchCard from "@/components/base/base-search-card.vue";
import { reportManageApi } from "@/api/cost/contract-manage/report-manage-api";
import mdApi from "@/api/system/md-api";
import { exportExcelWithStyle } from "@/utils/export-excel";
import { useMenuStore } from "@/stores/menu-store";
import { PERMISSIONS } from "@/constants/permission";

defineOptions({ name: "contract-overview" });

const router = useRouter();
const mdStore = useMDStore();
const menuStore = useMenuStore();

// ============ 查询参数 ============
const queryParams = ref({
    segId: undefined,
    projIdList: [],      // 项目ID列表（多选级联）
    signDate: [],      // 签约日期范围 [开始, 结束]
    companyId: undefined,      // 甲方签约公司
    // supName: undefined,          // 供应商名称
    conProperty: undefined,      // 合同类型
    conTypeIdList: undefined,       // 合同分类（多选级联）
    payMethod: undefined,        // 产值确认方式
    conStatusList: [40, 60],        // 合同状态,默认已审批40，已结算60
    keyWord: undefined,        // 关键字
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

const conStatusList = computed(() => {
    return ConStatusEnum.filter((item) => item.value != 0);
})
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

const columns: any = [
    { type: "index", label: "序号", width: 60, fixed: "left" },
    { prop: "segName", label: "业务板块", width: 80, fixed: "left" },
    { prop: "projName", label: "项目名称", width: 120, fixed: "left" },
    { prop: "conName", label: "合同名称", width: 150, fixed: "left" },
    { prop: "conSysNo", label: "合同编号", width: 150, fixed: "left" },
    { prop: "conStatusName", label: "合同状态", width: 90, fixed: "left" },
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
                formatter: (v, row) => {
                    return v ? `${v}%` : "-"
                },
            },
            {
                prop: "pbAmt",
                label: "应交履约保证金",
                width: 120,
                formatter: (v) => formatThousandWithPlaces(v),
            },
            {
                prop: "pbRecvAmt",
                label: "已交履约保证金",
                width: 120,
                formatter: (v) => formatThousandWithPlaces(v),
            },
            {
                prop: "pbRefundAmt",
                label: "已退履约保证金",
                width: 120,
                formatter: (v) => formatThousandWithPlaces(v),
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
                formatter: (v) => formatThousandWithPlaces(v),
            },
            {
                prop: "addAmt",
                label: "补充合同金额",
                width: 120,
                formatter: (v) => formatThousandWithPlaces(v),
            },
            {
                prop: "changeAmt",
                label: "变更金额",
                width: 100,
                formatter: (v) => formatThousandWithPlaces(v),
            },
            {
                prop: "visaAmt",
                label: "签证金额",
                width: 100,
                formatter: (v) => formatThousandWithPlaces(v),
            },
            {
                prop: "estConAmt",
                label: "系统预估合同金额",
                width: 160,
                formatter: (v) => formatThousandWithPlaces(v),
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
                formatter: (v) => formatThousandWithPlaces(v),
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
                formatter: (v) => formatThousandWithPlaces(v),
                clickable: true, // 点击单元格触发 onClick 事件
                onClick: (data) => {
                    handleCellEventClick(data)
                },
            },
            {
                prop: "payAmt",
                label: "应付金额",
                width: 100,
                formatter: (v) => formatThousandWithPlaces(v),
                clickable: true, // 点击单元格触发 onClick 事件
                onClick: (data) => {
                    handleCellEventClick(data)
                },
            },
            {
                prop: "unlockPayAmt",
                label: "解锁应付金额",
                width: 120,
                formatter: (v) => formatThousandWithPlaces(v),
                clickable: true, // 点击单元格触发 onClick 事件
                onClick: (data) => {
                    handleCellEventClick(data)
                },
            },
            {
                prop: "reqAmt",
                label: "请款金额",
                width: 100,
                formatter: (v) => formatThousandWithPlaces(v),
            },
            {
                prop: "prepayReqAmt",
                label: "其中预付款请款金额",
                width: 140,
                formatter: (v) => formatThousandWithPlaces(v),
            },
            {
                prop: "dedAmt",
                label: "款项调整金额",
                width: 120,
                formatter: (v) => formatThousandWithPlaces(v),
            },
            {
                prop: "factReqAmt",
                label: "实际请款金额",
                width: 120,
                formatter: (v) => formatThousandWithPlaces(v),
                clickable: true, // 点击单元格触发 onClick 事件
                onClick: (data) => {
                    // 查看请款明细
                    handleCellPaymentDetail(data)
                },
            },
            {
                prop: "paidAmt",
                label: "已付金额",
                width: 100,
                formatter: (v) => formatThousandWithPlaces(v),
                clickable: true, // 点击单元格触发 onClick 事件
                onClick: (data) => {
                    // 查看请款明细
                    handleCellPaymentDetail(data)
                },
            },
            {
                prop: "reqOweAmt",
                label: "请款欠款金额",
                width: 120,
                formatter: (v) => formatThousandWithPlaces(v),
            },
            {
                prop: "payOweAmt",
                label: "应付欠款金额",
                width: 120,
                formatter: (v) => formatThousandWithPlaces(v),
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
                formatter: (v) => formatThousandWithPlaces(v),
            },
            {
                prop: "invcNotTaxAmt",
                label: "开票金额(不含税)",
                width: 140,
                formatter: (v) => formatThousandWithPlaces(v),
            },
            {
                prop: "reqInvOweAmt",
                label: "请款欠票额",
                width: 120,
                formatter: (v) => formatThousandWithPlaces(v),
            },
            {
                prop: "payInvOweAmt",
                label: "应付欠票额",
                width: 120,
                formatter: (v) => formatThousandWithPlaces(v),
            },
            {
                prop: "paidInvOweAmt",
                label: "已付欠票额",
                width: 120,
                formatter: (v) => formatThousandWithPlaces(v),
            },
        ],
    },
];

const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return tableData.value.slice(start, end);
});

// 单元格点击点击查看产值明细
const handleCellEventClick = (row: any) => {
    if (row) {
        const timestamp = new Date().getTime();
        const params = {
            segId: row.segId,
            projId: row.projId,
            conId: row.conId,
        };
        router.push({
            path: "/report/output-detail",
            query: {
                data: JSON.stringify(params),
                _t: timestamp.toString(),
            },
        });
    }
}
// 单元格点击查看某个合同的请款明细
const handleCellPaymentDetail = (row: any) => {
    if (row) {
        const timestamp = new Date().getTime();
        const params = {
            segId: row.segId,
            projId: row.projId,
            conId: row.conId,
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
    const { segId, signDate, ...rest } = queryParams.value;
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
        signDateStart: signDate?.[0],
        signDateEnd: signDate?.[1],
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
        if (key === "conStatusList") {
            queryParams.value[key] = [40, 60]
        } else if (Array.isArray(queryParams.value[key])) {
            queryParams.value[key] = [];
        } else {
            queryParams.value[key] = undefined;
        }
    });
    selectedDefaultSeg();
    getDataList();
};

const handlePaginationChange = (params: any) => {
    currentPage.value = params.currentPage;
    pageSize.value = params.pageSize;
};
// 接口导出
const handleExport = async () => {
    try {
        exportLoading.value = true;
        const params = buildParams();
        const fileBlob = await reportManageApi.exportExecutionReport({ ...params, isExport: true });
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
// 前端导出
// const handleExport = async () => {
//     try {
//         exportLoading.value = true;

//         // 1. 获取全部数据（已包含 isExport: true）
//         const params = buildParams();
//         const res = await reportManageApi.getExecutionReport({ ...params });
//         if (res.code !== 200) {
//             ElMessage.error('导出数据获取失败');
//             return;
//         }
//         const list = res.data || [];

//         // 直接传递页面定义的 columns（含 children），并自动添加序号
//         await exportExcelWithStyle(
//             list,
//             columns, // 注意：columns 中包含 type: 'index' 无 prop，会被忽略，所以 includeIndex 会补充序号
//             '合同执行概览',
//             {
//                 includeIndex: true,   // 自动添加序号列
//                 headerBgColor: 'FFD3D3D3',
//                 fontName: '微软雅黑',
//                 headerFontSize: 10,
//                 bodyFontSize: 10,
//             }
//         );

//         ElMessage.success('导出成功');
//     } catch (error) {
//         console.error('导出失败:', error);
//         ElMessage.error('导出失败，请重试');
//     } finally {
//         exportLoading.value = false;
//     }
// };
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

    .table-card {
        flex: 1;
        min-height: 0;
        background: #ffffff;
        border-radius: 12px;
        // padding: 15px 15px 8px 15px;
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