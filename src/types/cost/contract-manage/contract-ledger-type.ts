// ==================== 合同台账 类型定义 ====================

// 新增/编辑合同台账参数
export interface HConMainSave {
  conMain: HConMain;
  conMainExt: HConMainExt;
}

// ==================== 通用基础类型 ====================

/** 基础实体字段 */
export interface BaseEntity {
  /** 主键，自增 */
  id?: number;
  /** 删除标识：0-未删除，1-已删除 */
  isDel?: boolean | string;
  /** 创建人ID */
  createId?: number;
  /** 创建时间 */
  createDate?: string;
  /** 更新人ID */
  operId?: number;
  /** 更新时间 */
  operDate?: string;
}

// ==================== 合同台账相关类型 ====================

/** 合同台账主表 */
export interface HConMain extends BaseEntity {
  /** 业务板块ID */
  segId?: number;
  /** 项目ID(外键) */
  projId: number;
  /** 核算项目ID */
  acctProjId?: number;
  /** 招采明细事项ID */
  tenderItemId?: number;
  /** 签约公司ID */
  companyId: number;
  /** 合同名称 */
  conName: string;
  /** 合同系统编号 */
  conSysNo: string;
  /** 合同档案编号 */
  conPhyNo?: string;
  /** 合同分类ID */
  conTypeId: number;
  /** 合同类型：1-普通合同 2-战略合同 3-订单合同 4-采购订单 */
  conProperty: number;
  /** 主合同ID */
  mainConId?: number;
  /** 供应商ID(外键) */
  supId: number;
  /** 计价方式：1-总价包干 2-暂定总价 3-单价合同 */
  priceType: number;
  /** 合同状态：0-草稿 5-审批中 10-已审批 20-已结算 30-已作废 */
  conStatus?: number;
  /** 签约金额（含税） */
  signAmt: number;
  /** 签约金额（不含税） */
  signExclAmt: number;
  /** 税额 */
  taxAmt: number;
  /** 签订日期 */
  signDate?: string;
  /** 生效日期 */
  effectiveDate?: string;
  /** 到期日期 */
  expiryDate?: string;
  /** 工期：自然日 */
  daysNum?: number;
  /** 是否需办理结算：false-否，true-是 */
  needSettle: boolean;
  /** 结算金额 */
  settleAmt?: number;
  /** 经办人ID */
  agentId?: number;
  /** 生产专业（数据字典：结构、景观等） */
  proProf?: number;
  /** 楼栋ID，多个逗号分隔 */
  bldIds?: string;
  /** 楼栋名称，多个逗号分隔 */
  bldNames?: string;
  /** 履约保证金金额 */
  pbAmount?: number;
  /** 管理类型：1-内部 2-外部 */
  manageType: number;
  /** 付款方式：1-按进度支付 2-按材料到货支付 3-按节点支付 */
  payMethod: number;
}

/** 合同台账扩展表 */
export interface HConMainExt extends BaseEntity {
  /** 合同ID(外键)，与h_con_main一对一 */
  conId: number;
  /** 是否需要用印：false-否，true-是 */
  needSeal?: boolean;
  /** 印章类型，多个以逗号隔开 */
  sealTypes?: string;
  /** 签约地点 */
  signAddr?: string;
  /** 供应商联系人姓名 */
  supCmanName?: string;
  /** 供应商联系人身份证号码 */
  supCmanIdno?: string;
  /** 供应商联系人电话 */
  supCmanTel?: string;
  /** 供应商联系人职务 */
  supCmanJob?: string;
  /** 开户银行 */
  bankName?: string;
  /** 银行户名 */
  accountName?: string;
  /** 银行账号 */
  bankAccount?: string;
  /** 是否默认账户：false-否，true-是 */
  isDefault?: boolean;
  /** 是否启用：false-禁用，true-启用 */
  isEnabled?: boolean;
  /** 备注 */
  remark?: string;
}

/** 合同单据价税明细表 */
export interface HConBillPrice extends BaseEntity {
  /** 主键 */
  id?: number;
  /** 单据ID */
  conBillId: number;
  /** 分项ID（如果是修订，则带出进行修改） */
  itemId?: number;
  /** 分项名称 */
  itemName: string;
  /** 分项金额（含税） */
  itemAmt: number;
  /** 税率 */
  itemTaxRate?: number;
  /** 分项金额（不含税） */
  itemExclAmt?: number;
  /** 分项税额 */
  itemTaxAmt?: number;
  /** 备注 */
  remark?: string;
}

/** 合同支付比例表 */
export interface HConBillPayrate extends BaseEntity {
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
export interface HConBillMaterial extends BaseEntity {
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

/** 合同支付节点明细表 */
export interface HConBillPaynode extends BaseEntity {
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

/** 通用业务附件表 */
export interface HTableAnnex extends BaseEntity {
  /** 主键 */
  id?: number;
  /** 表名 */
  tableName: string;
  /** 表主键值 */
  tableId: number;
  /** 附件分组标记 */
  annexFlag: string;
  /** 附件名称（别名） */
  annexName: string;
  /** 附件ID */
  sysAnnexId: number;
}

/** 查询合同台账列表参数 */
export interface HConMainQuery {
  /** 板块ID */
  segId?: number;
  /** 项目ID */
  projId: number;
  /** 合同名称 */
  conName?: string;
  /** 合同状态 */
  conStatus?: number;
}

/** 新增/编辑合同台账完整参数 */
export interface HConMainFullSave {
  /** 合同主表信息 */
  conMain: HConMain;
  /** 合同扩展信息 */
  conMainExt?: HConMainExt;
  /** 合同价税明细（支持多条） */
  billPrices?: HConBillPrice[];
  /** 合同支付比例（支持多条） */
  billPayrates?: HConBillPayrate[];
  /** 材料合同产值（支持多条） */
  billMaterials?: HConBillMaterial[];
  /** 合同支付节点明细（支持多条） */
  billPaynodes?: HConBillPaynode[];
  /** 合同附件（支持多条） */
  annexes?: HTableAnnex[];
}

/** 可以分步保存 - 第一步：基本信息 */
export interface HConMainStep1Save {
  conMain: HConMain;
  conMainExt: HConMainExt;
}

/** 分步保存 - 第二步：价格明细 */
export interface HConMainStep2Save {
  conId: number;
  billPrices: HConBillPrice[];
}

/** 分步保存 - 第三步：支付信息 */
export interface HConMainStep3Save {
  conId: number;
  billPayrates?: HConBillPayrate[];
  billPaynodes?: HConBillPaynode[];
  billMaterials?: HConBillMaterial[];
}

/** 分步保存 - 第四步：附件 */
export interface HConMainStep4Save {
  conId: number;
  annexes: HTableAnnex[];
}
