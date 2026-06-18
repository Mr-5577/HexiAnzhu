<!-- 合同附件 列表 -->
<template>
  <div class="attachment-table-wrapper">
    <base-table
      :columns="tableColumns"
      :tableData="tableData"
      :loading="tableLoading"
      :rowKey="'id'"
      :pagination="false"
    >
      <!-- 列表外操作栏 -->
      <template #actionBar>
        <div class="actionBar-buttons">
          <el-button type="primary" icon="Refresh" @click="handleRefresh">
            刷新列表
          </el-button>
          <el-button type="primary" @click="handleUpload"> 上传附件 </el-button>
        </div>
      </template>
      <template #actions="{ row }">
        <el-button type="primary" link @click="handleView(row)">
          查看
        </el-button>
        <el-button type="primary" link @click="handleDownload(row)">
          下载
        </el-button>
        <el-button type="danger" link @click="handleDelete(row)">
          删除
        </el-button>
      </template>
    </base-table>
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
import { ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import { attachmentApi } from "@/api/cost/contract-manage/attachment-api.ts";
import { ContractAnnex } from "@/types/cost/contract-manage/attachment-type.ts";
import AddAttachmentDialog from "./add-attachment-dialog.vue";
import { useDict } from "@/composables/use-dict";
import { dictMapping } from "@/utils/dict-mapping";

defineOptions({ name: "attachment" });

const props = defineProps<{
  conId: number | null;
}>();

const dialogVisible = ref(false);
const tableLoading = ref(false);
const tableData = ref<ContractAnnex[]>([]);

const tableColumns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60 },
  { prop: "annexTypeName", label: "文档类型" },
  { prop: "annexName", label: "文档名称" },
  { prop: "annexSrcName", label: "文档来源" },
  { prop: "createDate", label: "上传时间" },
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
// 刷新按钮
const handleRefresh = () => {
  getDataList();
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
watch(
  () => props.conId,
  async (val) => {
    if (val) {
      await initDictData();
      getDataList();
    } else {
      tableData.value = [];
    }
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
.attachment-table-wrapper {
  width: 100%;
  height: 100%;
  padding: 15px;
  box-sizing: border-box;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .actionBar-buttons {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
}
</style>
