// ==================== 补充合同类型定义 ====================
/**
 * 补充合同信息 对应数据库表: h_con_add
 */
export interface SupplementContract {
  /** 主键ID */
  id: number;
  /** 单据ID */
  conBillId?: number;
  /** 补充合同名称 */
  addName: string;
  /** 主合同签约公司ID */
  companyId: number;
  /** 主合同签约公司名称（前端展示用） */
  companyName?: string;
  /** 合同系统编号 */
  addSysNo: string;
  /** 合同物理编号 */
  addPhyNo: string;
  /** 补充合同类型：1-变更转补充 2-普通补充合同 */
  addType: number;
  /** 补充合同类型名称 */
  addTypeName?: string;
  /** 主合同分类ID */
  conTypeId: number;
  /** 主合同分类名称 */
  conTypeName?: string;
  /** 主合同类型：1-普通合同 2-战略合同 3-订单合同 4-采购订单 */
  conProperty: number;
  /** 主合同类型名称 */
  conPropertyName?: string;
  /** 主合同供应商ID */
  supId: number;
  /** 主合同供应商名称 */
  supName?: string;
  /** 主合同计价方式：1-总价包干 2-暂定总价 3-单价合同 */
  priceType: number;
  /** 主合同计价方式名称 */
  priceTypeName?: string;
  /** 主合同生产专业ID（数据字典：结构、景观...） */
  proProf?: number;
  /** 主合同生产专业名称 */
  proProfName?: string;
  /** 主合同楼栋ID（多个用逗号分隔） */
  bldIds?: string;
  /** 主合同楼栋名称（多个用逗号分隔） */
  bldNames?: string;
  /** 楼栋列表（前端展示用） */
  buildingList?: Array<{ id: number; name: string }>;
  /** 主合同付款方式：1-按进度支付 2-按节点支付 */
  payType: number;
  /** 主合同付款方式名称 */
  payTypeName?: string;
  /** 补充合同签约金额（含税） */
  addAmt: number;
  /** 补充合同签约金额（不含税） */
  addExclAmt: number;
  /** 税额 */
  taxAmt: number;
  /** 签订日期 */
  signDate?: string; // date格式: 'YYYY-MM-DD'
  /** 经办人ID */
  agentId?: number;
  /** 经办人姓名 */
  agentName?: string;
  /** 创建人ID */
  createId: number;
  /** 创建人姓名 */
  createName?: string;
  /** 创建时间 */
  createDate: string; // datetime格式: 'YYYY-MM-DD HH:mm:ss'
  /** 更新人ID */
  operId?: number;
  /** 更新时间 */
  operDate?: string;
  /** 删除标识：false-未删除，true-已删除 */
  isDel: boolean;
}

/**
 * 补充合同扩展信息  对应数据库表: h_con_add_ext
 */
export interface SupplementContractExt {
  /** 主键ID */
  id: number;
  /** 补充合同ID（与h_con_add一对一） */
  addId: number;
  /** 是否需要用印 */
  needSeal?: boolean;
  /** 印章类型，多个以逗号隔开 */
  sealTypes?: string;
  /** 印章类型列表（前端展示用） */
  sealTypeList?: string[];
  /** 签约地点 */
  signAddr?: string;
  /** 供应商联系人 */
  supCmanName?: string;
  /** 供应商联系人身份证号码 */
  supCmanIdno?: string;
  /** 供应商联系人电话 */
  supCmanTel?: string;
  /** 供应商联系人职务 */
  supCmanJob?: string;
  /** 备注 */
  remark?: string;
  /** 创建人ID */
  createId: number;
  /** 创建时间 */
  createDate: string;
  /** 更新人ID */
  operId?: number;
  /** 更新时间 */
  operDate?: string;
  /** 删除标识 */
  isDel: boolean;
}

/**
 * 新增/编辑补充合同 - 表单数据
 */
export interface SupplementContractFormData {
  /** 补充合同ID（编辑时存在） */
  id?: number;
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
  proProf?: number;
  /** 主合同楼栋ID列表 */
  bldIds?: number[];
  /** 主合同楼栋name */
  bldNames?: string;
  /** 主合同付款方式：1-按进度支付 2-按节点支付 */
  payType: number;
  /** 补充合同签约金额（含税） */
  addAmt: number;
  /** 补充合同签约金额（不含税） */
  addExclAmt: number;
  /** 税额 */
  taxAmt: number;
  /** 签订日期 */
  signDate?: string;
  /** 经办人ID */
  agentId?: number;

  // ========== 扩展信息 ==========
  /** 是否需要用印 */
  needSeal?: boolean;
  /** 印章类型,多个逗号隔开 */
  sealTypes?: string;
  /** 签约地点 */
  signAddr?: string;
  /** 供应商联系人 */
  supCmanName?: string;
  /** 供应商联系人身份证号码 */
  supCmanIdno?: string;
  /** 供应商联系人电话 */
  supCmanTel?: string;
  /** 供应商联系人职务 */
  supCmanJob?: string;
  /** 备注 */
  remark?: string;
}

/**
 * 补充合同明细事项 对应数据库表: h_con_add_process
 */
export interface SupplementContractProcess {
  /** 主键ID */
  id: number;
  /** 单据ID */
  conBillId?: number;
  /** 签证ID */
  visaId?: number;
  /** 事项名称 */
  processName?: string;
  /** 事项金额（含税） */
  processAmt?: number;
  /** 事项金额（不含税） */
  processExclAmt?: number;
  /** 签证申请人ID */
  visaApplyId?: number;
  /** 签证申请人姓名 */
  visaApplyName?: string;
  /** 签证申请日期 */
  visaApplyDate?: string; // datetime格式
  /** 备注 */
  remark?: string;
  /** 创建人ID */
  createId: number;
  /** 创建时间 */
  createDate: string;
  /** 更新人ID */
  operId?: number;
  /** 更新时间 */
  operDate?: string;
  /** 删除标识 */
  isDel: boolean;
}

/** 新增/编辑 补充合同事项明细 */
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
