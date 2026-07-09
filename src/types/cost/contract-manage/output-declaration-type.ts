// ==================== 产值申报 类型定义 ====================

/**
 * 通用基础类型
 */
export interface BaseEntity {
  /** 主键，自增 */
  id?: number;
  /** 删除标识：false-未删除，true-已删除 */
  isDel?: boolean;
  /** 创建人ID */
  createId?: number;
  /** 创建时间 */
  createDate?: string;
  /** 更新人ID */
  operId?: number;
  /** 更新时间 */
  operDate?: string;
}

/**
 * 产值申报 信息
 * @description 对应数据库表 h_con_prod_val
 */
export interface ContractProdVal extends BaseEntity {
  /** 主键ID */
  id?: number;
  /** 单据ID */
  conBillId: number;
  /** 状态：0-草稿，5-审批中，10-已审批，30-已作废 */
  status: number;
  /** 合同签约金额 */
  signAmt: number;
  /** 补充合同金额 */
  addAmt: number;
  /** 累计变更签证 */
  sumChangeAmt: number;
  /** 预结算合同金额 */
  preSettleAmt: number;
  /** 累计产值 */
  sumProdVal: number;
  /** 累计应付 */
  sumPayAmt: number;
  /** 累计请款 */
  sumAppyAmt: number;
  /** 累计实付 */
  sumPaidAmt: number;
  /** 累计欠款 */
  sumOwedAmt: number;
  /** 合同ID */
  conId: number;
  /** 合同分类ID */
  conTypeId: number;
  /** 应付方法：1-按进度支付，2-按材料到货支付，3-按节点支付 */
  payMethod: number;
  /** 款项类型ID */
  payTypeId: number;
  /** 应付比例 */
  payRate: number;
  /** 是否强控：0-否，1-是 */
  isCtrl: number;
  /** 支付周期(月) */
  payIntvl: number;
  /** 本次申报产值金额 */
  applyProdVal: number;
  /** 本次申报应付金额 */
  applyPayAmt: number;
  /** 申报说明 */
  applyDesc: string;
  /** 成本复核产值金额 */
  costProdVal: number;
  /** 成本复核应付金额 */
  costPayAmt: number;
  /** 截止总产值 */
  totalProdVal: number;
  /** 截止总应付 */
  totalPayVal: number;
}

/**
 * 支付比例 信息
 * @description 对应数据库表 h_con_bill_payrate
 */
export interface ContractBillPayRate extends BaseEntity {
  /** 主键 */
  uuid?: string;
  /** 主键 */
  id?: number;
  /** 单据ID */
  conBillId: number;
  /** 支付比例ID */
  payRateId?: number;
  /** 数据字典，款项类型ID */
  payTypeId?: number;
  /** 应付比例 */
  payRate?: number;
  /** 是否强控：false-否，true-是，强控时应付=产值*比例，非强控应付可修改 */
  isCtrl?: boolean;
  /** 支付周期（月） */
  payIntvl?: number;
  /** 本次申请产值金额 */
  prodVal?: number;
  /** 本次申报应付金额 */
  payAmt?: number;
  /** 施工期间 */
  buildPeriod?: string;
  /** 产值期间 */
  prodValPeriod?: string;
  /** 计划付款日期 */
  payDate?: string;
  /** 成本复核产值金额 */
  costProdVal?: number;
  /** 成本复核应付金额 */
  costPayAmt?: number;
}

/** 材料合同产值表 */
export interface ContractBillMaterial extends BaseEntity {
  /** 主键 */
  uuid?: string;
  /** 主键 */
  id?: number;
  /** 单据ID */
  conBillId: number;
  /** 材料产值ID */
  mtId?: number;
  /** 材料名称 */
  mtName?: string;
  /** 材料规格 */
  mtModel?: string;
  /** 品牌 */
  mtBrand?: string;
  /** 接收数量 */
  recvNum?: number;
  /** 计量单位 */
  mtUnit?: string;
  /** 接收单号 */
  recvBillNo?: string;
  /** 接收价格 */
  recvPrice?: number;
  /** 罚款 */
  fineAmt?: number;
  /** 产值总金额 */
  prodVal?: number;
  /** 应付比例 */
  payRate?: number;
  /** 本次申报应付金额 */
  payAmt?: number;
  /** 施工期间 */
  buildPeriod?: string;
  /** 产值期间 */
  prodValPeriod?: string;
  /** 计划付款期间 */
  payDate?: string;
  /** 成本复核产值金额 */
  costProdVal?: number;
  /** 成本复核应付金额 */
  costPayAmt?: number;
}

/**
 * 支付节点明细 信息
 * @description 对应数据库表 h_con_bill_paynode
 */
export interface ContractBillPayNode extends BaseEntity {
  /** 主键 */
  uuid?: string;
  /** 主键 */
  id?: number;
  /** 单据ID */
  conBillId: number;
  /** 支付节点ID（如果是修订，则带出节点进行修改） */
  nodeId?: number;
  /** 支付节点名称 */
  nodeName: string;
  /** 数据字典，款项类型 */
  payType: number;
  /** 产值金额 */
  prodVal?: number;
  /** 应付比例 */
  payRate?: number;
  /** 应付金额 */
  payAmt?: number;
  /** 计划付款日期 */
  payDate?: string;
  /** 成本复核产值金额 */
  costProdVal?: number;
  /** 成本复核应付金额 */
  costPayAmt?: number;
  /** 备注 */
  remark?: string;
}

/**
 * 新增/编辑 产值申报参数
 */
export interface ContractProdValParams {
  /** 合同ID */
  conId: number;
  /** 产值信息 */
  prodVal: ContractProdVal;
  /** 合同支付比例 */
  billPayrates: ContractBillPayRate[];
  /** 材料合同产值 */
  billMaterials: ContractBillMaterial[];
  /** 合同支付节点 */
  billPaynodes: ContractBillPayNode[];
}
