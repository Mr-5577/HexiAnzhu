<!-- 成本分摊 组件 -->
<template>
  <div
    class="cost-allocation-container"
    :class="{ 'dialog-mode': isDialogMode }"
  >
    <!-- 顶部业务头部 -->
    <header class="header-card">
      <div class="header-top">
        <h2>成本分摊</h2>
        <!-- <el-button
          v-if="!isDialogMode"
          plain
          icon="DArrowLeft"
          type="primary"
          @click="handleBack"
        >
          返回
        </el-button> -->
      </div>

      <!-- 显示单据信息 -->
      <div class="biz-info" v-if="pageParams.bizBillId">
        <el-tag size="small" type="info"
          >单据编号：{{ pageParams.bizBillId }}</el-tag
        >
        <el-tag size="small" type="info" v-if="pageParams.bizKeyId"
          >业务ID：{{ pageParams.bizKeyId }}</el-tag
        >
        <el-tag size="small" type="warning"
          >含税金额：{{ pageParams.allocAmt }}</el-tag
        >
        <el-tag size="small" type="warning"
          >不含税金额：{{ pageParams.allocExclAmt }}</el-tag
        >
      </div>

      <el-row :gutter="16" class="summary-cards">
        <el-col :span="6">
          <div class="summary-item">
            <div class="label">单据类型</div>
            <el-select
              v-model="billType"
              size="default"
              style="width: 100%"
              :disabled="!!pageParams.bizType"
            >
              <el-option label="定标参考价分摊" value="定标参考价分摊" />
              <el-option label="合同分摊" value="合同分摊" />
              <el-option label="变更分摊" value="变更分摊" />
              <el-option label="签证分摊" value="签证分摊" />
              <el-option label="结算分摊" value="结算分摊" />
            </el-select>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="summary-item bg-gray">
            <div class="label">总成本金额</div>
            <div class="value large">{{ pageParams.allocAmt || 0 }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="summary-item bg-green">
            <div class="label">已分摊金额</div>
            <div class="value large green">{{ allocatedAmount }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="summary-item bg-gray-light">
            <div class="label">待分摊金额</div>
            <div class="value large gray">{{ pendingAmount }}</div>
          </div>
        </el-col>
      </el-row>
    </header>

    <!-- 产品分摊配置 -->
    <el-card class="base-card" shadow="never">
      <div class="card-header">
        <span>
          <el-icon><OfficeBuilding /></el-icon>
          产品分摊
        </span>
      </div>

      <base-table
        ref="baseTableRef"
        :columns="baseColumns"
        :table-data="baseProducts"
        :row-key="'name'"
        :pagination="false"
        :show-toolbar="false"
        :show-action-bar="false"
        :border="true"
        :stripe="true"
        :auto-height="false"
        :height="'200px'"
      />
    </el-card>

    <!-- 成本科目分摊明细 -->
    <el-card class="subject-card" shadow="never">
      <div class="card-header">
        <span>
          <el-icon><List /></el-icon> 成本分摊明细
        </span>
        <div>
          <el-button plain type="primary" @click="handleChoose">
            选择分摊科目
          </el-button>
          <el-button type="primary" @click="handleSubmit"> 确认分摊 </el-button>
        </div>
      </div>

      <editable-table
        ref="editableTableRef"
        :row-key="'id'"
        :height="'300px'"
        v-model="editableSubjectData"
        :columns="subjectColumns"
        :pagination="false"
        :highlight-current-row="false"
        :show-summary="false"
        :compactEmpty="true"
        :editable="true"
      />
    </el-card>

    <!-- 成本分摊预警 -->
    <el-card class="warning-card" shadow="never">
      <div class="card-header">
        <span>
          <el-icon><WarningFilled /></el-icon> 成本分摊预警
        </span>
        <el-button link type="primary" @click="toggleWarningPanel">
          <el-icon>
            <ArrowUp v-if="warningVisible" /><ArrowDown v-else />
          </el-icon>
          {{ warningVisible ? "收起面板" : "展开面板" }}
        </el-button>
      </div>

      <div v-show="warningVisible">
        <div class="warning-stats">
          <span>
            <span class="dot red"></span>
            红色预警
            <!-- （一级科目超支）：{{ warningCount.red }}条 -->
          </span>
          <span>
            <span class="dot orange"></span>
            黄色预警
            <!-- （二级科目超支）：{{ warningCount.orange }}条 -->
          </span>
          <span>
            <span class="dot green"></span>
            绿色预警
            <!-- （无异常）：{{ warningCount.green }}条 -->
          </span>
        </div>

        <base-table
          ref="warningTableRef"
          :columns="warningColumns"
          :table-data="warningData"
          :row-key="'subject'"
          :pagination="false"
          :show-toolbar="false"
          :show-action-bar="false"
          :border="true"
          :stripe="false"
          :auto-height="false"
          max-height="260"
          @cell-event="handleWarningCellEvent"
        >
          <template #level="{ row }">
            <span class="dot" :class="row.level"></span>
          </template>
        </base-table>
      </div>
    </el-card>

    <!-- 底部操作按钮（仅独立页面模式显示） -->
    <!-- <div class="footer-actions" v-if="!isDialogMode">
      <el-button plain @click="handleSaveDraft">
        <el-icon><Document /></el-icon> 临时保存草稿
      </el-button>
      <el-button type="success" @click="handleSubmit">
        <el-icon><Check /></el-icon> 确认分摊提交
      </el-button>
    </div> -->

    <!-- 选择分摊科目弹窗 -->
    <CostAlocationDialog v-model="dialogVisible" @select="getSelectData" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import {
  OfficeBuilding,
  List,
  WarningFilled,
  ArrowUp,
  ArrowDown,
  Document,
  Check,
} from "@element-plus/icons-vue";
import EditableTable from "@/components/base/editable-table.vue";
import { EditableColumn } from "@/components/base/editable-table.vue";
import { TableColumnItem } from "@/components/base/base-table.vue";
import { v4 as uuidv4 } from "uuid";
import { costCategoryApi } from "@/api/cost/master-data/cost-category-api";
import { productTypeApi } from "@/api/cost/master-data/product-type-api";
import CostAlocationDialog from "./choose-sub-dialog.vue";

// ============= Props 定义 =============
interface Props {
  // 从父组件传入的参数（弹窗模式使用）
  projId?: number;
  bizType?: string;
  bizBillId?: string;
  bizKeyId?: string;
  allocAmt?: number;
  allocExclAmt?: number;
  // 是否弹窗模式（由父组件控制）
  isDialogMode?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  projId: undefined,
  bizType: "",
  bizBillId: "",
  bizKeyId: "",
  allocAmt: 0,
  allocExclAmt: 0,
  isDialogMode: false,
});

// ============= Emits =============
const emit = defineEmits<{
  confirm: [data: any];
  cancel: [];
  "save-draft": [data: any];
}>();

// ============= 路由 =============
const route = useRoute();
const router = useRouter();

// ============= 判断是否为弹窗模式 =============
const isDialogMode = computed(() => {
  // 优先使用props传入的判断
  if (props.isDialogMode !== undefined) {
    return props.isDialogMode;
  }
  // 如果路由名称不是成本分摊页面，认为是弹窗模式
  return route.name !== "CostAllocation";
});

// ============= 响应式数据 =============
const billType = ref("定标参考价分摊");
const warningVisible = ref(true);
const subjectOptions = ref<any[]>([]);
const productOptions = ref<any[]>([]);
const dialogVisible = ref(false);
const confirmLoading = ref(false);

// ============= 页面参数 =============
const pageParams = ref({
  projId: 0,
  bizType: "定标参考价分摊",
  bizBillId: "",
  bizKeyId: "",
  allocAmt: 0,
  allocExclAmt: 0,
});

// ============= 数据 =============
const baseProducts = ref([
  {
    prodName: "别墅",
    agBuildArea: 50,
    ugBuildArea: 16,
    agSaleArea: 48,
    ugSaleArea: 66,
    houseNum: 50,
    elvNum: 16,
  },
]);

// 可编辑表格数据
const editableSubjectData = ref([
  {
    id: 1,
    name: "4 边坡工程",
    level: 0,
    rule: "产品面积分摊",
    status: "已分摊",
    amount: 100,
    highRise: 60,
    midRise: 30,
    nonAirDefense: 16,
    airDefense: 16,
    expanded: true,
    children: [
      {
        id: 2,
        name: "4.1.1 人工",
        level: 1,
        rule: "产品面积分摊",
        status: "部分分摊",
        amount: 50,
        highRise: 60,
        midRise: 0,
        nonAirDefense: 16,
        airDefense: 16,
        children: [],
      },
      {
        id: 3,
        name: "4.1.2 材料-水泥",
        level: 1,
        rule: "产品面积分摊",
        status: "未分摊",
        amount: 50,
        highRise: 50,
        midRise: 30,
        nonAirDefense: 16,
        airDefense: 16,
        children: [],
      },
      {
        id: 4,
        name: "4.1.3 材料-钢筋",
        level: 1,
        rule: "产品面积分摊",
        status: "未分摊",
        amount: 50,
        highRise: 50,
        midRise: 30,
        nonAirDefense: 16,
        airDefense: 16,
        children: [],
      },
    ],
  },
]);

// ============= 计算属性 =============

// 已分摊金额计算
const allocatedAmount = computed(() => {
  let total = 0;
  const traverse = (data: any[]) => {
    data.forEach((item) => {
      if (item.children && item.children.length > 0) {
        traverse(item.children);
      } else {
        total += Number(item.amount || 0);
      }
    });
  };
  traverse(editableSubjectData.value);
  return total;
});

// 待分摊金额
const pendingAmount = computed(() => {
  return (pageParams.value.allocAmt || 0) - allocatedAmount.value;
});

// 预警统计
const warningCount = computed(() => {
  const count = { red: 0, orange: 0, green: 0 };
  warningData.value.forEach((item) => {
    if (item.level === "red") count.red++;
    else if (item.level === "orange") count.orange++;
    else if (item.level === "green") count.green++;
  });
  return count;
});

// ============= 表格列配置 =============

// 产品基数表格列配置
const baseColumns: TableColumnItem[] = [
  { type: "selection", width: 50, fixed: "left" },
  { type: "index", label: "序号", width: 60, fixed: "left" },
  { prop: "prodName", label: "产品名称" },
  {
    label: "建筑面积(m²)",
    children: [
      { prop: "agBuildArea", label: "地上" },
      { prop: "ugBuildArea", label: "地下" },
    ],
  },
  {
    label: "可售面积(m²)",
    children: [
      { prop: "agSaleArea", label: "地上" },
      { prop: "ugSaleArea", label: "地下" },
    ],
  },
  { prop: "houseNum", label: "户数" },
  { prop: "elvNum", label: "电梯数" },
];

// 科目表格列配置
const subjectColumns = computed<EditableColumn[]>(() => {
  const baseCols: EditableColumn[] = [
    { type: "index", label: "序号", width: 60, editable: false, fixed: "left" },
    {
      prop: "name",
      label: "科目编码",
      minWidth: 100,
      editable: false,
      align: "left",
      fixed: "left",
    },
    {
      prop: "name",
      label: "科目名称",
      minWidth: 200,
      editable: false,
    },
    {
      prop: "rule",
      label: "分摊规则",
      minWidth: 150,
      editable: true,
      editType: "select",
      showOverflowTooltip: false,
      options: [
        { label: "产品面积分摊", value: "产品面积分摊" },
        { label: "建筑面积分摊", value: "建筑面积分摊" },
        { label: "户数分摊", value: "户数分摊" },
      ],
    },
    {
      prop: "status",
      label: "分摊状态",
      minWidth: 110,
      editable: false,
    },
    {
      prop: "amount",
      label: "科目金额",
      minWidth: 90,
      editable: true,
      editType: "number",
      showOverflowTooltip: false,
    },
    {
      prop: "highRise",
      label: "高层分摊",
      minWidth: 100,
      editable: false,
      editType: "number",
      precision: 2,
    },
    {
      prop: "midRise",
      label: "小高层分摊",
      minWidth: 100,
      editable: false,
      editType: "number",
      precision: 2,
    },
    {
      prop: "nonAirDefense",
      label: "非人防分摊",
      minWidth: 100,
      editable: false,
      editType: "number",
      precision: 2,
    },
    {
      prop: "airDefense",
      label: "人防分摊",
      minWidth: 100,
      editable: false,
      editType: "number",
      precision: 2,
    },
  ];
  return [...baseCols];
});

// 预警表格列配置
const warningColumns: TableColumnItem[] = [
  {
    prop: "level",
    label: "状态",
    width: 70,
    slot: "level",
  },
  { prop: "subject", label: "科目编码" },
  { prop: "subject", label: "科目名称" },
  { prop: "balance", label: "分摊后余额" },
  { prop: "targetCost", label: "目标成本可用额" },
  { prop: "currentCost", label: "当前分摊额" },
];

// ============= 预警数据 =============
const warningData = ref([
  {
    level: "red",
    subject: "边坡工程",
    balance: "-5",
    targetCost: "66",
    currentCost: "60",
  },
  {
    level: "orange",
    subject: "人工",
    balance: "20",
    targetCost: "112",
    currentCost: "92",
  },
  {
    level: "green",
    subject: "材料-水泥",
    balance: "30",
    targetCost: "112",
    currentCost: "82",
  },
  {
    level: "green",
    subject: "材料-钢筋",
    balance: "30",
    targetCost: "112",
    currentCost: "82",
  },
]);

// ============= 方法 =============

// 从URL或Props获取参数
const getParams = () => {
  // 优先使用props
  if (props.projId) {
    return {
      projId: props.projId,
      bizType: props.bizType || "定标参考价分摊",
      bizBillId: props.bizBillId || "",
      bizKeyId: props.bizKeyId || "",
      allocAmt: props.allocAmt || 0,
      allocExclAmt: props.allocExclAmt || 0,
    };
  }

  // 从路由参数获取
  return {
    projId: route.query.projId ? Number(route.query.projId) : 0,
    bizType: (route.query.bizType as string) || "定标参考价分摊",
    bizBillId: (route.query.bizBillId as string) || "",
    bizKeyId: (route.query.bizKeyId as string) || "",
    allocAmt: route.query.allocAmt ? Number(route.query.allocAmt) : 0,
    allocExclAmt: route.query.allocExclAmt
      ? Number(route.query.allocExclAmt)
      : 0,
  };
};

// 初始化页面
const initPage = async () => {
  const params = getParams();
  pageParams.value = params;

  if (!params.projId) {
    ElMessage.warning("缺少项目ID参数");
    return;
  }

  // 设置billType
  if (params.bizType) {
    billType.value = params.bizType;
  }

  // 加载数据
  await Promise.all([getCostSubjectProjList(), getProductList()]);

  // 如果有业务单据ID，加载已保存的分摊数据
  if (params.bizBillId) {
    await loadAllocationData(params.bizBillId);
  }
};

// 加载已保存的分摊数据
const loadAllocationData = async (bizBillId: string) => {
  try {
    // TODO: 调用API获取已保存的分摊数据
    // const res = await costAllocationApi.getAllocationDetail({ bizBillId });
    // if (res.code === 200 && res.data) {
    //   editableSubjectData.value = res.data;
    // }
    console.log("加载已有分摊数据:", bizBillId);
  } catch (error) {
    console.error("加载分摊数据失败:", error);
  }
};

// 获取目标成本科目列表
const getCostSubjectProjList = async () => {
  if (!pageParams.value.projId) {
    ElMessage.warning("请先选择项目");
    return;
  }
  try {
    const res = await costCategoryApi.getCostSubjectProjList({
      projId: pageParams.value.projId,
      withDetail: true,
    });
    if (res.code === 200) {
      subjectOptions.value = res.data || [];
      renderSubjectOptions();
    } else {
      ElMessage.error(res.msg || "获取数据失败");
    }
  } catch (error) {
    console.error("获取数据失败:", error);
  }
};

// 渲染科目列表
const renderSubjectOptions = () => {
  const list = subjectOptions.value.map((subject: any) => ({
    uuid: uuidv4(),
    subId: subject.id,
    subName: subject.subName,
    costAmt: 0,
    costExclAmt: 0,
    allocAmt: 0,
    allocExclAmt: 0,
    allocWarn: 2,
  }));
  console.log("渲染科目列表:", list);
};

// 获取项目产品类型
const getProductList = async () => {
  if (!pageParams.value.projId) return;
  try {
    const res = await productTypeApi.getProductProjList({
      projId: pageParams.value.projId,
      withDetail: true,
    });
    if (res.code === 200) {
      productOptions.value = res.data || [];
    } else {
      ElMessage.error(res.msg || "获取数据失败");
    }
  } catch (error) {
    console.error("获取业态列表失败:", error);
  }
};

// 弹窗选择科目
const handleChoose = () => {
  dialogVisible.value = true;
};

// 接收选择的科目数据
const getSelectData = (data: any) => {
  editableSubjectData.value = data;
};

// 提交确认
const handleSubmit = async () => {
  confirmLoading.value = true;
  try {
    const currentData = editableSubjectData.value;
    const params = pageParams.value;

    const submitData = {
      projId: params.projId,
      bizType: params.bizType,
      bizBillId: params.bizBillId,
      bizKeyId: params.bizKeyId,
      allocAmt: params.allocAmt,
      allocExclAmt: params.allocExclAmt,
      allocationData: currentData,
    };

    // TODO: 调用保存接口
    // await costAllocationApi.saveAllocation(submitData);
    console.log("提交数据:", submitData);

    if (isDialogMode.value) {
      // 弹窗模式：触发confirm事件给父组件
      emit("confirm", submitData);
      ElMessage.success("分摊数据确认提交！");
    } else {
      // 独立页面模式：提示成功
      ElMessage.success(
        "分摊数据确认提交！数据锁定，如需修改请执行撤销分摊操作",
      );
    }
  } catch (error) {
    console.error("提交失败:", error);
    ElMessage.error("提交失败，请重试");
  } finally {
    confirmLoading.value = false;
  }
};

// 返回（独立页面模式）
const handleBack = () => {
  router.back();
};

// 取消操作（弹窗模式使用）
const handleCancel = () => {
  if (isDialogMode.value) {
    emit("cancel");
  }
};

// 保存草稿（独立页面模式使用）
const handleSaveDraft = () => {
  const currentData = editableSubjectData.value;
  console.log("保存草稿:", currentData);
  // TODO: 调用保存草稿接口
  ElMessage.success("草稿保存成功，可继续编辑");
};

// 预警面板切换
const toggleWarningPanel = () => {
  warningVisible.value = !warningVisible.value;
};

// 预警跳转
const handleJump = (row: any) => {
  ElMessage.info(`已定位到 "${row.subject}" 科目，可直接修改分摊数值`);
};

// 预警表格单元格事件
const handleWarningCellEvent = (payload: any) => {
  if (payload.eventName === "action:调整") {
    handleJump(payload.row);
  }
};

// ============= 生命周期 =============

// 初始化
onMounted(async () => {
  // 如果是路由页面（非弹窗模式），初始化
  if (!isDialogMode.value) {
    await initPage();
  }
});

// 监听props变化（弹窗模式）
watch(
  () => [props.projId, props.bizBillId],
  () => {
    if (isDialogMode.value && props.projId) {
      initPage();
    }
  },
  { immediate: true },
);

// 暴露方法供父组件调用
defineExpose({
  initPage,
  getData: () => editableSubjectData.value,
  getBaseData: () => baseProducts.value,
  getPageParams: () => pageParams.value,
});
</script>

<style scoped>
.cost-allocation-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 16px;
  background: #f3f4f6;
  font-size: 14px;
}

/* 弹窗模式样式调整 */
.cost-allocation-container.dialog-mode {
  padding: 0;
  background: transparent;
}

.cost-allocation-container.dialog-mode .header-card {
  margin-top: 0;
}

/* 卡片通用 */
.header-card {
  padding: 16px 20px;
}
.header-card,
.base-card,
.subject-card,
.warning-card {
  background: #fff;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.header-card {
  position: sticky;
  top: 0;
  z-index: 30;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.header-top h2 {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
}

.biz-info {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 6px;
}

.summary-cards {
  margin: 12px 0;
}
.summary-item {
  background: #f0f7ff;
  border-radius: 8px;
  padding: 12px 16px;
  border: 1px solid #dbeafe;
}
.summary-item .label {
  font-size: 14px;
  color: #6b7280;
}
.summary-item .value.large {
  font-size: 24px;
  font-weight: 700;
  margin-top: 4px;
}
.summary-item.bg-gray {
  background: #f9fafb;
  border-color: #e5e7eb;
}
.summary-item.bg-green {
  background: #ecfdf5;
  border-color: #a7f3d0;
}
.summary-item.bg-green .value {
  color: #10b981;
}
.summary-item.bg-gray-light {
  background: #f3f4f6;
  border-color: #d1d5db;
}
.summary-item.bg-gray-light .value {
  color: #9ca3af;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 15px;
}
.card-header .el-icon {
  color: #2563eb;
  margin-right: 6px;
}

.warning-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 12px;
}
.warning-stats span {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
.dot.red {
  background: #ef4444;
}
.dot.orange {
  background: #f59e0b;
}
.dot.green {
  background: #10b981;
}

.footer-actions {
  background: #fff;
  border-radius: 12px;
  padding: 16px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  position: sticky;
  bottom: 0;
  z-index: 20;
  margin-top: 16px;
}

/* 弹窗模式下底部按钮隐藏 */
.dialog-mode .footer-actions {
  display: none;
}

</style>
