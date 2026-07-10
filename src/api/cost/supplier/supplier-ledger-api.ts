import { http } from "@/axios/service";
import {
  SupplierAnnexDeleteParams,
  SupplierAnnexQueryParams,
  SupplierAnnexSaveParams,
  SupplierBankDeleteParams,
  SupplierBankQueryParams,
  SupplierBankSaveParams,
  SupplierDeleteParams,
  SupplierPerfDeleteParams,
  SupplierPerfQueryParams,
  SupplierPerfSaveParams,
  SupplierQueryParams,
  SupplierSaveParams,
  SupplierSegmentDeleteParams,
  SupplierSegmentQueryParams,
  SupplierSegmentSaveParams,
} from "@/types/cost/supplier/supplier-ledger-type";
/**
 * 供应商台账 API
 * @description 提供供应商台账的增删改查功能，包括主表、服务板块、银行账户、资质、项目业绩等子表管理
 */
export const supplierApi = {
  // ==================== 供应商主表 ====================
  /**
   * 查询供应商列表
   * @param data - 查询参数
   * @param data.id - 供应商ID（精确查询）
   * @param data.supCode - 供应商编码（模糊查询）
   * @param data.supName - 供应商名称（模糊查询）
   * @param data.supLinkType - 供应商关联类型：1-内部关联单位，2-外部单位
   * @param data.supTypeId - 供应商主要服务类别ID
   * @param data.supNatureId - 企业性质ID
   * @param data.taxTypeId - 纳税类型ID
   * @param data.supStatus - 供应商状态
   * @param data.segId - 服务板块ID
   * @param data.entryDateStart - 入库日期开始
   * @param data.entryDateEnd - 入库日期结束
   * @returns Promise 供应商列表
   */
  getSupplierList: (data: SupplierQueryParams) => {
    return http.formPost("/sup/supplier/getList", data);
  },

  /**
   * 新增供应商
   * @param data - 新增参数
   * @param data.supName - 供应商名称（必填）
   * @param data.supTypeId - 供应商主要服务类别ID（必填）
   * @param data.segIds - 服务板块ID列表
   * @param data.bankAccounts - 银行账户列表
   * @returns Promise
   */
  addSupplier: (data: SupplierSaveParams) => {
    return http.post("/sup/supplier/add", data);
  },

  /**
   * 修改供应商
   * @param data - 修改参数
   * @param data.id - 供应商ID（必填）
   * @param data.supName - 供应商名称（必填）
   * @param data.supTypeId - 供应商主要服务类别ID（必填）
   * @param data.segIds - 服务板块ID列表
   * @param data.bankAccounts - 银行账户列表
   * @returns Promise
   */
  editSupplier: (data: SupplierSaveParams) => {
    return http.post("/sup/supplier/edit", data);
  },

  /**
   * 删除供应商
   * @param data - 删除参数
   * @param data.id - 供应商ID（必填）
   * @returns Promise
   */
  delSupplier: (data: SupplierDeleteParams) => {
    return http.formPost("/sup/supplier/del", data);
  },

  // ==================== 供应商服务板块 ====================

  /**
   * 查询供应商服务板块列表
   * @param data - 查询参数
   * @param data.supId - 供应商ID
   * @param data.segId - 板块ID
   * @param data.segIds - 板块ID列表（批量查询）
   * @param data.supIds - 供应商ID列表（批量查询）
   * @param data.remark - 备注（模糊查询）
   * @returns Promise 服务板块列表
   */
  getSegList: (data: SupplierSegmentQueryParams) => {
    return http.formPost("/sup/seg/getList", data);
  },

  /**
   * 新增供应商服务板块
   * @param data - 新增参数
   * @param data.supId - 供应商ID（必填）
   * @param data.segId - 板块ID（必填）
   * @param data.remark - 备注
   * @returns Promise
   */
  addSeg: (data: SupplierSegmentSaveParams) => {
    return http.post("/sup/seg/add", data);
  },

  /**
   * 修改供应商服务板块
   * @param data - 修改参数
   * @param data.id - 主键ID（必填）
   * @param data.segId - 板块ID（必填）
   * @param data.remark - 备注
   * @returns Promise
   */
  editSeg: (data: SupplierSegmentSaveParams) => {
    return http.post("/sup/seg/edit", data);
  },

  /**
   * 删除供应商服务板块
   * @param data - 删除参数
   * @param data.id - 主键ID（必填）
   * @returns Promise
   */
  delSeg: (data: SupplierSegmentDeleteParams) => {
    return http.formPost("/sup/seg/del", data);
  },

  // ==================== 供应商银行账户 ====================

  /**
   * 查询供应商银行账户列表
   * @param data - 查询参数
   * @param data.supId - 供应商ID
   * @param data.isDefault - 是否默认账户：false-否，true-是
   * @param data.isEnabled - 是否启用：false-禁用，true-启用
   * @returns Promise 银行账户列表
   */
  getBankList: (data: SupplierBankQueryParams) => {
    return http.formPost("/sup/bank/getList", data);
  },

  /**
   * 新增供应商银行账户
   * @param data - 新增参数
   * @param data.supId - 供应商ID（必填）
   * @param data.bankName - 开户银行（必填）
   * @param data.accountName - 银行户名（必填）
   * @param data.bankAccount - 银行账号（必填）
   * @param data.isDefault - 是否默认账户，默认 false
   * @param data.isEnabled - 是否启用，默认 true
   * @param data.remark - 备注
   * @returns Promise
   */
  addBank: (data: SupplierBankSaveParams) => {
    return http.post("/sup/bank/add", data);
  },

  /**
   * 修改供应商银行账户
   * @param data - 修改参数
   * @param data.id - 主键ID（必填）
   * @param data.bankName - 开户银行（必填）
   * @param data.accountName - 银行户名（必填）
   * @param data.bankAccount - 银行账号（必填）
   * @param data.isDefault - 是否默认账户
   * @param data.isEnabled - 是否启用
   * @param data.remark - 备注
   * @returns Promise
   */
  editBank: (data: SupplierBankSaveParams) => {
    return http.post("/sup/bank/edit", data);
  },

  /**
   * 删除供应商银行账户
   * @param data - 删除参数
   * @param data.id - 主键ID（必填）
   * @returns Promise
   */
  delBank: (data: SupplierBankDeleteParams) => {
    return http.formPost("/sup/bank/del", data);
  },

  // ==================== 供应商资质 ====================

  /**
   * 查询供应商资质列表
   * @param data - 查询参数
   * @param data.supId - 供应商ID
   * @param data.annexType - 附件类型
   * @param data.annexName - 附件名称（模糊查询）
   * @param data.annexId - 附件ID
   * @param data.remark - 备注（模糊查询）
   * @returns Promise 资质列表
   */
  getAnnexList: (data: SupplierAnnexQueryParams) => {
    return http.formPost("/sup/annex/getList", data);
  },

  /**
   * 新增供应商资质
   * @param data - 新增参数
   * @param data.supId - 供应商ID（必填）
   * @param data.annexType - 附件类型（必填）
   * @param data.annexName - 附件名称（必填）
   * @param data.annexId - 附件ID（必填，由文件上传接口返回）
   * @param data.remark - 备注
   * @returns Promise
   * @example
   * // 先上传文件获取 annexId
   * const uploadRes = await uploadFile({ file })
   * // 再保存资质信息
   * await addAnnex({
   *   supId: 1,
   *   annexType: '营业执照',
   *   annexName: '营业执照.pdf',
   *   annexId: uploadRes.data.id
   * })
   */
  addAnnex: (data: SupplierAnnexSaveParams) => {
    return http.post("/sup/annex/add", data);
  },

  /**
   * 修改供应商资质
   * @param data - 修改参数
   * @param data.id - 主键ID（必填）
   * @param data.annexType - 附件类型（必填）
   * @param data.annexName - 附件名称（必填）
   * @param data.annexId - 附件ID（必填）
   * @param data.remark - 备注
   * @returns Promise
   */
  editAnnex: (data: SupplierAnnexSaveParams) => {
    return http.post("/sup/annex/edit", data);
  },

  /**
   * 删除供应商资质
   * @param data - 删除参数
   * @param data.id - 主键ID（必填）
   * @returns Promise
   */
  delAnnex: (data: SupplierAnnexDeleteParams) => {
    return http.formPost("/sup/annex/del", data);
  },

  // ==================== 供应商项目业绩 ====================

  /**
   * 查询供应商项目业绩列表
   * @param data - 查询参数
   * @param data.supId - 供应商ID
   * @param data.projName - 项目名称（模糊查询）
   * @param data.companyName - 合作单位（模糊查询）
   * @param data.minConAmount - 合同金额最小值
   * @param data.maxConAmount - 合同金额最大值
   * @param data.startDateFrom - 开始日期范围-起始
   * @param data.startDateTo - 开始日期范围-结束
   * @param data.endDateFrom - 结束日期范围-起始
   * @param data.endDateTo - 结束日期范围-结束
   * @returns Promise 项目业绩列表
   */
  getPerfList: (data: SupplierPerfQueryParams) => {
    return http.formPost("/sup/perf/getList", data);
  },

  /**
   * 新增供应商项目业绩
   * @param data - 新增参数
   * @param data.supId - 供应商ID（必填）
   * @param data.projName - 项目名称（必填）
   * @param data.companyName - 合作单位（必填）
   * @param data.conAmount - 合同金额（必填）
   * @param data.conDesc - 合同概述（必填）
   * @param data.startDate - 开始日期
   * @param data.endDate - 结束日期
   * @param data.annexId - 相关附件ID
   * @returns Promise
   */
  addPerf: (data: SupplierPerfSaveParams) => {
    return http.post("/sup/perf/add", data);
  },

  /**
   * 修改供应商项目业绩
   * @param data - 修改参数
   * @param data.id - 主键ID（必填）
   * @param data.projName - 项目名称（必填）
   * @param data.companyName - 合作单位（必填）
   * @param data.conAmount - 合同金额（必填）
   * @param data.conDesc - 合同概述（必填）
   * @param data.startDate - 开始日期
   * @param data.endDate - 结束日期
   * @param data.annexId - 相关附件ID
   * @returns Promise
   */
  editPerf: (data: SupplierPerfSaveParams) => {
    return http.post("/sup/perf/edit", data);
  },

  /**
   * 删除供应商项目业绩
   * @param data - 删除参数
   * @param data.id - 主键ID（必填）
   * @returns Promise
   */
  delPerf: (data: SupplierPerfDeleteParams) => {
    return http.formPost("/sup/perf/del", data);
  },
};
