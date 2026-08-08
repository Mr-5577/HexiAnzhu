// ============ 合同台账表单 Composable（重构版） ============
// 业务逻辑层，整合拆分后的 useFormLayout / useOptionsLoader / useTableEditor / createContractFormRules
import { ref, computed, watch, onMounted, nextTick } from "vue";
import {
  ElMessage,
  ElMessageBox,
} from "element-plus";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user-store";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api";
import { conTypeApi } from "@/api/cost/master-data/contract-category-api";
import { supplierApi } from "@/api/cost/supplier/supplier-ledger-api";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";
import { contractLedgerApi } from "@/api/cost/contract-manage/contract-ledger-api";
import { commonApi } from "@/api/cost/common-api";
import { manageunitApi } from "@/api/cost/master-data/management-unit-api";
import { buildTree } from "@/utils/tree";
import { useDict } from "@/composables/use-dict";
import { dictMapping } from "@/utils/dict-mapping";
import { v4 as uuidv4 } from "uuid";
import { dateUtil, getDaysDiff } from "@/utils/date-util";
import { roleApi } from "@/api/system/role-api.ts";
import { useMDStore } from "@/stores/md-store.ts";
import { ManageTypeEnum ,PayTypeEnum} from "@/constants/contract-manage/enums";
import { useTagsStore } from "@/stores/tags-store";
import { cstProcessApi } from "@/api/cost/non-contract-manage/cst-process-api";

// 拆分模块
import type {
  ContractFormData,
  ContractFormProps,
  ContractFormEmits,
} from "./contract-form-types.ts";
import { saveContractFormRules,submitContractFormRules } from "./form-rules.ts";
import { useFormLayout } from "@/composables/use-form-layout.ts";
import { loadOptions } from "@/composables/use-options-loader.ts";
import { useTableEditor } from "@/composables/use-table-editor.ts";
import {
  NAV_CARDS,
  createPriceColumns,
  createPayrateColumns,
} from "./contract-form-config.ts";
import {
  requiredRule,
} from "@/utils/form-rule-validate.ts";
// 重新导出类型，保持外部 import 路径不变
import { formType } from '@/types/form/form-types.ts'
export type { ContractFormProps, ContractFormEmits, ContractFormData };

// ============ Composable ============
export function useContractForm(props: ContractFormProps, emit: ContractFormEmits) {
  const router = useRouter();
  const userStore = useUserStore();
  const mdStore = useMDStore();
  const tagsStore = useTagsStore();

  // ---- 模式 ----
  const mode = ref<"add" | "edit" | "detail">(props.mode ?? "add");
  const conId = ref<number | undefined>(props.conId);

  const isDetailMode = computed(() => mode.value === "detail");
  const isEditMode = computed(() => mode.value === "edit");
  const isAddMode = computed(() => mode.value === "add");

  // ---- 单据数据 ----
  const billData = ref({
    id: undefined,
    bizTitle: "",
    bizNo: "",
    status: 0,
    bizItemCode: formType.CON_MAIN,
    flowId:null,
  });
  const flowBaseData = ref<any>(null);
  const flowListData = ref<any>(null);

  // 统一只读态（detail 模式 或 单据已有 status）
  const isReadonly = computed(
    () => isDetailMode.value || !!billData.value.status,
  );

  // ---- UI 逻辑（卡片折叠 / 金额格式化）----
  // 悬浮定位栏已封装为 FloatNav 组件，内部自管 IntersectionObserver
  const { collapsedCards, toggleCard, formatMoney } = useFormLayout(NAV_CARDS);

  // ---- 表单数据 ----
  const initFormData = (): ContractFormData => ({
    // ===== 单据信息 =====
    userName: "",
    createDate: "",
    bizTitle: "",
    // ===== 合同主体 =====
    id: null,
    segId: null,
    segName: "",
    segNo: "",
    deptName: "",
    mguName: "",
    compName: "",
    projId: null,
    acctProjId: null,
    tenderItemId: null,
    tenderItemName: "",
    awardId:null,
    bidAmount:null,
    companyId: null,
    conName: "",
    conSysNo: "",
    conPhyNo: "",
    conTypeId: null,
    conProperty: null,
    mainConId: null,
    mainConName: "",
    mainConExpiryDate: null,
    supId: null,
    supName : "",
    priceType: null,
    conStatus: 0,
    signAmt: null,
    signExclAmt: null,
    taxAmt: null,
    signDate: "",
    effectiveDate: "",
    expiryDate: "",
    daysNum: null,
    needSettle: null,
    settleAmt: null,
    flowId: null,
    agentId: null,
    proProf: null,
    bldIds: [],
    bldNames: "",
    pbAmount: null,
    manageType: null,
    payMethod: null,
    // ===== 用印与扩展 =====
    needSeal: true,
    sealTypes: [],
    signAddr: "",
    supCmanName: "",
    supCmanIdno: "",
    supCmanTel: "",
    supCmanJob: "",
    bankName: "",
    accountName: "",
    bankAccount: "",
    remark: "",
  });

  const formData = ref<ContractFormData>(initFormData());
  const formRef = ref(null);
  const submitLoading = ref(false);

  // ---- 下拉选项 ----
  const companyOptions = ref<any[]>([]);
  const buildingOptions = ref<any[]>([]);
  const segOptions = ref<any[]>([]);
  const conTypeOptions = ref<any[]>([]);
  const projectOptions = ref<any[]>([]);
  const supplierOptions = ref<any[]>([]);
  const proProfOptions = ref<any[]>([]);
  const annexContractFileList = ref<any[]>([]);
  const annexFileList = ref<any[]>([]);
  const paymentTypeOptions = ref<any[]>([]);
  const empTreeOptions = ref<any[]>([]); 

  // ---- 明细表 ----
  const priceTable = ref<any[]>([]);
  const priceColumns = createPriceColumns();
  const payrateTable = ref<any[]>([]);
  const payrateColumns = createPayrateColumns(paymentTypeOptions);

  // ---- 表格行增删（工厂）----
  const { addRow: addPrice, deleteRow: deletePrice } = useTableEditor(
    priceTable,
    () => ({
      id: null,
      conBillId: conId.value,
      itemName: "",
      itemAmt: 0,
      itemTaxRate: 0,
      itemExclAmt: 0,
      itemTaxAmt: 0,
      remark: "",
    }),
  );
  const { addRow: addPayrate, deleteRow: deletePayrate } = useTableEditor(
    payrateTable,
    () => ({
      id: null,
      conBillId: conId.value,
      payRateId: null,
      payTypeId: null,
      payRate: 0,
      isCtrl: false,
      payIntvl: 0,
      prodVal: 0,
      payAmt: 0,
      buildPeriod: "",
      prodValPeriod: "",
      payDate: "",
      costProdVal: 0,
      costPayAmt: 0,
    }),
  );

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
  // ---- 价税明细自动计算 ----
  watch(
    () =>
      priceTable.value.map((item) => `${item.itemAmt}-${item.itemTaxRate}`),
    () => {
      priceTable.value.forEach((item) => {
        const amt = Number(item.itemAmt) || 0;       // ← 确认这行存在
        const rate = Number(item.itemTaxRate) || 0;   // ← 确认这行存在
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

  // showPayrate computed
  const showPayrate = computed(() => {
    const item = PayTypeEnum.find(item => item.value === formData.value.payMethod);
    return !item || item.value !== 2;
  });
  const visibleNavCards = computed(() =>
    showPayrate.value ? NAV_CARDS : NAV_CARDS.filter(card => card.id !== "card-payrate")
  );

  // ---- 数据字典 ----
  const { getDictList, loadDicts } = useDict(
    [dictMapping.proProf, dictMapping.paymentType],
    { treeDictCodes: [] },
  );

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
    return topLevelNode?.conTypeCode;     // 到顶了，取 code
  };

  const isJianAn = computed(() => {
    const id = formData.value.conTypeId;
    if (id == null) return false;
    const code = getRootCodeOf(id);
    return code != null && normalizeCode(code) === normalizeCode(JIAN_AN_CODE);
  });

  watch(
    () => formData.value.conTypeId,
    () => {
      if (!isJianAn.value) {
        formData.value.bldIds = [];
        formData.value.bldNames = "";
        formData.value.priceType = null;
        formData.value.payMethod = 2;
        payrateTable.value = [];
      }
    },
  );

  // ---- 表单校验规则 ----
  //const formRules = ref(createContractFormRules());
  const formRules = computed(() => {
    const rules = submitContractFormRules();
    // 需求1：合同类型为2/3时主合同必填
    const needMainCon = formData.value.conProperty == 3;
    rules.mainConId = needMainCon ? requiredRule("主合同") : [{ required: false }];
    // 需求2：用印为是时印章类型必填
    rules.sealTypes = formData.value.needSeal ? requiredRule("印章类型") : [{ required: false }];
    // 需求3：跨字段校验 —— 生效日期不能晚于到期日期
    const dateOrderValidator = (_rule: any, _value: any, callback: any) => {
      const start = formData.value.effectiveDate;   // 开始日期
      const end = formData.value.expiryDate;         // 结束日期
      // 任一个未填时交给 requiredRule 去拦，这里只比大小
      if (start && end && getDaysDiff(start, end) < 0) {
        callback(new Error("开始日期不能晚于结束日期"));
      } else {
        callback();
      }
    };
    rules.effectiveDate = [
      ...(rules.effectiveDate ?? []),
      { validator: dateOrderValidator, trigger: "change" },
    ];
    rules.expiryDate = [
      ...(rules.expiryDate ?? []),
      { validator: dateOrderValidator, trigger: "change" },
    ];
    return rules;
  });
  // ---- 主合同选择 ----
  const mainConDialogVisible = ref(false);
  const openMainConDialog = () => {
    if (isDetailMode.value) return;
    mainConDialogVisible.value = true;
  };
  const handleMainConSelect = (data) => {
    if (data && data.length > 0) {
      let newData = data || [];
      if (formData.value.supId != newData[0].id) {
        formData.value.mainConId = newData[0].id;
        formData.value.mainConName = newData[0].conName;
        formData.value.mainConExpiryDate = newData[0].expiryDate || newData[0].mainConExpiryDate || null;
        if (formData.value.supId != newData[0].supId) {
          formData.value.supId = newData[0].supId;
          formData.value.supName = newData[0].supName || "";
          formData.value.supCmanName = newData[0].supCmanName;
          getSupplierContactAndBank(formData.value.supId)
        }
      }
    }
  };

  // ---- 供应商选择 ---- 
  const supplierDialogVisible = ref(false);
  const openSupplierDialog = () => { 
    if (isDetailMode.value) return;
    supplierDialogVisible.value = true;
  };
  const handleSupplierSelect = (data) => {
    if (data && data.length > 0) {
      let newData = data || [];
      if (formData.value.supId != newData[0].id) {
        formData.value.supId = newData[0].id;
        formData.value.supName = newData[0].supName || "";
        
        // ...带出电话/身份证/职务/银行信息
        if (formData.value.supId != newData[0].supId) {
          getSupplierContactAndBank(formData.value.supId)
        }
      }
    }
  };

  const getSupplierContactAndBank = (supId) =>{
    //获取供应商联系人
    supplierApi.getDefContactList(supId).then((res)=>{
      if (res.code === 200) { 
        formData.value.supCmanName = res.data?.contactPerson || "";
        formData.value.supCmanJob = res.data?.jobTitle || "";
        formData.value.supCmanTel = res.data?.contactPhone || "";
        formData.value.supCmanIdno = res.data?.contactCardNo || "";
      }
    })

    //获取供应商银行账号
    supplierApi.getDefBankList(supId).then((res)=>{
      if (res.code === 200) {
        formData.value.accountName = res.data?.accountName || "";
        formData.value.bankAccount = res.data?.bankAccount || "";
        formData.value.bankName = res.data?.bankName || "";
      }

    })
  }

  // ---- 招标事项选择 ----
  const awardItemDialogVisible = ref(false);
  const openAwardItemDialog = () => {
    if (isDetailMode.value) return;
    if (formData.value.projId) {
      awardItemDialogVisible.value = true;
    } else {
      ElMessage.error("请先选择项目！")
    }
  };
  const handleAwardItemSelect = (data) => {
    if (data && data.length > 0) {
      let newData = data || [];
      formData.value.tenderItemId = newData[0].tenderItemId;
      formData.value.tenderItemName = newData[0].tenderItemName;
      formData.value.awardId = newData[0].awardId;
      formData.value.bidAmount = newData[0].bidAmount;
      formData.value.conTypeId = newData[0].conTypeId;
      if (formData.value.supId != newData[0].supId) {
        formData.value.supId = newData[0].supId;
        formData.value.supName = newData[0].supName || "";
        getSupplierContactAndBank(formData.value.supId)
      }
    }
    awardItemDialogVisible.value = false;
  };

  // ---- 下拉加载（使用通用 loader）----
  const getCompanyList = () =>
    loadOptions(
      () => manageunitApi.getAuthMguList(),
      companyOptions,
      "获取签约公司列表失败:",
      (d) => buildTree(d),
    );
  const getSegOptions = () =>
    loadOptions(
      () => dictionaryApi.getsegmentList(),
      segOptions,
      "获取业务板块列表失败:",
    );
  const getProjectOptions = () =>
    loadOptions(
      () => projectAreaApi.getSegMguProjList(),
      projectOptions,
      "获取项目列表失败:",
    );
  const getSupplierList = () =>
    loadOptions(
      () => supplierApi.getSupplierList({ supName: "" }),
      supplierOptions,
      "加载供应商列表失败:",
    );
  const getConTypeList = () =>
    loadOptions(
      () => conTypeApi.getConTypeList(),
      conTypeOptions,
      "获取合同分类失败:",
      (d) => buildTree(d),
    );

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
        isAddMode.value
      ) {
        formData.value.companyId = companyOptions.value[0].id;
        formData.value.compName = companyOptions.value[0].compName;
      }
    } catch (error) {
      console.error("获取公司列表失败:", error);
      companyOptions.value = [];
    }
  };

  // 初始化数据字典
  const initDictData = async () => {
    await loadDicts();
    proProfOptions.value = getDictList(dictMapping.proProf);
    paymentTypeOptions.value = getDictList(dictMapping.paymentType);
  };

  // 生成合同编号
  const createConNo = async () => {
    try {
      const conRes = await commonApi.getBillNo({ bizType: "HTBH" });
      if (conRes.code === 200) {
        formData.value.conSysNo = conRes.data;
        formData.value.conPhyNo = conRes.data;
      }
    } catch (error) {
      console.error("生成合同编号失败:", error);
    }
  };

  // 初始化所有下拉选项
  const initOptions = async () => {
    await Promise.all([
      getCompanyList(),
      getSegOptions(),
      getEmpTreeData(),
      getProjectOptions(),
      getSupplierList(),
      getConTypeList(),
      initDictData(),
    ]);
  };

  // ---- 构建提交参数 ----
  const buildSubmitParams = () => {
    return {
      bill: {
        ...billData.value,
        id: billData.value.id || undefined,
        bizTitle: formData.value.bizTitle,
        bizItemCode: formType.CON_MAIN,
        segId: formData.value.segId,
        segName: formData.value.segName,
        segNo: formData.value.segNo,
        projId: formData.value.projId,
        compId: formData.value.companyId,
        compName: formData.value.compName,
        flowId:formData.value.flowId,
      },
      conMain: {
        id: formData.value.id,
        segId: formData.value.segId,
        projId: formData.value.projId,
        acctProjId: formData.value.acctProjId,
        tenderItemId: formData.value.tenderItemId,
        companyId: formData.value.companyId,
        conName: formData.value.conName,
        conSysNo: formData.value.conSysNo,
        conPhyNo: formData.value.conPhyNo,
        conTypeId: formData.value.conTypeId,
        conProperty: formData.value.conProperty,
        mainConId: formData.value.mainConId,
        supId: formData.value.supId,
        priceType: formData.value.priceType,
        conStatus: formData.value.conStatus || 0,
        signAmt: priceTaxData.value.totalPriceTax,
        signExclAmt: priceTaxData.value.totalPrice,
        taxAmt: priceTaxData.value.taxAmount,
        taxRate: priceTaxData.value.taxRate,
        signDate: formData.value.signDate,
        effectiveDate: formData.value.effectiveDate,
        expiryDate: formData.value.expiryDate,
        daysNum: formData.value.daysNum,
        needSettle: formData.value.needSettle,
        flowId: formData.value.flowId,
        agentId: formData.value.agentId,
        proProf: formData.value.proProf,
        bldIds: formData.value.bldIds.join(","),
        bldNames: formData.value.bldNames,
        pbAmount: formData.value.pbAmount,
        manageType: formData.value.manageType,
        payMethod: formData.value.payMethod,
      },
      conMainExt: {
        id: formData.value.id,
        conId: formData.value.id,
        needSeal: formData.value.needSeal,
        sealTypes: formData.value.sealTypes.join(","),
        signAddr: formData.value.signAddr,
        supCmanName: formData.value.supCmanName,
        supCmanIdno: formData.value.supCmanIdno,
        supCmanTel: formData.value.supCmanTel,
        supCmanJob: formData.value.supCmanJob,
        bankName: formData.value.bankName,
        accountName: formData.value.accountName,
        bankAccount: formData.value.bankAccount,
        remark: formData.value.remark,
      },
      billPrices: priceTable.value,
      billPayrates: formData.value.payMethod == 1 ? payrateTable.value : [],
      annexContractList: annexContractFileList.value || [],
      annexList: annexFileList.value || [],
    };
  };

  // ---- 解析回显数据 ----
  const parseContractData = (
    conMain: any,
    conMainExt: any,
    bill: any,
    flowBase: any,
  ) => {
    return {
      userName: conMain.createName,
      createDate: bill.createDate,
      bizTitle: bill.bizTitle,
      id: conMain.id,
      segId: conMain.segId,
      segName: conMain.segName,
      segNo: flowBase.segNo,
      deptName: flowBase.deptName,
      mguName: flowBase.mguName,
      compName: flowBase.compName,
      projId: conMain.projId,
      acctProjId: conMain.acctProjId,
      tenderItemId: conMain.tenderItemId,
      tenderItemName: conMain.tenderItemName,
      awardId: conMain.awardId,
      bidAmount: conMain.bidAmount,
      companyId: conMain.companyId,
      conName: conMain.conName,
      conSysNo: conMain.conSysNo,
      conPhyNo: conMain.conPhyNo,
      conTypeId: conMain.conTypeId,
      conProperty: conMain.conProperty,
      mainConId: conMain.mainConId,
      mainConName: conMain.mainConName,
      mainConExpiryDate: conMain.mainConExpiryDate,
      supId: conMain.supId,
      supName : conMain.supName,
      priceType: conMain.priceType,
      conStatus: conMain.conStatus,
      signAmt: conMain.signAmt,
      signExclAmt: conMain.signExclAmt,
      taxAmt: conMain.taxAmt,
      signDate: conMain.signDate,
      effectiveDate: conMain.effectiveDate,
      expiryDate: conMain.expiryDate,
      daysNum: conMain.daysNum,
      needSettle: conMain.needSettle,
      settleAmt: conMain.settleAmt,
      flowId: bill.flowId,
      agentId: conMain.agentId,
      proProf: conMain.proProf,
      bldIds: conMain.bldIds ? conMain.bldIds.split(",").map(Number) : [],
      bldNames: conMain.bldNames || "",
      pbAmount: conMain.pbAmount,
      manageType: conMain.manageType,
      payMethod: conMain.payMethod,
      needSeal: conMainExt?.needSeal ?? false,
      sealTypes: conMainExt?.sealTypes ? conMainExt.sealTypes.split(",") : [],
      signAddr: conMainExt?.signAddr || "",
      supCmanName: conMainExt?.supCmanName || "",
      supCmanIdno: conMainExt?.supCmanIdno || "",
      supCmanTel: conMainExt?.supCmanTel || "",
      supCmanJob: conMainExt?.supCmanJob || "",
      bankName: conMainExt?.bankName || "",
      accountName: conMainExt?.accountName || "",
      bankAccount: conMainExt?.bankAccount || "",
      remark: conMainExt?.remark || "",
    };
  };

  // ---- 项目联动 ----
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
        getBuildingListByProjId(value);
        getCompanyListByProjId(value);

        // 程序化重置了若干字段，清除误报的必填红
        await nextTick();
        formRef.value?.clearValidate();
      }
    }
  };

  // ---- 公司联动 ----
  const changeCompany = (value: number) => {
    const selectedCompany = companyOptions.value.find(
      (item: any) => item.id === value,
    );
    formData.value.compName = selectedCompany?.compName || "";
  };

  const changeConEffectDate = () => {
    formData.value.daysNum = getDaysDiff(
      formData.value.effectiveDate,
      formData.value.expiryDate,
    );
  };

  const handleBuildingChange = (ids: number[]) => {
    const names = buildingOptions.value
      .filter((v: any) => ids.includes(v.id))
      .map((v: any) => v.bldName);
    formData.value.bldNames = names.join(",");
  };

  // ---- 附件上传 ----
  const handleUploadConSuccess = (file: any) => {
    annexContractFileList.value.push(file);
  };
  const handleUploadOtherSuccess = (file: any) => {
    annexFileList.value.push(file);
  };

  // 返回操作
  const goBack = () => {
    if (isAddMode.value) {
      tagsStore.closeTagByPath("/con/contract-ledger");
    }
    if (isEditMode.value) {
      tagsStore.closeTagByPath("/con/contract-ledger");
    }
    router.go(-1); // 返回上个页面
  };

  // ---- 加载合同详情 ----
  const loadContractDetail = async () => {
    if (!conId.value) return;
    try {
      const res = await contractLedgerApi.getContractLedgerById({
        id: conId.value,isWithFlow:true
      });
      if (res.code === 200 && res.data) {
        const {
          flowList,
          bill,
          flowBase,
          conMain,
          conMainExt,
          billPayrates = [],
          billPrices = [],
          annexList,
          annexContractList,
        } = res.data;
        billData.value = { ...billData.value, ...bill };
        flowListData.value = { ...flowListData.value, ...flowList };
        flowBaseData.value = { ...flowBaseData.value, ...flowBase };
        formData.value = parseContractData(
          conMain,
          conMainExt,
          billData.value,
          flowBaseData.value,
        );
        payrateTable.value = billPayrates.map((item: any) => ({
          ...item,
          uuid: uuidv4(),
        }));
        priceTable.value = billPrices.map((item: any) => ({
          ...item,
          uuid: uuidv4(),
        }));
        if (conMain.projId) {
          await getBuildingListByProjId(conMain.projId);
          await getCompanyListByProjId(conMain.projId);
        }
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
      console.error("获取合同信息失败:", error);
    }
  };

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
      // if (!item.itemAmt || item.itemAmt <= 0) {
      //   ElMessage.error(`价税明细列表第${i + 1}行：分项含税总额必须大于0`);
      //   return false;
      // }
      // if (!item.itemTaxRate || item.itemTaxRate < 0) {
      //   ElMessage.error(`价税明细列表第${i + 1}行：税率不能为空且不能小于0`);
      //   return false;
      // }
      // if (!item.itemExclAmt || item.itemExclAmt <= 0) {
      //   ElMessage.error(`价税明细列表第${i + 1}行：分项不含税总额必须大于0`);
      //   return false;
      // }
      // if (!item.itemTaxAmt || item.itemTaxAmt < 0) {
      //   ElMessage.error(`价税明细列表第${i + 1}行：分项总额必须大于等于0`);
      //   return false;
      // }
    }
    return true;
  };

 // 需求8：支付明细所有列均为必填
  const validatePayrateTable = () => {
    if (!showPayrate.value) {
      payrateTable.value = [];
      return true; // 不显示支付比例时不校验
    }
    if (payrateTable.value.length === 0) {
      ElMessage.error("支付比例明细列表不能为空");
      return false;
    }
    for (let i = 0; i < payrateTable.value.length; i++) {
      const item = payrateTable.value[i];
      if (!item.payTypeId) {
        ElMessage.error(`支付比例明细列表第${i + 1}行：请选择款项类型`);
        return false;
      }
      if (!item.payRate || item.payRate <= 0) {
        ElMessage.error(`支付比例明细列表第${i + 1}行：应付比例必须大于0`);
        return false;
      }
      if (item.isCtrl === null || item.isCtrl === undefined) {
        ElMessage.error(`支付比例明细列表第${i + 1}行：请选择是否强控`);
        return false;
      }
      if (!item.payIntvl || item.payIntvl <= 0) {
        ElMessage.error(`支付比例明细列表第${i + 1}行：支付周期必须大于0`);
        return false;
      }
    }
    return true;
  };

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

  // ---- 提交 ----
  const handleSubmit = async () => {
    if (isDetailMode.value) return;
    if (!formRef.value) return;
    try {
      await formRef.value.validate();
      // 校验各个明细表
      if (!validatePriceTable()) return;
      //await submitContractFormRules();
      if (!validatePayrateTable()) return;

      submitLoading.value = true;
      const params = buildSubmitParams();
      let res;
      if (formData.value.id) {
        res = await contractLedgerApi.submitContractLedger(params);
      } else {
        res = await contractLedgerApi.saveContractLedger(params);
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

  const SAVE_FIELDS = Object.keys(saveContractFormRules());
  const handleSave = async () => {
    if (isDetailMode.value) return;
    if (!formRef.value) return;
    try {
      //await formRef.value.validateField(['bizTitle', 'projId', 'conProperty','conName','conTypeId','supId','priceType','payMethod']);
      await formRef.value.validateField(SAVE_FIELDS); 
      //await saveContractFormRules();
      submitLoading.value = true;
      const params = buildSubmitParams();
      const res = await contractLedgerApi.saveContractLedger(params);
      if (res.code === 200 && res.data) {
        formData.value.id = res.data;
        conId.value = formData.value.id;
        ElMessage.success("保存成功");
        await loadContractDetail();
      }
    } catch (error) {
        focusFirstError(error as Record<string, any>);
    } finally {
      submitLoading.value = false;
    }
  };

  // 删除
  const handleDelete = async () => {
    ElMessageBox.confirm("确定要删除吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }).then(async () => {
      try {
        const res = await contractLedgerApi.delContractLedger({ id: formData.value.id });
        if (res.code === 200) {
          ElMessage.success("删除成功");
          goBack();
        }
      } catch (error) {
        console.error("删除失败:", error);
      }
    });
  };
  // 作废
  const handleCancel = async () => {
    ElMessageBox.confirm("确定要作废吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }).then(async () => {
      try {
        const res = await contractLedgerApi.voidContractLedger(formData.value.id,);
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

  // ---- 重置表单 ----
  const resetForm = () => {
    formData.value = initFormData();
    priceTable.value = [];
    payrateTable.value = [];
    if (formRef.value) {
      formRef.value.resetFields();
    }
  };

  watch(
    () => [props.conId, props.mode],
    () => { resetForm(); initData(); },
    { flush: "post" },
  );

  // ---- 初始化 ----
  const initData = async () => {
    await initOptions();
    if (isAddMode.value) {
      formData.value.agentId = userStore.userInfo.id;
      formData.value.pbAmount = 0;
      formData.value.manageType = ManageTypeEnum[1].value;
      formData.value.userName = userStore.userInfo?.empName || "";
      formData.value.createDate = dateUtil().format("YYYY-MM-DD");
      formData.value.deptName = userStore.userInfo?.deptName;
      formData.value.mguName = userStore.userInfo?.mguName;
      await createConNo();
      // 需求4：新增合同时默认新增一行价税明细
      addPrice();
      priceTable.value[0].itemName="合同价款";
    } else if (isEditMode.value || isDetailMode.value) {
      if (conId.value) {
        await loadContractDetail();
      }
    }
  };

  onMounted(() => {
    initData();
  });

  return {
    // 表单核心
    billData,
    formData,
    formRef,
    submitLoading,
    formRules,
    isReadonly,
    handleSubmit,
    handleSave,
    handleDelete,
    handleCancel,
    handleViewProcess,
    resetForm,
    initData,
    // 价款
    priceTaxData,
    formatMoney,
    priceTable,
    priceColumns,
    payrateTable,
    payrateColumns,
    addPrice,
    deletePrice,
    addPayrate,
    deletePayrate,
    // 下拉选项
    segOptions,
    companyOptions,
    empTreeOptions,
    buildingOptions,
    conTypeOptions,
    projectOptions,
    supplierOptions,
    proProfOptions,
    paymentTypeOptions,
    // 联动
    changeProject,
    handleBuildingChange,
    changeCompany,
    changeConEffectDate,
    // UI：卡片折叠
    collapsedCards,
    toggleCard,
    // UI：悬浮定位栏配置（传给 FloatNav 组件）
    navCards: visibleNavCards,
    // 需求7：支付比例显示控制
    showPayrate,
    // 模式
    isDetailMode,
    isEditMode,
    isAddMode,
    // 主合同选择
    mainConDialogVisible,
    openMainConDialog,
    handleMainConSelect,
    // 供应商选择（需求6）
    supplierDialogVisible,
    openSupplierDialog,
    handleSupplierSelect,
    awardItemDialogVisible,
    openAwardItemDialog,
    handleAwardItemSelect,
    // 附件
    annexContractFileList,
    annexFileList,
    handleUploadOtherSuccess,
    handleUploadConSuccess,
    isJianAn,
  };
}
