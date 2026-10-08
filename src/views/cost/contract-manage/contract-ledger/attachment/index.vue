<!-- 合同附件 列表 -->
<template>
  <div class="attachment-table-wrapper">
    <div class="pa-card">
      <div class="pa-toolbar">
        <div class="pa-toolbar__title">
          <span class="pa-toolbar__name">合同附件</span>
          <el-tag size="small" type="info" effect="plain" round>
            {{ tableData.length }} 个
          </el-tag>
        </div>
        <div class="pa-toolbar__actions">
          <el-button type="primary" class="refresh-btn" :class="{ 'is-refreshing': refreshing }" :disabled="refreshing"
            @click="handleRefresh">
            <el-icon class="refresh-icon">
              <Refresh />
            </el-icon>
            <span>{{ refreshing ? "刷新中" : "刷新列表" }}</span>
          </el-button>
          <el-button type="primary" class="add-btn" @click="handleUpload"
            :disabled="!menuStore.hasExactPermission(PERMISSIONS.CONT_ANNEX_UPLOAD)">
            <el-icon>
              <Upload />
            </el-icon>
            <span>上传附件</span>
          </el-button>
        </div>
      </div>
      <base-table :columns="tableColumns" :tableData="tableData" :loading="tableLoading" :rowKey="'id'" :height="'100%'"
        :pagination="false">
        <template #linkConType="{ row }">
          <span>{{ getEnumLabel(AnnexConTypeEnum, row?.linkConType) }}</span>
        </template>
        <template #annexType="{ row }">
          <span>{{ getEnumLabel(AnnexTypeEnum, row?.annexType) }}</span>
        </template>
        <template #annexSrc="{ row }">
          <span>{{ getEnumLabel(FileSourceEnum, row?.annexSrc) }}</span>
        </template>

        <template #actions="{ row }">
          <el-button type="primary" link class="row-link" @click="handleView(row)">
            查看
          </el-button>
          <el-button type="primary" link class="row-link" :disabled="downloading" @click="handleDownload(row)">
            下载
          </el-button>
          <!-- 只能删除附件来源为 手工上传的附件 -->
          <el-button type="danger" link class="row-link"
            :disabled="!menuStore.hasExactPermission(PERMISSIONS.CONT_ANNEX_DELETE) || row.annexSrc !== 1"
            @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </base-table>
    </div>

    <!-- 上传附件弹窗 -->
    <add-attachment-dialog v-model="dialogVisible" :conId="props.conId" :annexTypeOptions="annexTypeOptions"
      @success="handleRefresh" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Message, Refresh, Upload } from "@element-plus/icons-vue";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import { attachmentApi } from "@/api/cost/contract-manage/attachment-api.ts";
import { ContractAnnex } from "@/types/cost/contract-manage/attachment-type.ts";
import AddAttachmentDialog from "./add-attachment-dialog.vue";
import { useDict } from "@/composables/use-dict";
import { dictMapping } from "@/utils/dict-mapping";
import { getEnumLabel } from "@/utils/enum";
import { FileSourceEnum, AnnexTypeEnum, AnnexConTypeEnum } from "@/constants/contract-manage/enums.ts";
import { commonApi } from "@/api/cost/common-api.ts";
import { buildFileUrl } from "@/utils/file-path-util.ts";
import { useMenuStore } from "@/stores/menu-store";
import { PERMISSIONS } from "@/constants/permission.ts";
import { downloadByUrl } from "@/utils/common.ts";

defineOptions({ name: "attachment" });

const props = defineProps<{
  conId: number | null;
}>();

const menuStore = useMenuStore();
const dialogVisible = ref(false);
const tableLoading = ref(false);
const refreshing = ref(false);
const tableData = ref<ContractAnnex[]>([]);
const downloading = ref(false);

const tableColumns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60 },
  { slot: "linkConType", label: "合同类型", width: 100 },
  { prop: "linkConNo", label: "关联合同编号", width: 150 },
  { slot: "annexType", label: "附件类型", width: 130 },
  { prop: "annexName", label: "附件名称", minWidth: 200 },
  { slot: "annexSrc", label: "附件来源", width: 150 },
  { prop: "createDate", label: "上传时间", width: 180 },
  {
    label: "操作",
    width: 200,
    slot: "actions",
    fixed: "right",
  },
];
// 附件类型
const annexTypeOptions = computed(() => getDictList(dictMapping.annexType));
// 数据字典
const { getDictList, loadDicts } = useDict(
  [
    dictMapping.annexType, // 附件类型
  ]
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
  ElMessageBox.confirm(`确定删除“${row.annexName || ''}”附件吗？`, "提示", { type: "warning" })
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
    .catch(() => { });
};
// 刷新按钮
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
const handleView = async (row: any) => {
  console.log("查看附件:", row);
  if (row.annexUrl) {
    window.open(row.annexUrl, "_blank");
  }
  if (row.annexId) {
    try {
      const res = await commonApi.getFileList({ annexId: row.annexId });
      if (res.code === 200 && res.data) {
        const file = res.data[0];
        if (file && file.annexPath) {
          const url = buildFileUrl(file.annexPath);
          window.open(url, "_blank");
        }
      }
    } catch (error) {
      console.error("预览失败:", error);
    }
  }
};
// 下载附件
const handleDownload = async (row: any) => {
  console.log("下载附件:", row);
  if (downloading.value) return
  if (row.annexUrl) {
    downloading.value = true
    await downloadByUrl(row.annexUrl, row.annexName)
    downloading.value = false
  }
  if (row.annexId) {
    try {
      downloading.value = true
      await commonApi.downloadAnnex({ annexId: row.annexId });
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } catch (error) {
      console.error("预览失败:", error);
    } finally {
      downloading.value = false
    }
  }
};

// 初始化数据字典数据
const initDictData = async () => {
  await loadDicts();
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
  flex: 1;
  width: 100%;
  height: 100%;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: box-shadow 0.25s ease;
  padding: 0 15px 15px;
  box-sizing: border-box;

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
  padding: 14px 0px;
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
