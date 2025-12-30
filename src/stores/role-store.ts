import { defineStore } from "pinia";
import { ref } from "vue";

interface DataTypeInterface {
  dataType: number;
  dataTypeName: string;
}

export const useRoleStore = defineStore("role-store", () => {
  // 组织类型，0人员  1项目  2部门  3公司   4板块
  const dataTypeList = ref<DataTypeInterface[]>([]);

  const setDataTypeList = (data: DataTypeInterface[]) => {
    dataTypeList.value = data;
  };

  return {
    // 数据
    dataTypeList,

    // 方法
    setDataTypeList,
  };
});
