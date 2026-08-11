/**
 * invoice-recognition.ts
 * ---------------------------------------------------------------------------
 * 发票识别 + 查验 通用模块（框架无关，不依赖 Vue / Element Plus）
 *
 * 设计目标：
 *   1. 把「后端响应 → 标准发票对象」的映射抽成纯函数（normalizeInvoiceResult）
 *   2. 把「UI 通知 / 状态合并」与识别逻辑解耦
 *   3. 单张 / 批量识别都暴露为通用方法，支持并发控制与进度回调
 *   4. 失败不再「静默丢字段」，统一返回 { success, error }，调用方自行决定怎么处理
 *
 * API 约定：识别接口固定为 commonApi.recognizeAndCheckInvoice，默认直接调用；
 *          如需单测或换接口，仍可传入自定义 api 覆盖。
 * ---------------------------------------------------------------------------
 */

/* 固定使用的识别接口（如路径不同，按你项目实际结构调整） */
import { commonApi } from "@/api/common-api";

/* ============================ 类型定义 ============================ */

/** 发票明细行 */
export interface InvoiceDetailItem {
  itemName: string; // 货物/劳务名称
  size: string; // 规格型号
  unit: string; // 单位
  num: number; // 数量
  price: number; // 单价
  totalAmt: number; // 金额
  taxRate: number; // 税率
  taxAmt: number; // 税额
}

/**
 * 发票识别状态
 * 0 - 未知 / 未查验 / 识别失败
 * 1 - 查验通过
 * 2 - 查验不通过
 */
export type InvoiceStatus = 0 | 1 | 2;

/** 标准化后的发票对象（无论从哪个接口来，统一长这样） */
export interface RecognizedInvoice {
  annexId: number;
  annexName: string;
  invNo?: string;
  invDate?: string;
  totalAmt?: number;
  notTaxAmt?: number;
  taxAmt?: number;
  invType?: string;
  buyerCompany?: string;
  buyerTaxCode?: string;
  sellerCompany?: string;
  sellerTaxCode?: string;
  isValid?: boolean;
  validateMsg?: string;
  ocrRes?: string;
  validateRes?: string;
  status: InvoiceStatus;
  invoiceDs: InvoiceDetailItem[];
  /** 本次识别是否成功（API 调用 + 解析是否顺利） */
  success: boolean;
  /** 失败原因，success 为 false 时存在 */
  error?: string;
}

/** 识别接口入参（按你现有 commonApi.recognizeAndCheckInvoice 的签名） */
export interface RecognizeInvoiceParams {
  annexId: number;
  annexName?: string;
}

/** 识别接口返回 */
export interface RecognizeInvoiceResponse {
  code: number;
  data?: { finalData?: any } | null;
}

/** 注入的识别 API（业务方自己传，本模块不关心具体请求实现） */
export type RecognizeInvoiceApi = (
  params: RecognizeInvoiceParams
) => Promise<RecognizeInvoiceResponse>;

/* ====================== 纯函数：响应 → 标准对象 ====================== */

/**
 * 将后端 finalData 映射为标准 RecognizedInvoice。
 * 纯函数，无副作用，便于单测与复用。
 */
export function normalizeInvoiceResult(
  finalData: any | null | undefined,
  meta: { annexId: number; annexName: string }
): RecognizedInvoice {
  debugger
  if (!finalData) {
    return {
      annexId: meta.annexId,
      annexName: meta.annexName,
      status: 0,
      invoiceDs: [],
      success: false,
      error: "无识别结果",
    };
  }

  // 明细来源：铁路发票取 Railway，否则取 InvoiceProducts
  const isRailway =finalData.Railway != null &&  typeof finalData.Railway === "object" &&  !Array.isArray(finalData.Railway);
  const productsSource = isRailway ? finalData.Railway : finalData.InvoiceProducts;
  //const products = Array.isArray(productsSource) ? productsSource : [];
  const products = isRailway ? [finalData.Railway] : Array.isArray(finalData.InvoiceProducts)
    ? finalData.InvoiceProducts
    : [];

  const invoiceDs: InvoiceDetailItem[] = products.map((item: any) => {
    if (isRailway) {
      // 铁路发票：一条明细即一张车票，num=1，金额与发票总额一致
      const seg = [item.Departure, item.Destination].filter(Boolean).join("-");
      return {
        itemName: [
          item.TrainNumber,
          item.Class,
          item.Carriage,
          item.SeatNumber,
          seg,
          item.DepartureTime,
          item.PassengerName,
        ]
          .filter(Boolean)
          .join(" "),
        size: item.SpecModel ?? "",
        unit: item.MeasureUnit ?? "",
        num: 1,
        price: finalData.Amount, // 与发票总额一致
        totalAmt: finalData.Amount, // 与发票总额一致
        taxRate: item.TaxRate ?? 0,
        taxAmt: finalData.Amount, // 与发票总额一致
      };
    }
    debugger
    // 普通发票：若存在车辆信息则拼到品名
    const hasCarInfo = item.CarType != null || item.BrankNumber != null;
    return {
      itemName: hasCarInfo
        ? [item.Name, item.CarType, item.BrankNumber].filter(Boolean).join(" ")
        : item.Name ?? "",
      size: item.SpecModel,
      unit: item.MeasureUnit,
      num: item.Qty,
      price: item.Price,
      totalAmt: item.Amount,
      taxRate: item.TaxRate,
      taxAmt: item.TaxPrice,
    };
  });

  const validate = finalData.InvoiceValidate;
  const status: InvoiceStatus = validate === 1 ? 1 : validate === 0 ? 2 : 0;

  return {
    annexId: meta.annexId,
    annexName: meta.annexName,
    invNo: finalData.InvoiceNumber,
    invDate: finalData.InvoiceDate,
    totalAmt: finalData.Amount,
    notTaxAmt: finalData.TotalPrice,
    taxAmt: finalData.TotalTaxPrice,
    invType: finalData.InvoiceCategoryName,
    buyerCompany: finalData.BuyerCompany,
    buyerTaxCode: finalData.BuyerTaxCode,
    sellerCompany: finalData.InvoiceCompany,
    sellerTaxCode: finalData.TaxpayerCode,
    isValid: validate === 1,
    validateMsg: finalData.ValidateMsg,
    ocrRes: finalData.OCRRes || "",
    validateRes: finalData.ValidateRes || "",
    status,
    invoiceDs,
    success: true,
  };
}

/* ====================== 单张发票识别（通用） ====================== */

/**
 * 识别单张发票。
 * 内部捕获所有异常，永远返回 RecognizedInvoice（不会 reject），
 * 因此批量调用时不需要靠 allSettled 来区分成功/失败，看 success 字段即可。
 */
export async function recognizeInvoice(
  annexId: number,
  annexName: string,
  api: RecognizeInvoiceApi = commonApi.recognizeAndCheckInvoice
): Promise<RecognizedInvoice> {
  try {
    const res = await api({ annexId, annexName });
    if (res && res.code === 200 && res.data) {
      return normalizeInvoiceResult(res.data.finalData, { annexId, annexName });
    }
    return {
      annexId,
      annexName,
      status: 0,
      invoiceDs: [],
      success: false,
      error: `接口返回异常 code=${res?.code}`,
    };
  } catch (e: any) {
    return {
      annexId,
      annexName,
      status: 0,
      invoiceDs: [],
      success: false,
      error: e?.message || "请求失败",
    };
  }
}

/* ====================== 批量发票识别（通用） ====================== */

export interface BatchRecognizeOptions {
  /** 待识别的文件列表，至少包含 id 与 annexName */
  fileList: { id: number; annexName: string }[];
  /** 可选的识别 API，不传则使用默认的 commonApi.recognizeAndCheckInvoice */
  api?: RecognizeInvoiceApi;
  /** 并发数，默认 5（避免一次性发几十个请求） */
  concurrency?: number;
  /** 每完成一张回调（done 已完成数 / total 总数 / item 本次结果） */
  onProgress?: (done: number, total: number, item: RecognizedInvoice) => void;
}

/**
 * 批量识别发票，带并发控制。
 * 返回全部结果（成功 + 失败），顺序与 fileList 一致。
 */
export async function batchRecognizeInvoices(
  opts: BatchRecognizeOptions
): Promise<RecognizedInvoice[]> {
  const { fileList, api = commonApi.recognizeAndCheckInvoice, concurrency = 5, onProgress } = opts;
  const total = fileList.length;
  const results: RecognizedInvoice[] = new Array(total);
  let done = 0;

  const queue = fileList.map((f, index) => ({ f, index }));

  async function worker() {
    while (queue.length) {
      const { f, index } = queue.shift()!;
      const r = await recognizeInvoice(f.id, f.annexName, api);
      results[index] = r;
      done += 1;
      onProgress?.(done, total, r);
    }
  }

  const poolSize = Math.max(1, Math.min(concurrency, total));
  await Promise.all(Array.from({ length: poolSize }, worker));

  return results;
}

/* ====================== 业务侧组装（可选） ====================== */

/**
 * 把识别结果组装成你现有表格行结构（保留原来的 uuid / id / srcType /
 * conBillId 等业务字段）。如果你的表格字段不同，改这里即可，不用动上面的逻辑。
 */
export interface ToTableRowsContext {
  conBillId?: any;
  srcType?: any;
  /** 生成唯一 id 的函数，例如 () => uuidv4() */
  generateUuid: () => string;
}

export function toInvoiceTableRows(
  results: RecognizedInvoice[],
  ctx: ToTableRowsContext
) {
  return results.map((r) => ({
    ...r,
    uuid: ctx.generateUuid(),
    id: undefined,
    srcType: ctx.srcType,
    conBillId: ctx.conBillId,
    invNo: r.success ? r.invNo : undefined,
    invDate: r.success ? r.invDate : undefined,
    totalAmt: r.success ? r.totalAmt : 0,
    notTaxAmt: r.success ? r.notTaxAmt : 0,
    taxAmt: r.success ? r.taxAmt : 0,
    invType: r.success ? r.invType : "",
    invoiceDs: r.invoiceDs,
  }));
}
