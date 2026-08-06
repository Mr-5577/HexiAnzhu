<!-- 成本分摊 页面 -->
<template>
  <div class="app-container">
    <!-- 顶部业务头部 -->
    <header class="header-card">
      <div class="header-top">
        <h2>成本分摊</h2>
        <!-- <el-button plain icon="DArrowLeft" type="primary">返回</el-button> -->
      </div>

      <el-row :gutter="16" class="summary-cards">
        <el-col :span="6">
          <div class="summary-item">
            <div class="label">单据类型</div>
            <el-select v-model="billType" size="default" style="width: 100%">
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
            <div class="value large">100</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="summary-item bg-green">
            <div class="label">已分摊金额</div>
            <div class="value large green">100</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="summary-item bg-gray-light">
            <div class="label">待分摊金额</div>
            <div class="value large gray">0</div>
          </div>
        </el-col>
      </el-row>
    </header>

    <!-- 产品分摊配置 -->
    <el-card class="base-card" shadow="never">
      <div class="card-header">
        <span>
          <el-icon><OfficeBuilding /></el-icon>
          产品分摊配置
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
          <el-icon><List /></el-icon> 成本科目分摊明细
        </span>
        <div>
          <el-button plain type="primary" @click="handleChoose">
            选择分摊科目
          </el-button>
          <el-button type="primary" @click="handleSubmit"> 确认分摊 </el-button>
        </div>
      </div>

      <!-- 筛选栏 -->
      <div class="filter-bar">
        <span>筛选分摊状态：</span>
        <el-select v-model="filterStatus" size="default" style="width: 140px">
          <el-option label="全部" value="all" />
          <el-option label="已分摊" value="done" />
          <el-option label="部分分摊" value="part" />
          <el-option label="未分摊" value="none" />
        </el-select>
        <span>搜索科目：</span>
        <el-input
          v-model="searchKeyword"
          size="default"
          placeholder="输入科目名称"
          style="width: 180px"
        />
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
      ></editable-table>
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
            红色预警（一级科目超支）：1条
          </span>
          <span>
            <span class="dot orange"></span>
            黄色预警（二级科目超支）：1条
          </span>
          <span> <span class="dot green"></span> 绿色预警（无异常）：2条 </span>
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
          <!-- 自定义预警列 -->
          <template #level="{ row }">
            <span class="dot" :class="row.level"></span>
          </template>
        </base-table>
      </div>
    </el-card>

    <!-- 底部操作按钮 -->
    <!-- <div class="footer-actions">
      <el-button plain @click="handleSaveDraft">
        <el-icon><Document /></el-icon> 临时保存草稿
      </el-button>
      <el-button type="success" @click="handleSubmit">
        <el-icon><Check /></el-icon> 确认分摊提交
      </el-button>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import {
  OfficeBuilding,
  List,
  WarningFilled,
  ArrowUp,
  ArrowDown,
} from "@element-plus/icons-vue";
import EditableTable from "@/components/base/editable-table.vue";
import { EditableColumn } from "@/components/base/editable-table.vue";
import { TableColumnItem } from "@/components/base/base-table.vue";

const billType = ref("定标参考价分摊");
const filterStatus = ref("all");
const searchKeyword = ref("");
const warningVisible = ref(true);

const baseProducts = ref([
  {
    name: "高层",
    buildingType: "住宅",
    areaAbove: 50,
    areaBelow: 16,
    areaCountable: 48,
    totalArea: 66,
    areaAboveGround: 50,
    areaBelowGround: 16,
    households: 60,
    avgAreaPerHousehold: 110,
    plotRatio: 2.8,
    buildingDensity: 0.22,
    greenRate: 0.35,
  },
  {
    name: "小高层",
    buildingType: "住宅",
    areaAbove: 30,
    areaBelow: 16,
    areaCountable: 28,
    totalArea: 46,
    areaAboveGround: 30,
    areaBelowGround: 16,
    households: 30,
    avgAreaPerHousehold: 120,
    plotRatio: 2.5,
    buildingDensity: 0.2,
    greenRate: 0.38,
  },
]);
// 产品基数表格列配置
const baseColumns: TableColumnItem[] = [
  { type: "selection", width: 50, fixed: "left" },
  { type: "index", label: "序号", width: 60, fixed: "left" },
  { prop: "name", label: "产品名称", minWidth: 100, fixed: true },
  { prop: "buildingType", label: "业态类型", width: 100 },
  { prop: "areaAbove", label: "地上可售面积", width: 120 },
  { prop: "areaBelow", label: "地下可售面积", width: 120 },
  { prop: "areaCountable", label: "计容面积", width: 120 },
  { prop: "totalArea", label: "总建筑面积", width: 120 },
  { prop: "areaAboveGround", label: "地上建筑面积", width: 120 },
  { prop: "areaBelowGround", label: "地下建筑面积", width: 120 },
  { prop: "households", label: "总户数", width: 100 },
  { prop: "avgAreaPerHousehold", label: "户均面积", width: 110 },
  { prop: "plotRatio", label: "容积率", width: 100 },
  { prop: "buildingDensity", label: "建筑密度", width: 100 },
  { prop: "greenRate", label: "绿化率", width: 100 },
];

// 注意：这里直接用 ref 存储数据，不再使用 watch 同步
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

// ---------- 静态数据：预警数据 ----------
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

// ---------- 方法 ----------
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

// 保存草稿
const handleSaveDraft = () => {
  // 从可编辑表格获取当前数据
  const currentData = editableSubjectData.value;
  console.log("保存草稿:", currentData);
  ElMessage.success("草稿保存成功，可继续编辑");
};
// 弹窗选择科目
const handleChoose = () => {
  
}

// 提交
const handleSubmit = () => {
  const currentData = editableSubjectData.value;
  console.log("提交数据:", currentData);
  ElMessage.success("分摊数据确认提交！数据锁定，如需修改请执行撤销分摊操作");
};

// 暴露方法
defineExpose({
  getData: () => editableSubjectData.value,
  getBaseData: () => baseProducts.value,
});
</script>

<style scoped>
.app-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 16px;
  background: #f3f4f6;
  font-size: 14px;
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
  margin-bottom: 12px;
}
.header-top h2 {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
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

.filter-bar {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.filter-bar span {
  font-size: 14px;
  color: #4b5563;
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
</style>
