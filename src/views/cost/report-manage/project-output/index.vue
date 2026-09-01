<!-- 项目产值表 -->
<template>
    <div class="project-output-wrapper">
        <!-- 查询卡片 -->
        <div class="search-card">
            <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="80px" class="search-form">
                <el-form-item label="业务归属" prop="segId">
                    <el-select v-model="queryParams.segId" placeholder="请选择业务板块" :clearable="false" style="width: 150px"
                        @change="handleSegChange">
                        <el-option v-for="item in segOptions" :key="item.id" :label="item.segName" :value="item.id" />
                    </el-select>
                </el-form-item>

                <el-form-item label="项目名称" prop="projId">
                    <el-cascader v-model="queryParams.projId" :options="projectData" :show-all-levels="false" :props="{
                        expandTrigger: 'hover',
                        emitPath: false,
                        checkStrictly: false,
                        value: 'orgId',
                        label: 'orgName',
                        children: 'children',
                    }" placeholder="请选择项目" style="width: 200px" :clearable="false" filterable @change="handleSearch" />
                </el-form-item>

                <el-form-item label="截止月份" prop="endMonth">
                    <el-date-picker v-model="queryParams.endMonth" type="month" value-format="YYYY-MM"
                        placeholder="请选择截止月份" :clearable="false" style="width: 150px" @change="handleSearch" />
                </el-form-item>

                <el-form-item label="单位" prop="unit">
                    <el-select v-model="queryParams.unit" placeholder="请选择单位" :clearable="false" style="width: 120px"
                        @change="handleSearch">
                        <el-option label="万元" value="万元" />
                        <el-option label="元" value="元" />
                    </el-select>
                </el-form-item>

                <el-form-item class="action-buttons">
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
                </el-form-item>
            </el-form>
        </div>

        <!-- 统计卡片 -->
        <div class="statistics-card">
            <div class="stat-item stat-item-last-month">
                <div class="stat-icon"><el-icon>
                        <Calendar />
                    </el-icon></div>
                <div class="stat-content">
                    <span class="stat-label">截止上月累计产值</span>
                    <span class="stat-value">{{ statistics.totalLastMonthOutput }}
                        <span class="stat-unit">{{ queryParams.unit }}</span>
                    </span>
                </div>
            </div>
            <div class="stat-item stat-item-current-month">
                <div class="stat-icon"><el-icon>
                        <Document />
                    </el-icon></div>
                <div class="stat-content">
                    <span class="stat-label">本月产值</span>
                    <span class="stat-value">{{ statistics.totalCurrentMonthOutput }}
                        <span class="stat-unit">{{ queryParams.unit }}</span>
                    </span>
                </div>
            </div>
            <div class="stat-item stat-item-count">
                <div class="stat-icon"><el-icon>
                        <Files />
                    </el-icon></div>
                <div class="stat-content">
                    <span class="stat-label">本月产值</span>
                    <span class="stat-value">{{ statistics.totalCurrentMonthCount }}
                        <span class="stat-unit">份数</span>
                    </span>
                </div>
            </div>
            <div class="stat-item stat-item-total">
                <div class="stat-icon"><el-icon>
                        <TrendCharts />
                    </el-icon></div>
                <div class="stat-content">
                    <span class="stat-label">至本月累计产值</span>
                    <span class="stat-value">{{ statistics.totalCumulativeOutput }}
                        <span class="stat-unit">{{ queryParams.unit }}</span>
                    </span>
                </div>
            </div>
            <div class="stat-item stat-item-settlement">
                <div class="stat-icon"><el-icon>
                        <Money />
                    </el-icon></div>
                <div class="stat-content">
                    <span class="stat-label">结算金额</span>
                    <span class="stat-value">{{ statistics.totalSettlementAmt }}
                        <span class="stat-unit">{{ queryParams.unit }}</span>
                    </span>
                </div>
            </div>
        </div>

        <!-- 表格卡片 -->
        <div class="table-card">
            <base-table :columns="columns" :tableData="paginatedData" :loading="tableLoading" :rowKey="'uuid'"
                :total="total" :current-page="currentPage" :page-size="pageSize"
                @pagination-change="handlePaginationChange" class="custom-table" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from "vue";
import { Calendar, Document, Files, TrendCharts, Money, Search, Refresh, Download } from '@element-plus/icons-vue';
import type { TableColumnItem } from "@/components/base/base-table.vue";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";
import { BigNumber, formatThousandWithPlaces, toBig } from "@/utils/big-number";
import dayjs from "dayjs";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api";
import { reportManageApi } from "@/api/cost/contract-manage/report-manage-api";
import { ElMessage } from "element-plus";

defineOptions({ name: "project-output" });

const queryParams = ref({
    segId: undefined,
    projId: undefined,
    endMonth: dayjs().format("YYYY-MM"),
    unit: '元',
});

const projectOptions = ref([]);
const segOptions = ref([]);

const tableLoading = ref(false);
const tableData = ref([]);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const exportLoading = ref(false);

const statistics = computed(() => {
    const list = tableData.value || [];
    if (list.length === 0) {
        return {
            totalLastMonthOutput: 0,
            totalCurrentMonthOutput: 0,
            totalCurrentMonthCount: 0,
            totalCumulativeOutput: 0,
            totalSettlementAmt: 0,
        };
    }
    // 初始化 BigNumber 累加器（精度安全）
    let totalLastMonthOutput = new BigNumber(0); // 截止上月累计产值
    let totalCurrentMonthOutput = new BigNumber(0); // 本月产值
    let totalCurrentMonthCount = new BigNumber(0); // 本月产值(份数)
    let totalCumulativeOutput = new BigNumber(0); // 至本月累计产值
    let totalSettlementAmt = new BigNumber(0); // 结算金额

    const unit = queryParams.value.unit; // 获取单位
    const decimalPlaces = unit === '万元' ? 4 : 2; // 根据单位设置小数位数

    // toBig 自动处理 null/undefined/非数字
    for (const item of list) {
        totalLastMonthOutput = totalLastMonthOutput.plus(toBig(item.lastMonthProdVal));
        totalCurrentMonthOutput = totalCurrentMonthOutput.plus(toBig(item.curMonthProdVal));
        totalCurrentMonthCount = totalCurrentMonthCount.plus(toBig(item.curMonthProdCnt));
        totalCumulativeOutput = totalCumulativeOutput.plus(toBig(item.curMonthTotalProdVal));
        totalSettlementAmt = totalSettlementAmt.plus(toBig(item.settleAmt));
    }
    return {
        totalLastMonthOutput: formatThousandWithPlaces(totalLastMonthOutput.toNumber(), decimalPlaces),
        totalCurrentMonthOutput: formatThousandWithPlaces(totalCurrentMonthOutput.toNumber(), decimalPlaces),
        totalCurrentMonthCount: totalCurrentMonthCount.toNumber(),
        totalCumulativeOutput: formatThousandWithPlaces(totalCumulativeOutput.toNumber(), decimalPlaces),
        totalSettlementAmt: formatThousandWithPlaces(totalSettlementAmt.toNumber(), decimalPlaces),
    };
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
const columns: any = computed(() => {
    const unit = queryParams.value.unit; // 获取单位
    const decimalPlaces = unit === '万元' ? 4 : 2; // 根据单位设置小数位数
    return [
        { type: "index", label: "序号", width: 60, fixed: "left" },
        { prop: "supName", label: "供应商", width: 150, fixed: "left" },
        { prop: "conName", label: "合同名称", width: 180, fixed: "left" },
        { prop: "conSysNo", label: "合同编号", width: 150 },
        { prop: "taxRate", label: "税率", width: 80, formatter: (row) => row.taxRate ? `${row.taxRate}%` : '-' },
        {
            prop: "conAmt",
            label: `合同金额(${unit})`,
            width: 120,
            formatter: (row) => formatThousandWithPlaces(row.conAmt, decimalPlaces),
            headerTip: {
                icon: "QuestionFilled",
                content: "合同金额= 签约金额+补充金额",
                placement: "top",
                width: "200px",
            },
        },
        {
            prop: "completeRatio",
            label: `累计完成比例%`,
            width: 150,
            headerTip: {
                icon: "QuestionFilled",
                content: "累计产值/(签约+补充)",
                placement: "top",
                width: "200px",
            },
        },
        {
            prop: "lastMonthProdVal",
            label: `截止上月累计产值(${unit})`,
            width: 180,
            formatter: (row) => formatThousandWithPlaces(row.lastMonthProdVal, decimalPlaces),
        },
        {
            prop: "curMonthProdVal",
            label: `本月产值(${unit})`,
            width: 120,
            formatter: (row) => formatThousandWithPlaces(row.curMonthProdVal, decimalPlaces),
        },
        {
            prop: "curMonthProdCnt",
            label: `本月产值(份数)`,
            width: 140,
            headerTip: {
                icon: "QuestionFilled",
                content: "产值审批完成的单据数",
                placement: "top",
                width: "200px",
            },
        },
        {
            prop: "curMonthTotalProdVal",
            label: `至本月累计产值(${unit})`,
            width: 170,
            formatter: (row) => formatThousandWithPlaces(row.curMonthTotalProdVal, decimalPlaces),
        },
        {
            prop: "settleAmt",
            label: `结算金额(${unit})`,
            width: 140,
            formatter: (row) => formatThousandWithPlaces(row.settleAmt, decimalPlaces),
        },
        {
            prop: "latestProdVal",
            label: `最新合同产值(${unit})`,
            width: 150,
            formatter: (row) => formatThousandWithPlaces(row.latestProdVal, decimalPlaces),
        },
    ]
});

// 获取项目数据
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
// 设置默认选中第一个业务归属和归属下的第一个项目
const selectedDefaultSeg = () => {
    if (segOptions.value && segOptions.value.length > 0) {
        const firstSeg = segOptions.value[0];
        if (firstSeg) {
            queryParams.value.segId = firstSeg.id;
            // 切换板块后，自动选中该板块下的第一个项目
            updateFirstProject();
        }
    }
}
const handleSegChange = async (val: number) => {
    // 切换板块后自动选中该板块下的第一个项目
    updateFirstProject();
    await nextTick();
    handleSearch();
};
/**
 * 递归查找树形结构中的第一个叶子节点 ID（项目）
 * @param tree 树形数据（projectData）
 * @returns 第一个叶子节点的 orgId，若没有则返回 undefined
 */
const findFirstProjectId = (tree: any[]): string | number | undefined => {
    if (!tree || tree.length === 0) return undefined;
    for (const node of tree) {
        // 如果有子节点且不为空，则深入查找
        if (node.children && node.children.length > 0) {
            const found = findFirstProjectId(node.children);
            if (found) return found;
        } else {
            // 叶子节点（无 children 或 children 为空）
            return node.orgId;
        }
    }
    return undefined;
};
/**
 * 根据当前 projectData 自动选中第一个项目
 */
const updateFirstProject = () => {
    const firstId = findFirstProjectId(projectData.value);
    // 如果找到了项目 ID，则设置；否则清空（理论上不会发生，因为板块有项目）
    queryParams.value.projId = firstId;
};
const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return tableData.value.slice(start, end);
});

const buildParams = () => {
    let segIdList = []
    const { segId, ...rest } = queryParams.value;
    if (segId) {
        // 如果板块选择全部，则获取所有板块的id去掉9999
        if (segId == 9999) {
            segIdList = segOptions.value.map((item) => item.id).filter((vi) => vi != 9999);
        } else {
            segIdList = [segId];
        }
    }
    const params = {
        ...rest,
        segIds: segIdList,
    };
    return params;
}
// 获取列表数据
const getDataList = async () => {
    try {
        tableLoading.value = true;
        const params = buildParams();
        const res = await reportManageApi.getProdValReport(params);
        if (res.code === 200) {
            const list = res.data || [];
            tableData.value = list;
            total.value = list.length;
        }
    } catch (error) {
        console.error("获取项目产值列表失败:", error);
    } finally {
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
    // 重置所有查询条件为默认值
    // 1. 业务板块 → 默认第一个
    selectedDefaultSeg();
    // 2. 截止月份 → 当前月
    queryParams.value.endMonth = dayjs().format("YYYY-MM");
    // 3. 单位 → 万元
    queryParams.value.unit = '元';
    // 最后刷新表格
    getDataList();

};

const handlePaginationChange = (params: any) => {
    currentPage.value = params.currentPage;
    pageSize.value = params.pageSize;
};

const handleExport = async () => {
    if (!queryParams.value.projId) return;
    try {
        exportLoading.value = true;
        const params = buildParams();
        const fileBlob = await reportManageApi.exportProdValReport({ ...params, isExport: true });
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


onMounted(async () => {
    await Promise.all([getSegOptions(), getProjectOptions()]);
    // 先默认选中第一个业务板块
    selectedDefaultSeg();
    // 再获取数据列表
    getDataList();
});
</script>

<style lang="scss" scoped>
.project-output-wrapper {
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
        }
    }

    // ===== 统计卡片 =====
    .statistics-card {
        display: flex;
        align-items: center;
        background: #ffffff;
        border-radius: 12px;
        padding: 14px 24px;
        margin-bottom: 16px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06);
        flex-shrink: 0;
        border: 1px solid #edf2f7;
        flex-wrap: wrap;
        gap: 4px 0;

        .stat-item {
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 1;
            min-width: 140px;
            padding: 4px 0;

            .stat-icon {
                width: 40px;
                height: 40px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                flex-shrink: 0;
            }

            .stat-content {
                display: flex;
                flex-direction: column;
                gap: 1px;

                .stat-label {
                    font-size: 13px;
                    color: #718096;
                    font-weight: 400;
                }

                .stat-value {
                    font-size: 20px;
                    font-weight: 700;
                    color: #1a2332;
                    font-variant-numeric: tabular-nums;
                    letter-spacing: 0.3px;

                    .stat-unit {
                        font-size: 13px; // 比数值略小，但依然清晰
                        font-weight: 600; // 加粗，更醒目
                        color: #4a5568; // 与数值主色区分（数值为 #1a2332）
                        opacity: 0.8; // 稍微柔和一点，不抢数值风头
                    }
                }
            }

            // 各统计项主题色
            &.stat-item-last-month {
                .stat-icon {
                    background: #e8f0fe;
                    color: #5b8dd9;
                }

                .stat-value {
                    color: #5b8dd9;
                }
            }

            &.stat-item-current-month {
                .stat-icon {
                    background: #e8f5e9;
                    color: #66bb6a;
                }

                .stat-value {
                    color: #66bb6a;
                }
            }

            &.stat-item-count {
                .stat-icon {
                    background: #fdf6ec;
                    color: #d9a656;
                }

                .stat-value {
                    color: #d9a656;
                }
            }

            &.stat-item-total {
                .stat-icon {
                    background: #e3f0ff;
                    color: #4a8fc1;
                }

                .stat-value {
                    color: #4a8fc1;
                }
            }

            &.stat-item-settlement {
                .stat-icon {
                    background: #fde8e8;
                    color: #d96c6c;
                }

                .stat-value {
                    color: #d96c6c;
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

        .custom-table {
            flex: 1;
            min-height: 0;
        }
    }

    // ===== 响应式 =====
    @media screen and (max-width: 1200px) {
        .search-card .search-form .action-buttons {
            margin-left: 0;
            width: 100%;
            justify-content: flex-end;
            padding-top: 4px;
        }

        .statistics-card {
            .stat-item {
                min-width: 120px;
            }
        }
    }
}
</style>