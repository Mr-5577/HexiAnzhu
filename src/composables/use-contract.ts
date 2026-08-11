import { normalizeCode } from "@/utils/common";
import { ClassificationNode, queryClassificationNode } from "@/utils/tree";
import { MaybeRef } from "vue";

/**
 * 判断是否为建安分类
 * @param tree 分类树数据（支持 ref）
 * @param nodeId 节点ID
 * @returns 是否为建安分类
 */
export function isJianAnByConType(
  tree: MaybeRef<ClassificationNode[]>,
  nodeId: string | number | null | undefined
): boolean {
  const resType = queryClassificationNode(tree, nodeId, {
    targetLevel: 1,
    idField: 'id',
    pidField: 'pid',
    codeField: 'conTypeCode',
    nameField: 'conTypeName',
    childrenField: 'children',
  });

  if (resType.code === null) return false;

  // ✅ 两边都归一化，防止 "03" !== "3"
  return normalizeCode(resType.code) === normalizeCode("02");
}