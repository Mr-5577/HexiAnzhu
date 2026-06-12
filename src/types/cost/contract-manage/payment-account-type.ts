// ==================== 收款账号 类型定义 ====================
/**
 * 收款账号 信息
 */
export interface ContractBankAccount {
  /** 主键ID */
  id: number;
  /** 合同ID */
  conId: number;
  /** 银行名称 */
  bankName: string;
  /** 账户名称（开户名） */
  accountName: string;
  /** 银行账号 */
  bankAccount: string;
  /** 是否默认：false-否，true-是 */
  isDefault: boolean;
  /** 是否启用：false-禁用，true-启用 */
  isEnabled: boolean;
  /** 创建人 */
  createId: number;
  /** 创建时间 */
  createDate: string;
  /** 更新人 */
  operId: number | null;
  /** 更新时间 */
  operDate: string | null;
  /** 删除标识：false-未删除，true-已删除 */
  isDel: boolean;
}

/**
 * 新增/编辑 收款账号参数
 */
export interface ContractBankAccountParams {
  /** 主键ID */
  id?: number;
  /** 合同ID */
  conId: number;
  /** 银行名称 */
  bankName: string;
  /** 账户名称（开户名） */
  accountName: string;
  /** 银行账号 */
  bankAccount: string;
  /** 是否启用：false-禁用，true-启用 */
  isEnabled: boolean;
  /** 是否默认：false-禁用，true-启用 */
  isDefault: boolean;
}
