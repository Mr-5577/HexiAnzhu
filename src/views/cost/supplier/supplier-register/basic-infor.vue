<!-- 基本信息 -->
<template>
  <div class="basic-infor-form">
    <div class="form-scroll-area">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="110px"
        class="adapt-form"
      >
        <el-row :gutter="24">
          <el-col :xs="24" :sm="8" :md="8" :lg="8" :xl="8">
            <el-form-item label="供应商名称" prop="supName" required>
              <el-input
                v-model="formData.supName"
                :disabled="isView"
                placeholder="请输入供应商名称"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="8" :md="8" :lg="8" :xl="8">
            <el-form-item label="供应商类型" prop="supTypeId">
              <el-cascader
                v-model="formData.supTypeId"
                :disabled="isView"
                :options="supplierTypeList"
                :show-all-levels="false"
                :props="{
                  expandTrigger: 'hover',
                  emitPath: false,
                  checkStrictly: false,
                  value: 'id',
                  label: 'supTypeName',
                  children: 'children',
                }"
                placeholder="请选择供应商类别"
                style="width: 100%"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="8" :md="8" :lg="8" :xl="8">
            <el-form-item label="供应商编码" prop="supCode" required>
              <el-input
                v-model="formData.supCode"
                :disabled="isView"
                placeholder="请输入供应商编码"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :xs="24" :sm="8" :md="8" :lg="8" :xl="8">
            <el-form-item label="内外部" prop="supLinkType">
              <el-select
                v-model="formData.supLinkType"
                :disabled="isView"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option label="内部" :value="1" />
                <el-option label="外部" :value="2" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="8" :md="8" :lg="8" :xl="8">
            <el-form-item label="企业性质" prop="supNatureId">
              <el-select
                v-model="formData.supNatureId"
                :disabled="isView"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option
                  v-for="item in supNatureList"
                  :key="item.id"
                  :label="item.dicLabel"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="8" :md="8" :lg="8" :xl="8">
            <el-form-item label="统一信用代码" prop="uscCardNo">
              <el-input
                v-model="formData.uscCardNo"
                :disabled="isView"
                placeholder="请输入统一社会信用代码"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :xs="24" :sm="8" :md="8" :lg="8" :xl="8">
            <el-form-item label="成立日期" prop="entryDate">
              <el-date-picker
                v-model="formData.entryDate"
                :disabled="isView"
                type="date"
                placeholder="请选择日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="8" :md="8" :lg="8" :xl="8">
            <el-form-item label="注册资金" prop="registeredAmount">
              <el-input-number
                v-model="formData.registeredAmount"
                :disabled="isView"
                :min="0"
                :precision="2"
                :controls="false"
                placeholder="请输入注册资金"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="8" :md="8" :lg="8" :xl="8">
            <el-form-item label="纳税类型" prop="taxTypeId">
              <el-select
                v-model="formData.taxTypeId"
                :disabled="isView"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option
                  v-for="item in taxNatureList"
                  :key="item.id"
                  :label="item.dicLabel"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :xs="24" :sm="8" :md="8" :lg="8" :xl="8">
            <el-form-item label="供应商来源" prop="sourceTypeId">
              <el-select
                v-model="formData.sourceTypeId"
                :disabled="isView"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option
                  v-for="item in sourceTypeList"
                  :key="item.id"
                  :label="item.dicLabel"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="16" :md="16" :lg="16" :xl="16">
            <el-form-item label="供应商地址" prop="address">
              <el-input
                v-model="formData.address"
                :disabled="isView"
                placeholder="请输入供应商地址"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :xs="24" :sm="8" :md="8" :lg="8" :xl="8">
            <el-form-item label="法人代表" prop="legalPerson">
              <el-input
                v-model="formData.legalPerson"
                :disabled="isView"
                placeholder="请输入法人代表姓名"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="8" :md="8" :lg="8" :xl="8">
            <el-form-item label="法人证件类型" prop="legalCardTypeId">
              <el-select
                v-model="formData.legalCardTypeId"
                :disabled="isView"
                placeholder="请选择证件类型"
                style="width: 100%"
              >
                <el-option
                  v-for="item in legalCardTypeList"
                  :key="item.id"
                  :label="item.dicLabel"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="8" :md="8" :lg="8" :xl="8">
            <el-form-item label="法人证件号码" prop="legalCardNo">
              <el-input
                v-model="formData.legalCardNo"
                :disabled="isView"
                placeholder="请输入证件号码"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :xs="24" :sm="8" :md="8" :lg="8" :xl="8">
            <el-form-item label="法人代表电话" prop="legalPhone">
              <el-input
                v-model="formData.legalPhone"
                :disabled="isView"
                placeholder="请输入联系电话"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="16" :md="16" :lg="16" :xl="16">
            <el-form-item label="法人代表邮箱" prop="legalEmail">
              <el-input
                v-model="formData.legalEmail"
                :disabled="isView"
                placeholder="请输入邮箱"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item label="企业主要资质" prop="supQual">
              <el-input
                v-model="formData.supQual"
                :disabled="isView"
                placeholder="请填写企业取得的主要资质，如ISO9001、高新技术企业等"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item label="经营范围" prop="bizDesc">
              <el-input
                v-model="formData.bizDesc"
                :disabled="isView"
                type="textarea"
                :rows="3"
                maxlength="500"
                show-word-limit
                placeholder="请填写营业执照上的经营范围"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input
                v-model="formData.remark"
                :disabled="isView"
                type="textarea"
                :rows="3"
                maxlength="500"
                show-word-limit
                placeholder="其他需要补充说明的信息"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <div class="btn-row" v-if="!isView">
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
        提交
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed, watch } from "vue";
import { ElMessage } from "element-plus";
import { phoneRegex, emailRegex, uscRegex, idCardRegex } from "@/utils/regex";
import { supTypeApi } from "@/api/cost/master-data/supplier-category-api";
import type { SupplierTypeTreeNode } from "@/types/cost/master-data/supplier-category-type";
import { supplierApi } from "@/api/cost/supplier/supplier-ledger-api";
import { useDict } from "@/composables/use-dict";
import { dictMapping } from "@/utils/dict-mapping";
import { buildTree } from "@/utils/tree";

defineOptions({ name: "basic-infor" });

// 定义事件
const emit = defineEmits(["save-success"]);

const props = defineProps({
  supplierId: { type: [Number, String], default: null },
  mode: { type: String, default: "add" },
});

const isView = computed(() => props.mode === "view");

const initFormData = () => ({
  // 基础信息
  supName: "", // 供应商名称
  supCode: "", // 供应商编码
  supLinkType: null, // 供应商内外部 1-内部关联单位，2-外部单位
  supTypeId: null, // 供应商类别ID
  supNatureId: null, // 企业性质ID
  taxTypeId: null, // 纳税类型ID
  sourceTypeId: null, // 来源类型ID
  uscCardNo: "", // 统一社会信用代码

  // 法人信息
  legalPerson: "", // 法人代表
  legalCardTypeId: null, // 法人代表证件类型ID
  legalCardNo: "", // 法人代表证件号码
  legalEmail: "", // 法人代表邮箱
  legalPhone: "", // 法人代表电话

  // 财务及资质信息
  registeredAmount: null, // 注册资本
  supQual: "", // 企业主要资质及等级

  // 地址及其他
  address: "", // 供应商地址
  bizDesc: "", // 经营范围
  entryDate: "", // 入库日期（原成立日期）
  remark: "", // 备注（原其他说明）
});

const formData = ref(initFormData());

// 供应商类别
const supplierTypeList = ref<SupplierTypeTreeNode[]>([]);
// 企业性质
const supNatureList = ref([]);
// 纳税性质
const taxNatureList = ref([]);
// 供应商来源
const sourceTypeList = ref([]);
// 证件类型
const legalCardTypeList = ref([]);
// 数据字典
const { getDictTree, getDictList, loadDicts } = useDict(
  [
    dictMapping.enterpriseNature, // 企业性质
    dictMapping.taxType, // 纳税类型
    dictMapping.supplierSource, // 供应商来源
    dictMapping.legalCardType, // 法人证件类型
  ],
  {
    treeDictCodes: [],
  },
);

// 表单引用
const formRef = ref(null);
const submitLoading = ref(false);

const resetForm = () => {
  formData.value = initFormData();
};

// 加载对应供应商信息
const loadSupplierInfo = async () => {
  if (!props.supplierId) return;
  try {
    const res = await supplierApi.getSupplierList({
      id: Number(props.supplierId),
    });
    if (res.code === 200 && Array.isArray(res.data) && res.data.length > 0) {
      resetForm();
      Object.assign(formData.value, res.data[0]);
    } else {
      ElMessage.warning("未找到供应商数据");
    }
  } catch (error) {
    console.error("获取供应商信息失败", error);
  }
};

watch(
  () => [props.supplierId, props.mode],
  ([id, currentMode]) => {
    if (currentMode === "add") {
      resetForm();
    } else if (id) {
      loadSupplierInfo();
    }
  },
  { immediate: true },
);

// 自定义验证函数 - 证件号码验证
const validateCardNo = (rule, value, callback) => {
  if (!value) {
    callback(new Error("请输入证件号码"));
  } else if (
    formData.value.legalCardTypeId == 2016 &&
    !idCardRegex.test(value)
  ) {
    // 选择身份证时需要校验身份证号码格式
    callback(new Error("请输入正确的身份证号码"));
  } else if (value.length < 6) {
    callback(new Error("证件号码长度不能小于6位"));
  } else {
    callback();
  }
};
const validateSupCode = (rule, value, callback) => {
  if (!value) {
    callback(new Error("请输入供应商编码"));
    return;
  }
  // 必须以字母开头，后面只能跟字母、数字、下划线
  const pattern = /^[a-zA-Z][a-zA-Z0-9_]*$/;
  if (!pattern.test(value)) {
    callback(new Error("只能包含英文、数字和下划线，且不能以数字开头"));
  } else {
    callback();
  }
};

// 表单校验规则
const formRules = ref({
  // 必填字段
  supName: [
    { required: true, message: "请输入供应商名称", trigger: "blur" },
    { min: 2, max: 100, message: "长度在 2 到 100 个字符", trigger: "blur" },
  ],
  supTypeId: [
    { required: true, message: "请选择供应商类型", trigger: "change" },
  ],
  supCode: [
    { required: true, message: "请输入供应商编码", trigger: "blur" },
    { validator: validateSupCode, trigger: "blur" },
  ],
  supLinkType: [{ required: true, message: "请选择内外部", trigger: "change" }],
  supNatureId: [
    { required: true, message: "请选择企业性质", trigger: "change" },
  ],
  uscCardNo: [
    { required: true, message: "请输入统一社会信用代码", trigger: "blur" },
    {
      pattern: uscRegex,
      message: "请输入正确的统一社会信用代码",
      trigger: "blur",
    },
  ],
  entryDate: [{ required: true, message: "请选择成立日期", trigger: "change" }],
  registeredAmount: [
    { required: true, message: "请输入注册资金", trigger: "blur" },
    { type: "number", min: 0, message: "注册资金不能小于0", trigger: "blur" },
  ],
  taxTypeId: [{ required: true, message: "请选择纳税类型", trigger: "change" }],
  sourceTypeId: [
    { required: true, message: "请选择供应商来源", trigger: "change" },
  ],
  address: [
    { required: true, message: "请输入注册地址", trigger: "blur" },
    { min: 2, max: 200, message: "长度在 2 到 200 个字符", trigger: "blur" },
  ],
  legalPerson: [
    {
      required: true,
      message: "请输入法人代表姓名",
      trigger: "blur",
    },
    { min: 2, max: 50, message: "长度在 2 到 50 个字符", trigger: "blur" },
  ],
  legalCardTypeId: [
    { required: true, message: "请选择法人证件类型", trigger: "change" },
  ],
  legalCardNo: [
    {
      required: true,
      message: "请输入法人证件号码",
      trigger: "blur",
    },
    { validator: validateCardNo, trigger: "blur" },
  ],
  legalPhone: [
    { required: true, message: "请输入法人代表电话", trigger: "blur" },
    { pattern: phoneRegex, message: "请输入正确的手机号码", trigger: "blur" },
  ],
  legalEmail: [
    { required: true, message: "请输入法人代表邮箱", trigger: "blur" },
    { pattern: emailRegex, message: "请输入正确的邮箱地址", trigger: "blur" },
  ],
  // supQual: [
  //   { required: true, message: "请输入企业主要资质", trigger: "blur" },
  //   { max: 500, message: "长度不能超过500个字符", trigger: "blur" },
  // ],
  // bizDesc: [
  //   { required: true, message: "请输入经营范围", trigger: "blur" },
  //   { max: 500, message: "长度不能超过500个字符", trigger: "blur" },
  // ],
});

const handleSubmit = async () => {
  if (isView.value) return;
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    submitLoading.value = true;
    const params = {
      ...formData.value,
      supStatus: 0,
    };
    const isEdit = props.mode === "edit";
    // 构建参数
    const saveParams =
      isEdit && props.supplierId
        ? { ...params, id: Number(props.supplierId) }
        : params;

    const res = isEdit
      ? await supplierApi.editSupplier(saveParams)
      : await supplierApi.addSupplier(saveParams);

    if (res.code === 200) {
      const savedId = isEdit ? Number(props.supplierId) : res.data;
      ElMessage.success("提交成功");
      emit("save-success", savedId);
    }
  } catch (error) {
    console.log("表单验证失败：", error);
  } finally {
    submitLoading.value = false;
  }
};

// 获取供应商类别数据
const getSupplierTypeList = async () => {
  const res = await supTypeApi.getSupTypeList({ supTypeName: "" });
  if (res.code === 200) {
    supplierTypeList.value = buildTree(res.data || []);
  }
};
// 初始化数据字典数据
const initDictData = async () => {
  await loadDicts();
  supNatureList.value = getDictList(dictMapping.enterpriseNature); // 企业性质
  taxNatureList.value = getDictList(dictMapping.taxType); // 纳税类型
  sourceTypeList.value = getDictList(dictMapping.supplierSource); // 供应商来源
  legalCardTypeList.value = getDictList(dictMapping.legalCardType); // 法人证件类型
};

onMounted(() => {
  getSupplierTypeList();
  initDictData();
});
</script>

<style scoped lang="scss">
.basic-infor-form {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 6px;
  overflow: hidden;
}

.form-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 30px 30px 0 30px;
}

.adapt-form {
  width: 100%;
}

.btn-row {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid #eef2f6;
  background: #ffffff;
  flex-shrink: 0;
  gap: 12px;

  .el-button {
    min-width: 88px;
  }
}
</style>
