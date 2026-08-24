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
        <div v-if="!isView">
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
        <div class="info-item">
          <span class="info-label">项目名称：</span>
          <span class="info-value">{{ pageParams.projName || "" }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">事项名称：</span>
          <span class="info-value">{{ pageParams.displayName || "" }}</span>
        </div>
        <div class="info-item tax-rate">
          <span class="info-label">税率(%)：</span>
          <el-input-number v-model="compositeTaxRate" :precision="2" :min="0" :max="100" :controls="false"
            style="width: 100px" :disabled="isView" />
        </div>
        <div class="info-row">
          <div class="info-item half">
            <span class="info-label">楼栋：</span>
            <el-select v-model="selectedBuildings" placeholder="请选择楼栋" class="building-select" multiple filterable
              clearable collapse-tags collapse-tags-tooltip :max-collapse-tags="3" :disabled="isView"
              @change="handleBuildingChange">
              <el-option v-for="item in projBuildingOptions" :key="item.id" :label="item.bldName" :value="item.id" />
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
        :compact-empty="true" :editable="true" :default-expand-level="1" :on-save="handleSave" :key="tableKey">
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
            height="300px" :compact-empty="true" :default-expand-level="1">
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
    <ChooseSubnDialog v-model="dialogVisible" :projectId="pageParams.projId" :selectedSubIds="selectedSubIds"
      :segId="segId" @select="getSelectData" />
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
import { cstPaymentApi } from "@/api/cost/non-contract-manage/cst-payment-api.ts";
import { cstProcessApi } from "@/api/cost/non-contract-manage/cst-process-api.ts";
import { feePaymentApi } from "@/api/cost/non-contract-manage/fee-payment-api.ts";
// ===== 修改：替换 decimal.js 为 bignumber.js =====
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

// ---------- 楼栋选项 ----------
const projBuildingOptions = ref([]);
// 已选中的楼栋 (存储 value 数组)
const selectedBuildings = ref([]);
const segId = ref(null); // 业务板块ID
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
let billId = route.query?.billId ? Number(route.query.billId) : undefined;
// 业务ID
let bizId = route.query?.bizId ? Number(route.query.bizId) : undefined;
// 业务类型，例 NCON_CST  NCON_PROC
let bizType: any = route.query?.bizType ? route.query.bizType : "";
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
// ===== 修改：使用 toBig 替代 toDecimal，BigNumber 替代 Decimal =====
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
  // const prodList = getBusinessType();
  // console.log(
  //   "确认提交分摊明细",
  //   convertTreeDataToRows(editableSubjectData.value, prodList),
  // );
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
      allocAmt: result?.allocAmt || 0,
      allocExclAmt: result?.allocExclAmt || 0,
      allocStatus: result?.allocStatus,
      allocWarn: result?.allocWarn,
      allocDs: result?.allocDs || [],
    }
    // 保存分摊
    const res = await costAllocationApi.saveProjectAlloc(params);
    if (res.code === 200) {
      // 保存成功后更新流程
      const flowMap = {
        'NCON_PROC': () => cstProcessApi.saveNconCstProcessFlow({ id: bizId, allowEdit: true }), // 非合同立项
        'NCON_CST': () => cstPaymentApi.saveNconCstPaymentFlow({ id: bizId, allowEdit: true }), // 非合同请款
      };
      if (flowMap[bizType]) {
        const flowRes = await flowMap[bizType]();
        if (flowRes.code === 200) {
          ElMessage.success('保存成功');
        }
      }
    }
  } catch (error) {
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
// ===== 修改：使用 toBig 替代 toDecimal =====
const getWarnSubAlloc = async (params: any) => {
  if (!pageParams.value.projId) return;
  try {
    const res = await costAllocationApi.getWarnSubAlloc(params);
    if (res.code === 200 && res.data) {
      const { statusList } = res.data;

      // 为 statusList 添加小计字段 - 使用 BigNumber
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

  // 构建 API 数据映射
  const apiMap = new Map(apiDataList.map((item) => [item.subId, item]));

  // 需要更新的字段
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
    // 当前节点：如果有 API 数据则覆盖，否则设置默认值
    const apiItem = apiMap.get(node.subId || node.id);
    if (apiItem) {
      fields.forEach((key) => {
        node[key] = apiItem[key] ?? (key === "allocWarn" ? 2 : 0);
      });
    } else {
      fields.forEach((key) => {
        if (node[key] === undefined || node[key] === null) {
          node[key] = key === "allocWarn" ? 2 : 0;
        }
      });
    }

    // 递归处理子节点
    if (node.children?.length) {
      node.children.forEach((child: any) => updateNode(child));
    }
  };

  currentData.forEach((node) => updateNode(node));
  return currentData;
};
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
      // 默认选中全部业态
      selectedBuildings.value = list.map((item: any) => item.id);
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
    }
  }
};
/**
 * 弹窗打开初始化
 */
const initPage = async () => {
  // 解析参数，业务弹窗打开
  pageParams.value = {
    projId: props.projId,
    projName: props.projName || "",
    displayName: props.displayName || "",
    bizType: props.bizType || "",
    billId: undefined,
    bizKeyId: undefined,
    allocAmt: props.allocAmt || 0,
    allocExclAmt: props.allocExclAmt || 0,
  };
  console.log("分摊弹窗参数:", pageParams.value);
  // 获取项目产品类型列表
  // await Promise.all([
  //   getBusiSegList(),
  //   getProductList(),
  //   getBuildingListByProjId(),
  // ]);
  // 弹窗模式则是从erp系统打开弹窗操作，否则就是OA单独引用分摊页面
  // if (props?.cstMData && props.cstMData?.allocDs?.length > 0) {
  //   const detaiList = props.cstMData?.allocDs || [];
  //   processPopupData(detaiList);
  // }

  // erp打开也能修改
  bizType = props.bizType;
  billId = props.bizBillId;
  loadAllocationData();
};

/**
 * 加载OA打开的分摊数据
 */
// ===== 修改：使用 toBig 替代 toDecimal =====
const loadAllocationData = async () => {
  try {
    console.log("OA打开页面参数:", route.query, isView.value);
    // 非合同轻量级信息
    const liteRes = await feePaymentApi.getNconInfoLite({ nconBillId: billId });
    if (liteRes.code == 200 && liteRes.data) {
      if (bizType == 'NCON_PROC') {
        // 非合同立项
        segId.value = liteRes?.data?.process?.segId || undefined
        pageParams.value.projId = liteRes?.data?.process?.projId || undefined
        pageParams.value.projName = liteRes?.data?.process?.projName || undefined
        pageParams.value.displayName = liteRes?.data?.process?.processName || undefined
        pageParams.value.bizType = bizType;
        pageParams.value.billId = billId;
        pageParams.value.allocAmt = toBig(liteRes.data?.process?.processAmt || 0).decimalPlaces(2, BigNumber.ROUND_HALF_UP).toNumber();
        pageParams.value.allocExclAmt = 0;
      }
      if (bizType == 'NCON_CST') {
        // 非合同请款
        segId.value = liteRes?.data?.payment?.segId || undefined
        pageParams.value.projId = liteRes?.data?.payment?.projId || undefined
        pageParams.value.projName = liteRes?.data?.payment?.projName || undefined
        pageParams.value.displayName = liteRes?.data?.payment?.bizTitle || undefined
        pageParams.value.bizType = bizType;
        pageParams.value.billId = billId;
        pageParams.value.allocAmt = toBig(liteRes.data?.payment?.factReqAmt || 0).decimalPlaces(2, BigNumber.ROUND_HALF_UP).toNumber();
        pageParams.value.allocExclAmt = 0;
      }
    }
    // 分摊信息
    const res = await costAllocationApi.getProjectAlloc({
      bizBillId: billId,
      bizType: bizType,
    });
    console.log("OA加载分摊详情:", res);
    if (res.code === 200) {
      // 当有分摊信息时使用分摊信息
      if (res?.data) {
        apportionInfo.value = { ...apportionInfo.value, ...res.data };
        segId.value = res.data?.segId || undefined;
        pageParams.value.projId = res.data?.projId;
        pageParams.value.bizType = bizType;
        pageParams.value.billId = billId;
        pageParams.value.allocAmt = toBig(res.data?.allocAmt || 0).decimalPlaces(2, BigNumber.ROUND_HALF_UP).toNumber();
        pageParams.value.allocExclAmt = res.data?.costExclAmt || 0;
        await getBuildingListByProjId();
        await Promise.all([getBusiSegList(), getProductList()]);
        // 处理查询到的分摊数据，回显到页面
        const allocDs = res.data?.allocDs || [];
        const newData = allocDs.filter((item: any) => item.prodId);
        processPopupData(newData);
      } else {
        if (pageParams.value.projId) {
          await getBuildingListByProjId();
          await Promise.all([getBusiSegList(), getProductList()]);
        }
      }
    }
  } catch (error) {
    console.error("加载分摊数据失败:", error);
  }
};
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
// ===== 修改：使用 toBig 替代 toDecimal =====
const mergeTreeWithDetailApiData = (treeData, prodList) => {
  // 1. 获取叶子节点
  const leafSubjects = getLeafSubjects(treeData);

  // 2. 提取唯一业态
  const products: any = Array.from(
    new Map(prodList.map(item => [item.prodId, { prodId: item.prodId, prodName: item.prodName }])).values()
  );

  // 3. 按 subId 分组
  const groupMap = new Map();
  for (const item of prodList) {
    if (!groupMap.has(item.subId)) groupMap.set(item.subId, []);
    groupMap.get(item.subId).push(item);
  }

  // 4. 构建叶子节点数据映射
  const leafDataMap = new Map();
  for (const subject of leafSubjects) {
    const items = groupMap.get(subject.id) || [];
    const row = {
      id: subject.id,
      subId: subject.id,
      subName: subject.subName,
      subCode: subject.subCode,
      fullPath: subject.fullPath,
      level: subject.subLevel || 1,
      isLeaf: true,
      hasChildren: false,
      // 使用节点自身的值
      busiSegId: subject.busiSegId ?? subject.busiSegId ?? undefined,
      segName: subject.busiSegName ?? subject.segName ?? '',
      allocRule: subject.allocRule ?? '',
      allocRuleName: subject.allocRuleName ?? '',
      allocMid: subject.allocMid ?? 0,
      subjectAmt: 0,
      subjectAmtExcl: 0,
    };

    // 使用 BigNumber 累加
    let totalAmt = new BigNumber(0);
    let totalExclAmt = new BigNumber(0);

    // 为每个业态填充数据（行转列）
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

  // 5. 递归构建树形结构（直接使用节点自身的值）
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
        // 直接使用节点自身的值，有就显示没有就不显示
        busiSegId: node.busiSegId || undefined,
        segName: node.busiSegName ?? node.segName ?? undefined,
        allocRule: node.allocRule ?? undefined,
        allocRuleName: node.allocRuleName ?? undefined,
        allocMid: node.allocMid ?? undefined,
      };

      if (hasChildren) {
        const children = buildTree(node.children);

        // 非叶子节点：使用自身的值，金额为子节点汇总
        // 使用 BigNumber 累加子节点金额
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

        // 业态字段为子节点汇总 - 使用 BigNumber
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

      // 叶子节点：使用合并数据
      const leafData = leafDataMap.get(node.id);
      return {
        ...base,
        ...leafData,
        children: [],
        // 叶子节点优先使用明细数据中的值，如果没有则使用节点自身的值
        busiSegId: leafData?.busiSegId ?? base.busiSegId ?? undefined,
        segName: leafData?.segName ?? base.segName,
        allocRule: leafData?.allocRule ?? base.allocRule,
        allocRuleName: leafData?.allocRuleName ?? base.allocRuleName,
      };
    });
  };

  // 6. 生成动态列配置
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
// ===== 修改：使用 toBig 替代 toDecimal =====
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

    // 重置并累加子节点的科目金额 - 使用 BigNumber
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
// ===== 修改：使用 toBig 替代 toDecimal =====
const summarizeTree = (treeData, productList) => {
  const productIds = productList.map((item) => item.prodId);
  // 深拷贝数据
  const cloneData = JSON.parse(JSON.stringify(treeData));

  function summarize(node) {
    // 叶子节点
    if (!node.children || node.children.length === 0) {
      // 叶子节点的科目金额 = 各业态金额之和 - 使用 BigNumber
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

    // 累加子节点的科目金额 - 使用 BigNumber
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

// ===== 修改：使用 toBig 替代 toDecimal =====
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
      row.subjectAmtExcl = row.subjectAmt
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
    const params: any = buildSubmitParams(editableSubjectData.value);
    console.log("自动分摊接口参数", params)
    const result = await costAllocationApi.getNconAutoAlloc(params);
    if (result.code === 200 && result.data) {
      const { allocList = [] } = result.data;
      if (allocList && allocList.length) {
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
    // prodList: Array.from(prodMap.values()), // 产品列表
    bldIds: selectedBuildings.value, // 楼栋ID列表
  };
};
// 确认时校验
// ===== 修改：使用 toBig 替代 toDecimal =====
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
  // 校验成本金额和分摊金额 - 使用 BigNumber
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
// ===== 修改：使用 toBig 替代 toDecimal =====
const validateLeafNodesStrict = (leafNodes: any[]) => {
  const errors: any[] = [];

  leafNodes.forEach((node) => {
    // 1. 计算所有 allocAmt_* 的累计值（含税）- 使用 BigNumber
    let totalAllocAmt = new BigNumber(0);
    // 2. 计算所有 allocExclAmt_* 的累计值（不含税）- 使用 BigNumber
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
// ===== 修改：使用 toBig 替代 toDecimal =====
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
    // 使用 BigNumber 比较
    // ===== 修改：使用 isZero() 替代 equals(0)，isGreaterThan() 替代 greaterThan() =====
    const allocated = toBig(allocatedAmount.value);
    const pending = toBig(pendingAmount.value);

    if (allocated.isZero()) {
      allocStatus = 0;
    } else if (pending.isGreaterThan(0)) {
      // 待分摊金额大于0，部分分摊2
      allocStatus = 2;
    } else {
      // 成本金额=已分摊金额，已分摊1
      allocStatus = 1;
    }
    const currProdList = getBusinessType(); // 获取当前业态列表
    // console.log("statusList", editableSubjectData.value, currProdList);
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
      allocAmt: allocatedAmount.value, // 分摊金额(含税)
      allocExclAmt: allocExclAmtTotal.value, // 分摊金额(不含税)
      allocStatus: allocStatus, // 分摊状态(0:未分摊,1:已分摊,2:部分分摊)
      allocWarn: totalAllocWarn, // 分摊预警
      allocDs: newData, // 分摊明细列表
    };
  }
};

onMounted(async () => {
  // 弹窗模式时初始化
  if (isDialogMode.value) {
    if (props.projId) {
      await initPage();
    }
  } else {
    // OA打开
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
  // 确认提交
  handleConfirm: handleConfirm,
  // 校验
  validateTable,
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
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap;
  min-width: 0;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  flex-wrap: nowrap;
  width: 100%;
  min-width: 0;
}

.info-item {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 0.3rem;
  white-space: nowrap;
}

/* 项目名称固定宽度 */
.info-item:first-child {
  flex: 0 0 180px;
  min-width: 260px;
}

/* 事项名称固定宽度 */
.info-item:nth-child(2) {
  flex: 0 0 160px;
  min-width: 260px;
}

/* 税率固定宽度 */
.info-item.tax-rate {
  flex: 0 0 180px;
  min-width: 100px;
}

/* 楼栋自适应剩余空间 */
.info-item.building-item {
  flex: 1 1 auto;
  min-width: 100px;
  max-width: 100%;
  overflow: hidden;
}

/* 业态固定宽度 */
.info-item:last-child {
  flex: 0 0 140px;
  min-width: 100px;
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
</style>