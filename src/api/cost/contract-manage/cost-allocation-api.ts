import { http } from "@/axios/service";
import {
  AutoAllocateCostDTO,
  CostAllocationDetailDTO,
  CostAllocationDetailQueryDTO,
  CostAllocationDTO,
  CostAllocationQueryDTO,
  SaveCostAllocationDTO,
} from "@/types/cost/contract-manage/cost-allocation-type";

/**
 * 成本分摊 相关接口
 */
export const costAllocationApi = {
  /** 查询项目成本分摊主表 */
  getProjectAllocMList: (data: CostAllocationQueryDTO) => {
    return http.formPost("/cost/projectAllocM/getList", data);
  },
  /** 新增项目成本分摊主表 */
  addProjectAllocM: (data: CostAllocationDTO) => {
    return http.post("/cost/projectAllocM/add", data);
  },
  /** 修改项目成本分摊主表 */
  editProjectAllocM: (data: CostAllocationDTO) => {
    return http.post("/cost/projectAllocM/edit", data);
  },
  /** 删除项目成本分摊主表 */
  delProjectAllocM: (data: { id: number }) => {
    return http.formPost("/cost/projectAllocM/del", data);
  },

  /** 查询项目成本分摊子表 */
  getProjectAllocDList: (data: CostAllocationDetailQueryDTO) => {
    return http.formPost("/cost/projectAllocD/getList", data);
  },
  /** 新增项目成本分摊子表 */
  addProjectAllocD: (data: CostAllocationDetailDTO) => {
    return http.post("/cost/projectAllocD/add", data);
  },
  /** 修改项目成本分摊子表 */
  editProjectAllocD: (data: CostAllocationDetailDTO) => {
    return http.post("/cost/projectAllocD/edit", data);
  },
  /** 删除项目成本分摊子表 */
  delProjectAllocD: (data: { id: number }) => {
    return http.formPost("/cost/projectAllocD/del", data);
  },

  /** 获取合同综合税率 */
  getContractTaxRate: (data: { conId: number }) => {
    return http.formPost("/con/main/taxRate", data);
  },
  /** 动态成本自动分摊 */
  autoAllocateCost: (data: AutoAllocateCostDTO) => {
    return http.post("/con/main/autoAlloc", data);
  },
  /** 保存项目成本分摊（主从表） */
  saveProjectAlloc: (data: SaveCostAllocationDTO) => {
    return http.post("/cost/projectAlloc/save", data);
  },
  /** 删除项目成本分摊（主从表） */
  delProjectAlloc: (data: { id: number }) => {
    return http.formPost("/cost/projectAlloc/del", data);
  },
  /** 查询项目成本分摊（主从表） */
  getProjectAlloc: (data: { id: number }) => {
    return http.formPost("/cost/projectAlloc/getList", data);
  },
};
