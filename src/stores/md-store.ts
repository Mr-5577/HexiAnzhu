import { defineStore } from "pinia";
import { ref } from "vue";
import { mdApi } from "@/api/system/md-api";
import { conTypeApi } from "@/api/cost/master-data/contract-category-api.ts";
import { buildTree } from "@/utils/tree.ts";
import { roleApi } from "@/api/system/role-api.ts";

// API 返回的完整数据结构
interface ProjectInfo {
  id: number;
  projName: string;
}

interface CompanyInfo {
  id: number;           // 主键，自增
  pid: number;          // 上级公司ID
  segId: number;        // 所属业态ID
  compName: string;     // 法人公司名称
  compShortName: string;// 法人公司简称
  compNo: string;       // 法人公司编码
  oaCompId: string;     // OA系统对应ID
  sort: number;         // 序号
  projList: ProjectInfo[]; // 法人公司对应的项目列表
  isDel: boolean;      // 可选：是否删除标记
}

// API 响应结构
interface ApiResponse<T> {
  code: number;
  message?: string;
  data: T;
}

// 缓存结构
interface CacheItem {
  data: CompanyInfo[];
  timestamp: number;
}

// 缓存有效期：1小时（毫秒）
const CACHE_DURATION = 60 * 60 * 1000;

export const useMDStore = defineStore("md-store", () => {
  const conTypeOptions = ref([]);
  const empTreeData = ref([]);
  /**
   * 获取指定 segId 的公司列表（内部方法）
   */
  const fetchCompaniesByProjId = async (
    projId: number
  ): Promise<CompanyInfo[]> => {
    try {
      // API 调用：获取指定 segId 下的所有公司及其项目列表
      const response: ApiResponse<CompanyInfo[]> = await mdApi.getProjCompanyList({
        projId: projId
      });

      if (response.code === 200 && response.data) {
        const companies = Array.isArray(response.data) 
          ? response.data 
          : [response.data];
        
        return companies;
      }

      throw new Error(response.message || "获取公司信息失败");
    } catch (error) {
      console.error(`获取 projId=${projId} 的公司信息异常:`, error);      
      throw error;
    }
  };

  /**
   * 获取公司信息（对外方法）
   * @param projId 项目ID，用于过滤公司
   * @returns 包含指定 projId 的公司列表
   */
  const getProjCompanyList = async (
    projId: number
  ): Promise<CompanyInfo[]> => {
   // const currentSegId = userStore.userInfo.segId;
    
   /// if (!currentSegId) {
   //   throw new Error("segId 不存在，无法获取公司信息");
   // }

    // 1. 获取当前 projId 下的所有公司
    const allCompanies = await fetchCompaniesByProjId(projId);
    
    // 2. 过滤出包含指定 projId 的公司
    return allCompanies.filter(company => 
      !company.isDel && // 排除已删除的公司
      company.projList?.some(project => project.id === projId)
    );
  };

    /**
   * 获取合同分类（对外方法）
   * @returns 合同分类树
   */
  const getConTypeTree = async ()=> {
    if (conTypeOptions.value.length >0) {
      return conTypeOptions.value
    }
    try {
      const res = await conTypeApi.getConTypeList();
      if (res.code === 200) {
        conTypeOptions.value = buildTree(res.data || []);
        return conTypeOptions.value
      }
    } catch (error) {
      console.error("获取合同分类失败:", error);
    }
  };

  /**
   * 获取人员树（对外方法）
   * @returns 人员树
   */
  const getEmployeeTree = async () => {
    if (empTreeData.value.length >0) {
      return empTreeData.value
    }
    try {
      const res = await roleApi.getEmpTree({ empName: "", isIncludeLeave: false });
      // console.log("获取人员列表", res);
      if (res.code === 200) {
        empTreeData.value = res.data || [];
        return empTreeData.value
      }
    } catch (error) {
      console.error("获取人员信息失败:", error);
    }
  };

  return {   
    // 方法
    getProjCompanyList,           // 主要方法：按 projId 过滤
    getConTypeTree,
    getEmployeeTree,
  };
});