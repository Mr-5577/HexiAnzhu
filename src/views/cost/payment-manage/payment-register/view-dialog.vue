<!-- 付款登记查看 弹窗 -->
<template>
  <base-modal v-model="dialogVisible" :title="'付款登记明细'" width="1400px" :showConfirmButton="false"
    :showCancelButton="false" @close="handleClose">
    <div style="padding-right: 8px; box-sizing: border-box">
      <base-table :columns="payLedgerSubColumns" :tableData="combineTable" :rowKey="'uuid'" :pagination="false"
        :show-toolbar="false" :auto-height="false" :height="'500px'" :border="true" :stripe="true" :isExpandAll="true">
        <!-- 展开行：显示明细表格 -->
        <template #expand="{ row }">
          <div class="expand-table-wrapper">
            <div class="expand-title">明细</div>
            <base-table :columns="tableColumns" :tableData="row.children" :rowKey="'id'" :pagination="false"
              :show-toolbar="false" :auto-height="false" :height="'150px'" :border="true" :stripe="true"
              :compactEmpty="true">
              <!-- 回单照片列自定义渲染 -->
              <template #receiptPhotos="{ row: childRow }">
                <div class="photo-list">
                  <template v-if="childRow.receiptPhotos && childRow.receiptPhotos.length > 0">
                    <div v-for="(photo, index) in getDisplayPhotos(childRow.receiptPhotos)" :key="photo.id || index"
                      class="photo-item-wrapper" @click.stop="handlePreview(childRow.receiptPhotos, index)">
                      <el-image :src="photo.url || photo" fit="cover" class="photo-item" :preview-teleported="true" />
                    </div>
                    <span v-if="childRow.receiptPhotos.length > 3" class="photo-more"
                      @click.stop="handlePreview(childRow.receiptPhotos, 3)">
                      +{{ childRow.receiptPhotos.length - 3 }}
                    </span>
                  </template>
                  <span v-else style="color: #909399; font-size: 12px">
                    暂无照片
                  </span>
                </div>
              </template>
              <template #actions="{ row: childRow }" v-if="menuStore.hasExactPermission(PERMISSIONS.PAY_REG_DETAIL)">
                <el-button type="primary" link @click="handleEdit(childRow)">
                  编辑
                </el-button>
                <el-button type="danger" link @click="handleDelete(childRow)">
                  删除
                </el-button>
              </template>
            </base-table>
          </div>
        </template>
      </base-table>

      <!-- 图片预览组件 -->
      <el-image-viewer v-if="showViewer" :url-list="previewList" :initial-index="previewIndex" :teleported="true"
        @close="closePreview" @switch="handleSwitch" />

      <!-- 编辑登记明细弹窗 -->
      <edit-register-dialog v-model="editDialogVisible" :unpaidAmt="unpaidAmt" :projId="props.currentRow?.projId"
        :row-data="editRowData" @success="handleSuccess" />
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { ElMessage, ElMessageBox, formatter, type FormInstance } from "element-plus";
import { ElImageViewer } from "element-plus";
import { dateUtil } from "@/utils/date-util";
import { v4 as uuidv4 } from "uuid";
import { useUserStore } from "@/stores/user-store";
import { useMDStore } from "@/stores/md-store.ts";
import { payRegisterApi } from "@/api/cost/payment-manage/payment-register-api";
import { commonApi } from "@/api/cost/common-api";
import { buildFileUrl } from "@/utils/file-path-util";
import EditRegisterDialog from "./edit-register-dialog.vue";
import { toBig, formatThousandWithPlaces, roundToTwo, BigNumber } from "@/utils/big-number.ts";
import { PERMISSIONS } from "@/constants/permission.ts";
import { useMenuStore } from "@/stores/menu-store";

interface Props {
  modelValue: boolean;
  currentRow?: any;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  currentRow: null,
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [];
}>();

const userStore = useUserStore();
const mdStore = useMDStore();
const menuStore = useMenuStore();

const dialogVisible = ref(props.modelValue);
const formRef = ref<FormInstance>();
const editDialogVisible = ref(false);
const editRowData = ref(null);

// 预览相关
const showViewer = ref(false);
const previewList = ref<string[]>([]);
const previewIndex = ref(0);
const currentPreviewPhotos = ref([]);

// 表单数据
const formData = ref({
  registrar: "",
  registrarDate: "",
  modifier: "",
  modifyDate: "",
});

// 计算未付金额 = 请款金额（四舍五入后）- 已支付金额合计（每笔先四舍五入后累加）
const unpaidAmt = computed(() => {
  if (!props.currentRow) return 0;
  // 请款金额先四舍五入
  const payableAmt = roundToTwo(props.currentRow?.payableAmt || 0);
  // 每笔已付金额先四舍五入，再累加
  let paidAmt = 0;
  tableData.value.forEach((item) => {
    paidAmt += roundToTwo(item.payAmt || 0);
  });
  // 结果四舍五入
  return roundToTwo(payableAmt - paidAmt);
});

// 表格数据
const payLedgerSubData = ref([]); // 付款台账子记录
const tableData = ref([]); // 实付登记列表
const combineTable = ref([]); // 合并后的表格数据
const payLedgerSubColumns = [
  { type: "expand", width: "50", slot: "expand" },
  { prop: "finaSubDesc", label: "款项类型/事项" },
  { prop: "finaOrgName", label: "所属组织" },
  { prop: "pmBankName", label: "收款方开户行" },
  { prop: "pmAccountName", label: "收款方账户名" },
  { prop: "pmBankAccount", label: "收款方账号" },
  { prop: "payWayName", label: "支付方式", width: 100 },
  { prop: "finaSubName", label: "科目名称" },
  { prop: "finaSubAmt", label: "请款金额", width: 90 },
  { prop: "unpaidAmt", label: "未付金额", width: 90 },
]
// 表格列配置
const tableColumns = computed(() => {
  const baseColumns = [
    { type: "index", label: "序号", width: 60 },
    { prop: "finaSubDesc", label: "摘要", width: 150 },
    { prop: "payWayName", label: "支付方式", width: 100 },
    { prop: "payAmt", label: "支付金额", width: 100, formatter: (row) => formatThousandWithPlaces(row.payAmt || 0) },
    { prop: "payDate", label: "支付日期", width: 100 },
    { prop: "payDesc", label: "备注", width: 150 },
    { prop: "payCompName", label: "支付公司" },
    { prop: "bankAccount", label: "支付账号" },
    { prop: "bankReceipt", label: "银行回单号" },
    { slot: "receiptPhotos", label: "回单照片", width: 120 },
  ];
  // 入库锁定状态下不可操作
  if (props?.currentRow?.isLocked) {
    return baseColumns;
  } else {
    return [...baseColumns, { slot: "actions", label: "操作", width: 120 }];
  }
});

// 编辑
const handleEdit = async (row) => {
  console.log("主表数据", props.currentRow);
  editRowData.value = row;
  editDialogVisible.value = true;
};
// 删除
const handleDelete = (row) => {
  if (!row.id) return;
  ElMessageBox.confirm(`确定删除这条登记明细吗？`, "提示", {
    type: "warning",
  })
    .then(async () => {
      const res = await payRegisterApi.delPayRegister({ id: row.id });
      if (res.code === 200) {
        ElMessage.success("删除成功");
        // 更新当前登记列表数据
        getDetailList();
        // 更新主列表数据
        emit("success");
        // 关闭弹窗
        // handleClose();
      }
    })
    .catch(() => { });
};
const handleSuccess = () => {
  // 更新当前登记列表数据
  getDetailList();
  // 更新主列表数据
  emit("success");
};
// 获取显示的照片（最多显示3张）
const getDisplayPhotos = (photos: any[]) => {
  if (!photos || photos.length === 0) return [];
  return photos.slice(0, 3);
};

// 处理预览
const handlePreview = (photos: any[], index: number) => {
  if (!photos || photos.length === 0) return;

  currentPreviewPhotos.value = photos;
  previewList.value = photos.map((photo) => photo.url || photo);
  previewIndex.value = Math.min(index, photos.length - 1);
  showViewer.value = true;
};

// 关闭预览
const closePreview = () => {
  showViewer.value = false;
  previewList.value = [];
  previewIndex.value = 0;
  currentPreviewPhotos.value = [];
};

// 切换图片
const handleSwitch = (index: number) => {
  previewIndex.value = index;
};

// 关闭弹窗
const handleClose = () => {
  formRef.value?.resetFields();
  formRef.value?.clearValidate();
  dialogVisible.value = false;
  closePreview();
};

// 获取付款台账子记录
// ===== 修改：先四舍五入再计算未付金额 =====
const getPayLedgerSubData = async () => {
  try {
    const params = {
      bizBillId: props.currentRow.bizBillId,
      bizType: props.currentRow.bizType,
    }
    const res = await payRegisterApi.getPayLedgerSub(params);
    if (res.code === 200) {
      const list = res.data || [];
      payLedgerSubData.value = list.map((item) => {
        // 计算未付金额 = 请款金额（四舍五入）- 已付金额（四舍五入）
        const finaSubAmt = roundToTwo(item.finaSubAmt || 0);
        const regPayAmtSum = roundToTwo(item.regPayAmtSum || 0);
        const unpaidAmtVal = roundToTwo(finaSubAmt - regPayAmtSum);
        return {
          ...item,
          uuid: uuidv4(),
          unpaidAmt: unpaidAmtVal, // 未付金额
        };
      })
    }
  } catch (error) {

  }
}
// 获取明细数据
const getDetailList = async () => {
  try {
    const params = {
      bizBillId: props.currentRow.bizBillId,
      bizType: props.currentRow.bizType,
    };
    const res = await payRegisterApi.getPayRegisterList(params);
    if (res.code === 200) {
      const list = res.data || [];

      // 并发请求所有附件信息
      const promises = list.map(async (item) => {
        // 如果有附件ID，获取附件详情
        if (item.annexId) {
          try {
            const fileRes = await commonApi.getFileList({
              annexId: item.annexId,
            });
            if (
              fileRes.code === 200 &&
              fileRes.data &&
              fileRes.data.length > 0
            ) {
              // 获取第一个附件（根据实际情况调整）
              const file = fileRes.data[0];
              // 拼接完整路径
              const fullUrl = buildFileUrl(file.annexPath);
              return {
                ...item,
                receiptPhotos: [
                  {
                    id: file.id,
                    url: fullUrl,
                    name: file.annexName || file.name,
                    annexName: file.annexName || file.name,
                    annexPath: file.annexPath || file.url,
                  },
                ],
                // 保留原始annexId用于后续操作
                annexId: item.annexId,
              };
            }
          } catch (error) {
            console.error(`获取附件失败 (annexId: ${item.annexId}):`, error);
          }
        }

        // 没有附件或获取失败，返回原始数据
        return {
          ...item,
          receiptPhotos: [],
        };
      });

      // 等待所有并发请求完成
      const processedList = await Promise.all(promises);

      // 更新表格数据
      tableData.value = processedList || [];

      // 组合表格数据
      const combinedData = combineTableData(payLedgerSubData.value, processedList);
      console.log("combinedData", combinedData);
      combineTable.value = combinedData;
    }
  } catch (error) {
    console.error("获取明细列表失败:", error);
  }
};

// 组合表格数据 - 一对多关系
const combineTableData = (parentData: any[], childData: any[]) => {
  if (!parentData || parentData.length === 0) return [];

  // 建立子数据索引，按 finaAllocId 分组（一对多）
  const childMap = new Map();
  childData.forEach(item => {
    const key = item.finaAllocId;
    if (!childMap.has(key)) {
      childMap.set(key, []);
    }
    childMap.get(key).push({
      ...item,
      _isChild: true,
    });
  });

  // 组合父级数据，添加 children 数组
  return parentData.map((parent) => {
    const children = childMap.get(parent.finaAllocId) || [];
    return {
      ...parent,
      _isParent: true,
      children: children,
      childrenCount: children.length,
    };
  });
};

const initData = async () => {
  await getPayLedgerSubData(); // 获取付款台账子记录
  await getDetailList(); // 获取实付登记明细数据
};

watch(
  () => props.modelValue,
  async (val) => {
    dialogVisible.value = val;
    if (val) {
      formData.value.registrar = userStore.userInfo?.empName || "";
      formData.value.registrarDate = dateUtil().format("YYYY-MM-DD");
      await initData();
    }
  },
);

// 监听内部显示状态变化
watch(dialogVisible, (val) => {
  emit("update:modelValue", val);
});
</script>

<style lang="scss" scoped>
.expand-table-wrapper {
  padding: 8px 0;

  .expand-title {
    font-size: 13px;
    font-weight: 500;
    color: #409eff;
    margin-bottom: 6px;
    padding-left: 8px;
    border-left: 3px solid #409eff;
  }
}

.photo-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;

  .photo-item-wrapper {
    position: relative;
    cursor: pointer;
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid #e4e7ed;
    transition: all 0.2s;

    &:hover {
      transform: scale(1.1);
      border-color: #409eff;
      z-index: 1;
    }

    .photo-item {
      width: 40px;
      height: 40px;
      display: block;
    }
  }

  .photo-more {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 4px;
    background: #f5f7fa;
    color: #409eff;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    border: 1px dashed #d9d9d9;
    transition: all 0.2s;

    &:hover {
      background: #ecf5ff;
      border-color: #409eff;
    }
  }
}
</style>