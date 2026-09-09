<!-- 财务目标成本支付分析 -->
<template>
    <div class="target-cost-payment-analysis-wrapper">
        <!-- 查询卡片 -->
        <div class="search-card">
            <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="80px" class="search-form">
                <el-form-item label="业务归属" prop="segId">
                    <el-select v-model="queryParams.segId" placeholder="请选择业务板块" :clearable="false" style="width: 150px"
                        @change="handleSegChange">
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

                <el-form-item label="金额类型" prop="amountType">
                    <el-select v-model="queryParams.amountType" placeholder="请选择类型" :clearable="false"
                        style="width: 220px" @change="handleSearch">
                        <el-option label="含税" value="TAX" />
                        <el-option label="不含税" value="EXCL" />
                    </el-select>
                </el-form-item>

                <el-form-item label="截止月份" prop="endMonth">
                    <el-date-picker v-model="queryParams.endMonth" type="month" value-format="YYYY-MM"
                        placeholder="请选择截止月份" :clearable="false" style="width: 150px" @change="handleSearch" />
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
            <vxe-editable-table ref="vxeTableRef" v-model="paginatedData" :columns="columns" :rowKey="'id'"
                :treeConfig="treeConfig" :loading="tableLoading" :readonly="true" :pagination="true" :total="total"
                :page-size="pageSize" :current-page="currentPage" @pagination-change="handlePaginationChange" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from "vue";
import { Search, Refresh, Download } from '@element-plus/icons-vue';
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";
import { BigNumber, formatThousandWithPlaces, roundToTwo, toBig } from "@/utils/big-number";
import dayjs from "dayjs";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api";
import { reportManageApi } from "@/api/cost/contract-manage/report-manage-api";
import { ElMessage } from "element-plus";

defineOptions({ name: "target-cost-payment-analysis" });

// ---------- 树形配置 ----------
const treeConfig = {
    childrenField: 'children',
    hasChildrenField: 'hasChildren',
    expandAll: false,
    accordion: false,
}

const queryParams = ref({
    segId: undefined,          // 业务板块ID
    projIdList: [],            // 项目ID列表（多选级联）
    endMonth: dayjs().format("YYYY-MM"), // 截止月份
    amountType: 'EXCL',        // 金额类型：TAX-含税, EXCL-不含税
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

// ============ 计算属性：根据板块过滤项目 ============
const projectData = computed(() => {
    const segId = queryParams.value.segId;
    if (segId) {
        if (segId == 9999) {
            // 选择全部，返回地产项目（orgId === 2）
            return projectOptions.value.filter((item) => item.orgId === 2) || [];
        } else {
            return projectOptions.value.filter((item) => item.orgId === segId) || [];
        }
    } else {
        return [];
    }
});

const columns: any = [
    { prop: "financeCode", label: "财务科目编码", width: 100, fixed: "left" },
    {
        prop: "financeName", label: "财务科目名称", width: 180, fixed: "left", align: 'left',
        treeNode: true,
    },
    { prop: "targetCost", label: "目标成本金额", width: 100, formatter: (value) => formatThousandWithPlaces(value) },
    {
        label: "请款及支付",
        children: [
            {
                prop: "requestAmt",
                label: "请款金额",
                width: 100,
                formatter: (value) => formatThousandWithPlaces(value),
            },
            {
                prop: "adjustAmt",
                label: "款项调整金额",
                width: 100,
                formatter: (value) => formatThousandWithPlaces(value),
            },
            {
                prop: "actualRequestAmt",
                label: "实际请款金额",
                width: 100,
                formatter: (value) => formatThousandWithPlaces(value),
            },
            {
                prop: "paidAmt",
                label: "已支付金额",
                width: 100,
                formatter: (value) => formatThousandWithPlaces(value),
            },
            {
                prop: "unpaidAmt",
                label: "未支付金额",
                width: 100,
                formatter: (value) => formatThousandWithPlaces(value),
            },
        ],
    },
    {
        label: "目标成本对比",
        children: [
            {
                prop: "reqTargetDiff",
                label: "请款与目标成本差异",
                width: 140,
                formatter: (value) => formatThousandWithPlaces(value),
            },
            {
                prop: "reqTargetRatio",
                label: "请款占目标成本比例",
                width: 140,
                formatter: (value) => formatThousandWithPlaces(value),
            },
            {
                prop: "paidTargetDiff",
                label: "已付与目标成本差异",
                width: 140,
                formatter: (value) => formatThousandWithPlaces(value),
            },
            {
                prop: "paidTargetRatio",
                label: "已付占目标成本比例",
                width: 140,
                formatter: (value) => formatThousandWithPlaces(value),
            },
            {
                prop: "unpaidTargetDiff",
                label: "未付与目标成本差异",
                width: 140,
                formatter: (value) => formatThousandWithPlaces(value),
            },
            {
                prop: "unpaidTargetRatio",
                label: "未付占目标成本比例",
                width: 140,
                formatter: (value) => formatThousandWithPlaces(value),
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
    let segIdList = [];
    const { segId, projIdList, endMonth, amountType } = queryParams.value;
    if (segId) {
        if (segId == 9999) {
            // 全部传空数组
            segIdList = [];
        } else {
            segIdList = [segId];
        }
    }
    return {
        segIds: segIdList,
        projIdList: projIdList,
        endMonth: endMonth,
        amountType: amountType,
    };
};

const getDataList = async () => {
    try {
        submitLoading.value = true;
        tableLoading.value = true;
        const params = buildParams();
        // TODO: 替换为实际接口
        // const res = await reportManageApi.getTargetCostPaymentReport(params);
        // if (res.code === 200) {
        //     tableData.value = res.data || [];
        //     total.value = res.data?.length || 0;
        // }
        // 模拟假数据
        tableData.value = [];
        total.value = 0;
    } catch (error) {
        console.error("获取数据失败:", error);
    } finally {
        submitLoading.value = false;
        tableLoading.value = false;
    }
};

const handleSearch = () => {
    currentPage.value = 1;
    pageSize.value = 20;
    getDataList();
};

const handleReset = () => {
    currentPage.value = 1;
    pageSize.value = 20;
    // 重置为默认值：板块→全部，项目→空，月份→当前月，金额类型→不含税
    selectedDefaultSeg();
    queryParams.value.projIdList = [];
    queryParams.value.endMonth = dayjs().format("YYYY-MM");
    queryParams.value.amountType = 'EXCL';
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
        // TODO: 替换为实际导出接口
        // const fileBlob = await reportManageApi.exportTargetCostPaymentReport({ ...params, isExport: true });
        // if (!fileBlob || fileBlob.size === 0) {
        //     ElMessage.warning("导出文件为空，请检查数据");
        // } else {
        //     ElMessage.success("导出成功！");
        // }
        ElMessage.info("导出功能待实现");
    } catch (error) {
        console.error("导出失败:", error);
    } finally {
        exportLoading.value = false;
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

// ============ 设置默认板块（选中“全部”） ============
const selectedDefaultSeg = () => {
    if (segOptions.value && segOptions.value.length > 0) {
        // 优先查找“全部”选项（id === 9999）
        const allOption = segOptions.value.find(item => item.id === 9999);
        if (allOption) {
            queryParams.value.segId = allOption.id;
        } else {
            // 如果没有“全部”，选第一个
            const firstSeg = segOptions.value[0];
            if (firstSeg) {
                queryParams.value.segId = firstSeg.id;
            }
        }
        // ✅ 不自动选项目
    }
};

const handleSegChange = async (val: number) => {
    queryParams.value.projIdList = [];
    await nextTick();
    handleSearch();
};

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

onMounted(async () => {
    await Promise.all([getSegOptions(), getProjectOptions()]);
    // 设置默认板块（全部）
    selectedDefaultSeg();
    // 加载表格数据
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

            // .action-buttons {
            //     margin-left: auto;
            //     display: flex;
            //     gap: 6px;

            //     :deep(.el-form-item__content) {
            //         display: flex;
            //         gap: 8px;
            //     }
            // }

            // el-cascader 多选单行样式
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

    // ===== 表格卡片 =====
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