import { http } from "@/axios/service";

export const commonApi = {
  /** 上传文件到临时目录 */
  uploadFile: (data: { file: File }) => {
    return http.formPost("/system/uploadFile", data);
  },
  /** 将临时文件转为正式文件 */
  enableFile: (data: { annexId: String | Number }) => {
    return http.formPost("/system/enableFile", data);
  },
  /** 获取附件信息 */
  getFileInfo: (data: { annexId: String | Number }) => {
    return http.formPost("/system/getFileInfo", data);
  },
  /** 生成业务流水号 */
  getBillNo: (data: { bizType: String }) => {
    return http.formPost("/system/getBillNo", data);
  },
};
