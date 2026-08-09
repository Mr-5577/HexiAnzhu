import type { FormMode } from "@/types/form/form-types.ts"; // 导入类型
// ============ 合同表单类型定义 ============

/** 合同表单数据接口 */
export interface ContractFormData {
  // ===== 单据信息 =====
  userName: string;
  createDate: string;
  bizTitle: string;

  // ===== 合同主体 =====
  id: number | null;
  segId: number | null;
  segName: string;
  segNo: string;
  deptName: string;
  mguName: string;
  compName: string;
  projId: number | null;
  acctProjId: number | null;
  tenderItemId: number | null;
  tenderItemName: string;
  awardId: number | null;
  bidAmount:number | null,
  companyId: number | null;
  conName: string;
  conSysNo: string;
  conPhyNo: string;
  conTypeId: number | null;
  conProperty: number | null;
  mainConId: number | null;
  mainConName: string;
  mainConExpiryDate: string | null;
  supId: number | null;
  supName: string;          
  priceType: number | null;
  conStatus: number;
  signAmt: number | null;
  signExclAmt: number | null;
  taxAmt: number | null;
  signDate: string;
  effectiveDate: string;
  expiryDate: string;
  daysNum: number | null;
  needSettle: boolean;
  settleAmt: number | null;
  flowId: number | null;
  agentId: number | null;
  proProf: number | null;
  bldIds: number[];
  bldNames: string;
  pbAmount: number | null;
  manageType: number | null;
  payMethod: number | null;

  // ===== 用印与扩展 =====
  needSeal: boolean;
  sealTypes: string[];
  signAddr: string;
  supCmanName: string;
  supCmanIdno: string;
  supCmanTel: string;
  supCmanJob: string;
  bankName: string;
  accountName: string;
  bankAccount: string;
  remark: string;
}

/** 组件 Props */
export interface ContractFormProps<T = any> {
  mode?: FormMode;
  conId?: number;
  empTreeData?: T[];
  conTypeOptions?: T[];
}

/** 组件 Emits */
export type ContractFormEmits = {
  (e: "success", data: any): void;
  (e: "cancel"): void;
};
