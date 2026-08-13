/**
 * useInvoiceRecognition.ts
 * ---------------------------------------------------------------------------
 * 在 Vue 3 + Element Plus 项目中的使用示例（薄封装层）。
 * 把「通知弹窗」与「合并进表格」这些 UI 副作用接到通用模块上，
 * 业务页面无需传 api（已默认使用 commonApi.recognizeAndCheckInvoice），
 * 只需传入表单上下文即可。
 *
 * 用法：
 *   const getAnnexFileList = useInvoiceRecognition();
 *   // 上传回调里：
 *   const rows = await getAnnexFileList(fileList, {
 *     conBillId: formData.value.conBillId,
 *     srcType: formType.CON_PAY,
 *     generateUuid: uuidv4,
 *   });
 *   if (rows) invoiceMTable.value.push(...rows);
 * ---------------------------------------------------------------------------
 */
import { ElNotification, ElMessage } from "element-plus";
import {
  batchRecognizeInvoices,
  recognizeInvoice,
  toInvoiceTableRows,
  type RecognizedInvoice,
} from "@/utils/invc-verif";

export interface UseInvoiceRecognitionResult {
  /** 返回表格行数组；若整体失败返回 null */
  (
    fileList: { id: number; annexName: string }[],
    ctx: {
      conBillId?: any;
      srcType?: any;
      generateUuid: () => string;
    }
  ): Promise<ReturnType<typeof toInvoiceTableRows> | null>;
}

export function useInvoiceRecognition(): UseInvoiceRecognitionResult {
  return async function getInvcDataList(
    fileList: { id: number; annexName: string }[],
    ctx: {
      conBillId?: any;
      srcType?: any;
      generateUuid: () => string;
    }
  ) {
    if (!fileList || fileList.length === 0) return null;

    const notify = ElNotification({
      title: "发票识别中",
      message: `正在识别 ${fileList.length} 张发票，请稍候...`,
      type: "info",
      duration: 0,
      position: "top-right",
    });

    try {
      const results: RecognizedInvoice[] = await batchRecognizeInvoices({
        fileList,
        concurrency: 5,
        onProgress: (done, total) => {
          // 注意：Element Plus 通知实例的 message 为只读渲染，直接赋值不会触发重绘，
          // 因此不在此处尝试更新文案，仅保留整体「识别中」提示，完成时统一关闭。
          void done;
          void total;
        },
      });

      notify.close();

      const ok = results.filter((r) => r.success).length;
      const fail = results.length - ok;

      if (fail === 0) {
        ElNotification({
          title: "识别完成",
          message: `成功识别 ${ok} 张发票！`,
          type: "success",
          duration: 3000,
          position: "top-right",
        });
      } else {
        ElMessage.warning(`识别完成：${ok} 张成功，${fail} 张失败`);
      }

      return toInvoiceTableRows(results, ctx);
    } catch (error) {
      notify.close();
      ElMessage.error("发票识别失败");
      return null;
    }
  };
}



/**
 * 重新查验某张发票，并把结果「就地写回」当前行。
 * 封装了 recognizeInvoice + applyRecognizedToRow + 通知提示，
 * 业务页面直接调用即可，无需再 import utils / invoice-recognition。
 *
 * @param row 表格中的行（需含 annexId / annexName；通常来自 v-for 的响应式元素）
 * @returns 是否查验成功
 */
export async function invcRecognitionRefresh(
  row: Record<string, any>
) {
  if (!row.annexId) {
    ElMessage.warning("未上传发票！");
    return null;
  }

  const notify = ElNotification({
      title: "发票识别中",
      message: `正在识别发票，请稍候...`,
      type: "info",
      duration: 0,
      position: "top-right",
    });
  try {  
    const recognized = await recognizeInvoice(row.annexId, row.annexName);

    if (!recognized.success) {
      ElNotification({
        title: "识别完成",
        message: `发票查验完成！`,
        type: "success",
        duration: 3000,
        position: "top-right",
      });
    };
    notify.close();

    ElMessage.success("查验完成");
    return recognized;    
  } catch (error) {
    notify.close();
    ElMessage.error("发票识别失败");
    return null;
  }
}

