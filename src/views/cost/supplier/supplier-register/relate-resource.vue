<template>
  <div class="relate-resource-page">
    <div class="header-actions">
      <el-button type="primary" @click="handleAdd">新增资源</el-button>
    </div>
    
    <editable-table
      ref="editableTableRef"
      :rowKey="'id'"
      :table-data="tableData"
      :columns="columns"
      :dict-data="dictData"
      :on-save="handleSave"
      @data-change="handleDataChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ElMessage } from "element-plus";
import EditableTable from "@/components/base/editable-table.vue";
import type { EditableColumn } from "@/components/base/editable-table.vue";

const editableTableRef = ref();
const tableData = ref([
  { id: 1, name: "张三", age: 25, email: "zhang@example.com", status: "active", birthday: "1999-01-01", active: true, gender: "male", remark: "备注信息" },
  { id: 2, name: "李四", age: 30, email: "li@example.com", status: "inactive", birthday: "1994-05-15", active: false, gender: "female", remark: "测试数据" },
]);

// 字典数据（用于 status 字段）
const dictData = {
  status: [
    { label: "激活", value: "active" },
    { label: "禁用", value: "inactive" },
  ],
};

const columns: EditableColumn[] = [
  { type: "index", label: "序号", width: 60 },
  { 
    prop: "name", 
    label: "姓名", 
    editable: true, 
    showOverflowTooltip: false,
    editType: "input", 
    placeholder: "请输入姓名" 
  },
  { 
    prop: "age", 
    label: "年龄", 
    editable: true, 
    showOverflowTooltip: false,
    editType: "number" 
  },
  { 
    prop: "email", 
    label: "邮箱", 
    editable: true, 
    showOverflowTooltip: false,
    editType: "input",
    placeholder: "请输入邮箱"
  },
  { 
    prop: "status", 
    label: "状态", 
    editable: true, 
    showOverflowTooltip: false,
    editType: "select",
    dict: "status",  // 使用字典
    options: [
      { label: "激活", value: "active" },
      { label: "禁用", value: "inactive" }
    ]
  },
  { 
    prop: "birthday", 
    label: "生日", 
    editable: true, 
    showOverflowTooltip: false,
    editType: "date" 
  },
  { 
    prop: "active", 
    label: "启用", 
    editable: true, 
    showOverflowTooltip: false,
    editType: "switch" 
  },
  { 
    prop: "gender", 
    label: "性别", 
    editable: true, 
    showOverflowTooltip: false,
    editType: "radio",
    options: [
      { label: "男", value: "male" },
      { label: "女", value: "female" }
    ]
  },
  { 
    prop: "remark", 
    label: "备注", 
    editable: true, 
    showOverflowTooltip: false,
    editType: "textarea",
    placeholder: "请输入备注"
  },
];

// 新增资源
const handleAdd = () => {
  const newId = Date.now();
  tableData.value.push({
    id: newId,
    name: "",
    age: 0,
    email: "",
    status: "active",
    birthday: "",
    active: true,
    gender: "male",
    remark: "",
  });
  ElMessage.success("新增成功");
};

// 保存到服务器
const handleSave = async ({ row, column, newValue, oldValue, rowIndex }) => {
  console.log("保存:", { row, column, newValue, oldValue });
  
  // 调用API
  try {
    // const res = await fetch("/api/update", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ id: row.id, [column]: newValue }),
    // });
    // if (!res.ok) throw new Error("保存失败");
    
    ElMessage.success("保存成功");
  } catch (error: any) {
    ElMessage.error(error.message || "保存失败");
    throw error; // 抛出错误，让组件不更新数据
  }
};

// 数据变化回调
const handleDataChange = (data) => {
  console.log("数据已更新", data);
  // 如果需要同步外部数据，可以取消注释
  // tableData.value = data;
};
</script>

<style lang="scss" scoped>
.relate-resource-page {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 16px;
  padding: 15px;
  box-sizing: border-box;
  overflow: auto;

  .header-actions {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 16px;
  }
}
</style>