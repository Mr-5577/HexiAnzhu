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
  /**
   * @name 上传文件到临时目录
   * @param data - 请求参数
   * @param data.file - 待上传的文件对象
   * @returns Promise<{
   *   code: number;
   *   message: string;
   *   data: {
   *     id: number;              // 文件记录ID
   *     annexName: string;       // 附件名称
   *     annexSize: number;       // 附件大小（字节）
   *     annexMd5: string;        // 文件MD5值
   *     annexPath: string;       // 文件存储路径
   *     annexExt: string;        // 文件扩展名
   *     uploadStatus: 0 | 1;     // 文件状态：0-临时文件，1-正式文件
   *     expireTime: string;      // 过期时间（ISO 8601格式）
   *     createDate: string;      // 创建时间（ISO 8601格式）
   *     createId: number;        // 创建人ID
   *   }
   * }>
   *
   */
  uploadFile: (data: { file: File }) => {
    return http.formPost("/system/uploadFile", data);
  },
  /**
   * @name 将临时文件转为正式文件
   * @param data - 请求参数
   * @param data.annexIds - 附件ID集合
   * @returns Promise
   */
  enableFile: (data: { annexIds: number[] }) => {
    return http.formPost("/system/enableFile", data);
  },
  /**
   * @name 获取附件信息
   * @param data - 请求参数
   * @param data.annexId - 附件ID
   * @returns Promise<附件信息>
   */
  getFileList: (data: { annexId: number }) => {
    return http.formPost("/system/getFileList", data);
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
   * @name 批量绑定附件到业务单据
   * @param data AttachmentParams
   * @returns
   */
  batchBindAttachment: (data: AttachmentParams) => {
    return http.formPost("/system/batchBindAttachment", data);
  },
  /**
   * 设置文件过期时间
   * expireDays: 过期天数（0表示永不过期）
   */
  setFileExpireTime: (data: { annexId: number; expireDays: number }) => {
    return http.formPost("/system/setFileExpireTime", data);
  },
  /**
   * @name 识别发票文件
   * @param data - 请求参数
   * @param data.annexId - 附件ID（必传）
   * @param data.conBillId - 单据ID（可选，不传则仅识别不保存）
   * @returns Promise<识别结果>
   */
  recognizeInvoice: (data: { annexId: number; conBillId?: number }) => {
    return http.formPost("/system/recognizeInvoice", data);
  },
  /**
   * @name 生成业务流水号
   * @param data - 请求参数
   * @param data.bizType - 业务类型
   * @returns Promise<业务流水号>
   */
  getBillNo: (data: { bizType: String }) => {
    return http.formPost("/system/getBillNo", data);
  },
  /**
   * @name 生成OA审批页面重定向地址
   * @param data - 请求参数
   * @param data.oaRequestId - OA流程请求ID
   */
  generateRedirectUrl: (data: { oaRequestId: number }) => {
    return http.formPost("/workflow/generateRedirectUrl", data);
  },
};
