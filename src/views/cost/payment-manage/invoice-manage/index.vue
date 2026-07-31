<template>
  <div class="invoice-manage-page">
    <div class="content">
      <el-tabs v-model="activeTab" @tab-change="changeTab">
        <el-tab-pane
          label="合同发票台账"
          name="invoice-ledger"
          style="height: 100%"
        >
          <invoice-ledger v-show="activeTab === 'invoice-ledger'" />
        </el-tab-pane>
        <el-tab-pane
          label="发票核验明细"
          name="invoice-verification"
          style="height: 100%"
        >
          <invoice-verification v-show="activeTab === 'invoice-verification'" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import InvoiceLedger from "./invoice-ledger/index.vue";
import InvoiceVerification from "./invoice-verification/index.vue";

defineOptions({ name: "invoice-manage" });

const activeTab = ref("invoice-ledger");

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
