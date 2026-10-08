/**
 * 项目产值表 列表项
 */
export interface ProjectOutputVO {
  /** 供应商名称 */
  supName: string;
  /** 合同名称 */
  conName: string;
  /** 合同编号 */
  conSysNo: string;
  /** 税率（百分比数值，如 13 表示 13%） */
  taxRate?: number;
  /** 合同金额（签约金额+补充金额） */
  conAmt: number;
  /** 累计完成比例（累计产值 / (签约+补充) * 100，可能为小数） */
  completeRatio?: number;
  /** 截止上月累计产值 */
  lastMonthProdVal: number;
  /** 本月产值 */
  curMonthProdVal: number;
  /** 本月产值份数（审批完成的单据数） */
  curMonthProdCnt: number;
  /** 至本月累计产值 */
  curMonthTotalProdVal: number;
  /** 结算金额 */
  settleAmt: number;
  /** 最新合同产值（可能为累计产值或其他，按业务定义） */
  latestProdVal?: number;
  // 以下字段可能用于扩展或统计，视具体接口返回
  /** 唯一标识（表格 rowKey） */
  uuid?: string;
}

/**
 * 项目产值表 查询参数
 */
export interface ProjectOutputQueryParam {
  /** 业务板块ID列表（选择“全部”时传入所有板块ID，否则为单个ID数组） */
  segIds?: number[];
  /** 项目ID（级联单选，为叶子节点ID） */
  projId?: number;
  /** 截止月份（YYYY-MM） */
  endMonth: string;
  /** 单位（'万元' 或 '元'） */
  unit: string;
  /** 是否导出（true 时触发导出接口） */
  isExport?: boolean;
}
