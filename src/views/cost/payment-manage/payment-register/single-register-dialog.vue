<!-- 付款登记 弹窗 -->
<template>
  <base-modal v-model="dialogVisible" :title="'付款登记'" width="1400px" :confirmText="'提交登记'"
    :confirm-loading="submitLoading" @confirm="handleSubmit" @close="handleClose">
    <div style="padding-right: 8px; box-sizing: border-box">
      <div style="
          width: 100%;
          display: flex;
          flex-wrap: nowrap;
          margin-bottom: 10px;
        ">
        <div class="info-item">
          <span class="info-label">登记人：</span>
          <span class="info-value">{{ formData.registrar || "-" }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">登记日期：</span>
          <span class="info-value">
            {{ formData.registrarDate || "-" }}
          </span>
        </div>
        <!-- <div class="info-item">
          <span class="info-label">修改人：</span>
          <span class="info-value">{{ formData.modifier || "-" }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">修改日期：</span>
          <span class="info-value">
            {{ formData.modifyDate || "-" }}
          </span>
        </div> -->
      </div>

      <div class="title">款项明细</div>
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="0">
        <editable-table ref="tableRef" :row-key="'uuid'" :height="'400px'" v-model="tableData" :columns="tableColumns"
          :pagination="false" :highlight-current-row="false" :show-summary="false" :compactEmpty="true" :editable="true"
          @selection-change="handleSelectionChange">
          <!-- 回单照片列自定义渲染 -->
          <template #receiptPhotos="{ row }">
            <div class="photo-list">
              <template v-if="row.receiptPhotos && row.receiptPhotos.length > 0">
                <div v-for="(photo, index) in getDisplayPhotos(row.receiptPhotos)" :key="photo.id || index"
                  class="photo-item-wrapper" @click.stop="handlePreview(row.receiptPhotos, index)">
                  <el-image :src="photo.url || photo" fit="cover" class="photo-item" :preview-teleported="true" />
                </div>
                <span v-if="row.receiptPhotos.length > 3" class="photo-more"
                  @click.stop="handlePreview(row.receiptPhotos, 3)">
                  +{{ row.receiptPhotos.length - 3 }}
                </span>
              </template>
              <span v-else style="color: #909399; font-size: 12px">
                暂无照片
              </span>
            </div>
          </template>

          <template #actions="{ row }">
            <div class="actions-btn">
              <el-button link type="primary" @click.stop="openUploadForRow(row)">
                上传照片
              </el-button>
              <el-button v-if="row.receiptPhotos && row.receiptPhotos.length > 0" link type="danger"
                @click.stop="clearPhotos(row)">
                清空照片
              </el-button>
            </div>
          </template>
        </editable-table>
      </el-form>
      <!-- 放在表格外面的上传组件（隐藏） -->
      <Teleport to="body">
        <div style="display: none" @click.stop @mousedown.stop>
          <base-upload ref="hiddenUploadRef" key="receipt-photo" v-model:file-list="tempFileList" :limit="1"
            :multiple="true" :showIcon="true" :showTip="false" :accept="'.jpg,.jpeg,.png'" button-text="选择文件"
            size="default" button-type="primary" @success="handleUploadSuccess" />
        </div>
      </Teleport>

      <!-- 图片预览组件 -->
      <el-image-viewer v-if="showViewer" :url-list="previewList" :initial-index="previewIndex" :teleported="true"
        @close="closePreview" @switch="handleSwitch" />
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { ElImageViewer } from "element-plus";
import EditableTable from "@/components/base/editable-table.vue";
import { EditableColumn } from "@/components/base/editable-table.vue";
import BaseUpload from "@/components/base/base-upload.vue";
import { buildFileUrl } from "@/utils/file-path-util";
import { dateUtil } from "@/utils/date-util";
import { useUserStore } from "@/stores/user-store";
import { useMDStore } from "@/stores/md-store.ts";
import { v4 as uuidv4 } from "uuid";
import { useDict } from "@/composables/use-dict";
import { dictMapping } from "@/utils/dict-mapping";
import { payRegisterApi } from "@/api/cost/payment-manage/payment-register-api";
import { roundToTwo } from "@/utils/big-number";

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

const dialogVisible = ref(props.modelValue);
const formRef = ref<FormInstance>();
const submitLoading = ref(false);
const selectedRows = ref([]);
const tempFileList = ref([]);
const hiddenUploadRef = ref();
const currentUploadRow = ref(null);
const payComOptions = ref([]);

// 预览相关
const showViewer = ref(false);
const previewList = ref<string[]>([]);
const previewIndex = ref(0);
const currentPreviewPhotos = ref([]);

// 数据字典
const { getDictList, loadDicts } = useDict([dictMapping.payType], {
  treeDictCodes: [],
});
// 支付方式
const payTypeOptions = computed(() => {
  const list = getDictList(dictMapping.payType);
  // 过滤掉冲账选项
  return list.filter((item) => item.id != 2112);
});

// 表单数据（仅保留全局信息）
const formData = ref({
  registrar: "",
  registrarDate: "",
  modifier: "",
  modifyDate: "",
});

// 表格数据
const tableData = ref([]);

// 表格列配置
const tableColumns = computed<EditableColumn[]>(() => [
  { type: "selection", width: 50, fixed: "left" },
  { prop: "finaSubDesc", label: "款项类型/事项", editable: false, width: 120 },
  { prop: "finaOrgName", label: "所属组织", editable: false, width: 100 },
  { prop: "finaSubName", label: "科目名称", editable: false, width: 140 },
  {
    prop: "pmBankName",
    label: "收款方开户行",
    editable: false,
    width: 120,
  },
  {
    prop: "pmAccountName",
    label: "收款方账户名",
    editable: false,
    width: 120,
  },
  {
    prop: "pmBankAccount",
    label: "收款方账号",
    editable: false,
    width: 140,
  },
  {
    prop: "payWayId",
    label: "支付方式",
    editable: true,
    editType: "select",
    width: 130,
    showOverflowTooltip: false,
    optionLabelField: "dicLabel",
    optionValueField: "id",
    options: payTypeOptions.value || [],
  },
  { prop: "finaSubAmt", label: "请款金额", editable: false, width: 100 },
  { prop: "unpaidAmt", label: "未付金额", editable: false, width: 100 },
  {
    prop: "payAmt",
    label: "支付金额",
    editable: true,
    editType: "number",
    width: 120,
  },
  {
    prop: "payDate",
    label: "支付日期",
    editable: true,
    editType: "date",
    width: 160,
  },
  {
    prop: "payDesc",
    label: "备注",
    editable: true,
    editType: "input",
    width: 150,
  },
  {
    prop: "payCompId",
    label: "支付公司",
    editable: true,
    editType: "select",
    width: 140,
    showOverflowTooltip: false,
    optionLabelField: "compName",
    optionValueField: "id",
    options: payComOptions.value || [],
  },
  {
    prop: "bankAccount",
    label: "支付账号",
    editable: true,
    editType: "input",
    width: 150,
  },

  {
    prop: "bankReceipt",
    label: "银行回单号",
    editable: true,
    editType: "input",
    width: 140,
  },
  {
    label: "回单照片",
    editable: false,
    width: 160,
    slot: "receiptPhotos",
  },
  {
    label: "操作",
    width: 180,
    slot: "actions",
    fixed: "right",
  },
]);

// 表单校验规则
const formRules: FormRules = {};

// 处理选择变更
const handleSelectionChange = (rows: any[]) => {
  selectedRows.value = rows;
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

// 更新行数据
const updateRow = (rowIndex: number, data: any) => {
  // Object.assign(tableData.value[rowIndex], data);
  // tableData.value = [...tableData.value];
  const row = tableData.value[rowIndex];
  Object.keys(data).forEach((key) => {
    row[key] = data[key];
  });
};

// 打开上传对话框
const openUploadForRow = (row: any) => {
  currentUploadRow.value = row;
  tempFileList.value = [];

  nextTick(() => {
    hiddenUploadRef.value?.triggerFileSelect();
  });
};

// 上传组件的成功回调
const handleUploadSuccess = (file: any) => {
  console.log("上传组件的成功回调", file);
  tempFileList.value = [file];
  if (currentUploadRow.value) {
    const currIndex = tableData.value.findIndex(
      (item) => item.id === currentUploadRow.value.id,
    );

    if (currIndex === -1) {
      currentUploadRow.value = null;
      return;
    }

    const photoItem = {
      id: file.id || Date.now(),
      // url: file.url || file.annexPath,
      url: buildFileUrl(file.annexPath), // 显示文件全路径
      name: file.annexName || file.name,
      annexName: file.annexName || file.name,
      annexPath: file.annexPath || file.url,
    };

    const currentPhotos = tableData.value[currIndex].receiptPhotos || [];

    updateRow(currIndex, {
      // receiptPhotos: [...currentPhotos, photoItem], // 多张照片
      receiptPhotos: [photoItem], // 一张照片
    });

    // ElMessage.success("照片上传成功");
    currentUploadRow.value = null;
  }
};

// 清空照片
const clearPhotos = (row: any) => {
  const currIndex = tableData.value.findIndex((item) => item.id === row.id);

  if (currIndex !== -1) {
    updateRow(currIndex, {
      receiptPhotos: [],
    });
    ElMessage.success("已清空照片");
  }
};

// 构建参数
const buildParams = () => {
  const submitList = selectedRows.value.map((item) => {
    const { receiptPhotos, uuid, ...rest } = item;
    return {
      ...rest,
      annexId:
        receiptPhotos && receiptPhotos.length > 0
          ? receiptPhotos[0].id
          : undefined,
    };
  });
  return submitList;
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    submitLoading.value = true;

    if (tableData.value.length === 0) {
      ElMessage.warning("暂无款项明细数据！");
      submitLoading.value = false;
      return;
    }

    if (selectedRows.value.length === 0) {
      ElMessage.warning("请至少选择一条款项明细");
      submitLoading.value = false;
      return;
    }

    const invalidRows = selectedRows.value.filter((row) => {
      if (!row.payDate) {
        ElMessage.warning(`请选择支付日期`);
        return true;
      }
      if (!row.payWayId) {
        ElMessage.warning(`请选择支付方式`);
        return true;
      }
      if (!row.payAmt || row.payAmt <= 0) {
        ElMessage.warning(`支付金额必须大于0`);
        return true;
      }
      if (row.payAmt > row.unpaidAmt) {
        ElMessage.warning(`本次支付金额不能超过未付金额`);
        return true;
      }
      if (!row.payCompId) {
        ElMessage.warning(`请选择支付公司`);
        return true;
      }
      return false;
    });

    if (invalidRows.length > 0) {
      submitLoading.value = false;
      return;
    }

    const paramList = buildParams();
    console.log("提交数据:", buildParams());
    const res = await payRegisterApi.savePayRegister(paramList);
    if (res.code === 200) {
      ElMessage.success("登记成功");
      emit("success");
      handleClose();
    }
  } catch (error) {
    console.error("表单验证失败:", error);
  } finally {
    submitLoading.value = false;
  }
};

// 关闭弹窗
const handleClose = () => {
  formRef.value?.resetFields();
  formRef.value?.clearValidate();
  dialogVisible.value = false;
  currentUploadRow.value = null;
  tempFileList.value = [];
  closePreview();
  // 清理上传组件引用
  hiddenUploadRef.value = null;
};

// 获取公司列表
const getCompanyListByProjId = async () => {
  const projId = props?.currentRow?.projId;
  if (!projId) {
    payComOptions.value = [];
    return;
  }
  try {
    payComOptions.value = [];
    const companies = await mdStore.getProjCompanyList(projId);
    payComOptions.value = companies || [];
  } catch (error) {
    console.error("获取公司列表失败:", error);
    payComOptions.value = [];
  }
};

// 获取明细数据
const getDetailList = async () => {
  try {
    const params = {
      bizBillId: props.currentRow.bizBillId,
      bizType: props.currentRow.bizType,
    };
    const res = await payRegisterApi.getPayLedgerSub(params);
    console.log("res", res);
    if (res.code === 200) {
      const list = res.data || [];
      tableData.value = list.map((item) => {
        // 计算未付金额 = 请款金额 - 已付金额
        const finaSubAmt = Number(item.finaSubAmt || 0);
        const regPayAmtSum = Number(item.regPayAmtSum || 0);
        const unpaidAmt = roundToTwo(finaSubAmt - regPayAmtSum)
        return {
          ...item,
          uuid: uuidv4(),
          payAmt: unpaidAmt, // 初始化本次支付金额为未付金额
          unpaidAmt: unpaidAmt, // 未付金额
          payWayId: item.pmPayWayId ? Number(item.pmPayWayId) : null, // 支付方式
          payDate: dateUtil().format("YYYY-MM-DD"), // 支付日期
          payCompId: props?.currentRow?.compId || undefined, // 支付公司
        };
      }).filter((vi) => vi.unpaidAmt !== 0); // 过滤掉未付金额为0的项
    }
  } catch (error) { }
};

const initData = async () => {
  console.log("初始化数据", props.currentRow);
  await loadDicts();
  await getCompanyListByProjId();
  await getDetailList();
};

// 监听外部传入的显示状态
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
.title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
  padding-left: 12px;
  box-sizing: border-box;
  position: relative;

  &::before {
    content: "";
    width: 4px;
    height: 16px;
    background: linear-gradient(180deg, #409eff, #66b1ff);
    border-radius: 2px;
    position: absolute;
    left: 0;
    top: 5px;
  }
}

.info-item {
  width: 25%;
  display: flex;
  align-items: center;

  .info-label {
    color: #909399;
    font-size: 14px;
    min-width: 80px;
    display: flex;
    justify-content: flex-end;
  }

  .info-value {
    color: #303133;
    font-size: 14px;
    font-weight: 500;
  }
}

.actions-btn {
  height: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
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
