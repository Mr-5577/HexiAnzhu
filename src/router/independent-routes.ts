// 独立路由
export const independentRoutes = [
  {
    path: "/cost-allocation",
    name: "costAllocation",
    component: () => import("@/views/cost/cost-allocation/index.vue"),
    meta: {
      title: "成本分摊",
      isKeepAlive: false,
    },
  },
  {
    path: "/oa/ncon/cost-allocation",
    name: "oa-ncon-costAllocation",
    component: () => import("@/views/cost/cost-allocation/ncon-cost-alloc/index.vue"),
    meta: {
      title: "成本分摊",
      isKeepAlive: false,
    },
  },
  {
    path: "/finance-allocation",
    name: "financeAllocation",
    component: () => import("@/views/cost/finance-allocation/index.vue"),
    meta: {
      title: "财务分摊",
      isKeepAlive: false,
    },
  },
  {
    path: "/oa/bidding/bidding-detail",
    name: "oa-bidding-detail",
    component: () =>
      import("@/views/cost/bidding/tender-matter/bidding-detail.vue"),
    meta: {
      title: "招标事项详情",
      isKeepAlive: false,
    },
  },
  {
    path: "/oa/bidding/bidding-demand/detail",
    name: "oa-bidding-demand-detail",
    component: () =>
      import("@/views/cost/bidding/bidding-demand/bidding-demand-detail.vue"),
    meta: {
      title: "招标需求详情",
      isKeepAlive: false,
    },
  },
  {
    path: "/oa/bidding/tender-plan/detail",
    name: "oa-tender-plan-detail",
    component: () =>
      import("@/views/cost/bidding/tender-matter/components/tender-plan/tender-plan-detail.vue"),
    meta: {
      title: "招标审批详情",
      isKeepAlive: false,
    },
  },
  {
    path: "/oa/bidding/reference-price/detail",
    name: "oa-reference-price-detail",
    component: () =>
      import("@/views/cost/bidding/tender-matter/components/reference-price/reference-price-detail.vue"),
    meta: {
      title: "定标参考价详情",
      isKeepAlive: false,
    },
  },
  {
    path: "/oa/bidding/award-approval/detail",
    name: "oa-award-approval-detail",
    component: () =>
      import("@/views/cost/bidding/tender-matter/components/award-approval/award-approval-detail.vue"),
    meta: {
      title: "定标审批详情",
      isKeepAlive: false,
    },
  },
  {
    path: "/oa/bidding/bid-bond-pay/detail",
    name: "oa-bid-bond-pay-detail",
    component: () =>
      import("@/views/cost/bidding/tender-matter/components/bid-bond-pay/bid-bond-pay-detail.vue"),
    meta: {
      title: "保证金缴纳详情",
      isKeepAlive: false,
    },
  },
  {
    path: "/oa/bidding/bid-bond-refund/detail",
    name: "oa-bid-bond-refund-detail",
    component: () =>
      import("@/views/cost/bidding/tender-matter/components/bid-bond-refund/bid-bond-refund-detail.vue"),
    meta: {
      title: "保证金退还详情",
      isKeepAlive: false,
    },
  },
];
