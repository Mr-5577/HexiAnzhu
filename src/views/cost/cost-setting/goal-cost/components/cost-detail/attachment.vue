<!-- 相关附件 -->
<template>
  <div class="cost-detail-attachment">
    <base-table
      :columns="tableColumns"
      :tableData="tableData"
      :rowKey="'id'"
      :pagination="false"
      :loading="tableLoading"
      :show-toolbar="false"
    >
      <template #annexName="{ row }">
        <div class="annex-cell">
          <el-link
            v-if="row.id"
            type="primary"
            :underline="'hover'"
            @click="handleViewAnnex(row)"
          >
            {{ row.annexName || "查看附件" }}
          </el-link>
        </div>
      </template>
    </base-table>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { useRoute } from "vue-router";
import { commonApi } from "@/api/cost/common-api";
import { goalCostApi } from "@/api/cost/cost-setting/goal-cost-api";
import { dateUtil } from "@/utils/date-util";
import { buildFileUrl } from "@/utils/file-path-util";

defineOptions({ name: "cost-detail-attachment" });

interface Props {
  mode: "add" | "edit" | "detail";
  costMid?: undefined | number;
  projId?: undefined | number;
}

const props = withDefaults(defineProps<Props>(), {
  mode: "add",
  costMid: undefined,
  projId: undefined,
});

const route = useRoute();

const mode = ref<"add" | "edit" | "detail">(props.mode);
const costMid = ref<number | undefined>(props.costMid);
const projId = ref<number | undefined>(props.projId);

const isDetail = computed(() => mode.value === "detail");
const isEdit = computed(() => mode.value === "edit");
const isAdd = computed(() => mode.value === "add");

const tableLoading = ref(false);
const tableData = ref([]);
const tableColumns = ref([
  { type: "index", label: "序号", width: 60 },
  {
    label: "附件名称",
    slot: "annexName",
  },
  {
    label: "上传人",
    prop: "createName",
  },
  {
    label: "上传时间",
    prop: "createDate",
    formatter: (data: any) => {
      const date = data.createDate || new Date();
      return dateUtil(date).format("YYYY-MM-DD");
    },
  },
]);
// 获取详情数据
const getDetailData = async () => {
  try {
    tableLoading.value = true;
    tableData.value = [];
    const res = await goalCostApi.getProjectCostM({
      id: costMid.value,
    });
    console.log("详情res", res);
    if (res.code === 200 && res.data) {
      const { annexList } = res.data;
      tableData.value = annexList || [];
    }
  } catch (error) {
  } finally {
    tableLoading.value = false;
  }
};
// 查看附件
const handleViewAnnex = async (row: any) => {
  if (!row.id) {
    ElMessage.warning("该附件不存在");
    return;
  }
  try {
    const res = await commonApi.getFileList({ annexId: row.id });
    if (res.code === 200 && res.data && res.data.length > 0) {
      const file = res.data[0];
      const fileUrl = file.annexPath;
      if (fileUrl) {
        const url = buildFileUrl(fileUrl);
        window.open(url, "_blank");
      } else {
        ElMessage.error("无法获取附件地址");
      }
    } else {
      ElMessage.error("附件不存在");
    }
  } catch (error) {
    ElMessage.error("查看附件失败，请稍后重试");
  }
};
// watch(
//   () => [props.mode, props.costMid, props.projId],
//   () => {
//     getDetailData();
//   },
//   { deep: true, immediate: true },
// );
onMounted(() => {
  getDetailData();
});
</script>

<style lang="scss" scoped>
.cost-detail-attachment {
  height: 100%;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  background: #fff;
}
</style>
