<!-- 成本分摊卡片 组件 -->
<template>
  <div class="item-card" v-if="visible">
    <div class="section-title">成本分摊</div>
    <el-row :gutter="24">
      <el-col :xs="24" :sm="24" :md="12" :lg="6" :xl="6">
        <!-- 分摊状态(0:未分摊,1:已分摊,2:部分分摊) -->
        <el-form-item label="分摊状态：" label-width="90px">
          <el-tag size="small" :type="getEnumType(allocStatusEnum, props.allocationStatus || 0)">
            {{ getEnumLabel(allocStatusEnum, props.allocationStatus || 0) }}
          </el-tag>
        </el-form-item>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="6" :xl="6">
        <!-- 预警状态(0:红色预警,1:黄色预警,2:绿色预警) -->
        <el-form-item label="预警状态：" label-width="90px">
          <!-- <el-tag size="small" :type="getEnumType(allocWarnEnum, props.warningStatus)">
            {{ getEnumLabel(allocWarnEnum, props.warningStatus) }}
          </el-tag> -->
          <span class="status-dot"
            :style="{ backgroundColor: getEnumColor(allocWarnEnum, props.warningStatus) }"></span>
        </el-form-item>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="6" :xl="6">
        <el-form-item label="分摊：" label-width="90px">
          <el-button type="primary" @click="handleDetail"> 分摊详情 </el-button>
        </el-form-item>
      </el-col>
    </el-row>

    <!-- 分摊详情弹窗 -->
    <NconCostAllocDialog v-model="dialogVisible" :projId="props.projId" :projName="props.projName"
      :displayName="props.displayName" :bizType="props.bizType" :allocAmt="props.allocAmt" :cstMData="props.cstMData"
      :dialogMode="props.dialogMode" @select="getData" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, toRefs } from "vue";
import NconCostAllocDialog from "./ncon-cost-alloc-dialog.vue";
import { ElMessage } from "element-plus";
import {
  allocStatusEnum,
  allocWarnEnum,
} from "@/constants/contract-manage/enums.ts";
import { getEnumColor, getEnumLabel, getEnumType } from "@/utils/enum.ts";

defineOptions({ name: "CostAllocationCard" });

interface Props {
  /** 是否可见 */
  visible: boolean;
  /** 分摊状态 */
  allocationStatus?: number;
  /** 预警状态 */
  warningStatus?: number;
  /** 项目ID */
  projId: number | undefined;
  projName?: string;
  displayName?: string;
  /** 业务单据ID */
  bizBillId?: number | undefined;
  /** 业务类型 */
  bizType?: string;
  /** 成本金额 */
  allocAmt?: number;
  /** 成本分摊数据 */
  cstMData?: any;
  /** 弹窗模式 */
  dialogMode?: string;
}

const props = withDefaults(defineProps<Props>(), {
  visible: true,
  allocationStatus: undefined,
  warningStatus: undefined,
  projId: undefined,
  projName: undefined,
  displayName: undefined,
  bizBillId: undefined,
  bizType: undefined,
  allocAmt: 0,
  cstMData: null,
  dialogMode: "view", // 弹窗模式，默认为查看模式 view  edit
});

const emit = defineEmits<{
  (e: "detail-click"): void;
  (e: "selectData", data: any[]): void;
}>();

const dialogVisible = ref(false);

const getData = (dataList: any) => {
  emit("selectData", dataList);
};
// 处理分摊详情按钮点击
const handleDetail = () => {
  // 如果有传入项目ID，则打开内部弹窗
  if (props.projId) {
    dialogVisible.value = true;
  } else {
    ElMessage.warning("请先选择项目");
  }
  // 触发外部事件，让父组件自行处理
  emit("detail-click");
};
</script>

<style scoped lang="scss">
.item-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 15px 15px;
  margin-bottom: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  transition:
    box-shadow 0.3s ease,
    transform 0.2s ease;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  padding: 0 0 12px 14px;
  position: relative;

  &::before {
    content: "";
    width: 4px;
    height: 18px;
    background: linear-gradient(180deg, #409eff, #66b1ff);
    border-radius: 2px;
    position: absolute;
    left: 0;
    top: 4px;
  }
}

.status-dot {
  display: inline-block;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  flex-shrink: 0;
}

// 覆盖 el-form-item 默认样式，使其在卡片内更紧凑
:deep(.el-form-item) {
  margin-bottom: 0;
}
</style>
