<!-- 费用报销 -->
<template>
  <div class="oa-open-page">
    <!-- 加载状态 -->
    <div v-if="loading" class="page-loading">
      <el-icon class="is-loading">
        <Loading />
      </el-icon>
      <span>数据加载中...</span>
    </div>
    <!-- 单据内容 -->
    <FeePaymentForm v-else mode="detail" :feePaymentId="bizId" />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import FeePaymentForm from "./fee-payment-form.vue";
import { feePaymentApi } from "@/api/cost/non-contract-manage/fee-payment-api.ts";
import { ElMessage } from "element-plus";
import { onMounted, ref } from "vue";

defineOptions({ name: "oa-cst-payment-page" });

const route = useRoute();
const loading = ref(true);

// 单据ID
const billId = route.query?.billId ? Number(route.query.billId) : undefined;
// 业务ID
const bizId = route.query?.bizId ? Number(route.query.bizId) : undefined;

// 获取基础信息
const getBaseInfo = async () => {
  if (!billId || !bizId) {
    loading.value = false;
    return
  }
  try {
    loading.value = true;
    const res = await feePaymentApi.getNconInfoLite({ nconBillId: billId });
    console.log('轻量级信息', res);
  } catch (err: any) {
    ElMessage.error("加载数据失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  // getBaseInfo();
  await new Promise((resolve) => setTimeout(resolve, 1000));
  loading.value = false;
});

</script>

<style scoped lang="scss">
.oa-open-page {
  width: 100%;
  height: 100%;
  background-color: #fff;
  overflow: hidden;
}

.page-loading {
  margin-top: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
  color: #909399;

  .el-icon {
    font-size: 48px;
    color: #909399;
  }

  .is-loading {
    color: #409eff;
    font-size: 40px;
  }

  span {
    font-size: 16px;
    color: #606266;
  }
}
</style>
