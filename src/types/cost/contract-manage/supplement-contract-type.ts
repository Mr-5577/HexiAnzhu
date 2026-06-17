// ==================== 补充合同类型定义 ====================

/**
 * 补充合同信息（主表） 对应数据库表: h_con_add
 */
export interface SupplementContract {
  /** 主键ID */
  id?: number;
  /** 单据ID */
  conBillId: number;
  /** 补充合同名称 */
  addName: string;
  /** 主合同签约公司ID */
  companyId: number;
  /** 合同系统编号 */
  addSysNo: string;
  /** 合同物理编号 */
  addPhyNo: string;
  /** 补充合同类型：1-变更转补充 2-普通补充合同 */
  addType: number;
  /** 主合同分类ID */
  conTypeId: number;
  /** 主合同类型：1-普通合同 2-战略合同 3-订单合同 4-采购订单 */
  conProperty: number;
  /** 主合同供应商ID */
  supId: number;
  /** 主合同计价方式：1-总价包干 2-暂定总价 3-单价合同 */
  priceType: number;
  /** 主合同生产专业ID */
  proProf: number;
  /** 主合同楼栋ID（多个用逗号分隔） */
  bldIds: string;
  /** 主合同楼栋名称（多个用逗号分隔） */
  bldNames: string;
  /** 主合同付款方式：1-按进度支付 2-按节点支付 */
  payMethod: number;
  /** 补充合同签约金额（含税） */
  addAmt: number;
  /** 补充合同签约金额（不含税） */
  addExclAmt: number;
  /** 税额 */
  taxAmt: number;
  /** 签订日期 */
  signDate: string;
  /** 经办人ID */
  agentId: number;
  /** 创建人ID */
  createId?: number;
  /** 创建时间 */
  createDate?: string;
  /** 更新人ID */
  operId?: number;
  /** 更新时间 */
  operDate?: string;
  /** 删除标识 */
  isDel?: boolean;
}

/**
 * 补充合同扩展信息 对应数据库表: h_con_add_ext
 */
export interface SupplementContractExt {
  /** 主键ID */
  id?: number;
  /** 单据ID */
  conBillId: number;
  /** 是否需要用印 */
  needSeal: boolean;
  /** 印章类型，多个以逗号隔开 */
  sealTypes: string;
  /** 签约地点 */
  signAddr: string;
  /** 供应商联系人 */
  supCmanName: string;
  /** 供应商联系人身份证号码 */
  supCmanIdno: string;
  /** 供应商联系人电话 */
  supCmanTel: string;
  /** 供应商联系人职务 */
  supCmanJob: string;
  /** 备注 */
  remark: string;
  /** 创建人ID */
  createId?: number;
  /** 创建时间 */
  createDate?: string;
  /** 更新人ID */
  operId?: number;
  /** 更新时间 */
  operDate?: string;
  /** 删除标识 */
  isDel?: boolean;
}

/**
 * 补充合同明细事项 对应数据库表: h_con_add_process
 * 对应后端接口参数: addProcesses 数组中的每一项
 */
export interface SupplementContractProcess {
  /** 主键ID */
  id?: number;
  /** 单据ID */
  conBillId?: number;
  /** 签证ID */
  visaId: number;
  /** 事项名称 */
  processName: string;
  /** 事项金额（含税） */
  processAmt: number;
  /** 事项金额（不含税） */
  processExclAmt: number;
  /** 签证申请人ID */
  visaApplyId: number;
  /** 签证申请日期 */
  visaApplyDate: string;
  /** 备注 */
  remark: string;
  /** 创建人ID */
  createId?: number;
  /** 创建时间 */
  createDate?: string;
  /** 更新人ID */
  operId?: number;
  /** 更新时间 */
  operDate?: string;
  /** 删除标识 */
  isDel?: boolean;
}

/**
 * 补充合同完整请求参数
 */
export interface SupplementContractRequest {
  /** 补充合同主表信息 */
  conAdd: SupplementContract;
  /** 补充合同扩展信息 */
  conAddExt: SupplementContractExt;
  /** 补充合同明细事项列表 */
  addProcesses: SupplementContractProcess[];
}

/**
 * 补充合同明细事项表单
 */
export interface SupplementProcessForm {
  /** 主键ID（编辑时必填） */
  id?: number;
  /** 单据ID */
  conBillId?: number;
  /** 签证ID */
  visaId?: number;
  /** 事项名称 */
  processName?: string;
  /** 事项金额（含税） */
  processAmt?: number | string;
  /** 事项金额（不含税） */
  processExclAmt?: number | string;
  /** 签证申请人ID */
  visaApplyId?: number;
  /** 签证申请日期 */
  visaApplyDate?: string;
  /** 备注 */
  remark?: string;
}
