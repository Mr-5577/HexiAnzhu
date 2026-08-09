<template>
  <div class="supplement-contract-form">
    <!-- ============ 顶部操作栏 ============ -->
    <BillHeader
      :title="'补充合同审批'"
      :contract-no="formData.addSysNo || ''"
      :submitter="formData.userName || ''"
      :submit-time="formData.createDate || ''"
      :status="billData.status || 0"
      :show-status="true"
      :button-loading="submitLoading"
      :save-disabled="isReadonly"
      :submit-disabled="isReadonly"
      :delete-disabled="isDetail || isAdd || !!billData.status"
      :void-disabled="isDetail || isAdd || !!billData.status"
      :view-disabled="isAdd"
      @save="handleFormDataSave"
      @submit="handleFormDataSubmit"
      @delete="handleDelete"
      @void="handleCancel"
      @viewFlow="handleViewProcess"
    />
    <div class="form-scroll-area">
      <el-form
        ref="formRef"
        :disabled="isReadonly"
        :validate-on-rule-change="false"
        :model="formData"
        :rules="formRules"
        label-width="130px"
        class="adapt-form"
      >
        <!-- ====== 卡片1：单据信息 ====== -->
        <BillInfo
          v-model="formData"
          :status="billData?.status || 0"
          :disabled="isReadonly"
          :project-options="projectOptions"
          @project-change="changeProject"
        />

        <!-- ====== 卡片2：主合同信息 ====== -->
        <FormCard
          id="card-main"
          icon="📄"
          title="主合同信息"
          v-model:collapsed="collapsedCards.basic"
        >
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
              <el-form-item label="主合同名称" prop="mainConId">
                <PickInput
                  v-model="formData.mainConName"
                  placeholder="请选择主合同"
                  :readonly="isReadonly"
                  v-model:model-value-id="formData.mainConId"
                  @pick="openMainConDialog"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="合同类型" prop="conProperty" required>
                <EnumSelect
                  v-model="formData.conProperty"
                  :options="ConPropertyEnum"
                  placeholder=""
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item prop="conTypeId" label="合同分类" required>
                <ConTypeSelector
                  v-model="formData.conTypeId"
                  :show-all-levels="false"
                  placeholder=""
                  style="width: 100%"
                  :width="'100%'"
                  clearable
                  filterable
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
              <el-form-item label="签约公司" prop="compName" required>
                <el-input
                  v-model="formData.compName"
                  clearable
                  placeholder=""
                  disabled
                />
              </el-form-item>
            </el-col>

            <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
              <el-form-item label="供应商名称" prop="supName" required>
                <el-input
                  v-model="formData.supName"
                  clearable
                  placeholder=""
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24" v-show="isJianAn">
            <el-col v-if="isJianAn" :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
              <el-form-item label="楼栋范围" prop="mainBldNames" required>
                <SelectWithAll
                  v-model="formData.mainBldIds"
                  v-model:labelText="formData.mainBldNames"
                  select-all
                  multiple
                  :options="buildingOptions.map((i) => ({ value: i.id, label: i.bldName }))"
                  placeholder="请选择楼栋"
                  style="width: 100%"
                  disabled
                >
                  <el-option
                    v-for="item in buildingOptions"
                    :key="item.id"
                    :label="item.bldName"
                    :value="item.id"
                  />
                </SelectWithAll>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="计价方式" prop="priceType" required>
                <el-select
                  v-model="formData.priceType"
                  :disabled="true"
                  placeholder=""
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in PriceTypeEnum"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="产值确认方式" prop="payMethod" required>
                <el-select
                  v-model="formData.payMethod"
                  :disabled="true"
                  placeholder=""
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in PayTypeEnum"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </FormCard>

        <!-- ====== 卡片3：补充信息 ====== -->
        <FormCard
          id="card-add"
          icon="📄"
          title="补充合同信息"
          v-model:collapsed="collapsedCards.basic"
        >
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
              <el-form-item label="补充合同名称" prop="addName" required>
                <el-input
                  v-model="formData.addName"
                  :disabled="isDetail"
                  clearable
                  placeholder="请输入补充合同名称"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="补充合同类型" prop="addType" required>
                <el-select
                  v-model="formData.addType"
                  :disabled="isDetail"
                  placeholder="请选择补充合同类型"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in AddTypeEnum"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="系统编号" prop="addSysNo">
                <el-input
                  v-model="formData.addSysNo"
                  disabled
                  placeholder=""
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col v-if="isJianAn" :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
              <el-form-item label="楼栋范围" prop="bldNames" required>
                <SelectWithAll
                  v-model="formData.bldIds"
                  v-model:labelText="formData.bldNames"
                  select-all
                  multiple
                  :options="buildingOptions.map((i) => ({ value: i.id, label: i.bldName }))"
                  placeholder="请选择楼栋"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in buildingOptions"
                    :key="item.id"
                    :label="item.bldName"
                    :value="item.id"
                  />
                </SelectWithAll>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="补充合同简述" prop="remark" required>
                <el-input
                  v-model="formData.remark"
                  :disabled="isDetail"
                  type="textarea"
                  :rows="3"
                  maxlength="500"
                  show-word-limit
                  placeholder="其他需要补充说明的信息"
                />
              </el-form-item>
            </el-col>
          </el-row>

        </FormCard>

        <!-- ====== 卡片4：签约信息 ====== -->
        <FormCard
          id="card-sign"
          icon="📄"
          title="签约信息"
          v-model:collapsed="collapsedCards.basic"
        >
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="是否需要用印" prop="needSeal" required>
                <el-select
                  v-model="formData.needSeal"
                  :disabled="isDetail"
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <el-option label="是" :value="true" />
                  <el-option label="否" :value="false" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="印章类型" prop="sealTypes">
                <el-select
                  v-model="formData.sealTypes"
                  :disabled="isDetail || !formData.needSeal"
                  multiple
                  collapse-tags
                  placeholder="请选择印章类型"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in SealTypesEnum"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="签订日期" prop="signDate" required>
                <el-date-picker
                  v-model="formData.signDate"
                  :disabled="isDetail"
                  type="date"
                  placeholder="请选择签订日期"
                  style="width: 100%"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="签约地点" prop="signAddr">
                <el-input
                  v-model="formData.signAddr"
                  :disabled="isDetail"
                  placeholder="请输入签约地点"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="甲方经办人" prop="agentId" required>
                <el-cascader
                  ref="projCascaderRef"
                  v-model="formData.agentId"
                  :options="empTreeOptions"
                  :show-all-levels="false"
                  :props="{
                    expandTrigger: 'click',
                    emitPath: false,
                    checkStrictly: false,
                    value: 'orgId',
                    label: 'orgName',
                    children: 'children',
                    leaf: (data) => data.dataType === 0,
                  }"
                  placeholder="请选择经办人"
                  style="width: 100%"
                  clearable
                  filterable
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="供应商联系人" prop="supCmanName">
                <el-input
                  v-model="formData.supCmanName"
                  :disabled="isDetail"
                  placeholder="请输入联系人姓名"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="联系人电话" prop="supCmanTel">
                <el-input
                  v-model="formData.supCmanTel"
                  :disabled="isDetail"
                  placeholder="请输入联系电话"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="联系人身份证" prop="supCmanIdno">
                <el-input
                  v-model="formData.supCmanIdno"
                  :disabled="isDetail"
                  placeholder="请输入身份证号码"
                />
              </el-form-item>
            </el-col>

          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="联系人职务" prop="supCmanJob">
                <el-input
                  v-model="formData.supCmanJob"
                  :disabled="isDetail"
                  placeholder="请输入职务"
                />
              </el-form-item>
            </el-col>
          </el-row>

        </FormCard>

        <!-- ====== 卡片5：价款信息 ====== -->
        <FormCard
          id="card-price"
          icon="💰"
          title="价款及税率"
          v-model:collapsed="collapsedCards.price"
        >
          <SummaryBar :items="summaryItems" />
          <DetailTableCard
            title="价税明细"
            :count="priceTable.length"
            add-text="新增价税明细"
            v-model="priceTable"
            :columns="priceColumns"
            @add="addPrice"
          >
            <template #actions="{ row }">
              <el-button link type="danger" @click="deletePrice(row)">
                删除
              </el-button>
            </template>
          </DetailTableCard>
        </FormCard>

        <!-- ====== 卡片6：明细事项 ====== -->
        <FormCard
          id="card-process"
          v-show="showProcess"
          icon="📊"
          title="事项明细"
          v-model:collapsed="collapsedCards.process"
        >
          <DetailTableCard
            title="事项明细"
            :count="tableList.length"
            add-text="新增事项"
            v-model="tableList"
            :show-summary="true" 
            :columns="processColumns"
            @add="addProcess"
          >
            <!-- ========= 表格上方额外按钮 ========= -->
            <template #header-extra>
              <el-button type="success" size="small" @click="handleLinkVisa">🔗关联签证</el-button>
              <el-button type="primary" size="small" plain @click="handleLinkChange">📄关联变更</el-button>
            </template>
            <template #actions="{ row }">
              <el-button link type="danger" @click="deleteProcess(row)">
                删除
              </el-button>
            </template>
          </DetailTableCard>
        </FormCard>

        <!-- ====== 卡片7：补充合同附件 ====== -->
        <FormCard
          id="card-annex"
          icon="📎"
          title="补充合同附件"
          v-model:collapsed="collapsedCards.annex"
        >
          <el-form-item label="补充合同正文及附件" required>
            <base-upload
              v-model:file-list="annexContractFileList"
              :limit="9"
              :multiple="false"
              :showIcon="true"
              :showTip="true"
              :maxSize="20"
              :unrestricted="true"
              :accept="''"
              button-text="选择文件"
              size="default"
              :disabled="isReadonly"
              @success="handleUploadConSuccess"
            />
          </el-form-item>
          <el-form-item label="其他附件">
            <base-upload
              v-model:file-list="annexFileList"
              :limit="9"
              :multiple="false"
              :showIcon="true"
              :showTip="true"
              :maxSize="20"
              :unrestricted="true"
              :accept="''"
              button-text="选择文件"
              size="default"
              :disabled="isReadonly"
              @success="handleUploadOtherSuccess"
            />
          </el-form-item>
        </FormCard>
      </el-form>
    </div>

    <!-- ============ 悬浮定位栏 ============ -->
    <FloatNav :items="visibleNavCards" />
  </div>
  <!-- 选择合同弹窗 -->
  <choose-contract-dialog
    ref="contractDialogRef"
    v-model="mainConDialogVisible"
    :selectionMode="'single'"
    :projId = formData.projId
    @select="handleMainConSelect"
  />

  <!-- 选择变更弹窗 (已归档、无需签证、未转补充合同的变更)-->
  <choose-change-dialog
    ref="contractDialogRef"
    v-model="changeDialogVisible"
    :selectionMode="'single'"
    :conId = formData.mainConId
    :isToAdd="false"
    :needVisa="false"
    :status="40"  
    @select="handleChangeSelect"
  />

  <!-- 选择签证弹窗(已归档、未转补充合同) -->
  <choose-visa-dialog
    ref="contractDialogRef"
    v-model="visaDialogVisible"
    :selectionMode="'single'"
    :conId = formData.mainConId
    :isToAdd="false"
    :status="40"  
    @select="handleVisaSelect"
  />
</template>


<script setup lang="ts">
// ===================== 依赖导入 =====================
// 框架 / 第三方
import {
  ElMessage,
  ElMessageBox,
} from "element-plus";
import { useRouter } from "vue-router";
import { ref, computed, watch, onMounted, nextTick } from "vue";
import { v4 as uuidv4 } from "uuid";

// 工具 / 常量 / 类型
import { dateUtil, getDaysDiff } from "@/utils/date-util";
import { dictMapping } from "@/utils/dict-mapping";
import { buildTree } from "@/utils/tree";
import { formType } from '@/types/form/form-types.ts'
import {
  ConPropertyEnum,
  PriceTypeEnum,
  PayTypeEnum,
  SealTypesEnum,
  AddTypeEnum,
} from "@/constants/contract-manage/enums";

// API
import { conTypeApi } from "@/api/cost/master-data/contract-category-api";
import { supplierApi } from "@/api/cost/supplier/supplier-ledger-api";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";
import { commonApi } from "@/api/cost/common-api";
import { manageunitApi } from "@/api/cost/master-data/management-unit-api";
import { contractLedgerApi } from "@/api/cost/contract-manage/contract-ledger-api";
import { supplementContractApi } from "@/api/cost/contract-manage/supplement-contract-api";
import { roleApi } from "@/api/system/role-api.ts";
import { visaManagementApi } from "@/api/cost/contract-manage/visa-management-api";

// 组合式函数 / 状态仓库
import { useDict } from "@/composables/use-dict";
import { useUserStore } from "@/stores/user-store";
import { useMDStore } from "@/stores/md-store.ts";
import { useTagsStore } from "@/stores/tags-store";
import { loadOptions } from "@/composables/use-options-loader.ts";
import { useFormLayout } from "@/composables/use-form-layout.ts";
import { useTableEditor } from "@/composables/use-table-editor.ts";
import { SupplementConMain } from "@/types/cost/contract-manage/supplement-contract-type.ts";

// 组件
import FormCard from "@/components/base/base-form-card.vue";
import PickInput from "@/components/base/base-pick-input.vue";
import EnumSelect from "@/components/base/base-enum-select.vue";
import DetailTableCard from "@/components/base/detail-table-card.vue";
import FloatNav from "@/components/base/base-float-nav.vue";
import EditableTable from "@/components/base/editable-table.vue";
import type { EditableColumn } from "@/components/base/editable-table.vue";
import ChooseContractDialog from "@/components/business/choose-contract-dialog.vue";
import ChooseVisaDialog from "@/components/business/choose-cost-visa-dialog.vue";
import ChooseChangeDialog from "@/components/business/choose-cost-change-dialog.vue";
import { NAV_CARDS, createPriceColumns, createProcessColumns } from "./supplement-contract-config.ts";
import { bankCardRule, moneyRule, optionalInputRule, phoneRule, requiredInputRule, requiredRule } from "@/utils/form-rule-validate.ts";

// ===================== Props / Emits =====================
const props = defineProps<{
  mode: "add" | "edit" | "detail";
  projId?: number; // 项目ID
  conId: number; // 合同ID
  addId?: number; // 补充合同ID
}>();
const emit = defineEmits<{
  success: [];
  cancel: [];
}>();

const isDetail = computed(() => props.mode === "detail");
const isEdit = computed(() => props.mode === "edit");
const isAdd = computed(() => props.mode === "add");
const conMainId = ref<number | undefined>(props.conId);
const conAddId = ref<number | undefined>(props.addId);

// ===================== 路由 / 状态仓库 =====================
const router = useRouter();
const userStore = useUserStore();
const mdStore = useMDStore();
const tagsStore = useTagsStore();

// ===================== 单据 / 流程状态 =====================
const billData = ref({
  id: undefined,
  bizTitle: "",
  bizNo: "",
  status: 0,
  bizItemCode: formType.CON_ADD,
  flowId: null,
});

const conMainData = ref<SupplementConMain>(null);
const flowListData = ref<any>(null);
const flowBaseData = ref<any>(null);

const isReadonly = computed(
  () => isDetail.value || !!billData.value.status,
);

// ===================== 下拉 / 字典数据 =====================
const projectOptions = ref<any[]>([]);
const companyOptions = ref([]); // 签约公司选项
const conTypeOptions = ref([]); // 合同分类选项
const supplierOptions = ref([]); // 供应商选项
const buildingOptions = ref([]); // 楼栋选项
const proProfOptions = ref([]); // 生产专业列表
const empTreeOptions = ref<any[]>([]); // 组织及人员
const visaList = ref([]); // 签证单据列表

// 数据字典
const { getDictList, loadDicts } = useDict([dictMapping.proProf], {
  treeDictCodes: [],
});

// ===================== 工具 computed：建安类判断 =====================
const JIAN_AN_CODE = "2";
const normalizeCode = (c: any) =>
  c == null ? "" : String(c).replace(/^0+(?=\d)/, "");

// 从分类树反查 targetId 所属顶级节点的 code
const getRootCodeOf = (targetId: any): string | undefined => {
  if (targetId == null) return undefined;
  const list: any[] = conTypeOptions.value ?? [];
  // ✅ 先找到当前节点（支持深层查找）
  const findNodeById = (nodes: any[], id: any): any => {
    for (const node of nodes) {
      if (String(node.id) === String(id)) return node;
      if (node.children?.length) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return undefined;
  };

  // ✅ 从当前节点向上查找顶级节点
  const findTopLevelNode = (startNode: any): any => {
    let current = startNode;

    // 递归向上查找，直到找到顶级节点（parentId为0或null）
    while (current) {
      // 判断是否为顶级节点
      if (current.pid === 0 || current.pid === null || current.pid === undefined) {
        return current;
      }

      // 继续向上查找父节点
      current = findNodeById(list, current.pid);
    }

    return startNode; // 如果没找到顶级节点，返回自身
  };

  let cur = findNodeById(list, targetId);
  const topLevelNode = cur ? findTopLevelNode(cur) : undefined;
  return topLevelNode?.conTypeCode; // 到顶了，取 code
};

const isJianAn = computed(() => {
  if (!formData.value.conTypeId) {
    return false;
  }
  const id = formData.value.conTypeId;
  if (id == null) return false;
  const code = getRootCodeOf(id);
  return code != null && normalizeCode(code) === normalizeCode(JIAN_AN_CODE);
});

// 悬浮定位栏已封装为 FloatNav 组件，内部自管 IntersectionObserver
const { collapsedCards, toggleCard, formatMoney } = useFormLayout(NAV_CARDS);

// ===================== 表单初始值 / 表单状态 =====================
// 初始化表单数据
const initFormData = () => ({
  id: null,
  segId: null,
  segName: null,
  segNo: null,
  bizTitle:"",
  flowId:null,
  addName: "", // 补充合同名称
  companyId: null, // 主合同签约公司
  compName: null,
  addSysNo: "", // 合同系统编号
  addPhyNo: "", // 合同物理编号
  addType: null, // 补充合同类型
  conTypeId: null, // 主合同分类
  conProperty: null, // 主合同类型
  supId: null, // 主合同供应商
  priceType: null, // 计价方式
  bldIds: [], // 楼栋ID列表
  bldNames: "", // 楼栋名称
  payMethod: null, // 付款方式
  addAmt: 0, // 签约金额
  addExclAmt: 0, // 不含税金额
  taxAmt: 0, // 税额
  signDate: "", // 签订日期
  needSeal: true, // 是否盖章
  sealTypes: [], // 印章类型
  signAddr: "", // 签署地点
  supCmanName: "", // 联系人姓名
  supCmanIdno: "", // 联系人身份证
  supCmanTel: "", // 联系人电话
  supCmanJob: "", // 联系人职务
  bankName: "",
  accountName: "",
  bankAccount: "",
  remark: "", // 备注
  userName: userStore.userInfo?.empName,
  createDate: dateUtil().format("YYYY-MM-DD"),
  projId: props.projId,
  mainConId: props.conId,
  agentId: userStore.userInfo.id,
  deptName: userStore.userInfo?.deptName,
  mguName: userStore.userInfo?.mguName,
  mainConName: "",
  supName: "",
  mainBldIds: [],
  mainBldNames: "",
});

const formData = ref(initFormData());
const formRef = ref<any>(null);
const submitLoading = ref(false);
const tableLoading = ref(false);
const tableList = ref([]);
const processColumns = createProcessColumns();
const priceColumns = createPriceColumns();
const priceTable = ref<any[]>([]);
const annexContractFileList = ref<any[]>([]);
const annexFileList = ref<any[]>([]);

const { addRow: addPrice, deleteRow: deletePrice } = useTableEditor(
  priceTable,
  () => ({
    id: null,
    conBillId: conAddId.value,
    itemName: "",
    itemAmt: 0,
    itemTaxRate: 0,
    itemExclAmt: 0,
    itemTaxAmt: 0,
    remark: "",
  }),
);
const { addRow: addProcess, deleteRow: deleteProcess } = useTableEditor(
  tableList,
  () => ({
    id: null,
    conBillId: conAddId.value,
    srcType: 2,
  }),
);

// ===================== 表单校验规则 =====================
const formRules = ref({
  bizTitle: requiredInputRule("标题"),
  projId: requiredRule("项目"),
  mainConId: requiredRule("主合同"),
  addName: requiredInputRule("补充合同名称"),
  addType: requiredRule("补充合同类型"),
  addSysNo: requiredInputRule("补充合同编号"),
  companyId: requiredRule("签约公司"),
  supId: requiredRule("供应商"),
  bldNames: requiredInputRule("楼栋范围"),
  remark: requiredInputRule("补充合同简述"),
  addAmt: moneyRule("补充合同金额"),
  addExclAmt: moneyRule("补充合同不含税金额"),
  taxAmt: moneyRule("补充合同税额"),
  signDate: requiredRule("签订日期"),
  needSeal: requiredRule("是否用印"),
  sealTypes: requiredRule("印章类型"),
  signAddr: requiredInputRule("签约地点"),
  supCmanName: requiredInputRule("联系人姓名"),
  supCmanTel: phoneRule("联系人电话"),
  supCmanJob: optionalInputRule("联系人职务"),
  bankName: optionalInputRule("开户银行"),
  accountName: optionalInputRule("银行户名"),
  bankAccount: bankCardRule("银行账号"),
});

// ---- 校验明细表 ----
  const validatePriceTable = () => {
    if (priceTable.value.length === 0) {
      ElMessage.error("价税明细列表不能为空");
      return false;
    }
    for (let i = 0; i < priceTable.value.length; i++) {
      const item = priceTable.value[i];
      if (!item.itemName || item.itemName.trim() === "") {
        ElMessage.error(`价税明细列表第${i + 1}行：分项名称不能为空`);
        return false;
      }
    }
    return true;
  };

 // 需求8：支付明细所有列均为必填
  const validateProcessTable = () => {
    if (!showProcess.value) {
      tableList.value = [];
      return true; // 不显示支付比例时不校验
    }
    if (tableList.value.length === 0) {
      ElMessage.error("事项明细列表不能为空");
      return false;
    }
    for (let i = 0; i < tableList.value.length; i++) {
      const item = tableList.value[i];
      if (!item.processName) {
        ElMessage.error(`事项明细列表第${i + 1}行：请填写事项名称！`);
        return false;
      }
      if (!item.processAmt) {
        ElMessage.error(`事项明细列表第${i + 1}行：请填写事项含税金额！`);
        return false;
      }
    }
    return true;
  };

  // =====================校验事项明细含税金额 = 价税明细含税金额 =====================
const validateProcessAmountMatch = (): boolean => {
  if (!showProcess.value)
    return true;

  // 事项明细含税金额之和
  const processTotal = tableList.value.reduce(
    (sum, item) => sum + (Number(item.processAmt) || 0),
    0,
  );
  // 价税明细含税金额之和
  const priceTotal = priceTable.value.reduce(
    (sum, item) => sum + (Number(item.itemAmt) || 0),
    0,
  );

  // 保留两位小数后比较，避免浮点误差
  const p = Math.round(processTotal * 100) / 100;
  const pr = Math.round(priceTotal * 100) / 100;

  if (p !== pr) {
    ElMessage.warning(
      `事项明细含税金额合计（¥${p.toFixed(2)}）与价税明细含税金额合计（¥${pr.toFixed(2)}）不一致，请核对后再提交`,
    );
    return false;
  }
  return true;
};


// ===================== 校验失败辅助 =====================
// ---- 校验失败后：滚动到第一个错误项并聚焦对应控件 ----
const focusFirstError = (invalidFields?: Record<string, any>) => {
  const firstProp = Object.keys(invalidFields ?? {})[0];
  if (!firstProp) return;
  const formInst = formRef.value as any;
  const field = formInst?.fields?.find((f: any) => f.prop === firstProp);
  const el = field?.$el as HTMLElement | undefined;
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  nextTick(() => {
    const focusable = el.querySelector<HTMLElement>(
      'input:not([type="hidden"]), textarea, .el-select__wrapper, .el-date-editor input, [tabindex]',
    );
    focusable?.focus({ preventScroll: true });
  });
};

// ===================== 价款汇总（computed） =====================
// ---- 价款汇总（computed 追踪 priceTable 变化）----
const priceTaxData = computed(() => calculatePriceTaxData());

function calculatePriceTaxData() {
  if (!priceTable.value || priceTable.value.length === 0) {
    return { totalPriceTax: 0, totalPrice: 0, taxAmount: 0, taxRate: 0 };
  }
  const result = priceTable.value.reduce(
    (acc, item) => {
      const amt = Number(item.itemAmt) || 0;
      const exclAmt = Number(item.itemExclAmt) || 0;
      const tax = Number(item.itemTaxAmt) || 0;
      const rate = Number(item.itemTaxRate) || 0;
      return {
        totalPriceTax: acc.totalPriceTax + amt,
        totalPrice: acc.totalPrice + exclAmt,
        taxAmount: acc.taxAmount + tax,
        taxRate: rate > 0 ? Math.max(acc.taxRate, rate) : acc.taxRate,
      };
    },
    { totalPriceTax: 0, totalPrice: 0, taxAmount: 0, taxRate: 0 },
  );
  const finalTaxRate =
    result.taxRate > 0 ? Math.round(result.taxRate * 100) / 100 : 0;
  return {
    totalPriceTax: Math.round(result.totalPriceTax * 100) / 100,
    totalPrice: Math.round(result.totalPrice * 100) / 100,
    taxAmount: Math.round(result.taxAmount * 100) / 100,
    taxRate: finalTaxRate,
  };
}

// 价款汇总条数据
const summaryItems = computed(() => [
  { label: "合同总价(含税)", value: `¥ ${formatMoney(priceTaxData.value.totalPriceTax)}` },
  { label: "合同总价(不含税)", value: `¥ ${formatMoney(priceTaxData.value.totalPrice)}` },
  { label: "税额", value: `¥ ${formatMoney(priceTaxData.value.taxAmount)}`, type: "tax" as const },
  { label: "综合税率", value: `${priceTaxData.value.taxRate}%`, type: "tax" as const },
]);

// ===================== 监听器 =====================
// ---- 价税明细自动计算 ----
watch(
  () =>
    priceTable.value.map((item) => `${item.itemAmt}-${item.itemTaxRate}`),
  () => {
    priceTable.value.forEach((item) => {
      const amt = Number(item.itemAmt) || 0; // ← 确认这行存在
      const rate = Number(item.itemTaxRate) || 0; // ← 确认这行存在
      if (amt > 0 && rate >= 0) {
        item.itemExclAmt =
          Math.round((amt / (1 + rate / 100)) * 100) / 100;
        item.itemTaxAmt =
          Math.round((amt - item.itemExclAmt) * 100) / 100;
      }
    });
  },
);

// watch needSeal 为否时清空 sealTypes
watch(() => formData.value.needSeal, (val) => {
  if (!val) formData.value.sealTypes = [];
});

watch(
  () => formData.value.needSeal,
  (newVal) => {
    if (!newVal) {
      formData.value.sealTypes = [];
    }
  },
);

// showProcess computed
const showProcess = computed(() => {
  const item = AddTypeEnum.find(item => item.value === formData.value.addType);
  return !item || item.value === 1;
});
const visibleNavCards = computed(() =>
  showProcess.value ? NAV_CARDS : NAV_CARDS.filter(card => card.id !== "card-process")
);

// ===================== 附件上传 =====================
// ---- 附件上传 ----
const handleUploadConSuccess = (file: any) => {
  annexContractFileList.value.push(file);
};
const handleUploadOtherSuccess = (file: any) => {
  annexFileList.value.push(file);
};

// ===================== 交互事件 =====================
// 选择签证
const visaDialogVisible = ref(false);
const handleLinkVisa = async () => {
  if (isDetail.value) return;
  visaDialogVisible.value = true;
}
const handleVisaSelect = (data) => {
  if (data && data.length > 0) {
    let newData = data || [];
    const selected = newData[0];
    // 去重：合同已存在于明细中则提示并跳过
    const exists = tableList.value.some((item) => (item.src_id === selected.visaId && item.srcType === 0));
    if (exists) {
      ElMessage.warning(`签证「${selected.visaName}」已在事项明细中，不可重复关联`);
      return;
    }
    addProcess()
    if (tableList.value.length>0) {
      tableList.value[tableList.value.length-1].srcType = 0;//签证
      tableList.value[tableList.value.length-1].src_id = selected.visaId;
      tableList.value[tableList.value.length-1].src_apply_id = selected.createId;
      tableList.value[tableList.value.length-1].src_apply_date = selected.createDate;
      tableList.value[tableList.value.length-1].process_name = selected.visaName;
      tableList.value[tableList.value.length-1].process_amt = selected.auditReviewAmt;
      tableList.value[tableList.value.length-1].process_excl_amt = selected.auditReviewAmt;
      tableList.value[tableList.value.length-1].remark = selected.remark;
    }
  }
};

// 选择变更
const changeDialogVisible = ref(false);
const handleLinkChange = async () => {
  if (isDetail.value) return;
  changeDialogVisible.value = true;
}
const handleChangeSelect = (data) => {
  if (data && data.length > 0) {
    let newData = data || [];
    const selected = newData[0];
    // 去重：合同已存在于明细中则提示并跳过
    const exists = tableList.value.some((item) => (item.src_id === selected.changeId && item.srcType === 1));
    if (exists) {
      ElMessage.warning(`变更「${selected.visaName}」已在事项明细中，不可重复关联`);
      return;
    }
    debugger
    addProcess()
    if (tableList.value.length>0) {
      tableList.value[tableList.value.length-1].srcType = 1;//变更
      tableList.value[tableList.value.length-1].srcId = selected.changeConId;
      tableList.value[tableList.value.length-1].srcApplyId = selected.createId;
      tableList.value[tableList.value.length-1].visaApplyDate = selected.createDate;
      tableList.value[tableList.value.length-1].processName = selected.changeName;
      tableList.value[tableList.value.length-1].processAmt = selected.estChangeAmt;
      tableList.value[tableList.value.length-1].processExclAmt = selected.estChangeAmt;
      tableList.value[tableList.value.length-1].remark = selected.remark;
    }
  }
};

const changeProject = async (value: number) => {
  if (value) {
    const res = await projectAreaApi.getInfoByProjId({ id: value });
    if (res.code === 200 && res.data) {
      const { compName, compId, segId, segName,segNo } = res.data;
      formData.value.segId = segId || "";
      formData.value.segName = segName || "";
      formData.value.segNo = segNo || "";
      formData.value.companyId = null;
      formData.value.compName = "";
      formData.value.bldIds = [];
      formData.value.bldNames = "";
      formData.value.mainConId = null;
      formData.value.mainConName = "";
      tableList.value=[];
      if (value) {
        await getBuildingListByProjId(value);
        await getCompanyListByProjId(value);
      }

      // 程序化重置了若干字段，清除误报的必填红
      await nextTick();
      formRef.value?.clearValidate();
    }
  }
};

// ---- 主合同选择 ----
const mainConDialogVisible = ref(false);
const openMainConDialog = () => {
  if (isDetail.value) return;
  mainConDialogVisible.value = true;
};
const handleMainConSelect = (data) => {
  if (data && data.length > 0) {
    let newData = data || [];
    if (formData.value.supId != newData[0].id) {
      formData.value.mainConId = newData[0].id;
      formData.value.mainConName = newData[0].conName;
      getConMainData(formData.value.mainConId);
    }
  }
};

const handleCancel = async () => {
  ElMessageBox.confirm("确定要作废吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    try {
      const res = await supplementContractApi.voidSupplementContract(formData.value.id,);
      if (res.code === 200) {
        ElMessage.success("作废成功");
        goBack();
      }
    } catch (error) {
      console.error("作废失败:", error);
    }
  });
};

const handleViewProcess = async () => {
  if (flowListData.value && flowListData.value?.wfFlowId) {
    try {
      const redirectRes = await commonApi.generateRedirectUrl({
        oaRequestId: flowListData.value.wfFlowId,
      });
      if (redirectRes.code === 200 && redirectRes.data) {
        window.open(redirectRes.data, "_blank");
      }
    } catch (error) {
      console.error("查看流程失败:", error);
    }
  } else {
    ElMessage.warning("暂无流程信息");
  }
};

const handleDelete = async () => {
  ElMessageBox.confirm("确定要删除吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    try {
      const res = await supplementContractApi.delSupplementContract(formData.value.id);
      if (res.code === 200) {
        ElMessage.success("删除成功");
        goBack();
      }
    } catch (error) {
      console.error("删除失败:", error);
    }
  });
};

const buildSubmitParams = () => {
    return {
      conMain: {
        ...conMainData.value,
        id: formData.value.mainConId,
      }, 
      bill: {
        ...billData.value,
        id: billData.value.id || undefined,
        bizTitle: formData.value.bizTitle,
        bizItemCode: formType.CON_ADD,
        segId: formData.value.segId,
        segName: formData.value.segName,
        segNo: formData.value.segNo,
        projId: formData.value.projId,
        compId: formData.value.companyId,
        compName: formData.value.compName,
        flowId:formData.value.flowId,
      },
      conAdd: {
        id: formData.value.id,
        conBillId: props.conId,
        addName: formData.value.addName,
        companyId: formData.value.companyId,
        addSysNo: formData.value.addSysNo,
        addPhyNo: formData.value.addPhyNo,
        addType: formData.value.addType,
        conTypeId: formData.value.conTypeId,
        conProperty: formData.value.conProperty,
        supId: formData.value.supId,
        priceType: formData.value.priceType,
        bldIds: formData.value.bldIds?.join(",") || "",
        bldNames: formData.value.bldNames,
        payMethod: formData.value.payMethod,
        addAmt: priceTaxData.value.totalPriceTax,
        addExclAmt: priceTaxData.value.totalPrice,
        taxAmt: priceTaxData.value.taxAmount,
        signDate: formData.value.signDate,
        agentId: formData.value.agentId,
        taxRate: priceTaxData.value.taxRate,
      },
      conAddExt: {
        id: formData.value.id,
        conBillId: props.conId,
        addId: formData.value.id,
        needSeal: formData.value.needSeal,
        sealTypes: formData.value.sealTypes?.join(",") || "",
        signAddr: formData.value.signAddr || "",
        supCmanName: formData.value.supCmanName || "",
        supCmanIdno: formData.value.supCmanIdno || "",
        supCmanTel: formData.value.supCmanTel || "",
        supCmanJob: formData.value.supCmanJob || "",
        remark: formData.value.remark || "",
      },
      addProcesses: formData.value.addType == 1 ? tableList.value : [],
      billPrices: priceTable.value,
      annexContractList: annexContractFileList.value || [],
      annexList: annexFileList.value || [],
    };
  };

const handleFormDataSave = async () => {
  submitLoading.value = true;
  try {
    await formRef.value.validateField(["bizTitle","addName"]); 

    const params = buildSubmitParams()
    const res = await supplementContractApi.editSupplementContract(params);
    if (res.code === 200 && res.data) {
      formData.value.id = res.data;
      conAddId.value = formData.value.id;
      ElMessage.success("保存成功");
      await getSupplementContractDetail();
    }
  } catch (error) {
    focusFirstError(error as Record<string, any>);
  } finally {
    submitLoading.value = false;
  }
};

const handleFormDataSubmit = async () => {
  submitLoading.value = true;
  try {
    await formRef.value.validate();
    // 校验各个明细表
    if (!validatePriceTable()) return;
    if (!validateProcessTable()) return;
    if (!validateProcessAmountMatch()) return;   // ← 加这一行

    const params = buildSubmitParams()
    let res;
    if (formData.value.id) {
      res = await supplementContractApi.submitSupplementContract(params);
    } else {
      res = await supplementContractApi.editSupplementContract(params);
    }
    if (res.code === 200) {
      ElMessage.success("提交成功,已发起审批！");
      // 生成OA审批页面重定向地址
      const redirectRes = await commonApi.generateRedirectUrl({
        oaRequestId: res.data,
      });
      // 提交成功后，关闭当前页面，跳转到单据列表页面
      goBack();

      if (redirectRes.code === 200 && redirectRes.data) {
        // 打开OA审批页面
        setTimeout(() => {
          window.open(redirectRes.data, "_blank");
        }, 800);
      }
    }
  } catch (error) {
    focusFirstError(error as Record<string, any>);
  } finally {
    submitLoading.value = false;
  }
};

// 返回操作
const goBack = () => {
  if (isAdd.value) {
    tagsStore.closeTagByPath("/con/supplement-contract/add");
  }
  if (isEdit.value) {
    tagsStore.closeTagByPath("/con/supplement-contract/edit");
  }
  router.go(-1); // 返回上个页面
};

// ===================== 数据获取 =====================
// 获取人员树形数据（原代码无 try-catch，保持一致）
const getEmpTreeData = async () => {
  const res = await roleApi.getEmpTree({
    empName: "",
    isIncludeLeave: false,
  });
  if (res.code === 200) {
    empTreeOptions.value = res.data || [];
  }
};

// 获取主合同信息
const getConMainData = async (conId) => {
  if (!conId) return;
  if (conId === formData.value.mainConId) return;
  try {
    const res = await contractLedgerApi.getContractLedgerById({
      id: conId,
    });
    if (res.code === 200 && res.data) {
      const {
        conMain,
      } = res.data;

      if (formData.value.projId != conMain.projId)
        getBuildingListByProjId(conMain.projId);

      formData.value.segId = conMain.segId;
      formData.value.segName = conMain.segName;
      formData.value.segNo = conMain.segNo;
      formData.value.compName = conMain.companyName;
      formData.value.projId = conMain.projId;
      formData.value.companyId = conMain.companyId;
      formData.value.mainConName = conMain.conName;
      formData.value.mainConId = conMain.id;

      formData.value.conTypeId = conMain.conTypeId;
      formData.value.conProperty = conMain.conProperty;
      formData.value.supId = conMain.supId;
      formData.value.supName = conMain.supName;
      formData.value.priceType = conMain.priceType;
      formData.value.payMethod = conMain.payMethod;
      formData.value.mainBldIds = conMain.bldIds ? conMain.bldIds.split(",").map(Number) : [];
      formData.value.mainBldNames = conMain.bldNames;

      formData.value.bldIds = conMain.bldIds ? conMain.bldIds.split(",").map(Number) : [];
      formData.value.bldNames = conMain.bldNames;

      if (formData.value.supId) {
        getSupplierContactAndBank(formData.value.supId)
      }
    }
  } catch (error) {
    console.error("获取合同信息失败:", error);
  }
};

const getSupplierContactAndBank = (supId) => {
  //获取供应商联系人
  supplierApi.getDefContactList(supId).then((res) => {
    if (res.code === 200) {
      formData.value.supCmanName = res.data?.contactPerson || "";
      formData.value.supCmanJob = res.data?.jobTitle || "";
      formData.value.supCmanTel = res.data?.contactPhone || "";
      formData.value.supCmanIdno = res.data?.contactCardNo || "";
    }
  })

  //获取供应商银行账号
  supplierApi.getDefBankList(supId).then((res) => {
    if (res.code === 200) {
      formData.value.accountName = res.data?.accountName || "";
      formData.value.bankAccount = res.data?.bankAccount || "";
      formData.value.bankName = res.data?.bankName || "";
    }

  })
}

// 获取签约公司列表
const getCompanyList = async () => {
  try {
    const res = await manageunitApi.getAuthMguList(); // 获取权限内公司列表
    // const res = await manageunitApi.getSegMguList(); // 获取板块-公司树形结构
    if (res.code === 200) {
      companyOptions.value = buildTree(res.data || []);
    }
  } catch (error) {
    console.error("获取签约公司列表失败:", error);
  }
};

// 获取公司列表（含单公司自动选择逻辑）
const getCompanyListByProjId = async (projId: number) => {
  if (!projId) {
    companyOptions.value = [];
    return;
  }
  try {
    const companies = await mdStore.getProjCompanyList(projId);
    companyOptions.value = companies || [];
    if (
      companyOptions.value &&
      companyOptions.value.length === 1 &&
      isAdd.value
    ) {
      formData.value.companyId = companyOptions.value[0].id;
      formData.value.compName = companyOptions.value[0].compName;
    }
  } catch (error) {
    console.error("获取公司列表失败:", error);
    companyOptions.value = [];
  }
};
const getProjectOptions = () =>
  loadOptions(
    () => projectAreaApi.getSegMguProjList(),
    projectOptions,
    "获取项目列表失败:",
  );

// 获取合同分类列表
const getConTypeList = async () => {
  try {
    const res = await conTypeApi.getConTypeList();
    if (res.code === 200) {
      conTypeOptions.value = res.data || [];
    }
  } catch (error) {
    console.error("获取合同分类失败:", error);
  }
};

// 获取供应商列表
const getSupplierList = async () => {
  try {
    const res = await supplierApi.getSupplierList({ supName: "" });
    if (res.code === 200) {
      supplierOptions.value = res.data || [];
    }
  } catch (error) {
    console.error("加载供应商列表失败:", error);
  }
};

// 获取楼栋列表（含回显楼栋名称逻辑）
const getBuildingListByProjId = async (projId: number) => {
  if (!projId) return;
  try {
    buildingOptions.value = [];
    const buildingRes = await projectAreaApi.getBuildingList({ projId });
    if (buildingRes.code === 200) {
      buildingOptions.value = buildingRes.data || [];
      if (formData.value.bldIds && formData.value.bldIds.length > 0) {
        const names = buildingOptions.value
          .filter((v: any) => formData.value.bldIds.includes(v.id))
          .map((v: any) => v.bldName);
        formData.value.bldNames = names.join(",");
      }
    }
  } catch (error) {
    console.error("获取楼栋列表失败:", error);
  }
};


// // 获取签证单据列表
// const getVisaData = async () => {
//   try {
//     const res = await visaManagementApi.getVisaList({
//       conId: props.conId,
//     });
//     if (res.code === 200) {
//       visaList.value = res.data || [];
//     }
//   } catch (error) {
//     console.error("获取签证单据列表失败:", error);
//   }
// };
// 生成合同编号
const createConNo = async () => {
  try {
    // BCBH:补充合同编号前缀
    const conRes = await commonApi.getBillNo({ bizType: formType.CON_ADD });
    if (conRes.code === 200) {
      formData.value.addSysNo = conRes.data;
      formData.value.addPhyNo = conRes.data;
    }
  } catch (error) {
    console.error("生成合同编号失败:", error);
  }
};

// 初始化下拉选项
const initOptions = async () => {
  await getProjectOptions();
  await getCompanyList();
  await getEmpTreeData();
  await getConTypeList();
  await getSupplierList();
};

// 获取补充合同详情
const getSupplementContractDetail = async () => {
  if (!conAddId.value) return;
  try {
    const res = await supplementContractApi.getSupplementContractById(conAddId.value);
    if (res.code === 200 && res.data) {
      const { conMain,bill,conAdd, conAddExt, addProcesses,billPrices, flowList, flowBase,annexList,annexContractList = [] } = res.data;
      billData.value = { ...billData.value, ...bill };
      conMainData.value = { ...conMainData.value, ...conMain }
      flowListData.value = { ...flowListData.value, ...flowList };
      flowBaseData.value = { ...flowBaseData.value, ...flowBase };
      formData.value = {
        id: conAdd.id,
        bizTitle:billData.value.bizTitle,
        flowId:billData.value.flowId,
        segId: conMain.segId,
        addName: conAdd.addName,
        companyId: conAdd.companyId,
        compName: conAdd.companyName,
        addSysNo: conAdd.addSysNo,
        addPhyNo: conAdd.addPhyNo,
        addType: conAdd.addType,
        conTypeId: conAdd.conTypeId,
        conProperty: conAdd.conProperty,
        supId: conAdd.supId,
        priceType: conAdd.priceType,
        bldIds: conAdd.bldIds ? conAdd.bldIds.split(",").map(Number) : [],
        bldNames: conAdd.bldNames,
        payMethod: conAdd.payMethod,
        addAmt: conAdd.addAmt,
        addExclAmt: conAdd.addExclAmt,
        taxAmt: conAdd.taxAmt,
        signDate: conAdd.signDate,
        needSeal: conAddExt?.needSeal ?? false,
        sealTypes: conAddExt?.sealTypes ? conAddExt.sealTypes.split(",") : [],
        signAddr: conAddExt?.signAddr || "",
        supCmanName: conAddExt?.supCmanName || "",
        supCmanIdno: conAddExt?.supCmanIdno || "",
        supCmanTel: conAddExt?.supCmanTel || "",
        supCmanJob: conAddExt?.supCmanJob || "",
        remark: conAddExt?.remark || "",
        userName: conAdd.createName,
        createDate: conAdd.createDate,
        projId: flowBaseData.value.projId,
        mainConId: conMainData.value.id,
        agentId: conAdd.agentId,
        segName: flowBaseData.value.segName,
        segNo: conAdd.segNo,
        deptName: flowBaseData.value.deptName,
        mguName: flowBaseData.value.mguName,
        mainConName: conMainData.value.conName,
        supName: conAdd.supName,
        mainBldIds: conMainData.value.bldIds ? conMainData.value.bldIds.split(",").map(Number) : [],
        mainBldNames: conMainData.value.bldNames,
        bankName: conAdd.bankName,
        accountName: conAdd.accountName,
        bankAccount: conAdd.bankAccount,
      };
      tableList.value = addProcesses?.map((item: any) => ({
        ...item,
        uuid: uuidv4(),
      }));

      priceTable.value = billPrices?.map((item: any) => ({
        ...item,
        uuid: uuidv4(),
      }));
      await getBuildingListByProjId(formData.value.projId);
      await getCompanyListByProjId(formData.value.projId);
      if (annexList && annexList.length > 0) {
        annexFileList.value = annexList.map((item: any) => ({
          ...item,
          name: item.annexName,
          url: item.annexPath,
        }));
      }
      if (annexContractList && annexContractList.length > 0) {
        annexContractFileList.value = annexContractList.map((item: any) => ({
          ...item,
          name: item.annexName,
          url: item.annexPath,
        }));
      }
    }
  } catch (error) {
    console.error("获取补充合同详情失败:", error);
  }
};

// ===================== 初始化 / 生命周期 =====================
// 初始化
const initData = async () => {
  await initOptions();

  if (props.mode === "add") {
    formData.value = {
      ...initFormData(),
    }
    await createConNo();
    await getConMainData(conMainId.value);
    addPrice();
  }

  // await getVisaData();
  if (props.mode === "edit" || props.mode === "detail") {
    await getSupplementContractDetail();
  }
};

onMounted(() => {
  initData();
});

// 暴露方法
defineExpose({
  formData,
  formRef,
  handleFormDataSave,
  handleFormDataSubmit,
});
</script>

<style scoped lang="scss">
.supplement-contract-form {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  border-radius: 8px;
  overflow: hidden;
}

/* ============ 表单滚动区 ============ */
.form-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px 30px;
  box-sizing: border-box;
}

.adapt-form {
  width: 100%;
  margin: 0 auto;

  :deep(.el-form-item) {
    margin-bottom: 16px;
  }

  :deep(.el-form-item__label) {
    font-size: 13px;
    color: #4e5969;
    line-height: 32px;
    padding-right: 12px;
  }

  :deep(.el-input__wrapper),
  :deep(.el-textarea__inner),
  :deep(.el-select__wrapper) {
    border-radius: 4px;
    transition: all 0.2s;
  }

  /* 金额字段 ¥ 前缀 */
  .is-money :deep(.el-input__wrapper) {
    padding-left: 24px;
    position: relative;

    &::before {
      content: "¥";
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: #86909c;
      font-size: 13px;
      pointer-events: none;
      z-index: 1;
    }
  }
}

/* 滚动条美化 */
.form-scroll-area::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.form-scroll-area::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 4px;
}
.form-scroll-area::-webkit-scrollbar-thumb:hover {
  background: #909399;
}
.form-scroll-area::-webkit-scrollbar-track {
  background: transparent;
}
</style>
