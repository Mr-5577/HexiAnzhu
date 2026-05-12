import { http } from "@/axios/service";
import {
  SupplierBankDeleteParams,
  SupplierBankQueryParams,
  SupplierBankSaveParams,
  SupplierDeleteParams,
  SupplierQueryParams,
  SupplierSaveParams,
  SupplierSegmentDeleteParams,
  SupplierSegmentQueryParams,
  SupplierSegmentSaveParams,
} from "@/types/cost/supplier-ledger-type";

export const supplierApi = {
  // 查询供应商列表
  getSupplierList: (data: SupplierQueryParams) => {
    return http.formPost("/sup/supplier/getList", data);
  },
  // 新增供应商
  addSupplier: (data: SupplierSaveParams) => {
    return http.post("/sup/supplier/add", data);
  },
  // 修改供应商
  editSupplier: (data: SupplierSaveParams) => {
    return http.post("/sup/supplier/edit", data);
  },
  // 删除供应商
  delSupplier: (data: SupplierDeleteParams) => {
    return http.formPost("/sup/supplier/del", data);
  },

  // 查询供应商服务板块列表
  getSegList: (data: SupplierSegmentQueryParams) => {
    return http.formPost("/sup/seg/getList", data);
  },
  // 新增供应商服务
  addSeg: (data: SupplierSegmentSaveParams) => {
    return http.post("/sup/seg/add", data);
  },
  // 修改供应商服务
  editSeg: (data: SupplierSegmentSaveParams) => {
    return http.post("/sup/seg/edit", data);
  },
  // 删除供应商服务
  delSeg: (data: SupplierSegmentDeleteParams) => {
    return http.formPost("/sup/seg/del", data);
  },

  // 查询供应商银行账户列表
  getBankList: (data: SupplierBankQueryParams) => {
    return http.formPost("/sup/bank/getList", data);
  },
  // 新增供应商银行账户
  addBank: (data: SupplierBankSaveParams) => {
    return http.post("/sup/bank/add", data);
  },
  // 修改供应商银行账户
  editBank: (data: SupplierBankSaveParams) => {
    return http.post("/sup/bank/edit", data);
  },
  // 删除供应商银行账户
  delBank: (data: SupplierBankDeleteParams) => {
    return http.formPost("/sup/bank/del", data);
  },
};
