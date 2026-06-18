// ==================== 合同附件类型定义 ====================
/**
 * 合同附件信息 对应数据库表: h_con_annex
 */
export interface ContractAnnex {
  /** 主键ID */
  id: number;
  /** 合同ID */
  conId: number;
  /** 附件类型（数据字典：电子档案；扫描件） */
  annexType: number;
  /** 附件类型名称（前端展示用） */
  annexTypeName: string;
  /** 附件ID */
  annexId: number;
  /** 附件来源：1-审批流程 2-手工上传 */
  annexSrc: number;
  /** 附件来源名称 */
  annexSrcName: string;
  /** 附件名称（关联h_sys_annex表获取） */
  annexName?: string;
  /** 附件大小（关联h_sys_annex表获取） */
  annexSize?: number;
  /** 附件路径（关联h_sys_annex表获取） */
  annexPath?: string;
  /** 附件后缀名（关联h_sys_annex表获取） */
  annexExt?: string;
  /** 创建人ID */
  createId: number;
  /** 创建时间 */
  createDate: string; // datetime格式: 'YYYY-MM-DD HH:mm:ss'
  /** 更新人ID */
  operId?: number;
  /** 更新时间 */
  operDate?: string;
  /** 删除标识：0-未删除，1-已删除 */
  isDel: number;
}
/**
 * 新增合同附件 - 表单数据
 */
export interface ContractAnnexFormData {
  /** 主键 */
  id?: number;
  /** 合同ID */
  conId: number;
  /** 附件类型ID（必填） */
  annexType: number;
  /** 附件来源（必填） 1-审批流程 2-手工上传  */
  annexSrc: number;
  /** 已关联的附件ID */
  annexId: number;
}
