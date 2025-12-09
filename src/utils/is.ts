// TypeScript 类型判断工具函数库

const toString = Object.prototype.toString;

export const is = (val: unknown, type: string) => {
  return toString.call(val) === `[object ${type}]`;
};

export const isDef = <T = unknown>(val?: T): val is T => {
  return typeof val !== "undefined";
};

export const isUnDef = <T = unknown>(val?: T): val is T => {
  return !isDef(val);
};

export const isObject = (val: any): val is Record<any, any> => {
  return val !== null && is(val, "Object");
};

export const isEmpty = <T = unknown>(val: T): val is T => {
  if (isArray(val) || isString(val)) {
    return val.length === 0;
  }

  if (val instanceof Map || val instanceof Set) {
    return val.size === 0;
  }

  if (isObject(val)) {
    return Object.keys(val).length === 0;
  }

  return false;
};

export const isDate = (val: unknown): val is Date => {
  return is(val, "Date");
};

export const isNull = (val: unknown): val is null => {
  return val === null;
};

export const isNullAndUnDef = (val: unknown): val is null | undefined => {
  return isUnDef(val) && isNull(val);
};

export const isNullOrUnDef = (val: unknown): val is null | undefined => {
  return isUnDef(val) || isNull(val);
};

export const isNumber = (val: unknown): val is number => {
  return is(val, "Number");
};

export const isPromise = <T = any>(val: unknown): val is Promise<T> => {
  return (
    is(val, "Promise") &&
    isObject(val) &&
    isFunction(val.then) &&
    isFunction(val.catch)
  );
};

export const isString = (val: unknown): val is string => {
  return is(val, "String");
};

export const isFunction = (val: unknown): val is Function => {
  return typeof val === "function";
};

export const isBoolean = (val: unknown): val is boolean => {
  return is(val, "Boolean");
};

export const isRegExp = (val: unknown): val is RegExp => {
  return is(val, "RegExp");
};

export const isArray = (val: any): val is Array<any> => {
  return val && Array.isArray(val);
};

export const isWindow = (val: any): val is Window => {
  return typeof window !== "undefined" && is(val, "Window");
};

export const isElement = (val: unknown): val is Element => {
  return isObject(val) && !!val.tagName;
};

export const isMap = (val: unknown): val is Map<any, any> => {
  return is(val, "Map");
};

export const isServer = typeof window === "undefined";

export const isClient = !isServer;

export const isUrl = (path: string): boolean => {
  try {
    new URL(path);
    return true;
  } catch (_error) {
    return false;
  }
};

// 是否是图片链接
export const isImgPath = (path: string): boolean => {
  return /(https?:\/\/|data:image\/).*?\.(png|jpg|jpeg|gif|svg|webp|ico)/gi.test(
    path
  );
};

export const isEmptyVal = (val: any): boolean => {
  return val === "" || val === null || val === undefined;
};

const data = [
  {
    id: 0,
    type: "module",
    name: "dashboard",
    icon: "DataBoard",
    sort: 0,
    parentId: 0,
    meta: {
      title: "工作台",
      icon: "DataBoard",
    },
    children: [
      {
        id: 1,
        type: "menu",
        name: "home",
        path: "home",
        component: "home/index", // 首页直接使用组件，不要children
        icon: "HomeFilled",
        sort: 1,
        parentId: 0,
        meta: {
          title: "首页",
          icon: "HomeFilled",
        },
      },
    ],
  },
  {
    id: 2,
    type: "module",
    name: "dashboard-analysis",
    icon: "DataBoard",
    sort: 1,
    parentId: 0,
    meta: {
      title: "大屏分析",
      icon: "Monitor",
    },
    children: [
      {
        id: 3,
        type: "menu",
        name: "sales-analysis",
        path: "sales-analysis",
        icon: "TrendCharts",
        sort: 1,
        parentId: 0,
        meta: {
          title: "销售分析",
          icon: "Monitor",
        },
        children: [
          {
            id: 4,
            type: "menu",
            name: "large-screen",
            path: "large-screen",
            component: "sales-analysis/large-screen",
            icon: "Monitor",
            sort: 1,
            parentId: 3,
            meta: {
              title: "销售大屏",
              icon: "Monitor",
            },
          },
        ],
      },
    ],
  },
  {
    id: 5,
    type: "module",
    name: "sales",
    icon: "ShoppingCart",
    sort: 2,
    parentId: 0,
    meta: {
      title: "销售管理",
      icon: "Monitor",
    },
    children: [
      {
        id: 6,
        type: "menu",
        name: "task-management",
        path: "task-management",
        icon: "Trophy",
        sort: 1,
        parentId: 0,
        meta: {
          title: "业绩任务",
          icon: "Monitor",
        },
        children: [
          {
            id: 7,
            type: "menu",
            name: "annual-task",
            path: "annual-task",
            component: "task-management/annual-task",
            icon: "Calendar",
            sort: 1,
            parentId: 6,
            meta: {
              title: "年度任务",
              icon: "Calendar",
            },
          },
          {
            id: 8,
            type: "menu",
            name: "month-task",
            path: "month-task",
            component: "task-management/month-task",
            icon: "Date",
            sort: 2,
            parentId: 6,
            meta: {
              title: "月度任务",
              icon: "Date",
            },
          },
        ],
      },
    ],
  },
  {
    id: 9,
    type: "module",
    name: "finance",
    icon: "Money",
    sort: 3,
    parentId: 0,
    meta: {
      title: "财务管理",
      icon: "Date",
    },
    children: [
      {
        id: 10,
        type: "menu",
        name: "finance-report",
        path: "finance-management",
        component: "finance-management/report",
        icon: "Document",
        sort: 1,
        parentId: 0,
        meta: {
          title: "财务报表",
          icon: "Document",
        },
      },
    ],
  },
];
