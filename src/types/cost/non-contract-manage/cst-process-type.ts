// ==================== 非合同建安立项 类型定义 ====================

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
 * 非合同建安立项
 */
export interface HNconCstProcess {
  /** 主键，自增 */
  id?: number;
  /** 业务板块ID */
  segId: number;
  /** 项目ID */
  projId: number;
  /** 事项编号 */
  processNo: string;
  /** 事项名称 */
  processName: string;
  /** 事项计划金额 */
  processAmt: number;
  /** 事项说明 */
  remark?: string;
  /** 本事项对应流程ID */
  nconBillId?: number;
  /** 结算单据ID */
  settledPaymentId?: number;
  /** 状态(0-草稿 5-审批中 10-已审批 20-已结算 30-已作废) */
  status: number;
}

/**
 * 新增 非合同建安立项 请求参数
 */
export interface CstProcessSaveParam {
  /** 非合同建安立项信息 */
  process: HNconCstProcess;
}
