// ============ 表单校验规则工厂（全项目通用） ============
// 与具体业务无关，输入 label 即可生成规则，任何表单均可复用

import { bankCardRegex, idCardRegex, phoneRegex } from "@/utils/regex";

type Rule = any;

/** 必填选择规则（change 触发，用于 select / date） */
export const requiredRule = (
  label: string,
  trigger: "change" | "blur" = "change",
): Rule[] => [{ required: true, message: `请选择${label}`, trigger }];

/** 必填输入规则（blur 触发，用于 input） */
export const requiredInputRule = (label: string): Rule[] => [
  { required: true, message: `请输入${label}`, trigger: "blur" },
];

/** 金额规则（必填 + 不能小于 0） */
export const moneyRule = (label: string): Rule[] => [
  { required: true, message: `请输入${label}`, trigger: "blur" },
  { type: "number", min: 0, message: `${label}不能小于0`, trigger: "blur" },
];

/** 正则规则（必填 + 正则校验） */
export const patternRule = (
  label: string,
  regex: RegExp,
  hint: string,
): Rule[] => [
  { required: true, message: `请输入${label}`, trigger: "blur" },
  { pattern: regex, message: hint, trigger: "blur" },
];

/** 系统编号规则（必填 + 字符校验：英文大小写、数字、下划线） */
export const codeRule = (label: string): Rule[] => [
  { required: true, message: `请输入${label}`, trigger: "blur" },
  {
    pattern: /^[a-zA-Z0-9_]+$/,
    message: `${label}只能包含英文大小写、数字和下划线`,
    trigger: "blur",
  },
];

/** 非必填输入规则 */
export const optionalInputRule = (label: string): Rule[] => [
  { required: false, message: `请输入${label}`, trigger: "blur" },
];

// ============ 预置正则规则（常见场景开箱即用） ============

/** 手机号必填规则 */
export const phoneRule = (label = "联系人电话") =>
  patternRule(label, phoneRegex, "请输入正确的手机号码");

/** 身份证号必填规则 */
export const idCardRule = (label = "身份证号码") =>
  patternRule(label, idCardRegex, "请输入正确的身份证号码");

/** 银行卡号必填规则 */
export const bankCardRule = (label = "银行账号") =>
  patternRule(label, bankCardRegex, "请输入正确的银行卡号");
