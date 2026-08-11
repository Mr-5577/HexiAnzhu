// composables/useAllocationActions.ts
import { ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { costAllocationApi } from "@/api/cost/contract-manage/cost-allocation-api";
import { costCategoryApi } from "@/api/cost/master-data/cost-category-api";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api";
import type { PageParams, ProductInfo } from "./types";
import { getLeafNodes, filterTreeByIds, buildTree } from "./treeUtils";
import {
  toNumber,
  round2,
  validateLeafNodes,
  convertTreeToRows,
} from "./allocUtils";

export function useAllocationActions(
  treeData: any,
  products: any,
  warningData: any,
  pageParams: any,
  selectedBuildings: any,
  mergeDetailsFn: (details: any[]) => void,
  summarizeFn: () => void,
  summarizeParentsOnlyFn: () => void,
  syncWarningFn: () => void,
) {
  // ========== 状态 ==========
  const loading = ref(false);
  const submitLoading = ref(false);
  const confirmLoading = ref(false);
  const dialogVisible = ref(false);
  const warningVisible = ref(false);
  const selectedSubIds = ref<number[]>([]);
  const busiSegOptions = ref<any[]>([]);
  const subjectOptions = ref<any[]>([]);

  // ========== 获取已选中的科目ID ==========
  const getSelectedIds = () => {
    const leaves = getLeafNodes(treeData.value);
    return leaves.map((node: any) => node.subId || node.id);
  };

  // ========== 打开选择科目弹窗 ==========
  const handleChoose = () => {
    selectedSubIds.value = getSelectedIds();
    dialogVisible.value = true;
  };

  // ========== 接收选择的科目 ==========
  const handleSelect = async (
    selectedTree: any[],
    goalCostDetailList: any[],
  ) => {
    warningVisible.value = false;

    // 提取业态列表
    const prodList = goalCostDetailList
      .filter((item: any) => item.prodId)
      .map((item: any) => ({
        prodId: item.prodId,
        prodName: item.prodName || `业态${item.prodId}`,
      }));

    const uniqueProdList = Array.from(
      new Map(prodList.map((p: any) => [p.prodId, p])).values(),
    );

    products.value = uniqueProdList;

    // 合并数据
    const result = selectedTree;
    treeData.value = result;

    // 回填明细数据
    mergeDetailsFn(goalCostDetailList);

    // 汇总
    summarizeFn();

    // 同步预警
    syncWarningFn();

    // 自动匹配楼栋
    if (uniqueProdList.length) {
      const prodIds = uniqueProdList.map((p) => p.prodId);
      return prodIds; // 返回给外部用于匹配楼栋
    }
  };

  // ========== 删除节点 ==========
  const handleDelete = (targetNode: any) => {
    if (!targetNode.isLeaf) {
      ElMessage.warning("只能删除叶子节点");
      return;
    }

    ElMessageBox.confirm(
      `确定要删除科目 "${targetNode.subName}" 吗？删除后该科目下的所有数据将被移除。`,
      "删除确认",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      },
    )
      .then(() => {
        // 删除节点（由 useAllocationData 处理）
        const nodeId = targetNode.id || targetNode.subId;
        // 外部调用删除方法
        return nodeId;
      })
      .catch(() => {});
  };

  // ========== 保存编辑 ==========
  const handleSave = (data: any) => {
    warningVisible.value = false;

    const { row, column, newValue, oldValue, rowIndex } = data;

    // column 可能是字符串，也可能是对象，需要兼容处理
    const columnName =
      typeof column === "string" ? column : column?.prop || column?.key || "";

    const isSubjectAmtField =
      columnName === "subjectAmt" || columnName === "subjectAmtExcl";
    const isAllocField =
      columnName?.startsWith("allocAmt_") ||
      columnName?.startsWith("allocExclAmt_");

    if (isSubjectAmtField) {
      // 编辑科目金额含税/不含税：只更新父级汇总，不改变叶子节点
      setTimeout(() => {
        summarizeParentsOnlyFn();
      }, 0);
    } else if (isAllocField) {
      // 编辑业态金额：完整汇总（包括叶子节点）
      setTimeout(() => {
        summarizeFn();
      }, 0);
    } else {
      // 其他字段：默认完整汇总
      setTimeout(() => {
        summarizeFn();
      }, 0);
    }
  };

  // ========== 自动分摊 ==========
  const autoAllocation = async () => {
    if (!treeData.value.length) {
      ElMessage.warning("没有可分摊的数据，请先选择科目并填写分摊金额");
      return;
    }

    try {
      confirmLoading.value = true;
      const params = buildSubmitParams();
      const res = await costAllocationApi.getNconAutoAlloc(params);

      if (res.code === 200 && res.data) {
        const { allocList } = res.data;

        // 回填数据
        fillAllocationData(allocList);
        summarizeFn();
        ElMessage.success("自动分摊成功");
      }
    } catch (error) {
      console.error("自动分摊失败:", error);
      ElMessage.error("自动分摊失败");
    } finally {
      confirmLoading.value = false;
    }
  };

  // ========== 构建提交参数 ==========
  const buildSubmitParams = () => {
    const leaves = getLeafNodes(treeData.value);
    const subMap = new Map();

    leaves.forEach((node: any) => {
      if (!subMap.has(node.subId || node.id)) {
        subMap.set(node.subId || node.id, {
          subId: node.subId || node.id,
          allocAmt: toNumber(node.subjectAmt),
          allocExclAmt: toNumber(node.subjectAmtExcl),
          allocRule: node.allocRule,
        });
      }
    });

    return {
      projId: pageParams.value.projId,
      subList: Array.from(subMap.values()),
      prodList: products.value.map((p: any) => ({
        id: p.prodId,
        prodName: p.prodName,
      })),
    };
  };

  // ========== 回填分摊数据 ==========
  const fillAllocationData = (allocList: any[]) => {
    const allocMap = new Map(
      allocList.map((item: any) => [`${item.subId}_${item.prodId}`, item]),
    );

    const traverse = (nodes: any[]): any[] => {
      return nodes.map((node) => {
        if (node.children?.length) {
          return { ...node, children: traverse(node.children) };
        }

        const newNode = { ...node };
        products.value.forEach((prod: any) => {
          const key = `${node.subId || node.id}_${prod.prodId}`;
          const data = allocMap.get(key);
          newNode[`allocAmt_${prod.prodId}`] = data?.allocAmt ?? 0;
          newNode[`allocExclAmt_${prod.prodId}`] = data?.allocExclAmt ?? 0;
          newNode.allocWarn = data?.allocWarn ?? newNode.allocWarn ?? 0;
        });
        return newNode;
      });
    };

    treeData.value = traverse(treeData.value);
  };

  // ========== 查看分摊预警 ==========
  const handleViewWarning = async () => {
    if (!validate()) return;

    const leaves = getLeafNodes(treeData.value);
    const subList = leaves.map((node: any) => ({
      subId: node.id || node.subId,
      allocAmt: toNumber(node.subjectAmt),
      allocExclAmt: toNumber(node.subjectAmtExcl),
    }));

    const params = {
      projId: pageParams.value.projId,
      subAllocList: subList,
      bldIds: selectedBuildings.value,
    };

    try {
      const res = await costAllocationApi.getWarnSubAlloc(params);
      if (res.code === 200 && res.data) {
        const { statusList = [] } = res.data;

        // 增量更新预警数据
        if (!warningData.value.length) {
          warningData.value = JSON.parse(JSON.stringify(treeData.value));
        }

        // 更新预警字段
        const statusMap = new Map(statusList.map((s: any) => [s.subId, s]));
        const updateWarning = (nodes: any[]) => {
          nodes.forEach((node) => {
            const status = statusMap.get(node.id || node.subId);
            if (status) {
              Object.keys(status).forEach((key) => {
                node[key] = status[key];
              });
            }
            if (node.children?.length) {
              updateWarning(node.children);
            }
          });
        };
        updateWarning(warningData.value);

        warningVisible.value = true;
      }
    } catch (error) {
      console.error("获取预警状态失败:", error);
    }
  };

  // ========== 获取提交数据 ==========
  const getSubmitData = async () => {
    const leaves = getLeafNodes(treeData.value);
    const subList = leaves.map((node: any) => ({
      subId: node.id || node.subId,
      allocAmt: toNumber(node.subjectAmt),
      allocExclAmt: toNumber(node.subjectAmtExcl),
    }));

    // 获取预警状态
    const params = {
      projId: pageParams.value.projId,
      subAllocList: subList,
      bldIds: selectedBuildings.value,
    };
    const res = await costAllocationApi.getWarnSubAlloc(params);
    const { statusList = [], totalAllocWarn = 0 } = res.data || {};

    // 计算分摊状态
    const allocated = treeData.value.reduce((sum: number, node: any) => {
      return sum + toNumber(node.subjectAmt);
    }, 0);
    const total = toNumber(pageParams.value.allocAmt);
    let allocStatus = 0;
    if (allocated === 0) allocStatus = 0;
    else if (allocated < total) allocStatus = 2;
    else allocStatus = 1;

    // 转换数据
    const detailList = convertTreeToRows(treeData.value, products.value);
    const finalList = detailList.map((item: any) => {
      const status = statusList.find((s: any) => s.subId === item.subId);
      return { ...item, allocWarn: status?.allocWarn ?? 0 };
    });

    return {
      allocAmt: round2(allocated),
      allocExclAmt: round2(
        treeData.value.reduce((sum: number, node: any) => {
          return sum + toNumber(node.subjectAmtExcl);
        }, 0),
      ),
      allocStatus,
      allocWarn: totalAllocWarn,
      allocDs: finalList,
    };
  };

  // ========== 确认提交 ==========
  const handleConfirm = async () => {
    if (!validate()) return;

    try {
      submitLoading.value = true;
      const data = await getSubmitData();

      const params = {
        projId: pageParams.value.projId,
        bizType: pageParams.value.bizType,
        bizBillId: pageParams.value.billId,
        bizKeyId: 0,
        allocAmt: data.allocAmt,
        allocExclAmt: data.allocExclAmt,
        allocWarn: data.allocWarn,
        allocStatus: data.allocStatus,
        detailList: data.allocDs || [],
      };

      const res = await costAllocationApi.saveProjectAlloc(params);
      if (res.code === 200) {
        ElMessage.success("保存成功");
      }
    } catch (error) {
      console.error("提交失败:", error);
    } finally {
      submitLoading.value = false;
    }
  };

  // ========== 校验 ==========
  const validate = () => {
    if (!treeData.value.length) {
      ElMessage.warning("没有可分摊的数据，请先选择科目并填写分摊金额");
      return false;
    }

    const leaves: any = getLeafNodes(treeData.value);

    // 检查是否所有叶子都有金额
    const hasZero = leaves.some(
      (node: any) =>
        toNumber(node.subjectAmt) === 0 || toNumber(node.subjectAmtExcl) === 0,
    );
    if (hasZero) {
      ElMessage.error("请输入科目金额");
      return false;
    }

    // 检查不含税 ≤ 含税
    const invalidTax = leaves.filter(
      (node: any) => toNumber(node.subjectAmtExcl) > toNumber(node.subjectAmt),
    );
    if (invalidTax.length) {
      const names = invalidTax.map((n: any) => n.subName).join("、");
      ElMessage.error(`科目金额(不含税)不能大于科目金额(含税)：${names}`);
      return false;
    }

    // 校验业态金额之和 = 科目金额
    const result = validateLeafNodes(leaves);
    if (!result.valid) {
      ElMessage.error("各业态金额累加需要等于科目金额");
      return false;
    }

    // 校验总金额
    const total = leaves.reduce(
      (sum, node) => sum + toNumber(node.subjectAmt || 0),
      0,
    );
    if (total > toNumber(pageParams.value.allocAmt)) {
      ElMessage.error("分摊金额不能大于成本金额");
      return false;
    }

    return true;
  };

  // ========== 加载基础数据 ==========
  const loadBaseData = async () => {
    try {
      const res = await dictionaryApi.getsegmentList();
      if (res.code === 200) busiSegOptions.value = res.data || [];
    } catch (error) {
      console.error("获取业务归属失败:", error);
    }
  };

  const loadSubjects = async () => {
    if (!pageParams.value.projId) return;
    try {
      const res = await costCategoryApi.getCostSubjectProjList({
        projId: pageParams.value.projId,
        withDetail: true,
      });
      if (res.code === 200) {
        subjectOptions.value = res.data || [];
      }
    } catch (error) {
      console.error("获取科目列表失败:", error);
    }
  };

  return {
    // 状态
    loading,
    submitLoading,
    confirmLoading,
    dialogVisible,
    warningVisible,
    selectedSubIds,
    busiSegOptions,
    subjectOptions,

    // 方法
    handleChoose,
    handleSelect,
    handleDelete,
    handleSave,
    autoAllocation,
    handleViewWarning,
    handleConfirm,
    getSubmitData,
    validate,
    loadBaseData,
    loadSubjects,
    getSelectedIds,
  };
}
