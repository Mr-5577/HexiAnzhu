<!-- 请款执行概览 -->
<template>
  <div class="payment-overview-wrapper">
    <!-- 查询卡片 -->
    <div class="search-card">
      <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="80px" class="search-form">
        <el-form-item label="业务板块" prop="segId">
          <el-select v-model="queryParams.segId" placeholder="请选择业务板块" style="width: 220px" @change="changeSeg">
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

        <el-form-item label="支付公司" prop="payCompId">
          <el-select v-model="queryParams.payCompId" placeholder="请选择公司" clearable filterable style="width: 220px">
            <el-option v-for="item in companyOptions" :key="item.id" :label="item.compName" :value="item.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="请款单号" prop="reqNo">
          <el-input v-model="queryParams.reqNo" placeholder="请输入请款单号" clearable style="width: 220px" />
        </el-form-item>

        <el-form-item label="归属月份" prop="belongMonth">
          <el-date-picker v-model="queryParams.belongMonth" type="monthrange" range-separator="至" value-format="YYYY-MM"
            start-placeholder="开始月份" end-placeholder="结束月份" style="width: 220px" />
        </el-form-item>

        <el-form-item label="收款方" prop="payeeName">
          <el-input v-model="queryParams.payeeName" placeholder="请输入收款方" clearable style="width: 220px" />
        </el-form-item>

        <el-form-item label="申请人" prop="applyUserId">
          <ChooseEmployee v-model="queryParams.applyUserId" :show-all-levels="false" placeholder="请选择" :width="220"
            clearable filterable />
        </el-form-item>

        <el-form-item label="申请日期" prop="applyDate">
          <el-date-picker v-model="queryParams.applyDate" type="daterange" range-separator="至" value-format="YYYY-MM-DD"
            start-placeholder="开始日期" end-placeholder="结束日期" style="width: 220px" />
        </el-form-item>

        <el-form-item label="审批状态" prop="wfStatus">
          <el-select v-model="queryParams.wfStatus" multiple placeholder="请选择审批状态" style="width: 220px">
            <!-- <el-option label="草稿" :value="0" /> -->
            <el-option label="审批中" :value="10" />
            <el-option label="已审批" :value="40" />
            <!-- <el-option label="作废" :value="80" /> -->
          </el-select>
        </el-form-item>

        <el-form-item label="入账状态" prop="isLocked">
          <el-select v-model="queryParams.isLocked" placeholder="请选择入账状态" style="width: 220px" clearable>
            <el-option label="已入账" :value="true" />
            <el-option label="未入账" :value="false" />
          </el-select>
        </el-form-item>

        <el-form-item label="支付状态" prop="payStatus">
          <el-select v-model="queryParams.payStatus" placeholder="请选择支付状态" style="width: 220px" clearable>
            <el-option label="未支付" value="未支付" />
            <el-option label="部分支付" value="部分支付" />
            <el-option label="全部支付" value="全部支付" />
          </el-select>
        </el-form-item>

        <el-form-item label="支付统计月" prop="statMonth">
          <el-date-picker v-model="queryParams.statMonth" type="month" value-format="YYYY-MM" placeholder="请选择支付统计月"
            style="width: 220px" />
        </el-form-item>
        <el-form-item label="费用类型" prop="finaTypeIds">
          <el-cascader v-model="queryParams.finaTypeIds" :options="feeTypeOptions" :collapse-tags="true"
            :collapse-tags-tooltip="true" :max-collapse-tags="1" :show-all-levels="false" :props="{
              expandTrigger: 'hover',
              emitPath: false,
              checkStrictly: false,
              value: 'id',
              label: 'finaTypeName',
              children: 'children',
              multiple: true,
            }" placeholder="请选择费用类型" style="width: 220px" filterable clearable />
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
      <!-- 单位切换 -->
      <div class="unit-setting">
        <span class="unit-label">单位</span>
        <el-radio-group v-model="unitMode" size="small">
          <el-radio-button value="元">元</el-radio-button>
          <el-radio-button value="万元">万元</el-radio-button>
        </el-radio-group>
      </div>
      <div class="stat-item stat-item-request">
        <div class="stat-icon"><el-icon>
            <Money />
          </el-icon></div>
        <div class="stat-content">
          <span class="stat-label">请款金额</span>
          <span class="stat-value">{{ formatAmount(statistics.totalRequestAmt) }}
            <span class="stat-unit">{{ unitMode }}</span>
          </span>
        </div>
      </div>
      <div class="stat-item stat-item-adjust">
        <div class="stat-icon"><el-icon>
            <Edit />
          </el-icon></div>
        <div class="stat-content">
          <span class="stat-label">款项调整金额</span>
          <span class="stat-value">{{ formatAmount(statistics.totalAdjustAmt) }}
            <span class="stat-unit">{{ unitMode }}</span>
          </span>
        </div>
      </div>
      <div class="stat-item stat-item-actual">
        <div class="stat-icon"><el-icon>
            <Document />
          </el-icon></div>
        <div class="stat-content">
          <span class="stat-label">实际请款金额</span>
          <span class="stat-value">{{ formatAmount(statistics.totalActualRequestAmt) }}
            <span class="stat-unit">{{ unitMode }}</span>
          </span>
        </div>
      </div>
      <div class="stat-item stat-item-paid">
        <div class="stat-icon"><el-icon>
            <Check />
          </el-icon></div>
        <div class="stat-content">
          <span class="stat-label">已付金额(累计)</span>
          <span class="stat-value">{{ formatAmount(statistics.totalPaidAmt) }}
            <span class="stat-unit">{{ unitMode }}</span>
          </span>
        </div>
      </div>
      <div class="stat-item stat-item-unpaid">
        <div class="stat-icon"><el-icon>
            <Clock />
          </el-icon></div>
        <div class="stat-content">
          <span class="stat-label">未付金额</span>
          <span class="stat-value">{{ formatAmount(statistics.totalUnpaidAmt) }}
            <span class="stat-unit">{{ unitMode }}</span>
          </span>
        </div>
      </div>
    </div>

    <!-- 表格卡片 -->
    <div class="table-card">
      <base-table :columns="columns" :tableData="paginatedData" :loading="tableLoading" :rowKey="'id'" :total="total"
        :current-page="currentPage" :page-size="pageSize" @pagination-change="handlePaginationChange"
        class="custom-table" @cell-event="handleCellEventClick" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { Search, Refresh, Download, Money, Edit, Document, Check, Clock } from '@element-plus/icons-vue';
import type { TableColumnItem } from "@/components/base/base-table.vue";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api";
import { BigNumber, bigSum, formatThousandWithPlaces, toBig } from "@/utils/big-number";
import dayjs from "dayjs";
import mdApi from "@/api/system/md-api";
import { reportManageApi } from "@/api/cost/contract-manage/report-manage-api";
import { ElMessage } from "element-plus";
import { buildTree } from "@/utils/tree";
import { useRoute, useRouter } from "vue-router";

defineOptions({ name: "payment-overview" });

const router = useRouter();

const queryParams = ref({
  segId: undefined,
  projIds: [],
  payCompId: undefined,
  reqNo: undefined,
  belongMonth: [],
  payeeName: undefined,
  applyUserId: undefined,
  applyDate: [],
  wfStatus: [40], // 默认查询已审批通过的请款单
  isLocked: undefined,
  payStatus: undefined,
  // statMonth: dayjs().format("YYYY-MM"),
  statMonth: undefined,
  finaTypeIds: [],
});

const segOptions = ref([]);
const projectOptions = ref([]);
const companyOptions = ref([]);
const feeTypeOptions = ref([]);

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
const exportLoading = ref(false);
const unitMode = ref<'元' | '万元'>('万元');
const statistics = ref({
  totalRequestAmt: 0,
  totalAdjustAmt: 0,
  totalActualRequestAmt: 0,
  totalPaidAmt: 0,
  totalUnpaidAmt: 0,
});
const columns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60, fixed: "left" },
  { prop: "reqNo", label: "请款单号", width: 150, fixed: "left" },
  { prop: "reqTitle", label: "请款标题", width: 180, fixed: "left" },
  { prop: "segName", label: "业务板块", width: 80, fixed: "left" },
  { prop: "projName", label: "项目名称", width: 120, fixed: "left" },
  { prop: "compName", label: "费用所属公司", width: 120 },
  { prop: "payTypeName", label: "款项类型", width: 100 },
  { prop: "applyUser", label: "申请人", width: 90 },
  { prop: "applyDate", label: "申请日期", width: 100 },
  { prop: "itemNo", label: "合同/事项编号", width: 150 },
  { prop: "itemName", label: "合同/事项名称", width: 150 },
  { prop: "finaOrgName", label: "费用所属组织", width: 130 },
  { prop: "finaSubName", label: "报账科目", width: 120 },
  { prop: "payCompName", label: "支付公司", width: 150 },
  { prop: "reqDesc", label: "摘要", width: 200 },
  { prop: "belongMonth", label: "费用所属月份", width: 110 },
  { prop: "accountName", label: "收款方", width: 150 },
  {
    prop: "reqAmt",
    label: "请款金额",
    width: 100,
    formatter: (row) => formatThousandWithPlaces(row.reqAmt || 0),
  },
  {
    prop: "dedAmt",
    label: "其中抵房款",
    width: 110,
    formatter: (row) => formatThousandWithPlaces(row.dedAmt || 0),
  },
  {
    prop: "changeAmt",
    label: "款项调整金额",
    width: 120,
    formatter: (row) => formatThousandWithPlaces(row.changeAmt || 0),
  },
  {
    prop: "factReqAmt",
    label: "实际请款金额",
    width: 120,
    formatter: (row) => formatThousandWithPlaces(row.factReqAmt || 0),
    clickable: true, // 允许触发单元格事件
    clickEvent: "factReqAmt-click", // 事件名称
  },
  {
    prop: "paidAmt",
    label: "已付金额(累计)",
    width: 130,
    formatter: (row) => formatThousandWithPlaces(row.paidAmt || 0),
    clickable: true, // 允许触发单元格事件
    clickEvent: "paidAmt-click", // 事件名称
  },
  {
    prop: "monthPaidAmt",
    label: "统计月支付",
    width: 110,
    formatter: (row) => formatThousandWithPlaces(row.monthPaidAmt || 0),
  },
  { prop: "lastPayDate", label: "最近支付时间", width: 160 },
  {
    prop: "unpaidAmt",
    label: "未付金额",
    width: 120,
    formatter: (row) => formatThousandWithPlaces(row.unpaidAmt || 0),
  },
  { prop: "auditStatusName", label: "审核状态", width: 90 },
  { prop: "payStatusName", label: "支付状态", width: 90 },
  { prop: "confirmStatusName", label: "入账状态", width: 90 },
];

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return tableData.value.slice(start, end);
});
/**
 * 根据单位模式格式化金额
 * @param value 原始金额（单位：元）
 * @returns 格式化后的字符串（含单位）
 */
const formatAmount = (value: number): string => {
  if (value === undefined || value === null || isNaN(value)) return '0';
  let num = value;
  if (unitMode.value === '万元') {
    num = value / 10000;
  }
  // 保留两位小数
  return formatThousandWithPlaces(num, 2);
};
// ============ 计算统计数据 ============
const calcStatistics = (data: any[]) => {
  if (!data || data.length === 0) {
    statistics.value = {
      totalRequestAmt: 0,
      totalAdjustAmt: 0,
      totalActualRequestAmt: 0,
      totalPaidAmt: 0,
      totalUnpaidAmt: 0,
    };
    return;
  }
  // 初始化 BigNumber 累加器（精度安全）
  let totalRequestAmt = new BigNumber(0);
  let totalAdjustAmt = new BigNumber(0);
  let totalActualRequestAmt = new BigNumber(0);
  let totalPaidAmt = new BigNumber(0);
  let totalUnpaidAmt = new BigNumber(0);

  // toBig 自动处理 null/undefined/非数字
  for (const item of data) {
    totalRequestAmt = totalRequestAmt.plus(toBig(item.reqAmt));
    totalAdjustAmt = totalAdjustAmt.plus(toBig(item.changeAmt));
    totalActualRequestAmt = totalActualRequestAmt.plus(toBig(item.factReqAmt));
    totalPaidAmt = totalPaidAmt.plus(toBig(item.paidAmt));
    totalUnpaidAmt = totalUnpaidAmt.plus(toBig(item.unpaidAmt));
  }

  statistics.value = {
    totalRequestAmt: totalRequestAmt.toNumber(),
    totalAdjustAmt: totalAdjustAmt.toNumber(),
    totalActualRequestAmt: totalActualRequestAmt.toNumber(),
    totalPaidAmt: totalPaidAmt.toNumber(),
    totalUnpaidAmt: totalUnpaidAmt.toNumber(),
  };
};
const buildParams = () => {
  let segIdList = []
  const { belongMonth, applyDate, segId, ...rest } = queryParams.value;
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
    belongMonthStart: belongMonth?.[0],
    belongMonthEnd: belongMonth?.[1],
    reqDateStart: applyDate?.[0],
    reqDateEnd: applyDate?.[1],
  };
  return params;
}
// 获取列表数据
const getDataList = async () => {
  try {
    tableLoading.value = true;
    const params = buildParams();
    const res = await reportManageApi.getReportMain({ ...params });
    if (res.code === 200) {
      const list = res.data || [];
      tableData.value = list;
      total.value = list?.length || 0;
      // 计算统计数据
      calcStatistics(list);
    }
  } catch (error) {
    console.error("获取请款执行概览列表失败:", error);
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
  Object.keys(queryParams.value).forEach((key) => {
    if (key === "wfStatus") {
      queryParams.value[key] = [40];
    } else if (Array.isArray(queryParams.value[key])) {
      queryParams.value[key] = [];
    } else {
      queryParams.value[key] = undefined;
    }
  });
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
    const fileBlob = await reportManageApi.exportReportMain({ ...params, isExport: true });
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
// 单元格点击点击
const handleCellEventClick = (data: any) => {
  const { eventName, row } = data;
  if (eventName === "factReqAmt-click" || eventName === "paidAmt-click") {
    const timestamp = new Date().getTime();
    const params = {
      segId: row.segId,
      projId: row.projId,
      compId: row.compId,
      reqNo: row.reqNo,
    };
    router.push({
      path: "/report/pay-detail",
      query: {
        data: JSON.stringify(params),
        _t: timestamp.toString(),
      },
    });
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
  queryParams.value.finaTypeIds = [];
  feeTypeOptions.value = [];
  if (val) {
    if (val === 9999) {
      // 选择全部 → 加载地产板块的公司
      getCompanyList(2);
      // 加载地产板块的费用类型
      getpayTypeOptions(2);
    } else {
      getCompanyList(val);
      getpayTypeOptions(val);
    }
  }
};
// 查询费用类型
const getpayTypeOptions = async (segId: number) => {
  try {
    const res = await dictionaryApi.getCostTypeListBySegId({ segId: segId });
    if (res.code === 200) {
      feeTypeOptions.value = buildTree(res.data || []);
    }
  } catch (error) { }
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
onMounted(async () => {
  await Promise.all([getProjectOptions(), getSegOptions()]);
  // 先设置默认板块
  selectedDefaultSeg();
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
    position: relative;

    .unit-setting {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-right: 24px;
      padding-right: 24px;
      border-right: 1px solid #edf2f7;
      flex-shrink: 0;

      .unit-label {
        font-size: 13px;
        color: #718096;
        font-weight: 500;
      }

      .el-radio-group {
        .el-radio-button__inner {
          padding: 4px 10px;
          font-size: 12px;
          border-radius: 4px;
        }
      }
    }

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
          font-size: 18px;
          font-weight: 700;
          color: #1a2332;
          font-variant-numeric: tabular-nums;
          letter-spacing: 0.3px;

          .stat-unit {
            font-size: 13px; // 比数值略小，但依然清晰
            font-weight: 600; // 加粗，更醒目
          }
        }
      }

      // 各统计项主题色
      &.stat-item-request {
        .stat-icon {
          background: #e8f0fe;
          color: #5b8dd9;
        }

        .stat-value {
          color: #5b8dd9;
        }
      }

      &.stat-item-adjust {
        .stat-icon {
          background: #fdf6ec;
          color: #d9a656;
        }

        .stat-value {
          color: #d9a656;
        }
      }

      &.stat-item-actual {
        .stat-icon {
          background: #e8f5e9;
          color: #66bb6a;
        }

        .stat-value {
          color: #66bb6a;
        }
      }

      &.stat-item-paid {
        .stat-icon {
          background: #e3f0ff;
          color: #4a8fc1;
        }

        .stat-value {
          color: #4a8fc1;
        }
      }

      &.stat-item-unpaid {
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

  // ===== 响应式适配 =====
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