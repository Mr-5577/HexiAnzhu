import { http } from "@/axios/service";
import {
  ContractAuditPriceFormData,
  EngineeringPrice,
} from "@/types/cost/contract-manage/engineering-price-type";

/**
 * 累计取数 相关接口
 */
export const cumulativeDataApi = {
  /**
   * @name 读取合同结算数据（预结算、结算）
   * @param data.conId 合同id
   * @param data.typeList 结算类型列表：0=预结算,1=结算
   * @returns
   */
  getSettleData: (data: { conId: number; typeList: number[] }) => {
    return http.formPost("/con/settleData", data);
  },
  /**
   * @name 读取合同累计数据（产值、应付、请款、已付、欠款、扣款、已扣、变更、签证）
   * @param data.conId 合同id
   * @param data.typeList 累计类型列表（逗号分隔）：0=产值,1=应付,2=请款,3=已付,4=欠款,5=扣款,6=已扣,7=变更,8=签证
   * @param data.isReadCache 是否优先读取缓存，不传后端默认为false
   * @param data.isSaveCache 是否计算结果写入缓存，不传后端默认为false
   * @returns
   */
  getAccumData: (data: {
    conId: number;
    typeList: number[];
    isReadCache?: boolean;
    isSaveCache?: boolean;
  }) => {
    return http.formPost("/con/accum", data);
  },
};
