<!-- 成本分摊 组件 -->
<template>
  <div class="cost-allocation-container" :class="{ 'dialog-mode': isDialogMode }">
    <header class="header-card">
      <div class="header-top" v-if="!isDialogMode">
        <h2>成本分摊</h2>
      </div>

      <el-row :gutter="16" class="summary-cards">
        <el-col :span="6">
          <div class="summary-item">
            <div class="label">单据类型</div>
            <div class="value small">
              {{ getEnumLabel(bizTypeEnum, pageParams.bizType) }}
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="summary-item bg-gray">
            <div class="label">成本金额</div>
            <div class="value large">{{ pageParams.allocAmt || 0 }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="summary-item bg-green">
            <div class="label">已分摊金额</div>
            <div class="value large green">{{ formatDecimal(allocatedAmount) }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="summary-item bg-gray-light">
            <div class="label">待分摊金额</div>
            <div class="value large gray">{{ formatDecimal(pendingAmount) }}</div>
          </div>
        </el-col>
      </el-row>
    </header>

    <el-card class="subject-card" shadow="never">
      <div class="card-header">
        <span>
          <el-icon>
            <List />
          </el-icon>成本分摊明细
        </span>
        <div style="display: flex;" v-if="!isView">
          <!-- <div class="level-select">
            <span class="level-label">展开科目层级：</span>
            <el-select v-model="defaultLevel" style="width:120px" @change="handleLevelChange">
              <el-option :label="'不展开'" :value="0" />
              <el-option :label="'第一层'" :value="1" />
              <el-option :label="'第二层'" :value="2" />
              <el-option :label="'第三层'" :value="3" />
              <el-option :label="'第四层'" :value="4" />
            </el-select>
          </div> -->
          <el-button plain type="primary" @click="handleChoose">
            选择分摊科目
          </el-button>
          <el-button type="primary" :loading="confirmLoading" :disabled="editableSubjectData.length == 0"
            @click="autoAllocation">
            自动分摊
          </el-button>
        </div>
      </div>

      <!-- 项目、楼栋基本信息 -->
      <div class="card-info">
        <div class="info-row">
          <div class="info-item">
            <span class="info-label">项目名称：</span>
            <span class="info-value">{{ pageParams.projName || "" }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">合同名称：</span>
            <span class="info-value">{{ pageParams.displayName || "" }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">合同编号：</span>
            <span class="info-value">{{ pageParams.conNo || "" }}</span>
          </div>
          <div class="info-item info-item-tax">
            <span class="info-label">综合税率(%)：</span>
            <span class="info-value">{{ compositeTaxRate || 0 }}%</span>
          </div>
        </div>
        <div class="info-row">
          <div class="info-item half">
            <span class="info-label">楼栋：</span>
            <el-select v-model="selectedBuildings" placeholder="请选择楼栋" class="building-select" multiple filterable
              clearable collapse-tags collapse-tags-tooltip :max-collapse-tags="3" :disabled="isView"
              @change="handleBuildingChange">
              <el-option v-for="item in buildingOptions" :key="item.id" :label="item.bldName" :value="item.id" />
            </el-select>
          </div>
          <div class="info-item half">
            <span class="info-label">业态：</span>
            <span class="info-value">{{ businessTypeNames }}</span>
          </div>
        </div>
      </div>

      <!-- 可编辑表格：只有叶子节点可编辑 -->
      <editable-table ref="editableTableRef" row-key="id" height="350px" v-model="editableSubjectData"
        :columns="subjectColumns" :pagination="false" :highlight-current-row="false" :show-summary="false"
        :compact-empty="true" :editable="true" :default-expand-level="defaultLevel" :on-save="handleSave"
        :key="tableKey">
        <template #actions="{ row }" v-if="!isView">
          <el-button v-if="row.isLeaf" type="danger" link @click="handleDeleteNode(row)">
            删除
          </el-button>
        </template>
      </editable-table>
    </el-card>

    <el-card class="warning-card" shadow="never">
      <div class="card-header">
        <span>
          <el-icon>
            <WarningFilled />
          </el-icon>成本分摊预警
        </span>
        <el-button type="primary" :disabled="editableSubjectData.length == 0" @click="handleViewAlloc">
          查看分摊预警
        </el-button>
      </div>

      <div>
        <template v-if="warningVisible">
          <!-- 预警图例 -->
          <div class="warning-stats">
            <span><span class="dot dot0"></span>红色预警</span>
            <span><span class="dot dot1"></span>黄色预警</span>
            <span><span class="dot dot2"></span>绿色预警</span>
          </div>

          <base-table ref="warningTableRef" :columns="warningColumns" :table-data="warningData" row-key="id"
            :pagination="false" :show-toolbar="false" :show-action-bar="false" :border="true" :stripe="false"
            height="260px" :compact-empty="true" :default-expand-level="1">
            <template #allocWarn="{ row }">
              <span class="dot" :class="`dot${row.allocWarn}`"></span>
            </template>
          </base-table>
        </template>
        <template v-else>
          <el-empty :image-size="60" description="暂无数据" />
        </template>
      </div>
    </el-card>

    <!-- OA打开该页面时显示该按钮 -->
    <div class="footer-actions">
      <el-button type="primary" :loading="submitLoading" v-if="!isDialogMode && !isView" @click="handleConfirm">
        确认分摊提交
      </el-button>
    </div>

    <!-- 选择分摊科目弹窗   -->
    <ChooseSubnDialog v-model="dialogVisible" :projectId="pageParams.projId" :segId="segId"
      :selectedSubIds="selectedSubIds" @select="getSelectData" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { List, WarningFilled } from "@element-plus/icons-vue";
import EditableTable from "@/components/base/editable-table.vue";
import { costCategoryApi } from "@/api/cost/master-data/cost-category-api";
import { productTypeApi } from "@/api/cost/master-data/product-type-api";
import ChooseSubnDialog from "../choose-sub-dialog.vue";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api.ts";
import { allocRuleEnum } from "@/constants/master-data/enums.ts";
import { costAllocationApi } from "@/api/cost/contract-manage/cost-allocation-api.ts";
import { getEnumLabel } from "@/utils/enum.ts";
import { bizTypeEnum } from "@/constants/contract-manage/enums.ts";
import { buildTree } from "@/utils/tree.ts";
import { filterTreeByIds } from "../helpers.ts";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api.ts";
import { contractLedgerApi } from "@/api/cost/contract-manage/contract-ledger-api.ts";
import { supplementContractApi } from "@/api/cost/contract-manage/supplement-contract-api.ts";
import { changeOrderApi } from "@/api/cost/contract-manage/change-order-api.ts";
import { visaManagementApi } from "@/api/cost/contract-manage/visa-management-api.ts";
import { outputDeclarationApi } from "@/api/cost/contract-manage/output-declaration-api.ts";
import { toBig, formatDecimal, BigNumber } from "@/utils/big-number.ts";

interface Props {
  projId?: number; // 项目ID
  projName?: string; // 项目名称
  displayName?: string; // 事项名称
  bizType?: string; // 业务类型
  allocAmt?: number; // 分摊金额(含税)
  allocExclAmt?: number; // 分摊金额(不含税)
  isDialogMode?: boolean; // 是否为弹窗模式
  cstMData?: any; // 弹窗传参
  dialogMode?: string;
  bizBillId?: number;
  conId?: number;
  bizKeyId?: number;
}
const props = withDefaults(defineProps<Props>(), {
  projId: undefined,
  projName: "",
  displayName: "",
  bizType: "",
  allocAmt: 0,
  allocExclAmt: 0,
  isDialogMode: false, // 页面模式，默认非弹窗模式
  cstMData: null,
  dialogMode: "", // 弹窗模式， view  edit
  bizBillId: undefined,
  conId: undefined,
  bizKeyId: 0,
});

const emit = defineEmits<{
  confirm: [data: any];
  cancel: [];
  "save-draft": [data: any];
}>();

const route = useRoute();
const router = useRouter();

// 是否为弹窗模式（通过props或路由名称判断）
const isDialogMode = computed(() => {
  return props.isDialogMode;
});

// 判断查看还是编辑
const isView = computed(() => {
  return route.query.mode == "view" || props.dialogMode == "view";
});
const defaultLevel = ref(6); // 默认展开层级
const warningVisible = ref(false); // 预警面板展开状态
const confirmLoading = ref(false); // 自动分摊加载状态
const dialogVisible = ref(false); // 选择科目弹窗
const selectedSubIds = ref([]); // 已选中的科目ID列表
const submitLoading = ref(false); // 提交按钮加载状态

// 下拉选项数据
const productOptions = ref([]); // 产品选项
const busiSegOptions = ref([]); // 业务归属选项

// 表格数据
const editableSubjectData = ref([]); // 可编辑科目表格数据（树形）
const warningData = ref([]); // 预警表格数据
const subjectColumns = ref([]); // 动态生成的列配置

let cachedSubjectTree: any[] = []; // 缓存科目树数据
const tableKey = ref(0); // 表格key，用于刷新表格

// 项目楼栋
const projBuildingOptions = ref([]);
// 合同楼栋
const conBuildingOptions = ref([]);

// 已选中的楼栋 (存储 value 数组)
const selectedBuildings = ref([]);
// 业务板块ID
const segId = ref(null)
// 当前子合同业务ID
const currSubConBizId = ref(null)
// 通过合同税率计算科目不含税金额
const compositeTaxRate = ref(0)

// 页面参数
const pageParams = ref({
  projId: undefined,
  projName: "",
  displayName: "",
  bizType: "",
  billId: undefined,
  bizKeyId: 0,
  allocAmt: 0,
  allocExclAmt: 0,
  conNo: "",
});
// 分摊信息
const apportionInfo = ref({
  id: undefined,
  projId: undefined,
  bizType: "",
  bizBillId: undefined,
  bizKeyId: undefined,
  allocAmt: undefined,
  allocExclAmt: undefined,
  allocStatus: undefined,
  allocWarn: undefined,
  projName: "",
  allocDs: [] as any[]
});
// 单据ID
let billId: any = route.query?.billId ? Number(route.query.billId) : undefined;
// 业务ID
let bizId = route.query?.bizId ? Number(route.query.bizId) : undefined;
// bizKeyId
let bizKeyId = route.query?.bizKeyId ? Number(route.query.bizKeyId) : undefined;
// 业务类型，例 NCON_CST  NCON_PROC
let bizType: any = route.query?.bizType ? route.query.bizType : "";


// 显示的楼栋列表
const buildingOptions = computed(() => {
  // 取对应合同的楼栋
  const list = projBuildingOptions.value.filter((item) => conBuildingOptions.value.includes(item.id))
  return list
})
// 业态name信息
const businessTypeNames = computed(() => {
  if (!selectedBuildings.value.length) {
    return "";
  }

  // 获取所有楼栋数据的映射，方便通过id查找
  const buildingMap = new Map();
  projBuildingOptions.value.forEach(item => {
    buildingMap.set(item.id, item);
  });

  // 收集所有需要处理的楼栋id（选中的楼栋 + 关联的地下室id）
  const buildingIdsToProcess = new Set();

  // 遍历选中的楼栋
  selectedBuildings.value.forEach(id => {
    const building = buildingMap.get(id);
    if (building) {
      // 添加当前楼栋
      buildingIdsToProcess.add(id);
      // 如果有关联的地下室，也添加进去
      if (building.bindUnderGround) {
        buildingIdsToProcess.add(building.bindUnderGround);
      }
    }
  });

  // 提取所有 prodNames 并拆分
  const allProdNames = [...buildingIdsToProcess]
    .map(id => buildingMap.get(id))
    .filter(item => item && item.prodNames) // 过滤掉不存在或没有prodNames的项
    .flatMap((item) => {
      if (!item.prodNames) return [];
      // 按逗号拆分，并去除首尾空格
      return item.prodNames.split(",").map((name) => name.trim());
    })
    .filter((name) => name); // 过滤空字符串

  // 去重后拼接
  return [...new Set(allProdNames)].join("、");
});
const handleLevelChange = () => {
  tableKey.value++;
}
// 处理得到的选中楼栋关联的业态数据
const getBusinessType = () => {
  // 获取所有楼栋数据的映射，方便通过id查找
  const buildingMap = new Map();
  projBuildingOptions.value.forEach(item => {
    buildingMap.set(item.id, item);
  });

  // 收集所有需要处理的楼栋id（选中的楼栋 + 关联的地下室id）
  const buildingIdsToProcess = new Set();

  // 遍历选中的楼栋
  selectedBuildings.value.forEach(id => {
    const building = buildingMap.get(id);
    if (building) {
      // 添加当前楼栋
      buildingIdsToProcess.add(id);
      // 如果有关联的地下室，也添加进去
      if (building.bindUnderGround) {
        buildingIdsToProcess.add(building.bindUnderGround);
      }
    }
  });

  // 获取选中楼栋关联的业态类型，一个楼栋可能关联多个业态也可能不关联业态
  const prodList = [...buildingIdsToProcess]
    .map(id => buildingMap.get(id))
    .filter(item => item) // 过滤掉不存在的项
    .flatMap((item) => {
      const ids = item.prodIds?.split(",") || [];
      const names = item.prodNames?.split(",") || [];

      // 如果 prodIds 为空，跳过该项
      if (ids.length === 0) return [];

      // 如果只有一个值，直接返回
      if (ids.length === 1) {
        return [{ prodId: Number(ids[0]), prodName: names[0] || "" }];
      }
      // 多个值，拆分成多个对象
      return ids.map((id, index) => ({
        prodId: Number(id.trim()),
        prodName: names[index]?.trim() || "",
      }));
    })
    // 去重（按 prodId）
    .filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.prodId === item.prodId),
    );
  return prodList;
};

const handleBuildingChange = (val: any) => {
  // 重新生成动态表头和列表数据
  refreshTableData();
}
/**
 * 本次已分摊金额计算（科目金额含税）
 * 把叶子节点的科目金额(含税)累加起来
 */
const allocatedAmount = computed(() => {
  let total = new BigNumber(0);
  const traverse = (data: any[]) => {
    for (const item of data) {
      if (item.children?.length) {
        traverse(item.children);
      } else {
        total = total.plus(toBig(item.subjectAmt || 0));
      }
    }
  };
  traverse(editableSubjectData.value);
  // 四舍五入到2位
  return total.decimalPlaces(2, BigNumber.ROUND_HALF_UP).toNumber();
});
/**
 * 本次已分摊金额计算（科目金额不含税）
 * 把叶子节点的科目金额(不含税)累加起来
 */
const allocExclAmtTotal = computed(() => {
  let total = new BigNumber(0);
  const traverse = (data: any[]) => {
    for (const item of data) {
      if (item.children?.length) {
        traverse(item.children);
      } else {
        total = total.plus(toBig(item.subjectAmtExcl || 0));
      }
    }
  };
  traverse(editableSubjectData.value);
  return total.toNumber();
});

/**
 * 待分摊金额 = 总金额 - 已分摊金额
 */
const pendingAmount = computed(() => {
  const total = toBig(pageParams.value.allocAmt || 0);
  const allocated = toBig(allocatedAmount.value);
  return total.minus(allocated).decimalPlaces(2, BigNumber.ROUND_HALF_UP).toNumber();
});

/**
 * 预警表格列配置
 */
const warningColumns: any = [
  {
    prop: "subName",
    label: "成本科目",
    align: "left",
    width: 200,
    fixed: "left",
  },
  { slot: "allocWarn", label: "预警状态", width: 100, fixed: "left" },
  {
    label: "总目标成本",
    children: [
      { prop: "costExclAmt", label: "金额(不含税)", minWidth: 110 },
      { prop: "costAmt", label: "金额(含税)", minWidth: 110 },
    ],
  },
  {
    label: "历史累计已用",
    children: [
      { prop: "histExclAmt", label: "金额(不含税)", minWidth: 110 },
      { prop: "histAmt", label: "金额(含税)", minWidth: 110 },
    ],
  },
  {
    label: "目标成本可用",
    children: [
      { prop: "availExclAmt", label: "金额(不含税)", minWidth: 110 },
      { prop: "availAmt", label: "金额(含税)", minWidth: 110 },
    ],
  },
  {
    label: "本次分摊",
    children: [
      { prop: "allocExclAmt", label: "金额(不含税)", minWidth: 110 },
      { prop: "allocAmt", label: "金额(含税)", minWidth: 110 },
    ],
  },
  {
    label: "本次累计已用",
    children: [
      { prop: "cumUsedExclAmt", label: "金额(不含税)", minWidth: 110 },
      { prop: "cumUsedAmt", label: "金额(含税)", minWidth: 110 },
    ],
  },
  {
    label: "分摊后余额",
    children: [
      { prop: "balanceExclAmt", label: "金额(不含税)", minWidth: 110 },
      { prop: "balanceAmt", label: "金额(含税)", minWidth: 110 },
    ],
  },
];
// 确认分摊提交
const handleConfirm = async () => {
  if (!editableSubjectData.value?.length) {
    ElMessage.warning("没有可分摊的数据，请先选择科目并填写分摊金额");
    return;
  }
  const valida = validateTable();
  if (!valida) return;
  const result = await getSubmitData();
  console.log("提交分摊明细", result);
  try {
    submitLoading.value = true;
    const params = {
      id: apportionInfo.value?.id,
      projId: pageParams.value.projId,
      bizType: pageParams.value.bizType,
      bizBillId: billId,
      bizKeyId: bizKeyId ? Number(bizKeyId) : 0,
      allocAmt: result?.allocAmt || 0,
      allocExclAmt: result?.allocExclAmt || 0,
      allocStatus: result?.allocStatus,
      allocWarn: result?.allocWarn,
      allocDs: result?.allocDs || [],
    }
    debugger
    // 保存分摊
    const res = await costAllocationApi.saveProjectAlloc(params);
    if (res.code === 200) {

      // 保存成功后更新流程
      const flowMap = {
        'CON_MAIN': () => costAllocationApi.saveConMainFlow({ billId: billId, allowEdit: true }), // 合同
        'CON_ADD': () => costAllocationApi.saveConAddFlow({ billId: billId, allowEdit: true }), // 补充合同
        'CON_BG': () => costAllocationApi.saveChangeFlow({ billId: billId, allowEdit: true }), // 变更
        'CON_QZ': () => costAllocationApi.saveVisaFlow({ billId: billId, allowEdit: true }), // 签证
        'CON_PROD': () => costAllocationApi.saveProdValFlow({ billId: billId, allowEdit: true }), // 产值申报
      };
      if (flowMap[bizType]) {
        const flowRes = await flowMap[bizType]();
        if (flowRes.code === 200) {
          ElMessage.success('保存成功');
        }
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    submitLoading.value = false;
  }
};
// 查看分摊预警明细
const handleViewAlloc = async () => {
  const result = validateTable();
  if (!result) return;
  // 获取分摊明细最末级节点数据
  const leafSubjects = getLeafSubjects(editableSubjectData.value);
  // 更新分摊预警数据
  try {
    const subList = leafSubjects.map((item) => {
      return {
        subId: item.id,
        // allocRule: item.allocRule,
        allocAmt: Number(item?.subjectAmt || 0),
        allocExclAmt: Number(item?.subjectAmtExcl || 0),
      };
    });
    const params = {
      projId: pageParams.value.projId,
      subAllocList: subList,
      bldIds: selectedBuildings.value,
    };
    console.log("分摊预警参数", params);
    await getWarnSubAlloc(params);
    warningVisible.value = true;
  } catch (error) { }
};
/**
 * 计算单次分摊预警状态
 */
const getWarnSubAlloc = async (params: any) => {
  if (!pageParams.value.projId) return;
  try {
    const res = await costAllocationApi.getWarnSubAlloc(params);
    if (res.code === 200 && res.data) {
      const { statusList } = res.data;

      // 为 statusList 添加小计字段
      const processedAllocList = (statusList || []).map((item: any) => ({
        ...item,
        totalBalanceAmt: toBig(item.balanceAmt || 0)
          .plus(toBig(item.balanceExclAmt || 0))
          .decimalPlaces(2, BigNumber.ROUND_HALF_UP)
          .toNumber(),
        totalAvailAmt: toBig(item.availAmt || 0)
          .plus(toBig(item.availExclAmt || 0))
          .decimalPlaces(2, BigNumber.ROUND_HALF_UP)
          .toNumber(),
        totalAllocAmt: toBig(item.allocAmt || 0)
          .plus(toBig(item.allocExclAmt || 0))
          .decimalPlaces(2, BigNumber.ROUND_HALF_UP)
          .toNumber(),
      }));

      // 增量更新，只更新返回的科目
      // 如果 warningData 为空，先初始化
      if (!warningData.value || !warningData.value.length) {
        // 使用 editableSubjectData 作为基础结构
        warningData.value = JSON.parse(
          JSON.stringify(editableSubjectData.value),
        );
      }
      // console.log("warningData:", warningData.value);
      // console.log("processedAllocList:", processedAllocList);
      // 增量更新：只更新 statusList 中存在的科目
      warningData.value = mergeTreeDetailData(
        warningData.value, // 传入当前完整的预警数据
        processedAllocList, // 传入需要更新的科目列表
      );
    }
  } catch (error) {
    console.error("获取预警状态失败:", error);
  }
};
/**
 * 增量更新预警数据（只更新指定科目的字段）
 * @param currentData 当前完整的预警树形数据
 * @param apiDataList 接口返回的预警数据列表（只包含部分科目）
 * @returns 更新后的完整数据
 */
const mergeTreeDetailData = (currentData: any[], apiDataList: any[]) => {
  if (!currentData?.length || !apiDataList?.length) {
    return currentData;
  }

  const apiMap = new Map(apiDataList.map((item) => [item.subId, item]));

  const fields = [
    "allocWarn",
    "balanceAmt",
    "balanceExclAmt",
    "availAmt",
    "availExclAmt",
    "allocAmt",
    "allocExclAmt",
    "totalBalanceAmt",
    "totalAvailAmt",
    "totalAllocAmt",
    "costAmt",
    "costExclAmt",
    "histAmt",
    "histExclAmt",
    "cumUsedAmt",
    "cumUsedExclAmt",
  ];

  const updateNode = (node: any): void => {
    const apiItem = apiMap.get(node.subId || node.id);
    if (apiItem) {
      fields.forEach((key) => {
        node[key] = apiItem[key] ?? (key === "allocWarn" ? 2 : 0);
      });
      // ✅ 使用 BigNumber 计算总计
      if (apiItem.balanceAmt !== undefined || apiItem.balanceExclAmt !== undefined) {
        node.totalBalanceAmt = toBig(apiItem.balanceAmt || 0)
          .plus(toBig(apiItem.balanceExclAmt || 0))
          .decimalPlaces(2, BigNumber.ROUND_HALF_UP)
          .toNumber();
      }
      if (apiItem.availAmt !== undefined || apiItem.availExclAmt !== undefined) {
        node.totalAvailAmt = toBig(apiItem.availAmt || 0)
          .plus(toBig(apiItem.availExclAmt || 0))
          .decimalPlaces(2, BigNumber.ROUND_HALF_UP)
          .toNumber();
      }
      if (apiItem.allocAmt !== undefined || apiItem.allocExclAmt !== undefined) {
        node.totalAllocAmt = toBig(apiItem.allocAmt || 0)
          .plus(toBig(apiItem.allocExclAmt || 0))
          .decimalPlaces(2, BigNumber.ROUND_HALF_UP)
          .toNumber();
      }
    } else {
      fields.forEach((key) => {
        if (node[key] === undefined || node[key] === null) {
          node[key] = key === "allocWarn" ? 2 : 0;
        }
      });
    }

    if (node.children?.length) {
      node.children.forEach((child: any) => updateNode(child));
    }
  };

  currentData.forEach((node) => updateNode(node));
  return currentData;
}
/**
 * 获取业务归属列表
 */
const getBusiSegList = async () => {
  try {
    const res = await dictionaryApi.getsegmentList();
    if (res.code === 200) busiSegOptions.value = res.data || [];
  } catch (error) {
    console.error("获取业务归属失败:", error);
  }
};

/**
 * 获取项目产品类型列表
 */
const getProductList = async () => {
  if (!pageParams.value.projId) return;
  try {
    const res = await productTypeApi.getProductProjList({
      projId: pageParams.value.projId,
      withDetail: true,
    });
    if (res.code === 200) {
      productOptions.value = res.data || [];
    }
  } catch (error) {
    console.error("获取业态列表失败:", error);
  }
};
// 获取项目下的楼栋数据
const getBuildingListByProjId = async () => {
  if (!pageParams.value.projId) return;
  try {
    const res = await projectAreaApi.getBuildingList({
      projId: pageParams.value.projId,
    });
    if (res.code === 200) {
      const list = res.data || [];
      projBuildingOptions.value = list;
      // 弹窗模式默认选中全部楼栋,OA打开只能选择对应合同的楼栋
      // if (isDialogMode.value) {
      //   // 默认选中全部业态
      //   selectedBuildings.value = list.map((item: any) => item.id);
      // } else {
      //   selectedBuildings.value = conBuildingOptions.value;
      // }
      selectedBuildings.value = conBuildingOptions.value;
      console.log("业态类型:", getBusinessType());
    }
  } catch (error) {
    console.error("获取楼栋列表失败:", error);
  }
};
// 处理数据回显
const processPopupData = async (cstList: any) => {
  if (cstList && cstList?.length > 0) {
    const detaiList = cstList || [];
    // 获取科目ID集合
    const subIds: any = new Set(detaiList.map((item: any) => item.subId));
    // 查询基础科目树数据
    const costSubjectsRes = await costCategoryApi.getCostSubjectBase({
      isWithParent: true,
    });

    if (costSubjectsRes.code === 200) {
      const rawTreeData = costSubjectsRes.data || [];
      const subTreeData: any = buildTree(rawTreeData); // 构建基础科目树数据
      const treeData = filterTreeByIds(subTreeData, Array.from(subIds)); // 通过科目ID集合过滤树数据
      // 缓存原始科目树，便于用户切换楼栋时动态渲染业态列
      cachedSubjectTree = treeData;

      const result = mergeTreeWithDetailApiData(treeData, detaiList);
      console.log("result:", result);
      subjectColumns.value = generateColumns(result.products);

      editableSubjectData.value = result.mergedData;
      editableSubjectData.value = summarizeTree(
        editableSubjectData.value,
        result.products
      );
      tableKey.value++;
      console.log("editableSubjectData:", editableSubjectData.value);
    }
  }
};
// 获取合同信息
const getConDetail = async () => {
  // 主合同查询轻量级详情信息
  const liteRes = await contractLedgerApi.getConInfoLite({ conBillId: billId });
  console.log("OA主合同轻量级详情:", liteRes);
  if (liteRes?.code === 200 && liteRes?.data) {
    segId.value = liteRes?.data?.segId;
    pageParams.value.projId = liteRes?.data?.projId || undefined
    pageParams.value.projName = liteRes?.data?.projName || undefined
    pageParams.value.displayName = liteRes?.data?.conName || undefined
    pageParams.value.conNo = liteRes?.data?.conSysNo || undefined
    pageParams.value.allocAmt = toBig(liteRes.data?.signAmt || 0).decimalPlaces(2, BigNumber.ROUND_HALF_UP).toNumber();
    pageParams.value.allocExclAmt = 0;
    pageParams.value.bizType = bizType;
    pageParams.value.billId = billId;
    bizId = liteRes?.data?.id; // 合同ID
    // 保存合同楼栋信息
    conBuildingOptions.value = liteRes?.data?.bldIds?.split(",").map((ite) => Number(ite)) || [];
    console.log("主合同楼栋信息:", conBuildingOptions.value);
    await getTaxRate(bizId); // 获取合同税率
    if (pageParams.value.projId) {
      await getBuildingListByProjId();
      await Promise.all([getBusiSegList(), getProductList()]);
    }
  }
  // 合同分摊信息
  await getProjectAllocData();
}
// 补充合同
const getConAddDetail = async () => {
  // 主合同下子项合同轻量级获取对应ID
  const conSubRes = await contractLedgerApi.getSubConLiteInfo({ billId: billId });
  if (conSubRes?.code === 200 && conSubRes?.data) {
    currSubConBizId.value = conSubRes?.data; // 补充合同ID
    // 通过业务ID查询详细信息
    const res = await supplementContractApi.getSupplementContractById(conSubRes.data);
    if (res.code == 200 && res.data) {
      const { conMain, bill, conAdd, conAddExt, addProcesses, flowBase, cstM } = res.data;
      segId.value = flowBase?.segId;
      pageParams.value.projId = flowBase?.projId || undefined
      pageParams.value.projName = flowBase?.projName || undefined
      // pageParams.value.displayName = conAdd?.addName || undefined
      pageParams.value.displayName = conMain?.conName || undefined
      pageParams.value.conNo = conMain?.conSysNo || undefined
      pageParams.value.bizType = bizType;
      pageParams.value.billId = billId;
      pageParams.value.allocAmt = conAdd?.addAmt || 0;
      pageParams.value.allocExclAmt = 0;
      bizId = conMain?.id; // 合同ID
      // 保存补充合同楼栋信息，补充合同取补充合同楼栋
      conBuildingOptions.value = conAdd?.bldIds?.split(",").map((ite) => Number(ite)) || [];
      await getTaxRate(bizId); // 获取合同税率
      if (pageParams.value.projId) {
        await getBuildingListByProjId();
        await Promise.all([getBusiSegList(), getProductList()]);
      }

      // 合同分摊信息
      await getProjectAllocData();
    }
  }
}
// 变更
const getConBgDetail = async () => {
  // 主合同下子项合同轻量级获取对应ID
  const conSubRes = await contractLedgerApi.getSubConLiteInfo({ billId: billId });
  if (conSubRes?.code === 200 && conSubRes?.data) {
    currSubConBizId.value = conSubRes?.data; // 变更合同ID
    // 通过业务ID查询详细信息
    const res = await changeOrderApi.getChangeConDetail({
      id: conSubRes?.data,
      isWithFlow: true,
    });
    if (res.code == 200 && res.data) {
      const { change, conlist, conMain, flowBase, bill, cstM } = res.data;
      segId.value = flowBase?.segId;
      pageParams.value.projId = flowBase?.projId || undefined
      pageParams.value.projName = flowBase?.projName || undefined
      // pageParams.value.displayName = change.changeName || undefined
      pageParams.value.displayName = conMain?.conName || undefined
      pageParams.value.conNo = conMain?.conSysNo || undefined
      pageParams.value.bizType = bizType;
      pageParams.value.billId = billId;
      pageParams.value.allocAmt = change.changeAmt || 0;
      pageParams.value.allocExclAmt = 0;
      bizId = conMain?.id; // 合同ID
      // 保存变更合同楼栋信息，变更合同取主合同楼栋
      conBuildingOptions.value = conMain?.bldIds?.split(",").map((ite) => Number(ite)) || [];
      await getTaxRate(bizId); // 获取合同税率
      if (pageParams.value.projId) {
        await getBuildingListByProjId();
        await Promise.all([getBusiSegList(), getProductList()]);
      }

      // 合同分摊信息
      await getProjectAllocData();
    }
  }
}
// 签证
const getConQzDetail = async () => {
  // 主合同下子项合同轻量级获取对应ID
  const conSubRes = await contractLedgerApi.getSubConLiteInfo({ billId: billId });
  if (conSubRes?.code === 200 && conSubRes?.data) {
    currSubConBizId.value = conSubRes?.data; // 签证合同ID
    // 通过业务ID查询详细信息
    const res = await visaManagementApi.getVisaDetail({
      id: conSubRes?.data,
      isWithFlow: true,
    });
    if (res.code == 200 && res.data) {
      const { change, changeCon, visa, conMain, flowBase, bill, cstM } = res.data;
      segId.value = flowBase?.segId;
      pageParams.value.projId = flowBase?.projId || undefined
      pageParams.value.projName = flowBase?.projName || undefined
      // pageParams.value.displayName = bill.bizTitle || undefined
      pageParams.value.displayName = conMain?.conName || undefined
      pageParams.value.conNo = conMain?.conSysNo || undefined
      pageParams.value.bizType = bizType;
      pageParams.value.billId = billId;
      pageParams.value.allocAmt = visa.visaApplyAmt || 0;
      pageParams.value.allocExclAmt = 0;
      bizId = conMain?.id; // 合同ID
      // 保存签证合同楼栋信息，签证合同取主合同楼栋
      conBuildingOptions.value = conMain?.bldIds?.split(",").map((ite) => Number(ite)) || [];
      await getTaxRate(bizId); // 获取合同税率
      if (pageParams.value.projId) {
        await getBuildingListByProjId();
        await Promise.all([getBusiSegList(), getProductList()]);
      }

      // 合同分摊信息
      await getProjectAllocData();
    }
  }
}
// 合同产值
const getConProdDetail = async () => {
  // 主合同下子项合同轻量级获取对应ID
  const conSubRes = await contractLedgerApi.getSubConLiteInfo({ billId: billId });
  if (conSubRes?.code === 200 && conSubRes?.data) {
    currSubConBizId.value = conSubRes?.data; // 产值合同ID
    // 通过业务ID查询详细信息
    const res = await outputDeclarationApi.getProdValById({
      id: conSubRes?.data,
      isWithFlow: true,
    });
    if (res.code == 200 && res.data) {
      const { flowBase, bill, prodVal, conMain, cstM } = res.data;
      segId.value = flowBase?.segId;
      pageParams.value.projId = flowBase?.projId || undefined
      pageParams.value.projName = flowBase?.projName || undefined
      // pageParams.value.displayName = bill.bizTitle || undefined
      pageParams.value.displayName = conMain?.conName || undefined
      pageParams.value.conNo = conMain?.conSysNo || undefined
      pageParams.value.bizType = bizType;
      pageParams.value.billId = billId;
      pageParams.value.allocAmt = toBig(prodVal.applyProdVal || 0)
        .decimalPlaces(2, BigNumber.ROUND_HALF_UP)
        .toNumber();
      pageParams.value.allocExclAmt = 0;
      bizId = conMain?.id; // 合同ID
      // 保存签证合同楼栋信息，签证合同取主合同楼栋
      conBuildingOptions.value = conMain?.bldIds?.split(",").map((ite) => Number(ite)) || [];
      await getTaxRate(bizId); // 获取合同税率
      if (pageParams.value.projId) {
        await getBuildingListByProjId();
        await Promise.all([getBusiSegList(), getProductList()]);
      }

      // 合同分摊信息
      await getProjectAllocData();
    }
  }
}
// 获取合同税率
const getTaxRate = async (conId: number) => {
  if (!conId) return;
  try {
    const res = await costAllocationApi.getContractTaxRate({ conId: conId });
    if (res.code == 200) {
      compositeTaxRate.value = res.data || 0;
    }
  } catch (error) {
    console.log(error);
  }
}
// 加载分摊数据
const loadAllocationData = async () => {
  switch (bizType) {
    case "CON_MAIN":
      await getConDetail(); // 主合同
      break;
    case "CON_ADD":
      await getConAddDetail(); // 补充合同
      break;
    case "CON_BG":
      await getConBgDetail(); // 变更
      break;
    case "CON_QZ":
      await getConQzDetail(); // 签证
      break;
    case "CON_PROD":
      await getConProdDetail(); // 合同产值
      break;
    default:
      break;
  }
};
// 合同分摊信息
const getProjectAllocData = async () => {
  try {
    const allocRes = await costAllocationApi.getProjectAlloc({
      bizBillId: billId,
      bizType: bizType,
      bizKeyId: bizKeyId ? Number(bizKeyId) : 0,
    });
    if (allocRes.code == 200) {
      if (allocRes?.data) {
        apportionInfo.value = { ...apportionInfo.value, ...allocRes.data };
        // pageParams.value.allocAmt = allocRes.data?.allocAmt || 0;
        // pageParams.value.allocExclAmt = allocRes.data?.costExclAmt || 0;
        // 处理查询到的分摊数据，回显到页面
        const allocDs = allocRes.data?.allocDs || [];
        const newData = allocDs.filter((item: any) => item.prodId);
        processPopupData(newData);
      }
    }
  } catch (error) {
    console.log(error);
  }
}
/**
 * 获取当前已选中的科目ID列表（用于回显）
 */
const getSelectedSubIds = (): number[] => {
  const ids: number[] = [];
  const traverse = (nodes: any[]) => {
    for (const node of nodes) {
      if (node.children?.length) {
        traverse(node.children);
      } else if (node.isLeaf && node.subId) {
        ids.push(node.subId);
      }
    }
  };
  traverse(editableSubjectData.value);
  return ids;
};
/**
 * 弹窗选择科目
 */
const handleChoose = () => {
  // 获取已选择的科目ID列表用于回显
  selectedSubIds.value = getSelectedSubIds();
  dialogVisible.value = true;
};
// 重新动态生成表格列
const refreshTableData = () => {
  const prodList = getBusinessType();
  if (!cachedSubjectTree.length || !prodList.length) {
    editableSubjectData.value = [];
    subjectColumns.value = [];
    return;
  }
  const result = mergeTreeWithDetailApiData(cachedSubjectTree, prodList);
  editableSubjectData.value = result.mergedData || [];
  subjectColumns.value = result.columns || [];
  tableKey.value++;
};
// 接收选择的科目数据
const getSelectData = (treeData: any, goalCostDetailList: any) => {
  // console.log("接收选择的科目数据:", treeData, goalCostDetailList);
  // 获取当前业态
  const prodList = getBusinessType();
  // 缓存原始科目树，便于用户切换楼栋时动态渲染业态列
  cachedSubjectTree = treeData;
  // console.log("当前选中的楼栋关联的业态:", prodList);
  // console.log("处理数据:", mergeTreeWithDetailApiData(treeData, prodList));
  if (!prodList.length) return;
  const result = mergeTreeWithDetailApiData(treeData, prodList,);
  editableSubjectData.value = result.mergedData || []
  subjectColumns.value = result.columns || []
  tableKey.value++;
};
/**
 * 生成动态列配置
 */
const generateColumns = (products) => {
  const baseColumns: any = [
    {
      type: "index",
      label: "序号",
      width: 60,
      editable: false,
      fixed: "left"
    },
    {
      prop: "subName",
      label: "成本科目",
      align: "left",
      width: 180,
      editable: false,
      showOverflowTooltip: true,
      fixed: "left",
    },
    {
      prop: "busiSegId",
      label: "业务归属",
      width: 80,
      editable: true,
      editType: "select",
      optionLabelField: "segName",
      optionValueField: "id",
      options: busiSegOptions.value || [],
      placeholder: " ",
      showOverflowTooltip: false,
      disabled: true,
    },
    {
      prop: "allocRule",
      label: "分摊规则",
      width: 120,
      editable: true,
      editType: "select",
      optionLabelField: "label",
      optionValueField: "value",
      options: allocRuleEnum as any,
      placeholder: " ",
      showOverflowTooltip: false,
      disabled: true,
    },
    {
      prop: "subjectAmt",
      label: "科目金额(含税)",
      width: 120,
      editable: true,
      editType: "number",
      placeholder: " ",
      showOverflowTooltip: false,
      disabled: (row) => !isLeafNode(row) || isView.value,
    },
    {
      prop: "subjectAmtExcl",
      label: "科目金额(不含税)",
      width: 120,
      editable: true,
      editType: "number",
      placeholder: " ",
      showOverflowTooltip: false,
      disabled: (row) => !isLeafNode(row) || isView.value,
    },
  ];

  // 动态添加业态列
  if (products?.length) {
    const productColumns = products.map((product) => ({
      prop: `prod_${product.prodId}`,
      label: product.prodName || `业态${product.prodId}`,
      children: [
        {
          prop: `allocAmt_${product.prodId}`,
          label: "金额(含税)",
          minWidth: 100,
          editable: true,
          editType: "number",
          placeholder: " ",
          showOverflowTooltip: false,
          disabled: (row) => !isLeafNode(row) || isView.value,
        },
        {
          prop: `allocExclAmt_${product.prodId}`,
          label: "金额(不含税)",
          minWidth: 100,
          editable: true,
          editType: "number",
          placeholder: " ",
          showOverflowTooltip: false,
          disabled: (row) => !isLeafNode(row) || isView.value,
        },
      ],
    }));

    baseColumns.push({
      label: "业态分摊明细",
      align: "center",
      children: productColumns,
    });
  }

  // 操作列
  baseColumns.push({
    prop: "actions",
    label: "操作",
    width: 80,
    editable: false,
    fixed: "right",
    slot: "actions",
  });

  return baseColumns;
};

/**
 * 合并树形科目与业态明细数据
 */
const mergeTreeWithDetailApiData = (treeData, prodList) => {
  const leafSubjects = getLeafSubjects(treeData);

  const products: any = Array.from(
    new Map(prodList.map(item => [item.prodId, { prodId: item.prodId, prodName: item.prodName }])).values()
  );

  const groupMap = new Map();
  for (const item of prodList) {
    if (!groupMap.has(item.subId)) groupMap.set(item.subId, []);
    groupMap.get(item.subId).push(item);
  }

  const leafDataMap = new Map();
  for (const subject of leafSubjects) {
    const items = groupMap.get(subject.id) || [];
    const first = items[0] || {};
    const row = {
      id: subject.id,
      subId: subject.id,
      subName: subject.subName,
      subCode: subject.subCode,
      fullPath: subject.fullPath,
      level: subject.subLevel || 1,
      isLeaf: true,
      hasChildren: false,
      busiSegId: subject.busiSegId ?? subject.busiSegId ?? undefined,
      segName: subject.busiSegName ?? subject.segName ?? '',
      allocRule: subject.allocRule ?? '',
      allocRuleName: subject.allocRuleName ?? '',
      allocMid: subject.allocMid ?? 0,
      subjectAmt: 0,
      subjectAmtExcl: 0,
    };

    // ✅ 使用 BigNumber 累加
    let totalAmt = new BigNumber(0);
    let totalExclAmt = new BigNumber(0);

    for (const product of products) {
      const detail = items.find(item => item.prodId === product.prodId);
      const allocAmt = detail?.allocAmt ?? 0;
      const allocExclAmt = detail?.allocExclAmt ?? 0;

      row[`allocAmt_${product.prodId}`] = allocAmt;
      row[`allocExclAmt_${product.prodId}`] = allocExclAmt;
      row[`allocWarn_${product.prodId}`] = detail?.allocWarn ?? 0;

      totalAmt = totalAmt.plus(toBig(allocAmt));
      totalExclAmt = totalExclAmt.plus(toBig(allocExclAmt));
    }

    row.subjectAmt = totalAmt.decimalPlaces(2, BigNumber.ROUND_HALF_UP).toNumber();
    row.subjectAmtExcl = totalExclAmt.decimalPlaces(2, BigNumber.ROUND_HALF_UP).toNumber();
    leafDataMap.set(subject.id, row);
  }

  const buildTree = (nodes) => {
    return nodes.map(node => {
      const hasChildren = !!node.children?.length;
      const base = {
        id: node.id,
        subId: node.id,
        subName: node.subName,
        subCode: node.subCode,
        level: node.subLevel || 1,
        hasChildren,
        isLeaf: !hasChildren,
        busiSegId: node.busiSegId || undefined,
        segName: node.busiSegName ?? node.segName ?? undefined,
        allocRule: node.allocRule ?? undefined,
        allocRuleName: node.allocRuleName ?? undefined,
        allocMid: node.allocMid ?? undefined,
      };

      if (hasChildren) {
        const children = buildTree(node.children);

        // ✅ 使用 BigNumber 累加子节点金额
        let totalAmt = new BigNumber(0);
        let totalExclAmt = new BigNumber(0);
        children.forEach(child => {
          totalAmt = totalAmt.plus(toBig(child.subjectAmt || 0));
          totalExclAmt = totalExclAmt.plus(toBig(child.subjectAmtExcl || 0));
        });

        const nonLeaf = {
          ...base,
          children,
          subjectAmt: totalAmt.decimalPlaces(2, BigNumber.ROUND_HALF_UP).toNumber(),
          subjectAmtExcl: totalExclAmt.decimalPlaces(2, BigNumber.ROUND_HALF_UP).toNumber(),
        };

        // ✅ 使用 BigNumber 累加业态金额
        for (const product of products) {
          const pid = product.prodId;
          let prodTotal = new BigNumber(0);
          let prodExclTotal = new BigNumber(0);
          children.forEach(child => {
            prodTotal = prodTotal.plus(toBig(child[`allocAmt_${pid}`] || 0));
            prodExclTotal = prodExclTotal.plus(toBig(child[`allocExclAmt_${pid}`] || 0));
          });
          nonLeaf[`allocAmt_${pid}`] = prodTotal.decimalPlaces(2, BigNumber.ROUND_HALF_UP).toNumber();
          nonLeaf[`allocExclAmt_${pid}`] = prodExclTotal.decimalPlaces(2, BigNumber.ROUND_HALF_UP).toNumber();
          nonLeaf[`allocWarn_${pid}`] = 0;
        }

        return nonLeaf;
      }

      const leafData = leafDataMap.get(node.id);
      return {
        ...base,
        ...leafData,
        children: [],
        busiSegId: leafData?.busiSegId ?? base.busiSegId ?? undefined,
        segName: leafData?.segName ?? base.segName,
        allocRule: leafData?.allocRule ?? base.allocRule,
        allocRuleName: leafData?.allocRuleName ?? base.allocRuleName,
      };
    });
  };

  const columns = generateColumns(products);

  return {
    subjects: leafSubjects,
    products,
    columns,
    mergedData: buildTree(treeData),
  };
};
/**
 * 获取所有叶子节点（带完整路径）
 */
const getLeafSubjects = (treeData, path = []) => {
  const leaves = [];
  for (const node of treeData) {
    const currentPath = [...path, node.subName];
    if (node.children?.length) {
      leaves.push(...getLeafSubjects(node.children, currentPath));
    } else {
      leaves.push({ ...node, fullPath: currentPath.join(' / ') });
    }
  }
  return leaves;
};
/**
 * 判断是否为叶子节点
 */
const isLeafNode = (row) => {
  return row?.isLeaf === true || !row?.hasChildren;
};

// 删除节点
const handleDeleteNode = (targetNode: any) => {
  if (!targetNode.isLeaf) {
    ElMessage.warning("只能删除叶子节点");
    return;
  }
  ElMessageBox.confirm(
    `确定要删除科目 "${targetNode.subName}" 吗？删除后该科目下的所有数据将被移除。`,
    "删除确认",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    },
  )
    .then(() => {
      // 执行删除
      const result = deleteNodeFromTree(
        editableSubjectData.value,
        targetNode.id,
      );
      editableSubjectData.value = result;

      // 删除后重新汇总 --- 完整汇总（业态金额 + 科目金额）
      const prodList = getBusinessType(); // 获取当前业态列表
      if (prodList.length) {
        editableSubjectData.value = summarizeTree(
          editableSubjectData.value,
          prodList
        );
      }
    })
    .catch(() => { });
};
/**
 * 从树形数据中删除节点（自动清理空父节点）
 */
const deleteNodeFromTree = (treeData: any[], nodeId: number): any[] => {
  const result: any[] = [];

  for (const node of treeData) {
    // 如果当前节点就是要删除的节点，跳过
    if (node.id === nodeId) {
      continue;
    }

    // 如果有子节点，递归处理
    if (node.children && node.children.length > 0) {
      const filteredChildren = deleteNodeFromTree(node.children, nodeId);

      // 如果过滤后子节点为空，则不保留该父节点
      if (filteredChildren.length === 0) {
        continue;
      }

      result.push({
        ...node,
        children: filteredChildren,
        isLeaf: false,
        hasChildren: true,
      });
    } else {
      // 叶子节点，直接保留
      result.push(node);
    }
  }

  return result;
};
/**
 * 汇总科目金额（只处理 subjectAmt 和 subjectAmtExcl）
 * 用于编辑科目金额时调用
 */
const summarizeSubjectAmt = (treeData) => {
  // 深拷贝数据
  const cloneData = JSON.parse(JSON.stringify(treeData));

  function summarize(node) {
    // 叶子节点：保持不变（用户已编辑）
    if (!node.children || node.children.length === 0) {
      return node;
    }

    // 非叶子节点：先递归处理子节点
    node.children = node.children.map((child) => summarize(child));

    // 重置并累加子节点的科目金额
    let totalAmt = new BigNumber(0);
    let totalExclAmt = new BigNumber(0);

    node.children.forEach((child) => {
      totalAmt = totalAmt.plus(toBig(child.subjectAmt || 0));
      totalExclAmt = totalExclAmt.plus(toBig(child.subjectAmtExcl || 0));
    });

    node.subjectAmt = totalAmt.decimalPlaces(2, BigNumber.ROUND_HALF_UP).toNumber();
    node.subjectAmtExcl = totalExclAmt.decimalPlaces(2, BigNumber.ROUND_HALF_UP).toNumber();

    return node;
  }

  return cloneData.map((node) => summarize(node));
};

/**
 * 完整汇总（业态金额 + 科目金额）
 * 用于编辑业态金额时调用
 */
const summarizeTree = (treeData, productList) => {
  const productIds = productList.map((item) => item.prodId);
  // 深拷贝数据
  const cloneData = JSON.parse(JSON.stringify(treeData));

  function summarize(node) {
    // 叶子节点
    if (!node.children || node.children.length === 0) {
      // 叶子节点的科目金额 = 各业态金额之和
      let totalAmt = new BigNumber(0);
      let totalExclAmt = new BigNumber(0);

      productIds.forEach((id) => {
        totalAmt = totalAmt.plus(toBig(node[`allocAmt_${id}`] || 0));
        totalExclAmt = totalExclAmt.plus(toBig(node[`allocExclAmt_${id}`] || 0));
      });

      node.subjectAmt = totalAmt.decimalPlaces(2, BigNumber.ROUND_HALF_UP).toNumber();
      node.subjectAmtExcl = totalExclAmt.decimalPlaces(2, BigNumber.ROUND_HALF_UP).toNumber();
      return node;
    }

    // 非叶子节点：先递归处理子节点
    node.children = node.children.map((child) => summarize(child));

    // 重置汇总字段
    const totals: Record<string, BigNumber> = {};
    const exclTotals: Record<string, BigNumber> = {};
    const warnTotals: Record<string, number> = {};

    productIds.forEach((id) => {
      totals[id] = new BigNumber(0);
      exclTotals[id] = new BigNumber(0);
      warnTotals[id] = 0;

      // 累加子节点的业态金额
      node.children.forEach((child) => {
        totals[id] = totals[id].plus(toBig(child[`allocAmt_${id}`] || 0));
        exclTotals[id] = exclTotals[id].plus(toBig(child[`allocExclAmt_${id}`] || 0));
        warnTotals[id] = Math.max(warnTotals[id] || 0, Number(child[`allocWarn_${id}`]) || 0);
      });

      node[`allocAmt_${id}`] = totals[id].decimalPlaces(2, BigNumber.ROUND_HALF_UP).toNumber();
      node[`allocExclAmt_${id}`] = exclTotals[id].decimalPlaces(2, BigNumber.ROUND_HALF_UP).toNumber();
      node[`allocWarn_${id}`] = warnTotals[id];
    });

    // 累加子节点的科目金额
    let totalSubjectAmt = new BigNumber(0);
    let totalSubjectExclAmt = new BigNumber(0);

    node.children.forEach((child) => {
      totalSubjectAmt = totalSubjectAmt.plus(toBig(child.subjectAmt || 0));
      totalSubjectExclAmt = totalSubjectExclAmt.plus(toBig(child.subjectAmtExcl || 0));
    });

    node.subjectAmt = totalSubjectAmt.decimalPlaces(2, BigNumber.ROUND_HALF_UP).toNumber();
    node.subjectAmtExcl = totalSubjectExclAmt.decimalPlaces(2, BigNumber.ROUND_HALF_UP).toNumber();

    return node;
  }

  return cloneData.map((node) => summarize(node));
};

/**
 * 保存编辑处理
 */
let saveTimer = null;

const handleSave = async (data: any) => {
  const { row, column, newValue, oldValue, rowIndex } = data;

  // 隐藏分摊预警明细
  warningVisible.value = false;

  // 判断编辑的字段类型
  const isSubjectAmt = column === "subjectAmt" || column === "subjectAmtExcl";
  const isAllocAmt = column?.startsWith("allocAmt_") || column?.startsWith("allocExclAmt_");

  // 当编辑 subjectAmt（含税金额）时，通过税率计算不含税金额
  if (column === "subjectAmt") {
    if (compositeTaxRate && compositeTaxRate.value > 0) {
      const taxRate = toBig(compositeTaxRate.value).dividedBy(100);
      const amtIncl = toBig(newValue || 0);
      // 不含税金额 = 含税金额 / (1 + 税率)
      const amtExcl = amtIncl.dividedBy(new BigNumber(1).plus(taxRate));
      row.subjectAmtExcl = amtExcl.decimalPlaces(2, BigNumber.ROUND_HALF_UP).toNumber();
    } else {
      // 没有税率直接等于含税金额
      row.subjectAmtExcl = row.subjectAmt;
    }
  }

  // 防抖处理
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    if (isSubjectAmt) {
      // 编辑科目金额：只向上累加科目金额
      editableSubjectData.value = summarizeSubjectAmt(editableSubjectData.value);
    } else {
      // 编辑业态金额：完整汇总（业态金额 + 科目金额）
      const prodList = getBusinessType(); // 获取当前业态列表
      editableSubjectData.value = summarizeTree(
        editableSubjectData.value,
        prodList
      );
    }
  }, 300);
};
/**
 * 自动分摊
 */
const autoAllocation = async () => {
  if (!editableSubjectData.value?.length) {
    ElMessage.warning("没有可分摊的数据，请先选择科目并填写分摊金额");
    return;
  }
  // 这里是非合同分摊的自动分摊调取接口的数据格式====合同自动分摊数据格式需要另外处理
  try {
    confirmLoading.value = true;
    // 调取非合同自动分摊接口获取各业态的分摊数据  
    const paramsObj: any = buildSubmitParams(editableSubjectData.value);
    console.log("自动分摊接口参数", paramsObj)
    // 过滤掉科目金额不含税为0的数据
    const filterData = paramsObj.subList?.filter((item) => toBig(item.allocAmt).isGreaterThan(0));
    // 主合同取bizId,子合同取currSubConBizId,因为子合同从OA进入这个页面传递的bizId是合同ID
    // const currentBizId = bizType === 'CON_MAIN' ? bizId : currSubConBizId.value
    const params = {
      conId: bizId,
      subList: filterData,
      bldIds: selectedBuildings.value,
    }
    const result = await costAllocationApi.autoAllocateCost(params);
    if (result.code === 200 && result.data) {
      const { allocList = [] } = result.data;
      const currProdList = getBusinessType(); // 获取当前业态列表
      // 回填数据到分摊表格
      editableSubjectData.value = fillAllocationDataToTable(
        editableSubjectData.value,
        allocList,
        currProdList,
      );
      // 更新树形结构数据，累加子级数据到父级
      editableSubjectData.value = summarizeTree(
        editableSubjectData.value,
        currProdList,
      );
    }
  } catch (error) {
    console.error("自动分摊失败:", error);
  } finally {
    confirmLoading.value = false;
  }
};
/**
 * 8. 将接口返回的分摊数据回填到表格
 */
const fillAllocationDataToTable = (
  treeData: any[],
  allocList: any[],
  products: any[],
): any[] => {
  // 构建 allocList 的映射（按 subId + prodId 组合）
  const allocMap = new Map(
    allocList.map((item) => [`${item.subId}_${item.prodId}`, item]),
  );

  const traverse = (nodes: any[]): any[] => {
    return nodes.map((node) => {
      if (node.children?.length) {
        return { ...node, children: traverse(node.children) };
      }
      if (!node.isLeaf) return node;

      const newNode = { ...node };
      // 遍历所有产品，回填分摊数据
      for (const product of products) {
        const pid = product.prodId;
        const key = `${node.subId}_${pid}`;
        const data = allocMap.get(key);
        newNode[`costAmt_${pid}`] = data?.costAmt || 0;
        newNode[`costExclAmt_${pid}`] = data?.costExclAmt || 0;
        newNode[`allocAmt_${pid}`] = data?.allocAmt || 0;
        newNode[`allocExclAmt_${pid}`] = data?.allocExclAmt || 0;
        newNode.allocWarn = data?.allocWarn ?? newNode.allocWarn ?? 0;
      }
      return newNode;
    });
  };

  return traverse(treeData);
};
/**
 * 10. 构建非合同自动分摊接口提交参数
 */
const buildSubmitParams = (treeData: any[]) => {
  const currProdList = getBusinessType(); // 获取当前业态列表
  const subMap = new Map();
  const traverse = (nodes: any[]) => {
    for (const node of nodes) {
      if (node.children?.length) {
        traverse(node.children);
      } else if (node.isLeaf && !subMap.has(node.subId)) {
        subMap.set(node.subId, {
          subId: node.subId,
          allocAmt: Number(node?.subjectAmt || 0),
          allocExclAmt: Number(node?.subjectAmtExcl || 0),
          allocRule: node.allocRule,
        });
      }
    }
  };
  traverse(treeData);

  const prodMap = new Map(
    currProdList.map((p) => [
      p.prodId,
      { id: p.prodId, prodName: p.prodName },
    ]),
  );

  return {
    projId: pageParams.value.projId, // 项目ID
    subList: Array.from(subMap.values()), // 科目列表
    prodList: Array.from(prodMap.values()), // 产品列表
  };
};
// 确认时校验
const validateTable = () => {
  if (!editableSubjectData.value?.length) {
    ElMessage.warning("没有可分摊的数据，请先选择科目并填写分摊金额");
    return false;
  }
  const leafSubjects = getLeafSubjects(editableSubjectData.value);

  // 判断叶子节点每一项的subjectAmt和subjectAmtExcl是否都为0
  // ===== 修改：使用 isZero() 替代 equals(0) =====
  const isAllZero = leafSubjects.some(
    (item: any) => toBig(item.subjectAmt || 0).isZero() && toBig(item.subjectAmtExcl || 0).isZero(),
  );
  if (isAllZero) {
    ElMessage.error("请输入科目金额");
    return false;
  }

  // ====== 校验：不含税金额 ≤ 含税金额 ======
  // ===== 修改：使用 isGreaterThan() 替代 greaterThan() =====
  const invalidTaxItems: string[] = [];
  leafSubjects.forEach((item: any) => {
    const subjectAmt = toBig(item.subjectAmt || 0);
    const subjectAmtExcl = toBig(item.subjectAmtExcl || 0);
    if (subjectAmtExcl.isGreaterThan(subjectAmt)) {
      invalidTaxItems.push(item.subName);
    }
  });
  if (invalidTaxItems.length > 0) {
    ElMessage.error(
      `科目金额(不含税)不能大于科目金额(含税)：${invalidTaxItems.join("、")}`,
    );
    return false;
  }

  // 判断各业态金额是否等于科目金额
  const result = validateLeafNodesStrict(leafSubjects);
  if (!result.valid) {
    ElMessage.error("各业态金额累加需要等于科目金额");
    return false;
  }

  // 使用 BigNumber 比较
  // ===== 修改：使用 isEqualTo() 替代 equals() =====
  const allocated = toBig(allocatedAmount.value);
  const totalAmount = toBig(pageParams.value.allocAmt || 0);
  if (!allocated.isEqualTo(totalAmount)) {
    ElMessage.error(`分摊金额 (${allocated.decimalPlaces(2).toString()}) 必须等于成本金额 (${totalAmount.decimalPlaces(2).toString()})`);
    return false;
  }

  return true;
};
/**
 * 校验叶子节点数据 - 严格相等
 * @param leafNodes - 叶子节点数组
 * @returns 校验结果
 */
const validateLeafNodesStrict = (leafNodes: any[]) => {
  const errors: any[] = [];

  leafNodes.forEach((node) => {
    // 1. 计算所有 allocAmt_* 的累计值（含税）
    let totalAllocAmt = new BigNumber(0);
    // 2. 计算所有 allocExclAmt_* 的累计值（不含税）
    let totalAllocExclAmt = new BigNumber(0);

    Object.keys(node).forEach((key) => {
      if (key.startsWith("allocAmt_")) {
        totalAllocAmt = totalAllocAmt.plus(toBig(node[key] || 0));
      }
      if (key.startsWith("allocExclAmt_")) {
        totalAllocExclAmt = totalAllocExclAmt.plus(toBig(node[key] || 0));
      }
    });

    // 保留两位小数
    totalAllocAmt = totalAllocAmt.decimalPlaces(2, BigNumber.ROUND_HALF_UP);
    totalAllocExclAmt = totalAllocExclAmt.decimalPlaces(2, BigNumber.ROUND_HALF_UP);

    // 3. 获取科目金额
    const subjectAmt = toBig(node.subjectAmt || 0).decimalPlaces(2, BigNumber.ROUND_HALF_UP);
    const subjectAmtExcl = toBig(node.subjectAmtExcl || 0).decimalPlaces(2, BigNumber.ROUND_HALF_UP);

    // 4. 校验含税金额是否相等
    // ===== 修改：使用 isEqualTo() 替代 equals() =====
    if (!totalAllocAmt.isEqualTo(subjectAmt)) {
      errors.push({
        nodeId: node.id,
        nodeName: node.subName,
        field: "subjectAmt",
        subjectAmt: subjectAmt.toNumber(),
        totalAllocAmt: totalAllocAmt.toNumber(),
        diff: totalAllocAmt.minus(subjectAmt).toNumber(),
        message: `科目金额(含税) ${subjectAmt.toFixed(2)} ≠ 业态合计(含税) ${totalAllocAmt.toFixed(2)}，差额 ${totalAllocAmt.minus(subjectAmt).toFixed(2)}`,
      });
    }

    // 5. 校验不含税金额是否相等
    if (!totalAllocExclAmt.isEqualTo(subjectAmtExcl)) {
      errors.push({
        nodeId: node.id,
        nodeName: node.subName,
        field: "subjectAmtExcl",
        subjectAmtExcl: subjectAmtExcl.toNumber(),
        totalAllocExclAmt: totalAllocExclAmt.toNumber(),
        diff: totalAllocExclAmt.minus(subjectAmtExcl).toNumber(),
        message: `科目金额(不含税) ${subjectAmtExcl.toFixed(2)} ≠ 业态合计(不含税) ${totalAllocExclAmt.toFixed(2)}，差额 ${totalAllocExclAmt.minus(subjectAmtExcl).toFixed(2)}`,
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    totalNodes: leafNodes.length,
    errorCount: errors.length,
    details: {
      totalErrors: errors.length,
      hasAmtError: errors.some((e) => e.field === "subjectAmt"),
      hasExclError: errors.some((e) => e.field === "subjectAmtExcl"),
    },
  };
};
/**
 * 6. 列转行：将树形数据转回原始行数据格式（只提取叶子节点）
 */
const convertTreeDataToRows = (treeData: any[], products: any[]): any[] => {
  console.log("treeData", treeData, products);
  const rows: any[] = [];
  const traverse = (nodes: any[]) => {
    for (const node of nodes) {
      if (node.children?.length) {
        traverse(node.children);
      } else if (node.isLeaf) {
        for (const product of products) {
          const pid = product.prodId;
          rows.push({
            subId: node.subId,
            subName: node.subName,
            subCode: node.subCode,
            prodId: pid,
            prodName: product.prodName,
            allocWarn: node.allocWarn,
            allocAmt: Number(node[`allocAmt_${pid}`]),
            allocExclAmt: Number(node[`allocExclAmt_${pid}`]),
            busiSegId: node.busiSegId || undefined,
            segName: node.segName || "",
            allocRule: node.allocRule || "",
            level: node.level,
            fullPath: node.fullPath,
          });
        }
      }
    }
  };
  traverse(treeData);
  return rows;
};
// 后期确认参数
const getSubmitData = async () => {
  const leafSubjects = getLeafSubjects(editableSubjectData.value);
  const subList = leafSubjects.map((item) => {
    return {
      subId: item.id,
      allocAmt: Number(item?.subjectAmt || 0),
      allocExclAmt: Number(item?.subjectAmtExcl || 0),
    };
  });
  const params = {
    projId: pageParams.value.projId,
    subAllocList: subList,
  };
  const res = await costAllocationApi.getWarnSubAlloc(params);
  if (res.code == 200) {
    const { totalAllocWarn, statusList = [] } = res.data;
    let allocStatus = 0; // 分摊状态(0:未分摊,1:已分摊,2:部分分摊)

    const allocated = toBig(allocatedAmount.value);
    const pending = toBig(pendingAmount.value);

    // ✅ 使用 BigNumber 比较
    // ===== 修改：使用 isZero() 替代 equals(0)，isGreaterThan() 替代 greaterThan() =====
    if (allocated.isZero()) {
      allocStatus = 0;
    } else if (pending.isGreaterThan(0)) {
      allocStatus = 2;
    } else {
      allocStatus = 1;
    }

    const currProdList = getBusinessType();
    const detailList = convertTreeDataToRows(
      editableSubjectData.value,
      currProdList,
    );
    const newData = detailList.map((item) => {
      const statusInfo = statusList.find((i) => i.subId === item.subId);
      return {
        ...item,
        allocWarn: statusInfo?.allocWarn || 0,
      };
    });
    return {
      allocAmt: allocatedAmount.value,
      allocExclAmt: allocExclAmtTotal.value,
      allocStatus: allocStatus,
      allocWarn: totalAllocWarn,
      allocDs: newData,
    };
  }
};

onMounted(async () => {
  // 弹窗模式时初始化
  if (isDialogMode.value) {
    billId = props.bizBillId;
    bizType = props.bizType;
    bizKeyId = props.bizKeyId;
    await loadAllocationData();
  } else {
    // OA打开
    console.log("OA打开页面参数:", route.query, isView.value);
    await loadAllocationData();
  }
});

defineExpose({
  // 分摊列表基础数据，树形数据结构数据
  getData: () => editableSubjectData.value,
  // 页面查询参数
  getPageParams: () => pageParams.value,
  // 获取所有叶子节点
  getleafSubjects: () => {
    const leafSubjects = getLeafSubjects(editableSubjectData.value);
    return leafSubjects;
  },
  // 获取分摊的明细列表，列转行过后的数据
  getSubmitData: getSubmitData,
  // 提交保存
  handleConfirm: handleConfirm,
  // 校验
  validateTable,
});
</script>

<style scoped lang="scss">
.cost-allocation-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 16px;
  background: #f3f4f6;
  font-size: 14px;
}

.cost-allocation-container.dialog-mode {
  padding: 0;
  background: transparent;
}

.cost-allocation-container.dialog-mode .header-card {
  margin-top: 0;
}

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

.summary-item {
  height: 82px;
  background: #f0f7ff;
  border-radius: 8px;
  padding: 12px 16px;
  border: 1px solid #dbeafe;
}

.summary-item .label {
  font-size: 14px;
  color: #6b7280;
}

.summary-item .value.small {
  font-size: 20px;
  font-weight: 700;
  margin-top: 4px;
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

.dot.dot0 {
  background: #ef4444;
}

.dot.dot1 {
  background: #f59e0b;
}

.dot.dot2 {
  background: #10b981;
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  background: #ffffff;
  padding: 12px 20px;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  margin-top: 16px;
  z-index: 20;
}

.card-info {
  background: #ffffff;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  border: 1px solid #e8edf4;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  flex-wrap: nowrap;
  width: 100%;
  min-width: 0;
}

/* 上面一行：项目名称、合同名称、合同编号、综合税率 */
.info-row:first-child .info-item {
  flex: 1 1 auto;
  min-width: 0;
}


.info-item {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 0.3rem;
}

.info-item-tax {
  .info-value {
    color: #2563eb;
    font-weight: 700;
  }
}

.info-label {
  flex-shrink: 0;
  font-size: 0.8rem;
  font-weight: 500;
  color: #5a6e82;
  white-space: nowrap;
}

.info-value {
  font-weight: 500;
  color: #1a2634;
  font-size: 0.88rem;
  min-width: 0;
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.ellipsis {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.building-select {
  width: 300px;
  min-width: 80px;
  flex: 1;
}

.level-select {
  display: flex;
  align-items: center;
  margin-right: 20px;

  .level-label {
    flex-shrink: 0;
    font-size: 14px;
    font-weight: 500;
    color: #5a6e82;
    white-space: nowrap;
  }
}
</style>
