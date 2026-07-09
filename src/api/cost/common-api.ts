import { http } from "@/axios/service";
/**
 * 公共接口
 */
interface AttachmentParams {
  /** 业务附件ID */
  id?: number;
  /** 系统附件ID */
  annexId: number;
  /** 表名（业务单据表名） */
  tableName?: string;
  /** 表记录ID（业务单据ID） */
  tableId?: number;
  /** 附件分组标记（用于区分同一单据的不同附件组） */
  annexFlag?: string;
  /** 附件名称 */
  annexName?: string;
}
export const commonApi = {
  /** 上传文件到临时目录 */
  uploadFile: (data: { file: File }) => {
    return http.formPost("/system/uploadFile", data);
  },
  /** 将临时文件转为正式文件 */
  enableFile: (data: { annexId: number }) => {
    return http.formPost("/system/enableFile", data);
  },
  /** 获取附件信息 */
  getFileInfo: (data: { annexId: number }) => {
    return http.formPost("/system/getFileInfo", data);
  },
  /**
   * @name 识别发票文件
   * @param annexId  附件ID
   * @param conBillId  单据ID
   */
  recognizeInvoice: (data: { annexId: number; conBillId: number }) => {
    return http.formPost("/system/recognizeInvoice", data);
  },
  /**
   * @name 绑定附件到业务单据
   * @param data AttachmentParams
   * @returns
   */
  bindAttachment: (data: AttachmentParams) => {
    return http.formPost("/system/bindAttachment", data);
  },
  /**
   * 设置文件过期时间
   * expireDays: 过期天数（0表示永不过期）
   */
  setFileExpireTime: (data: { annexId: number; expireDays: number }) => {
    return http.formPost("/system/setFileExpireTime", data);
  },
  /** 生成业务流水号 */
  getBillNo: (data: { bizType: String }) => {
    return http.formPost("/system/getBillNo", data);
  },
};
