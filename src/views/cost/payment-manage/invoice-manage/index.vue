<template>
  <div class="invoice-manage-page">
    <div class="content">
      <el-tabs v-model="activeTab" @tab-change="changeTab">
        <el-tab-pane label="列表(基础编辑)" name="table1" style="height: 100%">
          <table1 />
        </el-tab-pane>
        <el-tab-pane label="列表（带分页）" name="table2" style="height: 100%">
          <table2 />
        </el-tab-pane>
        <el-tab-pane label="树形列表" name="table3" style="height: 100%">
          <table3 />
        </el-tab-pane>
        <el-tab-pane label="字典映射列表" name="table4" style="height: 100%">
          <table4 />
        </el-tab-pane>
        <el-tab-pane label="多级表头-编辑" name="table5" style="height: 100%">
          <table5 />
        </el-tab-pane>
        <el-tab-pane label="综合列表" name="table6" style="height: 100%">
          <table6 />
        </el-tab-pane>
        <el-tab-pane label="列表-只读" name="table7" style="height: 100%">
          <table7 />
        </el-tab-pane>
        <el-tab-pane label="列表-部分可编辑" name="table8" style="height: 100%">
          <table8 />
        </el-tab-pane>
        <el-tab-pane label="列表-不编辑" name="table9" style="height: 100%">
          <table9 />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import table1 from "./example-vxe-table/table1.vue";
import table2 from "./example-vxe-table/table2.vue";
import table3 from "./example-vxe-table/table3.vue";
import table4 from "./example-vxe-table/table4.vue";
import table5 from "./example-vxe-table/table5.vue";
import table6 from "./example-vxe-table/table6.vue";
import table7 from "./example-vxe-table/table7.vue";
import table8 from "./example-vxe-table/table8.vue";
import table9 from "./example-vxe-table/table9.vue";

defineOptions({ name: "invoice-manage" });

const activeTab = ref("table1");

const changeTab = (name: string) => {
  activeTab.value = name;
};
onMounted(() => {});
</script>

<style lang="scss" scoped>
.invoice-manage-page {
  width: 100%;
  height: 100%;
  display: flex;
  background: #fff;

  .content {
    width: 100%;
    height: 100%;
    flex: 1;
    background: #fff;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 0 15px 15px;
    box-sizing: border-box;
    :deep(.el-tabs) {
      height: 100%;
      display: flex;
      flex-direction: column;
      .el-tabs__header {
        margin: 0 0 16px 0;
        .el-tabs__active-bar {
          background-color: #409eff;
        }

        .el-tabs__item {
          font-size: 14px;

          &:hover {
            color: #409eff;
          }

          &.is-active {
            color: #409eff;
          }
        }
      }

      .el-tabs__content {
        flex: 1;
        overflow: hidden;
      }
    }

    .tab-placeholder {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
      color: #909399;
      background: #fafafa;
      border-radius: 8px;
      border: 1px dashed #dcdfe6;
    }
  }
}
</style>
