// 按钮权限标识映射
export const PERMISSIONS = {
  // 资产管理
  INV_DETAIL_EXPORT: "inventory-detail:export", // 库存明细表-导出
  INV_STATS_EXPORT: "inventory-statistics:export", // 库存统计表-导出
  OUTPUT_STATS_EXPORT: "output-statistics:export", // 产值统计表-导出
  ROOM_LEDGER_EXPORT: "room-ledger:export", // 房源台账-导出
  ROOM_LEDGER_SHOW_TEL: "room-ledger:showTel", // 房源台账-显示电话

  // 渠道分析
  CONV_RATE_EXPORT: "conversion-rate:export", // 转化率-导出
  DEAL_CHANNEL_EXPORT: "deal-channel:export", // 成交渠道-导出
  VISIT_CHANNEL_EXPORT: "visiting-channel:export", // 来访渠道-导出
  VISIT_RECORD_EXPORT: "visiting-record:export", // 来访记录-导出
  VISIT_RECORD_SHOW_ALL_TEL: "visiting-record:showAllTel", // 来访记录-显示全部电话
  VISIT_STATS_EXPORT: "visiting-statistics:export", // 来访统计-导出

  // 业绩分析
  AGENT_RANK_EXPORT: "agent-ranking:export", // 经纪人排行-导出
  ANN_REPORT_EXPORT: "annual-report:export", // 年度报表-导出
  COLL_DETAIL_EXPORT: "collection-detail:export", // 回款明细-导出
  COLL_DETAIL_SHOW_TEL: "collection-detail:showTel", // 回款明细-显示电话
  CONT_DETAIL_EXPORT: "contract-detail:export", // 合同明细-导出
  CONT_DETAIL_SHOW_TEL: "contract-detail:showTel", // 合同明细-显示电话
  DAILY_REPORT_EXPORT: "daily-report:export", // 日报表-导出
  SUB_DETAIL_EXPORT: "sub-detail:export", // 认购明细-导出
  SUB_DETAIL_SHOW_TEL: "sub-detail:showTel", // 认购明细-显示电话
  SUB_STATS_EXPORT: "subscription-statistics:export", // 认购统计-导出
  TREE_ANN_REPORT_EXPORT: "tree-annual-report:export", // 树形年度报表-导出
  TREE_DAILY_REPORT_EXPORT: "tree-daily-report:export", // 树形日报表-导出

  // 风险分析
  AGING_DETAIL_EXPORT: "aging-detail:export", // 账龄明细-导出
  AGING_DETAIL_SHOW_TEL: "aging-detail:showTel", // 账龄明细-显示电话
  CONV_DETAIL_EXPORT: "conversion-detail:export", // 转化明细-导出
  CONV_DETAIL_SHOW_TEL: "conversion-detail:showTel", // 转化明细-显示电话
  CONV_STATS_EXPORT: "conversion-stats:export", // 转化统计-导出
  FORFEIT_DETAIL_EXPORT: "forfeiture-detail:export", // 退单明细-导出
  FORFEIT_DETAIL_SHOW_TEL: "forfeiture-detail:showTel", // 退单明细-显示电话
  FORFEIT_STATS_EXPORT: "forfeiture-stats:export", // 退单统计-导出
  PEND_DETAIL_EXPORT: "pending-detail:export", // 待办明细-导出
  PEND_DETAIL_SHOW_TEL: "pending-detail:showTel", // 待办明细-显示电话
  PEND_STATS_EXPORT: "pending-stats:export", // 待办统计-导出
  PREM_DETAIL_EXPORT: "premium-detail:export", // 溢价明细-导出
  PREM_DETAIL_SHOW_TEL: "premium-detail:showTel", // 溢价明细-显示电话
  PREM_STATS_EXPORT: "premium-stats:export", // 溢价统计-导出
  RECV_DETAIL_EXPORT: "receivable-detail:export", // 应收明细-导出
  RECV_DETAIL_SHOW_TEL: "receivable-detail:showTel", // 应收明细-显示电话
  RECV_EXPORT: "receivables:export", // 应收款-导出

  // 成本管理
  CONT_ANNEX_UPLOAD: "contract-annex:upload", // 合同附件-上传
  CONT_ANNEX_DELETE: "contract-annex:delete", // 合同附件-删除
  COST_ALLOC_CON_MAIN: "cost-alloc:con-main", // 合同-成本分摊
  COST_ALLOC_CON_ADD: "cost-alloc:con-add", // 补充合同-成本分摊
  COST_ALLOC_CON_BG: "cost-alloc:con-bg", // 变更合同-成本分摊
  COST_ALLOC_CON_PROD: "cost-alloc:con-prod", // 产值合同-成本分摊
  COST_ALLOC_CON_QZ: "cost-alloc:con-qz", // 签证合同-成本分摊
  COST_ALLOC_NCON_PROC: "cost-alloc:ncon-proc", // 非合同立项-成本分摊
  COST_ALLOC_NCON_CST: "cost-alloc:ncon-cst", // 非合同请款-成本分摊
  FINA_ALLOC_CON_PAY: "fina-alloc:con-pay", // 合同支付-财务分摊
  FINA_ALLOC_NCON_CST: "fina-alloc:ncon-cst", // 非合同请款-财务分摊
  FINA_ALLOC_NCON_FEE: "fina-alloc:ncon-fee", // 非合同费用报销-财务分摊
  PAY_REG_DETAIL: "payment-register:detail", // 付款登记-明细
  PAY_LEDGER_REG: "payment-ledger:register", // 付款台账-登记
  PAY_LEDGER_ENTRY: "payment-ledger:entry", // 付款台账-录入

  // 报表管理
  CON_OVERVIEW_EXPORT: "contract-overview:export", // 合同执行概览-导出
  PAY_OVERVIEW_EXPORT: "payment-overview:export", // 请款执行概览-导出
  PAY_DETAIL_EXPORT: "payment-detail:export", // 请款执行明细-导出
  PROJECT_OUTPUT_EXPORT: "project-output:export", // 产值申报概览-导出
  OUTPUT_DETAIL_EXPORT: "output-detail:export", // 产值申报明细-导出

  // 系统角色权限
  DEPT_PERM_EDIT: "department-permissions:edit", // 部门权限-编辑
  PROJ_PERM_EDIT: "project-permissions:edit", // 项目权限-编辑
  PERSON_PERM_ADD: "personnel-permissions:add", // 人员权限-新增
  PERSON_PERM_DEL: "personnel-permissions:del", // 人员权限-删除
  ROLE_ADD: "role:add", // 角色-新增
  ROLE_EDIT: "role:edit", // 角色-编辑
  ROLE_DEL: "role:del", // 角色-删除
  MEMBER_ADD: "member:add", // 成员-新增
  MEMBER_EDIT: "member:edit", // 成员-编辑
  MEMBER_DEL: "member:del", // 成员-删除
  MENU_PERM_EDIT: "menu-permissions:edit", // 菜单权限-编辑
} as const;
