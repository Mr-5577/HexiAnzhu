<template>
  <base-modal
    v-model="visible"
    :title="dialogTitle"
    width="500px"
    :confirm-loading="submitLoading"
    @confirm="handleSubmit"
    @cancel="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item prop="bldName" label="楼栋名称" required>
        <el-input
          v-model="formData.bldName"
          placeholder="请输入楼栋名称，如：1#、2#、地下室"
        />
      </el-form-item>
      <el-form-item prop="prodIds" label="产品类型" required>
        <el-select
          v-model="formData.prodIds"
          placeholder="请选择产品类型"
          multiple
          collapse-tags
          @change="handleProdIdsChange"
        >
          <el-option
            v-for="item in prodTypeList"
            :key="item.id"
            :label="item.prodName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item prop="isUnderGround" label="是否地下室" required>
        <el-radio-group
          v-model="formData.isUnderGround"
          @change="handleUnderGroundChange"
        >
          <el-radio :value="false">否</el-radio>
          <el-radio :value="true">是</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item
        prop="bindUnderGround"
        label="关联地下室"
        :rules="bindUnderGroundRules"
      >
        <el-select
          v-model="formData.bindUnderGround"
          placeholder="请选择关联地下室"
          :disabled="formData.isUnderGround"
          clearable
        >
          <el-option
            v-for="item in bindUnderGroundList"
            :key="item.id"
            :label="item.bldName"
            :value="item.id"
          />
        </el-select>
        <div v-if="formData.isUnderGround" class="form-tip">
          地下室不能关联其他地下室
        </div>
        <div v-else-if="bindUnderGroundList.length === 0" class="form-tip">
          暂无地下室楼栋，请先创建地下室楼栋
        </div>
        <div v-else class="form-tip">可选择关联的地下室楼栋</div>
      </el-form-item>
    </el-form>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import type {
  ProjectBuilding,
  ProjectBuildingSaveParams,
} from "@/types/cost/master-data/project-area-type";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";
import { productTypeApi } from "@/api/cost/master-data/product-type-api";

const props = defineProps<{
  modelValue: boolean;
  projectId: number;
  editData?: any | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [];
}>();

const visible = ref(props.modelValue);
const formRef = ref<FormInstance>();
const submitLoading = ref(false);

const isEditMode = computed(() => !!props.editData?.id);
const dialogTitle = computed(() =>
  isEditMode.value ? "编辑楼栋" : "新增楼栋",
);

const formData = ref<ProjectBuildingSaveParams>({
  projId: props.projectId,
  bldName: "",
  isUnderGround: false,
  prodIds: [],
  prodNames: "",
  bindUnderGround: undefined,
});
const prodTypeList = ref([]);
const bindUnderGroundList = ref([]);

// 关联地下室验证规则（动态）
const bindUnderGroundRules = computed(() => {
  // 只有非地下室才需要关联地下室
  // if (!formData.value.isUnderGround) {
  //   return [
  //     {
  //       required: true,
  //       message: "请关联地下室",
  //       trigger: "change",
  //     },
  //   ];
  // }
  return [];
});

const formRules: FormRules = {
  bldName: [{ required: true, message: "请输入楼栋名称", trigger: "blur" }],
  isUnderGround: [
    { required: true, message: "请选择是否地下室", trigger: "change" },
  ],
  prodIds: [{ required: true, message: "请选择产品类型", trigger: "change" }],
};

// 处理是否地下室变化
const handleUnderGroundChange = (value: boolean) => {
  if (value) {
    // 如果选择"是"（地下室），清空关联地下室
    formData.value.bindUnderGround = undefined;
  }
  // 清除关联地下室字段的验证状态
  nextTick(() => {
    formRef.value?.clearValidate(["bindUnderGround"]);
  });
};

// 处理产品类型变化
const handleProdIdsChange = (values: number[]) => {
  // 根据选中的id获取对应的产品名称
  const names = values
    .map((id) => {
      const item = prodTypeList.value.find((prod: any) => prod.id === id);
      return item?.prodName || "";
    })
    .filter((name) => name); // 过滤掉空值

  formData.value.prodNames = names.join(",");
};

const getBindUnderGroundList = async () => {
  if (!props.projectId) return;
  try {
    const res = await projectAreaApi.getBuildingList({
      projId: props.projectId,
    });
    if (res.code === 200) {
      const list = res.data || [];
      // 如果当前是编辑模式，过滤掉自己（不能关联自己）
      const excludeId = props.editData?.id;
      bindUnderGroundList.value = list.filter((item) => {
        // 只显示地下室楼栋，且不是自己
        return item.isUnderGround && item.id !== excludeId;
      });
    }
  } catch (error) {}
};

watch(
  () => props.modelValue,
  async (val) => {
    visible.value = val;
    if (val) {
      await getProdTypeList();
      await getBindUnderGroundList();
      // 编辑
      if (isEditMode.value && props.editData) {
        formData.value = {
          id: props.editData.id,
          projId: props.editData.projId,
          bldName: props.editData.bldName,
          isUnderGround: props.editData.isUnderGround,
          bindUnderGround: props.editData.bindUnderGround,
          // 将字符串转换为数字数组
          prodIds: props.editData.prodIds
            ? props.editData.prodIds
                .split(",")
                .map(Number)
                .filter((id) => !isNaN(id))
            : [],
          prodNames: props.editData.prodNames || "",
        };
      } else {
        // 新增
        formData.value = {
          projId: props.projectId,
          bldName: "",
          isUnderGround: false,
          prodIds: [],
          prodNames: "",
          bindUnderGround: undefined,
        };
        formRef.value?.resetFields();
      }
    }
  },
);

watch(visible, (val) => emit("update:modelValue", val));

const getProdTypeList = async () => {
  if (!props.projectId) return;
  try {
    const res = await productTypeApi.getProductProjList({
      projId: props.projectId,
      withDetail: true,
    });
    if (res.code === 200) {
      prodTypeList.value = res.data || [];
    }
  } catch (error) {}
};

const handleClose = () => {
  visible.value = false;
  formRef.value?.resetFields();
  formRef.value?.clearValidate();
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitLoading.value = true;
    const submitData = {
      ...formData.value,
      prodIds: formData.value.prodIds.join(","),
    };
    if (!isEditMode.value) {
      delete submitData.id;
    }

    // 如果是地下室，确保关联地下室为空
    if (submitData.isUnderGround) {
      submitData.bindUnderGround = undefined;
    }

    let res;
    if (isEditMode.value) {
      res = await projectAreaApi.editBuilding(submitData);
    } else {
      res = await projectAreaApi.addBuilding(submitData);
    }
    if (res.code === 200) {
      ElMessage.success(`${dialogTitle.value}成功！`);
      visible.value = false;
      emit("success");
    } else {
      ElMessage.error(res.msg);
    }
  } catch (error) {
    console.error("表单验证失败:", error);
  } finally {
    submitLoading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}
</style>
