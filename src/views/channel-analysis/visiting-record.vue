<!-- 来访记录页面 -->
<template>
  <div class="visiting-record-page">
    <el-form
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      label-width="80px"
    >
      <el-form-item label="项目" prop="projId">
        <el-select
          v-model="queryParams.projId"
          placeholder="项目"
          :clearable="false"
          style="width: 200px"
          @change="handleProjectChange"
        >
          <el-option
            v-for="item in projectList"
            :key="item.projId"
            :label="item.projName"
            :value="item.projId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="来访日期" prop="day">
        <el-date-picker
          v-model="queryParams.day"
          type="date"
          placeholder="来访日期"
          :clearable="true"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item label="客户姓名" prop="custName">
        <el-input
          v-model="queryParams.custName"
          placeholder="请输入客户姓名"
          clearable
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item label="客户电话" prop="custTel">
        <el-input
          v-model="queryParams.custTel"
          placeholder="请输入客户电话"
          clearable
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="Search"
          :loading="tableLoading"
          @click="handleQuery"
        >
          搜索
        </el-button>
        <el-button icon="Refresh" :loading="tableLoading" @click="resetQuery">
          重置
        </el-button>
      </el-form-item>
    </el-form>
    <base-table
      :rowKey="'uuid'"
      :columns="visitingRecordColumns"
      :tableData="paginatedData"
      :loading="tableLoading"
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      @pagination-change="handlePaginationChange"
    >
      <!-- 项目名称 -->
      <template #projName="scope">
        <div>{{ getProjectName(scope.row.visitProjId) }}</div>
      </template>
      <!-- 到访方式 -->
      <template #visitTypeName="scope">
        <div>{{ getVisitTypeName(scope.row.visitTypeId) }}</div>
      </template>
      <!-- 置业顾问 -->
      <template #salerName="scope">
        <div>{{ getSalerName(scope.row.salerId) }}</div>
      </template>
      <!-- 知晓途径 -->
      <template #knowWayName="scope">
        <div>{{ getKnowWayName(scope.row.knowWayId) }}</div>
      </template>
      <!-- 列表内操作列自定义插槽 -->
      <template #action="scope">
        <div class="action-buttons">
          <el-button
            link
            type="primary"
            @click="handlePrint(scope.row)"
          >
            打印
          </el-button>
        </div>
      </template>
    </base-table>
    <!-- 打印表单 -->
    <base-modal
      v-model="modalVisible"
      :title="'打印详情'"
      width="900px"
      class="print-modal"
      :confirm-loading="confirmLoading"
      :confirmText="'确认打印'"
      @confirm="handleSubmit"
      @cancel="handleClose"
    >
      <template v-if="currentPrintRow">
        <el-descriptions
          :column="2"
          :size="'default'"
          border
          id="custom-descriptions-detail"
        >
          <template #title>
            <div>
              {{ getProjectName(currentPrintRow.visitProjId) || "-" }} -
              来访确认单
            </div>
          </template>
          <el-descriptions-item :span="2">
            <template #label>
              <div class="cell-item">项目名称</div>
            </template>
            {{ getProjectName(currentPrintRow.visitProjId) }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">客户姓名</div>
            </template>
            {{ currentPrintRow.custName || "-" }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">客户电话</div>
            </template>
            {{ currentPrintRow.custTel || "-" }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">备用电话</div>
            </template>
            {{ currentPrintRow.custTel2 || "-" }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">置业顾问</div>
            </template>
            {{ getSalerName(currentPrintRow.salerId) }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">到访方式</div>
            </template>
            {{ getVisitTypeName(currentPrintRow.visitTypeId) }}
          </el-descriptions-item>

          <el-descriptions-item>
            <template #label>
              <div class="cell-item">带访人</div>
            </template>
            {{ currentPrintRow.bringMan || "-" }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">带访人电话</div>
            </template>
            {{ currentPrintRow.bringTel || "-" }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">来访时间</div>
            </template>
            {{ currentPrintRow.visitTime || "-" }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">来访人数</div>
            </template>
            {{ currentPrintRow.visitNum || "-" }}人
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">知晓途径</div>
            </template>
            {{ getKnowWayName(currentPrintRow.knowWayId) }}
          </el-descriptions-item>
          <!-- 单独占一行 -->
          <el-descriptions-item :span="2">
            <template #label>
              <div class="cell-item">甲方</div>
            </template>
            {{ currentPrintRow.visitComName || "-" }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">乙方</div>
            </template>
            {{ currentPrintRow.reportCom || "-" }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">渠道门店</div>
            </template>
            {{ currentPrintRow.reportComArea || "-" }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">打印人</div>
            </template>
            {{ userName }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">打印时间</div>
            </template>
            {{ dateUtil().format("YYYY-MM-DD HH:mm:ss") }}
          </el-descriptions-item>

          <el-descriptions-item label="甲方签字">
            <div style="height: 60px"></div>
          </el-descriptions-item>
          <el-descriptions-item label="乙方签字">
            <div style="height: 60px"></div>
          </el-descriptions-item>
          <el-descriptions-item label="甲方签字时间">
            <div style="height: 60px"></div>
          </el-descriptions-item>
          <el-descriptions-item label="乙方签字时间">
            <div style="height: 60px"></div>
          </el-descriptions-item>
        </el-descriptions>
      </template>
    </base-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { visitingRecordColumns } from "./project-columns";
import { dateUtil } from "@/utils/date-util";
import { assetManagementApi } from "@/api/asset-management-api";
import { ConversionRateInterface } from "@/types/channel-analysis-type";
import { v4 as uuidv4 } from "uuid";
import BaseModal from "@/components/base/base-modal.vue";
import { VuePrintNext } from "vue-print-next";
import { useUserStore } from "@/stores/user-store";

const userStore = useUserStore();
// 组件name，需要和菜单配置里面的name一致
defineOptions({ name: "visiting-record" });

const queryParams = ref({
  projId: "",
  day: dateUtil().format("YYYY-MM-DD"),
  custName: "",
  custTel: "",
});
const projectList = ref([]);
const visitMethodList = ref([]);
const salerList = ref([]);
const knowWayList = ref([]);
const tableLoading = ref<boolean>(false);
const currentPage = ref<number>(1);
const pageSize = ref<number>(20);
const total = ref<number>(0);
const tableData = ref<ConversionRateInterface[]>([]);
const allTableList = ref<ConversionRateInterface[]>([]);

const modalVisible = ref<boolean>(false);
const confirmLoading = ref<boolean>(false);
const currentPrintRow = ref(null);
const printInstance = ref<any>(null);

const userName = computed(() => {
  const name = userStore?.userInfo?.empName || "";
  return name ? name.replace(/\(.*\)/, "") : "-";
});

const handleProjectChange = (value: any) => {
  queryParams.value.projId = value;
  fetchGetSalerList();
};
const handlePaginationChange = (params: any) => {
  currentPage.value = params.currentPage;
  pageSize.value = params.pageSize;
};

const handleQuery = () => {
  currentPage.value = 1;
  pageSize.value = 20;
  getTableList();
};
const resetQuery = () => {
  initDefaultParams();
  currentPage.value = 1;
  pageSize.value = 20;
  getTableList();
};

// 默认全选查询条件
const initDefaultParams = () => {
  if (projectList.value.length > 0) {
    queryParams.value.projId = projectList.value[0].projId;
  }
  //   queryParams.value.day = dateUtil().format("YYYY-MM-DD");
  queryParams.value.day = "";
};
// 获取项目列表
const getProjectList = async () => {
  try {
    const res = await assetManagementApi.getProjList({ isAll: true });
    if (res.code === 200) {
      projectList.value = res.data || [];
    }
  } catch (error) {
    projectList.value = [];
  }
};
// 获取来访方式
const fetchGetVisitType = async () => {
  try {
    const res = await assetManagementApi.getVisitType();
    if (res.code === 200) {
      const data = res.data || [];
      const [firstData, ...restData] = data;
      const { optionStr, valueStr } = firstData || {};
      visitMethodList.value = transformData(optionStr, valueStr);
    }
  } catch (error) {
    visitMethodList.value = [];
  }
};
// 获取置业顾问
const fetchGetSalerList = async () => {
  if (!queryParams.value.projId) {
    salerList.value = [];
    return;
  }
  try {
    const res = await assetManagementApi.getSalerList({
      projId: queryParams.value.projId,
    });
    if (res.code === 200) {
      salerList.value = res.data || [];
    }
  } catch (error) {
    salerList.value = [];
  }
};
// 获取知晓途径
const fetchGetKnowWay = async () => {
  try {
    const res = await assetManagementApi.getKnowWay();
    if (res.code === 200) {
      const data = res.data || [];
      const [firstData, ...restData] = data;
      const { optionStr, valueStr } = firstData || {};
      knowWayList.value = transformData(optionStr, valueStr);
    }
  } catch (error) {
    knowWayList.value = [];
  }
};
const transformData = (optionStr: any, valueStr: any) => {
  // 参数校验：非字符串或空字符串时返回空数组
  if (typeof optionStr !== "string" || typeof valueStr !== "string") {
    return [];
  }
  const trimmedOption = optionStr.trim();
  const trimmedValue = valueStr.trim();
  // 处理空字符串
  if (trimmedOption === "" || trimmedValue === "") {
    return [];
  }
  const names = trimmedOption.split(",");
  const ids = trimmedValue.split(",");
  const result = [];
  // 取两者中较短的长度进行配对，避免索引越界
  const length = Math.min(names.length, ids.length);
  // 遍历并组装对象数组
  for (let i = 0; i < length; i++) {
    result.push({
      id: ids[i], // 保持原始字符串格式
      name: names[i].trim(), // 去除名称首尾空格
    });
  }
  return result;
};

// 获取列表
const getTableList = async () => {
  try {
    tableLoading.value = true;
    allTableList.value = [];
    const { projId, day, custName, custTel } = queryParams.value;
    const params = {
      projId: projId,
      custName: custName,
      custTel: custTel,
      visitTimeStart: day ? `${day} 00:00:00` : "",
      visitTimeEnd: day ? `${day} 23:59:59` : "",
    };
    const res = await assetManagementApi.getVisitHis(params);
    if (res.code === 200) {
      allTableList.value = (res.data || []).map((item: any) => ({
        ...item,
        uuid: uuidv4(),
      }));
      total.value = res.data?.length || 0;
    }
  } catch (error) {
    console.error("获取数据失败:", error);
    allTableList.value = [];
    total.value = 0;
  } finally {
    tableLoading.value = false;
  }
};
// 手动分页
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return allTableList.value.slice(start, end);
});

// 打印
const handlePrint = (row: any) => {
  currentPrintRow.value = row;
  modalVisible.value = true;
};
const getProjectName = (projId: string) => {
  const project = projectList.value.find((item) => item.projId == projId);
  return project ? project.projName : "-";
};
const getVisitTypeName = (visitType: string) => {
  const visit = visitMethodList.value.find((item) => item.id == visitType);
  return visit ? visit.name : "-";
};
const getSalerName = (salerId: string) => {
  const saler = salerList.value.find((item) => item.salerId == salerId);
  return saler ? saler.salerName : "-";
};
const getKnowWayName = (knowWay: string) => {
  const know = knowWayList.value.find((item) => item.id == knowWay);
  return know ? know.name : "-";
};

const handleClose = () => {
  modalVisible.value = false;
  setTimeout(() => {
    currentPrintRow.value = null;
  }, 200);
};
const handleSubmit = async () => {
  printInstance.value = new VuePrintNext({
    el: "#custom-descriptions-detail", // 要打印的元素选择器
    preview: false, // 是否开启预览
    popTitle: "来访记录单", // 打印页眉标题
    orientation: "portrait", // 设置打印纸张的方向。'portrait'（纵向）或 'landscape'（横向）
    paperSize: "A4", // 纸张大小
    // 额外的 CSS 文件,用于自定义打印样式
    extraHead: `
        <style>
            @media print {
                @page {
                    margin: 0mm;
                    size: auto;
                }
                body {
                    margin: 0mm;
                }
            }
        </style>
    `,
  });
};
// 初始化数据
const initPageData = async () => {
  await getProjectList(); // 项目列表
  initDefaultParams(); // 初始化查询参数
  await fetchGetVisitType(); // 来访方式
  await fetchGetSalerList(); // 置业顾问
  await fetchGetKnowWay(); // 知晓途径
  await getTableList(); // 获取列表数据
};
// 生命周期
onMounted(() => {
  initPageData();
});
onUnmounted(() => {
  if (printInstance.value) {
    printInstance.value = null;
  }
});
</script>

<style lang="scss" scoped>
.visiting-record-page {
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 15px 15px;
  box-sizing: border-box;
  background: #fff;
}
#custom-descriptions-detail {
  padding: 20px;
  :deep(.el-descriptions__header) {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  :deep(.el-descriptions__label) {
    width: 120px; /* 设置固定宽度 */
  }
}
</style>
