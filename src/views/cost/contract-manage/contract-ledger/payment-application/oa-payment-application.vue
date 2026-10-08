<!-- OA 付款申请（合同支付） -->
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
        <PaymentApplicationForm v-if="projId && businessId" mode="edit" :paymentId="businessId" :projId="projId"
            :conId="bizId" />

    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { Loading } from "@element-plus/icons-vue";
import PaymentApplicationForm from "./payment-application-form.vue";
import { contractLedgerApi } from "@/api/cost/contract-manage/contract-ledger-api.ts";
import { ElMessage } from "element-plus";

defineOptions({ name: "oa-payment-application-page" });

const route = useRoute();
const loading = ref(true);
const mode = ref<'detail' | 'edit'>("edit");

// 单据ID
const billId = route.query?.billId ? Number(route.query.billId) : undefined;
// 合同ID
const bizId = route.query?.bizId ? Number(route.query.bizId) : undefined;
// 业务ID
const businessId = ref(undefined)
// 项目ID
const projId = ref(undefined)

// 获取合同基础信息
const getBaseInfo = async () => {
    if (!billId) {
        loading.value = false;
        return
    }
    try {
        loading.value = true;
        // 并行请求
        const [conRes, subRes] = await Promise.all([
            contractLedgerApi.getConInfoLite({ conBillId: billId }),
            contractLedgerApi.getSubConLiteInfo({ billId: billId })
        ]);
        if (conRes.code === 200 && conRes.data) {
            projId.value = conRes.data.projId;
        }

        if (subRes.code === 200 && subRes.data) {
            businessId.value = subRes.data;
        }
    } catch (err: any) {
        ElMessage.error("加载数据失败，请稍后重试");
    } finally {
        loading.value = false;
    }
};

onMounted(async () => {
    getBaseInfo();
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