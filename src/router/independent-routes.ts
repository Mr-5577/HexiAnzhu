export const independentRoutes = [
  {
    path: "/cost-allocation",
    name: "costAllocation",
    component: () => import("@/views/cost/cost-allocation/index.vue"),
    meta: {
      title: "成本分摊",
      isKeepAlive: false,
    },
  },{
    path: "/finance-allocation",
    name: "financeAllocation",
    component: () => import("@/views/cost/finance-allocation/index.vue"),
    meta: {
      title: "财务分摊",
      isKeepAlive: false,
    },
  }
];
