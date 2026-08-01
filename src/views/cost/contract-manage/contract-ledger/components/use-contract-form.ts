import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import { ElMessage } from "element-plus";
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
import { bankCardRegex, idCardRegex, phoneRegex } from "@/utils/regex";
import type { EditableColumn } from "@/components/base/editable-table.vue";
import { v4 as uuidv4 } from "uuid";
import { Search } from "@element-plus/icons-vue";  // 顶部 import

// ============ 类型定义 ============
export interface ContractFormProps<T = any> {
  mode?: "add" | "edit" | "detail";
  conId?: number;
  empTreeData?: T[];
  conTypeOptions?: T[];
}

export type ContractFormEmits = {
  (e: "success", data: any): void;
  (e: "cancel"): void;
};

// ============ Composable ============
export function useContractForm(props: ContractFormProps, emit: ContractFormEmits) {
  // 路由与状态
  const router = useRouter();
  const userStore = useUserStore();

  const mode = ref<"add" | "edit" | "detail">(props.mode ?? "add");
  const conId = ref<number | undefined>(props.conId);

  const isDetailMode = computed(() => mode.value === "detail");
  const isEditMode = computed(() => mode.value === "edit");
  const isAddMode = computed(() => mode.value === "add");

  // 创建响应式的价款数据，使用 computed 追踪 priceTable 变化
  const priceTaxData = computed(() => calculatePriceTaxData());

  // 金额格式化（千分位）—— 纯展示辅助，不影响数据逻辑
  const formatMoney = (val: number | string) => {
    const num = Number(val) || 0;
    return num.toLocaleString("zh-CN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // 卡片折叠状态（纯 UI 交互，不影响业务逻辑）
  const collapsedCards = reactive({
    base: false,
    basic: false,
    contract: false,
    price: false,
    supplier: false,
    payrate: false,
    annex: false,
  });
  const toggleCard = (key: keyof typeof collapsedCards) => {
    collapsedCards[key] = !collapsedCards[key];
  };

  // 悬浮定位栏（纯 UI 交互，不影响业务逻辑）
  const navCards = [
    { id: "card-base", icon: "📋", label: "基础信息" },
    { id: "card-basic", icon: "📄", label: "基本信息" },
    { id: "card-contract", icon: "📑", label: "合同信息" },
    { id: "card-price", icon: "💰", label: "价款及税率" },
    { id: "card-supplier", icon: "🏢", label: "供方信息" },
    { id: "card-payrate", icon: "📊", label: "支付比例" },
    { id: "card-annex", icon: "📎", label: "合同附件" },
  ];
  const activeCard = ref("card-base");
  const navCollapsed = ref(false);

  const scrollToCard = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      activeCard.value = id;
    }
  };

  let scrollObserver: IntersectionObserver | null = null;
  const initScrollSpy = () => {
    const scrollArea = document.querySelector(".form-scroll-area");
    if (!scrollArea) return;
    scrollObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          activeCard.value = visible[0].target.id;
        }
      },
      {
        root: scrollArea as HTMLElement,
        threshold: 0.1,
        rootMargin: "-80px 0px -60% 0px",
      },
    );
    navCards.forEach((c) => {
      const el = document.getElementById(c.id);
      if (el && scrollObserver) scrollObserver.observe(el);
    });
  };
  const destroyScrollSpy = () => {
    scrollObserver?.disconnect();
    scrollObserver = null;
  };

  const billData = ref({
    id: undefined,
    bizTitle: "",
    bizNo: "",
    status: 0,
    bizItemCode: "NCON_PROC",
  });
  const flowBaseData = ref(null);
  // 表单数据定义
  const initFormData = () => ({
    userName:"",
    createDate:"",
    // 主表字段
    id: null,
    bizTitle: "",
    segId: null,
    segName:"",
    segNo:"",
    deptName:"",
    mguName:"",
    compName:"",
    projId: null,
    acctProjId: null,
    tenderItemId: null,
    companyId: null,
    conName: "",
    conSysNo: "",
    conPhyNo: "",
    conTypeId: null,
    conProperty: null,
    mainConId: null,
    mainConName :"",
    supId: null,
    priceType: null,
    conStatus: 0,
    signAmt: null,
    signExclAmt: null,
    taxAmt: null,
    signDate: "",
    effectiveDate: "",
    expiryDate: "",
    daysNum: null,
    needSettle: true,
    settleAmt: null,
    flowId: null,
    agentId: null,
    proProf: null,
    bldIds: [],
    bldNames: "",
    pbAmount: null,
    manageType: null,
    payMethod: null,
    // 扩展字段
    needSeal: false,
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

  const formData = ref(initFormData());
  const formRef = ref(null);
  const submitLoading = ref(false);

  // 下拉选项数据
  const companyOptions = ref([]);
  const buildingOptions = ref([]);
  const segOptions = ref([]);
  const conTypeOptions = ref([]);
  const projectOptions = ref([]);
  const supplierOptions = ref([]);
  const proProfOptions = ref([]);
  const acctProjOptions = ref([
    { id: 1, dicLabel: "项目1" },
    { id: 2, dicLabel: "项目2" },
  ]);
  const paymentTypeOptions = ref([]);

  const priceTable = ref([]); // 合同价格明细
  const priceColumns = computed<EditableColumn[]>(() => [
    { type: "index", label: "序号", width: 60, editable: false },
    {
      prop: "itemName",
      label: "分项名称",
      editable: true,
      editType: "input",
      showOverflowTooltip: false,
    },
    {
      prop: "itemAmt",
      label: "分项含税总额",
      showSummary: true,
      editable: true,
      editType: "number",
      showOverflowTooltip: false,
    },
    {
      prop: "itemTaxRate",
      label: "税率",
      showSummary: true,
      editable: true,
      editType: "number",
      showOverflowTooltip: false,
    },
    {
      prop: "itemExclAmt",
      label: "分项不含税额",
      showSummary: true,
      editable: true,
      editType: "number",
      showOverflowTooltip: false,
    },
    {
      prop: "itemTaxAmt",
      label: "分项税额",
      showSummary: true,
      editable: true,
      editType: "number",
      showOverflowTooltip: false,
    },
    {
      prop: "remark",
      label: "备注",
      editable: true,
      editType: "input",
      showOverflowTooltip: false,
    },
    {
      label: "操作",
      width: 100,
      slot: "actions",
      fixed: "right",
    },
  ]);
  // 计算价款及税率汇总数据
  const calculatePriceTaxData = () => {
    // 累加各项金额
    const totalPriceTax = priceTable.value.reduce((sum, item) => {
      const amt = Number(item.itemAmt) || 0;
      return sum + amt;
    }, 0);

    const totalPrice = priceTable.value.reduce((sum, item) => {
      const exclAmt = Number(item.itemExclAmt) || 0;
      return sum + exclAmt;
    }, 0);

    const taxAmount = priceTable.value.reduce((sum, item) => {
      const tax = Number(item.itemTaxAmt) || 0;
      return sum + tax;
    }, 0);

    // 计算税率（不含税总额 > 0 时计算税率，否则为 0）
    let taxRate = 0;
    if (totalPrice > 0) {
      // 税率 = 税额 / 不含税总额 * 100
      taxRate = (taxAmount / totalPrice) * 100;
      // 保留两位小数
      taxRate = Math.round(taxRate * 100) / 100;
    }

    return {
      totalPriceTax,
      totalPrice,
      taxAmount,
      taxRate,
    };
  };
  const payrateTable = ref([]); // 支付明细
  const payrateColumns = computed<EditableColumn[]>(() => [
    { type: "index", label: "序号", width: 60, editable: false },
    {
      prop: "payTypeId",
      label: "款项类型",
      editable: true,
      editType: "select",
      showOverflowTooltip: false,
      // 自定义键名
      optionLabelField: "dicLabel",
      optionValueField: "id",
      options: paymentTypeOptions.value || [],
    },
    {
      prop: "payRate",
      label: "应付比例(%)",
      showSummary: true,
      editable: true,
      editType: "number",
      showOverflowTooltip: false,
    },
    {
      prop: "isCtrl",
      label: "是否强控",
      editable: true,
      editType: "select",
      showOverflowTooltip: false,
      clearable: false,
      options: [
        { value: true, label: "是" },
        { value: false, label: "否" },
      ],
    },
    {
      prop: "payIntvl",
      label: "支付周期(月)",
      showSummary: true,
      editable: true,
      editType: "number",
      precision: 0,
      showOverflowTooltip: false,
    },
    {
      label: "操作",
      width: 100,
      slot: "actions",
      fixed: "right",
    },
  ]);

  // 数据字典
  const { getDictList, loadDicts } = useDict(
    [dictMapping.proProf, dictMapping.paymentType],
    { treeDictCodes: [] },
  );

  // 表单校验规则
  const formRules = ref({
    bizTitle: [{ required: true, message: "请输入标题", trigger: "change" }],
    conName: [{ required: true, message: "请输入合同名称", trigger: "blur" }],
    conTypeId: [{ required: true, message: "请选择合同分类", trigger: "change" }],
    conProperty: [
      { required: true, message: "请选择合同类型", trigger: "change" },
    ],
    companyId: [{ required: true, message: "请选择签约公司", trigger: "change" }],
    conSysNo: [
      { required: true, message: "请输入合同系统编号", trigger: "blur" },
      {
        pattern: /^[a-zA-Z0-9_]+$/,
        message: "合同系统编号只能包含英文大小写、数字和下划线",
        trigger: "blur",
      },
    ],
    conPhyNo: [
      { required: true, message: "请输入合同物理编号", trigger: "blur" },
      {
        pattern: /^[a-zA-Z0-9_]+$/,
        message: "合同物理编号只能包含英文大小写、数字和下划线",
        trigger: "blur",
      },
    ],
    segId: [{ required: true, message: "请选择业务板块", trigger: "change" }],
    projId: [{ required: true, message: "请选择项目", trigger: "change" }],
    acctProjId: [
      { required: true, message: "请选择核算项目", trigger: "change" },
    ],
    supId: [{ required: true, message: "请选择供应商", trigger: "change" }],
    priceType: [{ required: true, message: "请选择计价方式", trigger: "change" }],
    manageType: [
      { required: true, message: "请选择管理类型", trigger: "change" },
    ],
    payMethod: [{ required: true, message: "请选择付款方式", trigger: "change" }],
    signAmt: [
      { required: true, message: "请输入签约金额", trigger: "blur" },
      { type: "number", min: 0, message: "金额不能小于0", trigger: "blur" },
    ],
    signExclAmt: [
      { required: true, message: "请输入不含税金额", trigger: "blur" },
      { type: "number", min: 0, message: "金额不能小于0", trigger: "blur" },
    ],
    taxAmt: [
      { required: true, message: "请输入税额", trigger: "blur" },
      { type: "number", min: 0, message: "税额不能小于0", trigger: "blur" },
    ],
    signDate: [{ required: true, message: "请选择签订日期", trigger: "change" }],
    effectiveDate: [
      { required: true, message: "请选择生效日期", trigger: "change" },
    ],
    expiryDate: [
      { required: true, message: "请选择到期日期", trigger: "change" },
    ],
    daysNum: [{ required: true, message: "请输入工期天数", trigger: "blur" }],
    pbAmount: [
      { required: true, message: "请输入履约保证金", trigger: "blur" },
      { type: "number", min: 0, message: "金额不能小于0", trigger: "blur" },
    ],
    proProf: [{ required: true, message: "请选择生产专业", trigger: "change" }],
    bldIds: [{ required: true, message: "请选择楼栋", trigger: "change" }],
    settleAmt: [
      { required: true, message: "请输入结算金额", trigger: "blur" },
      { type: "number", min: 0, message: "结算金额不能小于0", trigger: "blur" },
    ],
    needSeal: [{ required: true, message: "请选择是否用印", trigger: "change" }],
    sealTypes: [{ required: true, message: "请选择印章类型", trigger: "change" }],
    signAddr: [{ required: true, message: "请输入签约地点", trigger: "blur" }],
    supCmanName: [
      { required: true, message: "请输入联系人姓名", trigger: "blur" },
    ],
    supCmanTel: [
      { required: true, message: "请输入联系人电话", trigger: "blur" },
      {
        pattern: phoneRegex,
        message: "请输入正确的手机号码",
        trigger: "blur",
      },
    ],
    supCmanIdno: [
      { required: true, message: "请输入联系人身份证", trigger: "blur" },
      {
        pattern: idCardRegex,
        message: "请输入正确的身份证号码",
        trigger: "blur",
      },
    ],
    supCmanJob: [
      { required: false, message: "请输入联系人职务", trigger: "blur" },
    ],
    bankName: [{ required: false, message: "请输入开户银行", trigger: "blur" }],
    accountName: [
      { required: false, message: "请输入银行户名", trigger: "blur" },
    ],
    bankAccount: [
      { required: false, message: "请输入银行账号", trigger: "blur" },
      {
        pattern: bankCardRegex,
        message: "请输入正确的银行卡号",
        trigger: "blur",
      },
    ],
  });

  // 主合同选择
  const mainConName = ref("");                // 显示名
  const mainConDialogVisible = ref(false);    // 弹窗开关

  const openMainConDialog = () => {
    if (isDetailMode.value) return;           // 详情模式不允许选
    mainConDialogVisible.value = true;
  };

  // 弹窗里选中某条合同后回调
  const handleMainConSelect = (row) => {
    formData.value.mainConId = row.id;
    mainConName.value = row.conName;
    mainConDialogVisible.value = false;
  };

  // 获取签约公司列表
  const getCompanyList = async () => {
    try {
      const res = await manageunitApi.getAuthMguList();
      if (res.code === 200) {
        companyOptions.value = buildTree(res.data || []);
      }
    } catch (error) {
      console.error("获取签约公司列表失败:", error);
    }
  };

  // 获取业务板块列表
  const getSegOptions = async () => {
    try {
      const res = await dictionaryApi.getsegmentList();
      if (res.code === 200) {
        segOptions.value = res.data || [];
      }
    } catch (error) {
      console.error("获取业务板块列表失败:", error);
    }
  };

  // 获取项目列表
  const getProjectOptions = async () => {
    try {
      const res = await projectAreaApi.getMguProjList();
      if (res.code === 200) {
        projectOptions.value = res.data || [];
      }
    } catch (error) {
      console.error("获取项目列表失败:", error);
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

  // 获取合同分类
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

  // 获取楼栋列表
  const getBuildingListByProjId = async (projId: number) => {
    if (!projId) return;
    try {
      buildingOptions.value = [];
      const buildingRes = await projectAreaApi.getBuildingList({ projId });
      if (buildingRes.code === 200) {
        buildingOptions.value = buildingRes.data || [];
        // 编辑时回显楼栋名称
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

  // 初始化数据字典
  const initDictData = async () => {
    await loadDicts();
    proProfOptions.value = getDictList(dictMapping.proProf); // 生产专业
    paymentTypeOptions.value = getDictList(dictMapping.paymentType); // 款项类型
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
      getProjectOptions(),
      getSupplierList(),
      getConTypeList(),
      initDictData(),
    ]);
  };

  // 构建提交参数（表单数据 -> 接口参数）
  const buildSubmitParams = () => {
    return {
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
        signAmt: formData.value.signAmt,
        signExclAmt: formData.value.signExclAmt,
        taxAmt: formData.value.taxAmt,
        signDate: formData.value.signDate,
        effectiveDate: formData.value.effectiveDate,
        expiryDate: formData.value.expiryDate,
        daysNum: formData.value.daysNum,
        needSettle: formData.value.needSettle,
        settleAmt: formData.value.settleAmt,
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
      annexes: [],
    };
  };

  // 解析回显数据（接口数据 -> 表单数据）
  const parseContractData = (conMain: any, conMainExt: any,bill: any,flowBase:any) => {
    return {
      userName: flowBase.userName,
      createDate:bill.createDate,
      // 主表字段
      bizTitle : "",
      id: conMain.id,
      segId: conMain.segId,
      segName:conMain.segName,
      segNo:conMain.segNo,
      deptName:flowBase.deptName,
      mguName:flowBase.mguName,
      compName:flowBase.compName,
      projId: conMain.projId,
      acctProjId: conMain.acctProjId,
      tenderItemId: conMain.tenderItemId,
      companyId: conMain.companyId,
      conName: conMain.conName,
      conSysNo: conMain.conSysNo,
      conPhyNo: conMain.conPhyNo,
      conTypeId: conMain.conTypeId,
      conProperty: conMain.conProperty,
      mainConId: conMain.mainConId,
      mainConName:conMain.mainConName,
      supId: conMain.supId,
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
      flowId: conMain.flowId,
      agentId: conMain.agentId,
      proProf: conMain.proProf,
      bldIds: conMain.bldIds ? conMain.bldIds.split(",").map(Number) : [],
      bldNames: conMain.bldNames || "",
      pbAmount: conMain.pbAmount,
      manageType: conMain.manageType,
      payMethod: conMain.payMethod,
      // 扩展字段
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

  // 选择项目（联动加载楼栋）
  const changeProject = (id: number) => {
    formData.value.bldIds = [];
    formData.value.bldNames = "";
    if (id) {
      getBuildingListByProjId(id);
    }
  };

  // 楼栋选择变化（更新楼栋名称）
  const handleBuildingChange = (ids: number[]) => {
    const names = buildingOptions.value
      .filter((v: any) => ids.includes(v.id))
      .map((v: any) => v.bldName);
    formData.value.bldNames = names.join(",");
  };

  // 加载合同详情（编辑/详情模式）
  const loadContractDetail = async () => {
    if (!conId.value) return;
    try {
      const res = await contractLedgerApi.getContractLedgerById({
        id: conId.value,
      });
      if (res.code === 200 && res.data) {
        const {
          bill,
          flowBase,
          conMain,
          conMainExt,
          billPayrates = [],
          billPrices = [],
        } = res.data;
        billData.value = { ...billData.value, ...bill };
        flowBaseData.value = { ...flowBaseData.value, ...flowBase };
        formData.value = parseContractData(conMain, conMainExt,billData,flowBaseData);
        payrateTable.value = billPayrates.map((item: any) => ({
          ...item,
          uuid: uuidv4(),
        }));
        priceTable.value = billPrices.map((item: any) => ({
          ...item,
          uuid: uuidv4(),
        }));
        // 加载楼栋列表
        if (conMain.projId) {
          await getBuildingListByProjId(conMain.projId);
        }
      }
    } catch (error) {
      console.error("获取合同信息失败:", error);
    }
  };

  const addPrice = () => {
    const newRowData = {
      uuid: uuidv4(),
      id: null,
      conBillId: conId.value,
      itemName: "", // 分项名称
      itemAmt: 0, // 分项含税总额
      itemTaxRate: 0, // 税率
      itemExclAmt: 0, // 分项不含税总额
      itemTaxAmt: 0, // 分项税额
      remark: "", // 备注
    };
    priceTable.value = [...priceTable.value, newRowData];
  };
  const deletePrice = (row: any) => {
    priceTable.value = priceTable.value.filter((item) => item.uuid !== row.uuid);
  };
  const addPayrate = () => {
    const newRowData = {
      uuid: uuidv4(),
      id: null,
      conBillId: conId.value,
      payRateId: null, // 支付比例表ID
      payTypeId: null, // 款项类型ID
      payRate: 0, // 应付比例
      isCtrl: false, // 是否强控
      payIntvl: 0, // 付周期（月）
      prodVal: 0, // 本次申请产值金额
      payAmt: 0, // 本次申报应付金额
      buildPeriod: "", // 施工期间
      prodValPeriod: "", // 产值期间
      payDate: "", // 计划付款日期
      costProdVal: 0, // 成本复核产值金额
      costPayAmt: 0, // 成本复核应付金额
    };
    payrateTable.value = [...payrateTable.value, newRowData];
  };
  const deletePayrate = (row: any) => {
    payrateTable.value = payrateTable.value.filter(
      (item) => item.uuid !== row.uuid,
    );
  };

  // 校验价税明细表
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
      if (!item.itemAmt || item.itemAmt <= 0) {
        ElMessage.error(`价税明细列表第${i + 1}行：分项含税总额必须大于0`);
        return false;
      }
      if (!item.itemTaxRate || item.itemTaxRate < 0) {
        ElMessage.error(`价税明细列表第${i + 1}行：税率不能为空且不能小于0`);
        return false;
      }
      if (!item.itemExclAmt || item.itemExclAmt <= 0) {
        ElMessage.error(`价税明细列表第${i + 1}行：分项不含税总额必须大于0`);
        return false;
      }
      if (!item.itemTaxAmt || item.itemTaxAmt < 0) {
        ElMessage.error(`价税明细列表第${i + 1}行：分项总额必须大于等于0`);
        return false;
      }
    }
    return true;
  };
  // 校验支付比例明细表
  const validatePayrateTable = () => {
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
      if (!item.prodVal || item.prodVal <= 0) {
        ElMessage.error(
          `支付比例明细列表第${i + 1}行：本次申请产值金额必须大于0`,
        );
        return false;
      }
      if (!item.payAmt || item.payAmt <= 0) {
        ElMessage.error(
          `支付比例明细列表第${i + 1}行：本次申报应付金额必须大于0`,
        );
        return false;
      }
      if (!item.costProdVal || item.costProdVal <= 0) {
        ElMessage.error(
          `支付比例明细列表第${i + 1}行：成本复核产值金额必须大于0`,
        );
        return false;
      }
      if (!item.costPayAmt || item.costPayAmt <= 0) {
        ElMessage.error(
          `支付比例明细列表第${i + 1}行：成本复核应付金额必须大于0`,
        );
        return false;
      }
    }
    return true;
  };

  // 提交表单
  const handleSubmit = async () => {
    if (isDetailMode.value) return;
    if (!formRef.value) return;
    try {
      await formRef.value.validate();
      // 校验各个明细表
      // if (!validatePriceTable()) return;
      // if (!validatePayrateTable()) return;

      submitLoading.value = true;
      const params = buildSubmitParams();
      let res;
      if (formData.value.id) {
        res = await contractLedgerApi.editContractLedger(params);
      } else {
        res = await contractLedgerApi.addContractLedger(params);
      }
      if (res.code === 200) {
        ElMessage.success(formData.value.id ? "编辑成功" : "新增成功");
        emit("success", res.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      submitLoading.value = false;
    }
  };

  const handleSave = async () => {
  };
  
  const handleDelete = async () => {
  };

  const handleCancel = async () => {
  };

  const handleViewProcess = async () => {
  };

  // 重置表单
  const resetForm = () => {
    formData.value = initFormData();
    priceTable.value = [];
    payrateTable.value = [];
    if (formRef.value) {
      formRef.value.resetFields();
    }
  };

  // 初始化
  const initData = async () => {
    await initOptions();

    if (isAddMode.value) {
      formData.value.agentId = userStore.userInfo.id;
      await createConNo();
    } else if (isEditMode.value || isDetailMode.value) {
      if (conId.value) {
        await loadContractDetail();
      }
    }
  };

  onMounted(() => {
    initData();
    nextTick(() => initScrollSpy());
  });

  onBeforeUnmount(() => {
    destroyScrollSpy();
  });

  return {
    // 表单核心
    billData,
    formData,
    formRef,
    submitLoading,
    formRules,
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
    buildingOptions,
    conTypeOptions,
    projectOptions,
    supplierOptions,
    proProfOptions,
    acctProjOptions,
    // 联动
    changeProject,
    handleBuildingChange,
    // UI：卡片折叠
    collapsedCards,
    toggleCard,
    // UI：悬浮定位栏
    navCards,
    activeCard,
    navCollapsed,
    scrollToCard,
    isDetailMode,
    isEditMode,
    isAddMode,
    mainConDialogVisible,
    openMainConDialog,
    handleMainConSelect,
    Search, 
  };
}
