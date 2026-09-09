<template>
  <base-modal v-model="visible" :title="'新增合同附件'" width="550px" :confirm-loading="submitLoading" @confirm="handleSubmit"
    @cancel="handleClose">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="110px" class="add-attachment-dialog-form">
      <el-form-item prop="linkConType" label="关联合同类型" required>
        <el-select v-model="formData.linkConType" placeholder="请选择合同类型" style="width: 100%" @change="changeConType">
          <el-option v-for="item in AnnexConTypeEnum" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item prop="linkConId" label="关联合同" required v-if="formData.linkConType === 'ADD'">
        <el-select v-model="formData.linkConId" placeholder="请选择合同类型" style="width: 100%">
          <el-option v-for="item in conAddList" :key="item.id" :label="item.addName" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item prop="annexType" label="附件类型" required>
        <el-select v-model="formData.annexType" placeholder="请选择附件类型" style="width: 100%">
          <el-option v-for="item in AnnexTypeEnum" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item prop="annexSrc" label="附件来源" required>
        <el-select v-model="formData.annexSrc" placeholder="请选择附件来源" style="width: 100%" disabled>
          <el-option v-for="item in FileSourceEnum" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item prop="annexList" label="上传附件" required>
        <base-upload v-model:file-list="formData.annexList" :limit="9" :multiple="false" :showIcon="true"
          :showTip="true" :maxSize="20" :unrestricted="true" :accept="''" :tipText="'文件不超过20M，每次上传一个附件'"
          button-text="选择文件" size="default" @success="handleFileListUpdate" />
      </el-form-item>
    </el-form>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { FileSourceEnum, AnnexTypeEnum, AnnexConTypeEnum } from "@/constants/contract-manage/enums";
import { attachmentApi } from "@/api/cost/contract-manage/attachment-api";
import BaseUpload from "@/components/base/base-upload.vue";
import { supplementContractApi } from "@/api/cost/contract-manage/supplement-contract-api";

const props = defineProps<{
  modelValue: boolean;
  conId: number | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [];
}>();

const visible = ref(props.modelValue);
const formRef = ref<FormInstance>();
const submitLoading = ref(false);
const conAddList = ref([]);

const formData = ref({
  linkConType: null, // 合同类型
  linkConId: null, // 关联合同
  annexType: null, // 附件类型
  annexSrc: null, // 附件来源
  annexList: [], // 附件
});
const formRules: FormRules = {
  linkConType: [{ required: true, message: "请选择合同类型", trigger: "change" }],
  linkConId: [{ required: true, message: "请选择关联合同", trigger: "change" }],
  annexType: [{ required: true, message: "请选择附件类型", trigger: "change" }],
  annexSrc: [{ required: true, message: "请选择附件来源", trigger: "change" }],
  annexList: [{ required: true, message: "请选择附件", trigger: "change" }],
};
const changeConType = (val) => {
  console.log("changeConType", val);
  if (val === "CON") {
    // 主合同为当前合同ID
    formData.value.linkConId = props.conId;
  }
  if (val === "ADD") {
    // 补充合同置空自己选
    formData.value.linkConId = undefined;
    conAddList.value = []
    // 查询补充合同列表
    getConAddList();
  }
}
// 获取补充合同列表
const getConAddList = async () => {
  if (!props.conId) return
  try {
    const res = await supplementContractApi.getSupplementContractList({ conId: props.conId });
    if (res.code === 200) {
      conAddList.value = res.data || [];
    }
  } catch (error) {
    console.error("获取列表失败:", error);
  }
}
const handleClose = () => {
  visible.value = false;
  formRef.value?.resetFields();
  formRef.value?.clearValidate();
};
const handleFileListUpdate = (newList) => {
  console.log("handleFileListUpdate", newList);
  // formData.value.annexList.push(newList);
  formData.value.annexList = [newList];
};
const handleSubmit = async () => {
  console.log("handleSubmit", { ...formData.value, conId: props.conId });
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    if (formData.value.annexList?.length === 0) {
      ElMessage.error("请选择附件");
      return;
    }
    submitLoading.value = true;
    try {
      const annexId = formData.value.annexList[0]?.id;
      const params = {
        conId: props.conId,
        linkConId: formData.value.linkConId,
        linkConType: formData.value.linkConType,
        annexType: formData.value.annexType,
        annexSrc: formData.value.annexSrc,
        annexId: annexId,
      };
      const res = await attachmentApi.addAnnex(params);
      if (res.code === 200) {
        ElMessage.success("新增成功");
        visible.value = false;
        emit("success");
      }
    } catch (error) { }
  } catch (error) {
    console.error("表单验证失败:", error);
  } finally {
    submitLoading.value = false;
  }
};

watch(
  () => props.modelValue,
  (val) => {
    visible.value = val;
    if (val) {
      formData.value.annexSrc = 1;
      formData.value.annexType = 1;
    } else {
      formData.value.annexSrc = null;
      formData.value.annexType = null;
      formData.value.annexList = []
    }
  },
);

watch(visible, (val) => emit("update:modelValue", val));
</script>
<style lang="scss" scoped>
.add-attachment-dialog-form {
  padding: 0 20px;
  box-sizing: border-box;
}
</style>
