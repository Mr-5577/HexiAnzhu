<!-- 目标成本执行分析 明细 -->
<template>
    <base-modal v-model="dialogVisible" title="目标成本执行分析明细" :top="'15vh'" width="1000px" :showConfirmButton="false"
        :showCancelButton="false">
        <div class="contract-select-wrapper">
            <div class="info-header">
                <div class="info-item">
                    <span class="info-label">项目名称：</span>
                    <span class="info-value">{{ props.params?.projName || '-' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">设计费(含税)：</span>
                    <span class="info-value info-value-primary">
                        {{ formatThousandWithPlaces(props.params?.dynAmt) || '0' }}
                    </span>
                </div>
                <div class="info-item">
                    <span class="info-label">设计费(不含税)：</span>
                    <span class="info-value info-value-success">
                        {{ formatThousandWithPlaces(props.params?.dynExclAmt) || '0' }}
                    </span>
                </div>
            </div>
            <vxe-editable-table ref="vxeTableRef" v-model="tableData" :columns="tableColumns" :rowKey="'id'"
                :loading="tableLoading" :readonly="true" :pagination="false" :height="'400px'" :show-footer="true">
            </vxe-editable-table>
        </div>
        <!-- 合同成本分摊弹窗 -->
        <ConCostAllocDialog v-model="conCostAllocDialogVisible" :bizType="currentData?.bizType"
            :bizBillId="currentData?.bizBillId" :dialogMode="'edit'" />
        <!-- 非合同成本分摊弹窗 -->
        <NconCostAllocDialog v-model="nonConCostAllocDialogVisible" :bizBillId="currentData?.bizBillId"
            :bizType="currentData.bizType" :dialogMode="'edit'" />
    </base-modal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { ElMessage } from "element-plus";
import VxeEditableTable from '@/components/base/vxe-editable-table.vue'
import { reportManageApi } from "@/api/cost/contract-manage/report-manage-api";
import { formatThousandWithPlaces } from "@/utils/big-number";
import NconCostAllocDialog from "@/views/cost/cost-allocation/ncon-cost-alloc/ncon-cost-alloc-dialog.vue";
import ConCostAllocDialog from "@/views/cost/cost-allocation/con-cost-alloc/con-cost-alloc-dialog.vue";

// Props
interface Props {
    modelValue: boolean;
    params?: any;
}
// Emits
const emit = defineEmits<{
    "update:modelValue": [value: boolean];
    select: [row: any[]];
}>();

const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    params: null,
});

// 弹窗显示状态
const dialogVisible = ref(props.modelValue);
// 表格loading
const tableLoading = ref(false);
// 表格数据
const tableData = ref([]);
// 表格ref
const vxeTableRef = ref();
// 当前点击的数据类型
const currentData = ref({
    bizType: '',
    bizBillId: undefined,
});
// 合同成本分摊弹窗
const conCostAllocDialogVisible = ref(false);
// 非合同成本分摊弹窗
const nonConCostAllocDialogVisible = ref(false);

// 表格列配置
const tableColumns: any = [
    { type: 'index', title: '序号' },
    { prop: "bizTypeName", label: "单据类型", width: 100 },
    { prop: "bizTitle", label: "单据名称" },
    {
        prop: "billAmt", label: "单据金额", width: 130,
        formatter: (value) => formatThousandWithPlaces(value),
        clickable: true, // 点击单元格触发 onClick 事件
        onClick: (data) => {
            console.log("点击了单据金额:", data);
            openCostAlloc(data);
        },
    },
    { prop: "allocAmt", label: "分摊金额(含税)", width: 130, showSummary: true, formatter: (value) => formatThousandWithPlaces(value) },
    { prop: "allocExclAmt", label: "分摊金额(不含税)", width: 130, showSummary: true, formatter: (value) => formatThousandWithPlaces(value) },
];

const openCostAlloc = (row) => {
    console.log("打开成本分摊明细弹窗:", row);
    const { bizType, billId } = row
    currentData.value = { bizType, bizBillId: billId }
    // NCON_PROC:非合同立项  NCON_CST:非合同请款  CON_MAIN:主合同  CON_ADD:补充合同  CON_BG:合同变更  CON_QZ:合同签证  CON_PROD:合同产值
    switch (bizType) {
        case 'NCON_PROC':
        case 'NCON_CST':
            nonConCostAllocDialogVisible.value = true;
            break;
        case 'CON_MAIN':
        case 'CON_ADD':
        case 'CON_BG':
        case 'CON_QZ':
        case 'CON_PROD':
            conCostAllocDialogVisible.value = true;
            break;
        default:
            break;
    }
};
// 查询列表
const getSupplierList = async () => {
    console.log("查询参数:", props.params);
    try {
        tableLoading.value = true;
        tableData.value = [];
        const params = {
            seg: props.params?.seg,
            projId: props.params?.projId,
            costMid: props.params?.costMid,
            prodIds: props.params?.prodIds,
            subId: props.params?.subId,
        }
        const res = await reportManageApi.getDynamicReportDetail(params);
        if (res.code === 200) {
            tableData.value = res.data || [];
        }
    } catch (error) {
        ElMessage.error("加载列表失败");
    } finally {
        tableLoading.value = false;
    }
};

// 关闭弹窗
const handleClose = () => {
    dialogVisible.value = false;
};

watch(
    () => props.modelValue,
    (val) => {
        dialogVisible.value = val;
        if (val) {
            getSupplierList();
        }
    },
);

watch(dialogVisible, (val) => {
    emit("update:modelValue", val);
});

// 暴露方法供父组件调用
defineExpose({
    open: () => {
        dialogVisible.value = true;
    },
    close: () => {
        handleClose();
    },
});
</script>

<style lang="scss" scoped>
.contract-select-wrapper {
    display: flex;
    flex-direction: column;
    min-height: 500px;

    .info-header {
        display: flex;
        align-items: center;
        background: #f8fafc;
        border-radius: 8px;
        padding: 10px 16px;
        border: 1px solid #edf2f7;
        flex-wrap: wrap;
        gap: 8px 0;

        .info-item {
            display: flex;
            align-items: baseline;
            padding: 0 8px;
            flex: 1;
            min-width: 140px;

            .info-label {
                font-size: 13px;
                color: #718096;
                font-weight: 500;
                white-space: nowrap;
            }

            .info-value {
                font-size: 15px;
                font-weight: 600;
                color: #1a2332;
                font-variant-numeric: tabular-nums;

                &.info-value-primary {
                    color: #5b8dd9;
                }

                &.info-value-success {
                    color: #66bb6a;
                }
            }
        }
    }
}
</style>
