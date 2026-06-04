// ==================== 合同台账类型定义 ====================
// 合同台账主表
export interface HConMain {
  /** 主键，自增 */
  id: number;
  /** 业务板块 */
  segId?: number;
  /** 项目ID(外键) */
  projId: number;
  /** 核算项目ID */
  acctProjId?: number;
  /** 招采明细事项ID */
  tenderItemId?: number;
  /** 签约公司 */
  companyId: number;
  /** 合同名称 */
  conName: string;
  /** 合同系统编号 */
  conSysNo: string;
  /** 合同档案编号 */
  conPhyNo?: string;
  /** 合同分类 */
  conTypeId: number;
  /** 合同类型（1-普通合同 2-战略合同 3-订单合同 4-采购订单） */
  conProperty: number;
  /** 主合同ID */
  mainConId?: number;
  /** 供应商ID(外键) */
  supId: number;
  /** 计价方式（1-总价包干 2-暂定总价 3-单价合同） */
  priceType: number;
  /** 合同状态（0-草稿 5-审批中 10-已审批 20-已结算 30-已作废） */
  conStatus: number;
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
  /** 是否需办理结算 */
  needSettle: boolean;
  /** 结算金额 */
  settleAmt?: number;
  /** 合同审批流程ID */
  flowId?: number;
  /** 经办人 */
  agentId?: number;
  /** 生产专业-结构、景观... */
  proProf?: number;
  /** 楼栋ID */
  bldIds?: string;
  /** 楼栋名称 */
  bldNames?: string;
  /** 履约保证金金额 */
  pbAmount?: number;
  /** 管理类型（1-内部 2-外部） */
  manageType: number;
  /** 付款方式（1-按进度支付 2-按节点支付） */
  payType: number;
  /** 创建人 */
  createId: number;
  /** 创建时间 */
  createDate: string;
  /** 更新人 */
  operId?: number;
  /** 更新时间 */
  operDate?: string;
  /** 删除标识 */
  isDel: boolean;
}
// 合同台账扩展表
export interface HConMainExt {
  /** 主键，自增 */
  id: number;
  /** 合同ID(外键) 与h_con_main一对一 */
  conId: number;
  /** 是否需要用印 */
  needSeal?: boolean;
  /** 印章类型，多个以逗号隔开 */
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
  /** 创建人 */
  createId: number;
  /** 创建时间 */
  createDate: string;
  /** 更新人 */
  operId?: number;
  /** 更新时间 */
  operDate?: string;
  /** 删除标识 */
  isDel: boolean;
}
