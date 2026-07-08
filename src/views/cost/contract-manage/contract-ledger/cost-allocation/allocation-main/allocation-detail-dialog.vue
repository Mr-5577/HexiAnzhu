<!-- 成本分摊弹窗 -->
<template>
  <base-modal
    v-model="dialogVisible"
    :title="'成本分摊'"
    width="1000px"
    :showConfirmButton="false"
    :showCancelButton="false"
    @close="handleClose"
  >
    <div style="padding-right: 8px; box-sizing: border-box">
      <!-- 分摊主表业务信息 -->
      <el-descriptions :column="4" class="biz-info">
        <el-descriptions-item label="项目：">
          {{ currentRowData?.projName || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="业务类型：">
          {{ currentRowData?.bizTypeName || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="分摊总额(含税)：">
          {{ currentRowData?.allocAmt || 0 }}
        </el-descriptions-item>
        <el-descriptions-item label="分摊总额(不含税)：">
          {{ currentRowData?.allocExclAmt || 0 }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 分摊明细表格 -->
      <div class="detail-table">
        <div class="header-content">
          <span class="header-title">分摊明细</span>
        </div>
        <!-- 分摊汇总信息（分摊后显示） -->
        <div v-if="showSummary" class="summary-info">
          <el-descriptions :column="3" size="default">
            <el-descriptions-item label="需要分摊(含税)：">
              <span class="highlight">
                {{ summaryData.allocAmtNeed?.toFixed(2) || "0.00" }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="需要分摊(不含税)：">
              <span class="highlight">
                {{ summaryData.allocExclAmtNeed?.toFixed(2) || "0.00" }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="已分摊(含税)：">
              <span
                :class="
                  getAmtClass(summaryData.allocAmt, summaryData.allocAmtNeed)
                "
              >
                {{ summaryData.allocAmt?.toFixed(2) || "0.00" }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="已分摊(不含税)：">
              <span
                :class="
                  getAmtClass(
                    summaryData.allocExclAmt,
                    summaryData.allocExclAmtNeed,
                  )
                "
              >
                {{ summaryData.allocExclAmt?.toFixed(2) || "0.00" }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="分摊状态：">
              <el-tag
                :type="getStatusType(summaryData.allocStatus)"
                size="small"
              >
                {{ getStatusText(summaryData.allocStatus) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="预警状态：">
              <el-tag :type="getWarnType(summaryData.allocWarn)" size="small">
                {{ getWarnText(summaryData.allocWarn) }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="header-actions">
          <!-- <el-button
            v-if="showSummary"
            type="warning"
            size="small"
            @click="handleReset"
          >
            重新分摊
          </el-button> -->
          <el-button
            type="primary"
            size="small"
            :loading="submitLoading"
            @click="handleAutoAllocate"
          >
            {{ showSummary ? "重新分摊" : "分摊" }}
          </el-button>
        </div>

        <editable-table
          :row-key="'uuid'"
          :height="'300px'"
          v-model="detailTable"
          :columns="dynamicColumns"
          :loading="tableLoading"
          :pagination="false"
          :highlight-current-row="false"
          :show-summary="false"
          :compactEmpty="true"
        >
          <!-- 自定义列插槽：预警状态 -->
          <template #allocWarn="{ row }">
            <el-tag :type="getWarnType(row.allocWarn)" size="small">
              {{ getWarnText(row.allocWarn) }}
            </el-tag>
          </template>
        </editable-table>

        <!-- 底部汇总 -->
        <div v-if="!showSummary" class="table-footer">
          <span>
            已输入 分摊总额(含税)：<b>{{ totalInputAmt.toFixed(2) }}</b>
          </span>
          <span>
            应分摊总额(含税)：<b>{{ currentRowData?.allocAmt || 0 }}</b>
          </span>
          <span :class="diffClass">
            差额：<b>{{ diffAmt.toFixed(2) }}</b>
          </span>
        </div>
      </div>
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { v4 as uuidv4 } from "uuid";
import EditableTable from "@/components/base/editable-table.vue";
import type { EditableColumn } from "@/components/base/editable-table.vue";
import { costCategoryApi } from "@/api/cost/master-data/cost-category-api";
import { costAllocationApi } from "@/api/cost/contract-manage/cost-allocation-api";

defineOptions({ name: "allocation-detail-dialog" });

interface Props {
  modelValue: boolean;
  projId: number | null;
  conId: number | null;
  allocWarnOptions: any[];
  allocStatusOptions: any[];
  currentRowData?: any | null;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  projId: null,
  conId: null,
  allocWarnOptions: () => [],
  allocStatusOptions: () => [],
  currentRowData: null,
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [];
}>();

const dialogVisible = ref(props.modelValue);
const submitLoading = ref(false);
const tableLoading = ref(false);
const detailTable = ref([]);
const subjectOptions = ref([]);

// 汇总数据（分摊后显示）
const showSummary = ref(false);
const summaryData = ref({
  allocAmtNeed: 0,
  allocExclAmtNeed: 0,
  allocAmt: 0,
  allocExclAmt: 0,
  allocStatus: 0,
  allocWarn: 0,
});

// 动态列配置
const dynamicColumns = computed<EditableColumn[]>(() => {
  const columns: EditableColumn[] = [
    {
      type: "index",
      label: "序号",
      width: 60,
      editable: false,
    },
    {
      prop: "subName",
      label: "科目名称",
      editable: false,
    },
  ];

  // 分摊后显示成本金额列
  if (showSummary.value) {
    columns.push(
      {
        prop: "costAmt",
        label: "成本金额(含税)",
        editable: false,
      },
      {
        prop: "costExclAmt",
        label: "成本金额(不含税)",
        editable: false,
      },
    );
  }

  // 分摊金额列
  columns.push(
    {
      prop: "allocAmt",
      label: "分摊金额(含税)",
      editable: true,
      editType: "number",
      precision: 2,
      min: 0,
      showOverflowTooltip: false,
    },
    {
      prop: "allocExclAmt",
      label: "分摊金额(不含税)",
      editable: true,
      editType: "number",
      precision: 2,
      min: 0,
      showOverflowTooltip: false,
    },
  );

  // 分摊后显示预警状态列
  if (showSummary.value) {
    columns.push({
      prop: "allocWarn",
      label: "预警状态",
      editable: false,
      slot: "allocWarn",
    });
  }

  return columns;
});

// 用户输入的总额
const totalInputAmt = computed(() => {
  return detailTable.value.reduce((sum, item) => sum + (item.allocAmt || 0), 0);
});

// 差额
const diffAmt = computed(() => {
  const need = props.currentRowData?.allocAmt || 0;
  return need - totalInputAmt.value;
});

// 差额样式
const diffClass = computed(() => {
  const diff = diffAmt.value;
  if (Math.abs(diff) < 0.01) return "diff-equal";
  if (diff > 0) return "diff-insufficient";
  return "diff-excess";
});

// 渲染科目列表
const renderSubjectOptions = () => {
  detailTable.value = subjectOptions.value.map((subject) => ({
    uuid: uuidv4(),
    subId: subject.id,
    subName: subject.subName,
    costAmt: 0,
    costExclAmt: 0,
    allocAmt: 0,
    allocExclAmt: 0,
    allocWarn: 2, // 默认绿色预警
  }));
};

// 获取目标成本科目列表
const getCostSubjectProjList = async () => {
  if (!props.projId) {
    ElMessage.warning("请先选择项目");
    return;
  }
  try {
    tableLoading.value = true;
    const res = await costCategoryApi.getCostSubjectProjList({
      projId: props.projId,
      withDetail: true,
    });
    if (res.code === 200) {
      subjectOptions.value = res.data || [];
      renderSubjectOptions();
      // 重置汇总显示
      showSummary.value = false;
      summaryData.value = {
        allocAmtNeed: 0,
        allocExclAmtNeed: 0,
        allocAmt: 0,
        allocExclAmt: 0,
        allocStatus: 0,
        allocWarn: 0,
      };
    } else {
      ElMessage.error(res.msg || "获取数据失败");
    }
  } catch (error) {
    console.error("获取数据失败:", error);
    ElMessage.error("获取科目数据失败");
  } finally {
    tableLoading.value = false;
  }
};

// 分摊操作
const handleAutoAllocate = async () => {
  // 至少有一个科目有金额
  const hasAllocData = detailTable.value.some(
    (item) => (item.allocAmt || 0) > 0 || (item.allocExclAmt || 0) > 0,
  );
  if (!hasAllocData) {
    ElMessage.warning("请至少输入一个科目的分摊金额");
    return;
  }

  // 如果是重新分摊，提示确认
  if (showSummary.value) {
    try {
      await ElMessageBox.confirm(
        "重新分摊将覆盖之前的分摊结果，是否继续？",
        "提示",
        {
          confirmButtonText: "继续",
          cancelButtonText: "取消",
          type: "warning",
        },
      );
    } catch {
      return;
    }
  } else {
    try {
      await ElMessageBox.confirm(
        "确认按照当前所填分摊金额进行分摊，是否继续？",
        "提示",
        {
          confirmButtonText: "继续",
          cancelButtonText: "取消",
          type: "warning",
        },
      );
    } catch {
      return;
    }
  }

  try {
    submitLoading.value = true;
    const params = {
      conId: props.conId,
      subList: detailTable.value.map((item) => ({
        subId: item.subId,
        allocAmt: item.allocAmt || 0,
        allocExclAmt: item.allocExclAmt || 0,
      })),
    };

    const res = await costAllocationApi.autoAllocateCost(params);
    // const res = {
    //   code: 200,
    //   message: "success",
    //   data: {
    //     allocAmtNeed: 999, // 需要分摊总额(含税)
    //     allocExclAmtNeed: 1332, // 需要分摊总额(不含税)
    //     allocAmt: 111.0, // 已分摊总额(含税)
    //     allocExclAmt: 222.0, // 已分摊总额(不含税)
    //     allocStatus: 2, // 分摊状态
    //     allocWarn: 2, // 分摊预警
    //     allocList: [
    //       {
    //         subId: 6, // 科目ID
    //         prodId: 3016, // 产品ID
    //         costAmt: 99999.0, // 成本金额(含税)
    //         costExclAmt: 911111.0, // 成本金额(不含税)
    //         allocAmt: 111.0, // 分摊金额(含税)
    //         allocExclAmt: 222.0, // 分摊金额(不含税)
    //         allocWarn: 2, // 分摊预警
    //       },
    //       {
    //         subId: 7,
    //         prodId: 3016,
    //         costAmt: 777777.0,
    //         costExclAmt: 7111111.0,
    //         allocAmt: 0,
    //         allocExclAmt: 0,
    //         allocWarn: 2,
    //       },
    //       {
    //         subId: 9,
    //         prodId: 3016,
    //         costAmt: 666666.0,
    //         costExclAmt: 6111111.0,
    //         allocAmt: 0,
    //         allocExclAmt: 0,
    //         allocWarn: 2,
    //       },
    //     ],
    //   },
    // };
    if (res.code === 200) {
      const result = res.data;

      // 显示汇总信息
      showSummary.value = true;
      summaryData.value = {
        allocAmtNeed: result.allocAmtNeed || 0,
        allocExclAmtNeed: result.allocExclAmtNeed || 0,
        allocAmt: result.allocAmt || 0,
        allocExclAmt: result.allocExclAmt || 0,
        allocStatus: result.allocStatus ?? 0,
        allocWarn: result.allocWarn ?? 2,
      };

      // 更新表格数据
      if (result.allocList && result.allocList.length > 0) {
        detailTable.value = detailTable.value.map((item) => {
          const resultItem = result.allocList.find(
            (r: any) => r.subId === item.subId,
          );
          if (resultItem) {
            return {
              ...item,
              costAmt: resultItem.costAmt || 0,
              costExclAmt: resultItem.costExclAmt || 0,
              allocAmt: resultItem.allocAmt || 0,
              allocExclAmt: resultItem.allocExclAmt || 0,
              allocWarn: resultItem.allocWarn ?? 2,
            };
          }
          return item;
        });
      }

      // 根据结果提示
      const needAmt = result.allocAmtNeed || 0;
      const actualAmt = result.allocAmt || 0;
      const status = result.allocStatus ?? 0;

      if (status === 2) {
        // 部分分摊
        ElMessage.warning(
          `部分分摊成功：应分摊 ${needAmt.toFixed(2)}，实际分摊 ${actualAmt.toFixed(2)}`,
        );
      } else if (status === 1) {
        // 已分摊
        ElMessage.success(`分摊成功！共分摊 ${actualAmt.toFixed(2)}（含税）`);
        // 触发成功事件，通知父组件刷新
        setTimeout(() => {
          emit("success");
        }, 500);
      } else {
        ElMessage.info(`分摊完成，状态：${getStatusText(status)}`);
      }

      // 如果有预警，额外提示
      const hasWarn = result.allocList?.some(
        (item: any) => item.allocWarn === 0,
      );
      if (hasWarn) {
        await ElMessageBox.alert(
          "部分科目存在红色预警（分摊金额超出成本），请查看明细中的预警状态",
          "分摊预警",
          {
            confirmButtonText: "知道了",
            type: "warning",
          },
        );
      }
    } else {
      ElMessage.error("分摊失败");
    }
  } catch (error) {
    console.error("分摊失败:", error);
  } finally {
    submitLoading.value = false;
  }
};

// 重置
const handleReset = () => {
  showSummary.value = false;
  summaryData.value = {
    allocAmtNeed: 0,
    allocExclAmtNeed: 0,
    allocAmt: 0,
    allocExclAmt: 0,
    allocStatus: 0,
    allocWarn: 0,
  };
  // 重置分摊金额
  detailTable.value = detailTable.value.map((item) => ({
    ...item,
    costAmt: 0,
    costExclAmt: 0,
    allocAmt: 0,
    allocExclAmt: 0,
    allocWarn: 2,
  }));
  ElMessage.info("已重置，请重新输入分摊金额");
};

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false;
};

// 获取分摊状态
const getStatusText = (status: number) => {
  const targetStatus = props.allocStatusOptions.find(
    (item) => item.value == status,
  )?.label;
  return targetStatus || "未知";
};
const getStatusType = (status: number) => {
  const targetStatus = props.allocStatusOptions.find(
    (item) => item.value == status,
  );
  return targetStatus?.type || "info";
};

// 获取预警状态
const getWarnText = (warn: number) => {
  const targetWarn = props.allocWarnOptions.find(
    (item) => item.value == warn,
  )?.label;
  return targetWarn || "未知";
};
const getWarnType = (warn: number) => {
  const targetWarn = props.allocWarnOptions.find((item) => item.value == warn);
  return targetWarn?.type || "info";
};

// 获取金额样式
const getAmtClass = (actual: number, need: number) => {
  if (!actual && !need) return "";
  if (Math.abs(actual - need) < 0.01) return "amt-equal";
  if (actual < need) return "amt-insufficient";
  return "amt-excess";
};

watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val;
    if (val) {
      getCostSubjectProjList();
    }
  },
);

watch(dialogVisible, (val) => {
  emit("update:modelValue", val);
});
</script>

<style lang="scss" scoped>
.biz-info {
  margin-bottom: 16px;

  :deep(.el-descriptions__body) {
    .el-descriptions__table {
      table-layout: fixed;
    }
    .el-descriptions__table td {
      width: 25%; /* 4列就是25% */
    }
  }
}
:deep(.el-descriptions__label) {
  margin-right: 0;
}
.summary-info {
  :deep(.el-descriptions) {
    .highlight {
      color: #409eff;
      font-weight: bold;
    }
    .amt-equal {
      color: #67c23a;
      font-weight: bold;
    }
    .amt-insufficient {
      color: #e6a23c;
      font-weight: bold;
    }
    .amt-excess {
      color: #f56c6c;
      font-weight: bold;
    }
  }
}

.detail-table {
  .header-content {
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-title {
      font-size: 15px;
      color: #333;
      font-weight: 600;
    }
  }
  .header-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-bottom: 8px;
  }

  .table-footer {
    padding: 8px 12px;
    background: #f5f7fa;
    border-radius: 4px;
    display: flex;
    gap: 24px;
    font-size: 14px;

    b {
      color: #409eff;
    }

    .diff-equal {
      color: #67c23a;
    }
    .diff-insufficient {
      color: #e6a23c;
    }
    .diff-excess {
      color: #f56c6c;
    }
  }
}
</style>
