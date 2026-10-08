<!-- payment-edit-dialog.vue -->
<template>
  <base-modal v-model="dialogVisible" :title="'编辑付款明细'" width="900px" :confirmText="'保存'"
    :confirm-loading="submitLoading" @confirm="handleSubmit" @close="handleClose">
    <div style="padding: 0 20px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" label-position="right">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="摘要">
              <el-input v-model="formData.finaSubDesc" placeholder=" " style="width: 100%" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="未付金额">
              <el-input-number v-model="totalAmount" :precision="2" :min="0" :controls="false" placeholder=" "
                style="width: 100%" controls-position="right" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="支付方式" prop="payWayId">
              <el-select v-model="formData.payWayId" placeholder="请选择支付方式" style="width: 100%"
                @change="handlePayWayChange">
                <el-option v-for="item in payTypeOptions" :key="item.id" :label="item.dicLabel" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="支付公司" prop="payCompId">
              <el-select v-model="formData.payCompId" placeholder="请选择支付公司" style="width: 100%"
                @change="handlePayCompChange">
                <el-option v-for="item in payComOptions" :key="item.id" :label="item.compName" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="支付金额" prop="payAmt">
              <el-input-number v-model="formData.payAmt" :precision="2" :min="0" :controls="false" placeholder="请输入支付金额"
                style="width: 100%" controls-position="right" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="支付日期" prop="payDate">
              <el-date-picker v-model="formData.payDate" type="date" placeholder="请选择支付日期" value-format="YYYY-MM-DD"
                style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="支付账号">
              <el-input v-model="formData.bankAccount" placeholder="请输入支付账号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="银行回单号">
              <el-input v-model="formData.bankReceipt" placeholder="请输入银行回单号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="formData.payDesc" type="textarea" :rows="3" placeholder="请输入备注" maxlength="500"
                show-word-limit />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="照片">
          <div class="photo-upload-area">
            <base-upload v-model:file-list="annexFileList" :limit="1" :multiple="true" :showIcon="true" :showTip="true"
              :maxSize="20" :accept="'.pdf,.jpg,.jpeg,.png'" :tipText="'支持上传pdf、jpg、jpeg、png格式文件，单个文件不超过20M'"
              button-text="选择图片" size="default" @success="handleUploadSuccess" />
          </div>
        </el-form-item>
      </el-form>
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { v4 as uuidv4 } from "uuid";
import { useDict } from "@/composables/use-dict";
import { dictMapping } from "@/utils/dict-mapping";
import { useMDStore } from "@/stores/md-store.ts";
import BaseUpload from "@/components/base/base-upload.vue";
import { payRegisterApi } from "@/api/cost/payment-manage/payment-register-api";
import { commonApi } from "@/api/cost/common-api";
import { buildFileUrl } from "@/utils/file-path-util";

interface Props {
  modelValue: boolean;
  unpaidAmt: number;
  projId?: number;
  rowData?: any;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  projId: undefined,
  unpaidAmt: 0,
  rowData: null,
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [];
}>();

const mdStore = useMDStore();
// 数据字典
const { getDictList, loadDicts } = useDict([dictMapping.payType], {
  treeDictCodes: [],
});
const payTypeOptions = computed(() => {
  const list = getDictList(dictMapping.payType);
  // 过滤掉冲账选项
  return list.filter((item) => item.id != 2112);
});

// 这里的金额是未付金额 + 本次点击的登记明细的金额，因为本次点击的登记明细编辑时，需要显示未付金额 + 本次点击的登记明细的金额
const totalAmount = computed(() => {
  const unpaidAmt = props.unpaidAmt || 0;
  const rowDataAmt = props?.rowData?.payAmt || 0;
  return unpaidAmt + rowDataAmt;
});

const dialogVisible = ref(props.modelValue);
const formRef = ref<FormInstance>();
const submitLoading = ref(false);
const annexFileList = ref([]);
const payComOptions = ref([]); // 支付公司下拉选项

// 表单数据
const formData = ref({
  finaSubDesc: '',
  annexId: null,
  payWayId: null,
  payWayName: "",
  payCompId: null,
  payCompName: "",
  payAmt: 0,
  payDate: "",
  bankAccount: "",
  bankReceipt: "",
  payDesc: "",
});

// 表单校验规则
const formRules: FormRules = {
  payWayId: [{ required: true, message: "请选择支付方式", trigger: "change" }],
  payCompId: [{ required: true, message: "请选择支付公司", trigger: "change" }],
  payAmt: [
    { required: true, message: "请输入支付金额", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (value <= 0) {
          callback(new Error("支付金额必须大于0"));
        } else if (value > totalAmount.value) {
          callback(new Error(`支付金额不能超过未付金额 ${totalAmount.value}`));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
  payDate: [{ required: true, message: "请选择支付日期", trigger: "change" }],
};

const handlePayWayChange = (val) => {
  const payWay = payTypeOptions.value.find((item) => item.id === val);
  formData.value.payWayName = payWay?.dicLabel;
};
const handlePayCompChange = (val) => {
  const payComp = payComOptions.value.find((item) => item.id === val);
  formData.value.payCompName = payComp?.compName;
};
// 获取公司列表
const getCompanyListByProjId = async () => {
  if (!props?.projId) {
    payComOptions.value = [];
    return;
  }
  try {
    payComOptions.value = [];
    const companies = await mdStore.getProjCompanyList(props.projId);
    payComOptions.value = companies || [];
  } catch (error) {
    console.error("获取公司列表失败:", error);
    payComOptions.value = [];
  }
};

const handleUploadSuccess = (file) => {
  annexFileList.value = [file];
};

// 提交
const handleSubmit = async () => {
  console.log("formData", formData.value);
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    submitLoading.value = true;
    let params = {
      ...formData.value,
    };
    if (annexFileList.value.length > 0) {
      params.annexId = annexFileList.value[0].id;
    } else {
      params.annexId = null;
    }
    const res = await payRegisterApi.savePayRegister([params]);
    if (res.code === 200) {
      ElMessage.success("保存成功");
      emit("success");
      handleClose();
    }
  } catch (error) {
  } finally {
    submitLoading.value = false;
  }
};

// 关闭弹窗
const handleClose = () => {
  formRef.value?.resetFields();
  formRef.value?.clearValidate();
  dialogVisible.value = false;
};

// 初始化数据
const initData = async () => {
  if (!props.rowData) return;
  // 加载数据字典
  await loadDicts();
};

const initFormData = async () => {
  //   console.log("rowData", props.rowData);
  if (!props.rowData) return;
  formData.value = { ...formData.value, ...props.rowData };
  //   回填附件信息
  if (props?.rowData?.annexId) {
    try {
      const fileRes = await commonApi.getFileList({
        annexId: props?.rowData?.annexId,
      });
      if (fileRes.code === 200 && fileRes.data && fileRes.data.length > 0) {
        // 获取第一个附件
        const file = fileRes.data[0];
        annexFileList.value = [file];
        // 拼接完整路径
        //   const fullUrl = buildFileUrl(file.annexPath);
      }
    } catch (error) { }
  }
};

// 监听弹窗显示状态
watch(
  () => props.modelValue,
  async (val) => {
    dialogVisible.value = val;
    if (val) {
      await initData();
      await getCompanyListByProjId();
      initFormData();
    }
  },
);

// 监听内部显示状态变化
watch(dialogVisible, (val) => {
  emit("update:modelValue", val);
});
</script>

<style lang="scss" scoped>
.readonly-text {
  color: #303133;
  font-size: 14px;
  line-height: 32px;
  display: inline-block;
}

.photo-upload-area {
  width: 100%;

  .photo-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;

    .photo-item-wrapper {
      position: relative;
      cursor: pointer;
      border-radius: 4px;
      overflow: hidden;
      border: 1px solid #e4e7ed;
      width: 100px;
      height: 100px;

      &:hover {
        border-color: #409eff;

        .photo-delete {
          display: flex;
        }
      }

      .photo-item {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: cover;
      }

      .photo-delete {
        display: none;
        position: absolute;
        top: 4px;
        right: 4px;
        width: 20px;
        height: 20px;
        background: rgba(255, 0, 0, 0.8);
        color: white;
        border-radius: 50%;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;

        &:hover {
          background: rgba(255, 0, 0, 1);
          transform: scale(1.1);
        }
      }
    }
  }

  :deep(.el-upload--picture-card) {
    width: 100px;
    height: 100px;
    line-height: 100px;
  }

  :deep(.el-upload-list--picture-card .el-upload-list__item) {
    width: 100px;
    height: 100px;
  }

  .upload-tip {
    color: #909399;
    font-size: 12px;
    margin-top: 8px;
  }
}

:deep(.el-divider) {
  margin: 20px 0;

  .el-divider__text {
    font-weight: 500;
    color: #303133;
    font-size: 14px;
  }
}
</style>
