// ============ 合同台账表单专用校验规则集 ============
// 仅服务合同台账表单，通用工厂函数见 @/utils/form-rule-validate


import {
  requiredRule,
  requiredInputRule,
  moneyRule,
  codeRule,
  optionalInputRule,
  phoneRule,
  idCardRule,
  bankCardRule,
} from "@/utils/form-rule-validate.ts";

 /**
  * 创建合同台账表单【基础校验】规则集
  * 字段名与 ContractFormData 一一对应。
  *
  * 注意：主合同(mainConId)、印章类型(sealTypes) 属于条件型"特殊规则"，
  * 其必填与否依赖其它字段，不在此基础集合内，由 use-contract-form 的
  * formRules 在「填写时实时校验 + 提交时统一拦截」。
  */
export const saveContractFormRules = () => ({
  bizTitle: requiredRule("标题", "change"),
  projId: requiredRule("项目"),
  conProperty: requiredRule("合同类型"),
  conName: requiredInputRule("合同名称"),
  conTypeId: requiredRule("合同分类"),
  supName: requiredRule("供应商"),
  priceType: requiredRule("计价方式", "blur"),
  payMethod: requiredRule("产值确认方式"),
  needSettle: requiredRule("是否需办理结算"),   
});


export const submitContractFormRules = () => ({
  bizTitle: requiredRule("标题", "change"),
  conName: requiredInputRule("合同名称"),
  conTypeId: requiredRule("合同分类"),
  conProperty: requiredRule("合同类型"),
  mainConId: requiredRule("主合同"),
  companyId: requiredRule("签约公司"),
  projId: requiredRule("项目"),
  supName: requiredRule("供应商"),
  priceType: requiredRule("计价方式", "blur"),
  manageType: requiredRule("管理类型"),
  payMethod: requiredRule("产值确认方式"),
  signAmt: moneyRule("签约金额"),
  signExclAmt: moneyRule("不含税金额"),
  taxAmt: moneyRule("税额"),
  signDate: requiredRule("签订日期"),
  effectiveDate: requiredRule("生效日期"),
  expiryDate: requiredRule("到期日期"),
  pbAmount: moneyRule("应缴履约保证金金额"),
  bldNames: requiredInputRule("楼栋范围"),
  bldIds: requiredRule("楼栋范围"),
  needSeal: requiredRule("是否用印"),
  sealTypes: requiredRule("印章类型"),
  needSettle: requiredRule("是否需办理结算"),   
  signAddr: requiredInputRule("签约地点"),
  supCmanName: requiredInputRule("联系人姓名"),
  supCmanTel: phoneRule("联系人电话"),
  supCmanJob: optionalInputRule("联系人职务"),
  bankName: optionalInputRule("开户银行"),
  accountName: optionalInputRule("银行户名"),
  bankAccount: bankCardRule("银行账号"),
});
