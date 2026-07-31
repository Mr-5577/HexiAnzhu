<!-- 面积数据 -->
<template>
  <div class="area-data-page">
    <base-table
      ref="tableRef"
      :columns="tableColumns"
      :tableData="tableList"
      :loading="tableLoading"
      rowKey="id"
      :showSummary="true"
      :pagination="false"
    >
    </base-table>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { goalCostApi } from "@/api/cost/cost-setting/goal-cost-api";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";
import { TableColumnItem } from "@/components/base/base-table.vue";

defineOptions({ name: "area-data" });

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

const tableList = ref([]);
const tableLoading = ref(false);
const tableColumns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60 },
  { prop: "bldName", label: "楼栋名称" },
  { prop: "prodName", label: "业态名称" },
  {
    label: "建筑面积(m²)",
    children: [
      { prop: "agBuildArea", label: "地上", showSummary: true },
      { prop: "ugBuildArea", label: "地下", showSummary: true },
    ],
  },
  {
    label: "可售面积(m²)",
    children: [
      { prop: "agSaleArea", label: "地上", showSummary: true },
      { prop: "ugSaleArea", label: "地下", showSummary: true },
    ],
  },
  { prop: "houseNum", label: "户数", showSummary: true },
  { prop: "elvNum", label: "电梯数" },
];
// 加载数据列表
const getDataList = async (verMid: number) => {
  try {
    tableLoading.value = true;
    tableList.value = [];
    const params = {
      verMid: verMid, // 版本ID
    };
    const res = await projectAreaApi.getAreaVerDList(params);
    if (res.code === 200) {
      tableList.value = res.data || [];
    }
  } catch (error) {
  } finally {
    tableLoading.value = false;
  }
};

// 获取详情
const getDetailById = async () => {
  if (!costMid.value) return;
  try {
    const res = await goalCostApi.getProjectCostM({
      id: costMid.value,
    });
    if (res.code == 200 && res.data) {
      const { costM } = res.data;
      getDataList(costM.areaVerMid);
    }
  } catch (error) {}
};

// watch(
//   () => [props.mode, props.costMid, props.projId],
//   () => {
//     getDetailById();
//   },
//   { deep: true, immediate: true },
// );
onMounted(() => {
  getDetailById();
});
</script>

<style lang="scss" scoped>
.area-data-page {
  height: 100%;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  background: #fff;
}
</style>
