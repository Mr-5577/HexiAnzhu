<!-- 合同附件 列表（样式优化版 · 合并真实逻辑） -->
<template>
  <div class="attachment-table-wrapper">
    <div class="pa-card">
      <base-table
        :columns="tableColumns"
        :tableData="tableData"
        :loading="tableLoading"
        :rowKey="'id'"
        :pagination="false"
      >
        <template #annexSrc="{ row }">
          <span>{{ getEnumLabel(FileSourceEnum, row?.annexSrc) }}</span>
        </template>
        <template #annexType="{ row }">
          <span>{{ getEnumLabel(AnnexTypeEnum, row?.annexType) }}</span>
        </template>
        <!-- 列表外操作栏 -->
        <template #actionBar>
          <div class="pa-toolbar">
            <div class="pa-toolbar__title">
              <span class="pa-toolbar__name">合同附件</span>
              <el-tag size="small" type="info" effect="plain" round>
                {{ tableData.length }} 个
              </el-tag>
            </div>
            <div class="pa-toolbar__actions">
              <!-- 刷新按钮：点击图标旋转 + 悬浮微浮起 + 刷新中禁用 -->
              <el-button
                type="primary"
                class="refresh-btn"
                :class="{ 'is-refreshing': refreshing }"
                :disabled="refreshing"
                @click="handleRefresh"
              >
                <el-icon class="refresh-icon"><Refresh /></el-icon>
                <span>{{ refreshing ? "刷新中" : "刷新列表" }}</span>
              </el-button>
              <el-button type="primary" class="add-btn" @click="handleUpload">
                <el-icon><Upload /></el-icon>
                <span>上传附件</span>
              </el-button>
            </div>
          </div>
        </template>
        <template #actions="{ row }">
          <el-button type="primary" link class="row-link" @click="handleView(row)">
            查看
          </el-button>
          <el-button type="primary" link class="row-link" @click="handleDownload(row)">
            下载
          </el-button>
          <!-- <el-button type="danger" link class="row-link" @click="handleDelete(row)">
            删除
          </el-button> -->
        </template>
      </base-table>
    </div>

    <!-- 上传附件弹窗 -->
    <add-attachment-dialog
      v-model="dialogVisible"
      :conId="props.conId"
      :annexTypeOptions="annexTypeOptions"
      @success="handleRefresh"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Refresh, Upload } from "@element-plus/icons-vue";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import { attachmentApi } from "@/api/cost/contract-manage/attachment-api.ts";
import { ContractAnnex } from "@/types/cost/contract-manage/attachment-type.ts";
import AddAttachmentDialog from "./add-attachment-dialog.vue";
import { useDict } from "@/composables/use-dict";
import { dictMapping } from "@/utils/dict-mapping";
import { getEnumLabel, getEnumType } from "@/utils/enum";
import { FileSourceEnum, AnnexTypeEnum } from "@/constants/contract-manage/enums.ts";

defineOptions({ name: "attachment" });

const props = defineProps<{
  conId: number | null;
}>();

const dialogVisible = ref(false);
const tableLoading = ref(false);
const refreshing = ref(false); // 驱动刷新按钮旋转动画
const tableData = ref<ContractAnnex[]>([]);

const tableColumns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60 },
  { slot: "annexType", label: "文档类型", width: 150 },
  { prop: "annexName", label: "文档名称" },
  { slot: "annexSrc", label: "文档来源", width: 150 },
  { prop: "createDate", label: "上传时间", width: 180 },
  {
    label: "操作",
    width: 200,
    slot: "actions",
    fixed: "right",
  },
];
// 附件类型
const annexTypeOptions = ref([]);
// 数据字典
const { getDictList, loadDicts } = useDict(
  [
    dictMapping.annexType, // 附件类型
  ],
  {
    treeDictCodes: [],
  },
);
// 获取列表数据
const getDataList = async () => {
  if (!props.conId) {
    return;
  }
  try {
    tableLoading.value = true;
    tableData.value = [];
    const res = await attachmentApi.getAnnexList({ conId: props.conId });
    if (res.code === 200) {
      tableData.value = res.data;
    }
  } catch (error) {
    console.error("获取招标需求列表失败:", error);
  } finally {
    tableLoading.value = false;
  }
};

const handleDelete = (row) => {
  ElMessageBox.confirm("确定删除该数据吗？", "提示", { type: "warning" })
    .then(async () => {
      try {
        const res = await attachmentApi.delAnnex({ id: row.id });
        if (res.code === 200) {
          ElMessage.success("删除成功");
          getDataList();
        }
      } catch (error) {
        console.error("删除失败:", error);
      }
    })
    .catch(() => {});
};
// 刷新按钮（包一层 refreshing 状态驱动图标旋转，原 tableLoading 逻辑不动）
const handleRefresh = async () => {
  refreshing.value = true;
  try {
    await getDataList();
  } finally {
    refreshing.value = false;
  }
};

// 上传文件
const handleUpload = () => {
  dialogVisible.value = true;
};

// 查看附件
const handleView = async (row: ContractAnnex) => {
  try {
    if (row.annexPath) {
      window.open(row.annexPath, "_blank");
      return;
    }
    // 若后台提供按 id 获取文件的接口，可在这里使用 http.getFileBlob
    ElMessage.warning("当前附件无直链，无法预览");
  } catch (error) {
    console.error("预览失败:", error);
    ElMessage.error("预览失败");
  }
};

// 下载附件
const handleDownload = async (row: ContractAnnex) => {};

// 初始化数据字典数据
const initDictData = async () => {
  await loadDicts();
  annexTypeOptions.value = getDictList(dictMapping.annexType); // 附件类型
};

// 监听合同ID变化，自动刷新列表
// watch(
//   () => props.conId,
//   async (val) => {
//     if (val) {
//       await initDictData();
//       getDataList();
//     } else {
//       tableData.value = [];
//     }
//   },
//   { immediate: true },
// );
onMounted(async () => {
  await initDictData();
  getDataList();
});
</script>

<style lang="scss" scoped>
.attachment-table-wrapper {
  width: 100%;
  height: 100%;
  padding: 3px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 卡片容器 */
.pa-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: box-shadow 0.25s ease;
  &:hover {
    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.09);
  }
}

/* 工具栏：左标题 / 右操作 */
.pa-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid #f0f2f5;
  background: linear-gradient(180deg, #fafcff 0%, #ffffff 100%);
}
.pa-toolbar__title {
  display: flex;
  align-items: center;
  gap: 10px;
}
.pa-toolbar__name {
  position: relative;
  padding-left: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 16px;
    border-radius: 2px;
    background: #409eff;
  }
}
.pa-toolbar__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* —— 刷新按钮：重点优化 —— */
.refresh-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  .refresh-icon {
    transition: transform 0.3s ease;
  }
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.35);
  }
  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(64, 158, 255, 0.3);
  }
  /* 刷新中：图标持续旋转 */
  &.is-refreshing .refresh-icon {
    animation: pa-spin 0.8s linear infinite;
  }
}
@keyframes pa-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 上传按钮：与刷新按钮一致的悬浮反馈 */
.add-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.25);
  }
  &:active:not(:disabled) {
    transform: translateY(0);
  }
}

/* 行内操作链接：悬浮微提示 */
.row-link {
  font-weight: 500;
  transition: opacity 0.15s ease;
  &:hover {
    opacity: 0.85;
  }
}
</style>
