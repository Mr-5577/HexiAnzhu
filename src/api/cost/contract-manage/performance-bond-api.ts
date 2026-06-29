import { http } from "@/axios/service";
import {
  PerformanceBondEditParam,
  PerformanceBondParam,
  PerformanceBondReturnEditParam,
  PerformanceBondReturnParam,
} from "@/types/cost/contract-manage/performance-bond-type";

/**
 * 履约保证金 相关接口
 */
export const perfBondApi = {
  /** 查询履约保证金收取列表 */
  getLvRecvList: (data: { conId: number }) => {
    return http.formPost("/con/lvRecv/list", data);
  },
  /** 查询单个履约保证金收取 */
  getLvRecvDetail: (data: { id: number }) => {
    return http.formPost("/con/lvRecv/get", data);
  },
  /** 新增履约保证金收取 */
  addLvRecv: (data: PerformanceBondParam) => {
    return http.post("/con/lvRecv/add", data);
  },
  /** 修改履约保证金收取 */
  editLvRecv: (data: PerformanceBondEditParam) => {
    return http.post("/con/lvRecv/edit", data);
  },
  /** 删除履约保证金收取 */
  delLvRecv: (data: { id: number }) => {
    return http.formPost("/con/lvRecv/del", data);
  },

  /** 查询履约保证金退还列表 */
  getLvRefuvList: (data: { conId: number }) => {
    return http.formPost("/con/lvRefu/list", data);
  },
  /** 查询单个履约保证金退还 */
  getLvRefuDetail: (data: { id: number }) => {
    return http.formPost("/con/lvRefu/get", data);
  },
  /** 新增履约保证金退还 */
  addLvRefu: (data: PerformanceBondReturnParam) => {
    return http.post("/con/lvRefu/add", data);
  },
  /** 修改履约保证金退还 */
  editLvRefu: (data: PerformanceBondReturnEditParam) => {
    return http.post("/con/lvRefu/edit", data);
  },
  /** 删除履约保证金退还 */
  delLvRefu: (data: { id: number }) => {
    return http.formPost("/con/lvRefu/del", data);
  },
};
