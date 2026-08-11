<!-- 付款登记查看 弹窗 -->
<template>
  <base-modal
    v-model="dialogVisible"
    :title="'付款登记明细'"
    width="1400px"
    :showConfirmButton="false"
    :showCancelButton="false"
    @close="handleClose"
  >
    <div style="padding-right: 8px; box-sizing: border-box">
      <!-- <div class="title">款项明细</div> -->
      <base-table
        :columns="tableColumns"
        :tableData="tableData"
        :rowKey="'id'"
        :pagination="false"
        :show-toolbar="false"
        :auto-height="false"
        :height="'500px'"
        :border="true"
        :stripe="true"
      >
        <!-- 回单照片列自定义渲染 -->
        <template #receiptPhotos="{ row }">
          <div class="photo-list">
            <template v-if="row.receiptPhotos && row.receiptPhotos.length > 0">
              <div
                v-for="(photo, index) in getDisplayPhotos(row.receiptPhotos)"
                :key="photo.id || index"
                class="photo-item-wrapper"
                @click.stop="handlePreview(row.receiptPhotos, index)"
              >
                <el-image
                  :src="photo.url || photo"
                  fit="cover"
                  class="photo-item"
                  :preview-teleported="true"
                />
              </div>
              <span
                v-if="row.receiptPhotos.length > 3"
                class="photo-more"
                @click.stop="handlePreview(row.receiptPhotos, 3)"
              >
                +{{ row.receiptPhotos.length - 3 }}
              </span>
            </template>
            <span v-else style="color: #909399; font-size: 12px">
              暂无照片
            </span>
          </div>
        </template>

        <template #actions="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button type="danger" link @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </base-table>

      <!-- 图片预览组件 -->
      <el-image-viewer
        v-if="showViewer"
        :url-list="previewList"
        :initial-index="previewIndex"
        :teleported="true"
        @close="closePreview"
        @switch="handleSwitch"
      />
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { ElMessage, ElMessageBox, type FormInstance } from "element-plus";
import { ElImageViewer } from "element-plus";
import { dateUtil } from "@/utils/date-util";
import { v4 as uuidv4 } from "uuid";
import { useUserStore } from "@/stores/user-store";
import { useMDStore } from "@/stores/md-store.ts";
import { payRegisterApi } from "@/api/cost/payment-manage/payment-register-api";
import { commonApi } from "@/api/cost/common-api";
import { buildFileUrl } from "@/utils/file-path-util";

interface Props {
  modelValue: boolean;
  currentRow?: any;
  queryParams?: any;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  currentRow: null,
  queryParams: null,
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [];
}>();

const userStore = useUserStore();
const mdStore = useMDStore();

const dialogVisible = ref(props.modelValue);
const formRef = ref<FormInstance>();
const payComOptions = ref([]);

// 预览相关
const showViewer = ref(false);
const previewList = ref<string[]>([]);
const previewIndex = ref(0);
const currentPreviewPhotos = ref([]);

// 表单数据
const formData = ref({
  registrar: "",
  registrarDate: "",
  modifier: "",
  modifyDate: "",
});

// 表格数据
const tableData = ref([]);
// 表格列配置
const tableColumns = computed(() => {
  const baseColumns = [
    { type: "index", label: "序号", width: 60 },
    { prop: "payWayName", label: "支付方式", width: 100 },
    { prop: "payAmt", label: "支付金额", width: 100 },
    { prop: "payDate", label: "支付日期", width: 100 },
    { prop: "payDesc", label: "备注", width: 200 },
    { prop: "bankAccount", label: "支付账号" },
    { prop: "payCompName", label: "支付公司" },
    { prop: "bankReceipt", label: "银行回单号" },
    { slot: "receiptPhotos", label: "回单照片", width: 160 },
  ];
  // 入库锁定状态下不可操作
  if (props?.currentRow?.isLocked) {
    return baseColumns;
  } else {
    return [...baseColumns, { slot: "actions", label: "操作", width: 150 }];
  }
});

// 监听父组件传来的值
watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val;
    if (val) {
    }
  },
);
// 编辑
const handleEdit = (row) => {
  if (!row.id) return;
};
// 删除
const handleDelete = (row) => {
  if (!row.id) return;
  ElMessageBox.confirm(`确定删除这条数据吗？`, "提示", {
    type: "warning",
  })
    .then(async () => {
      const res = await payRegisterApi.delPayRegister({ id: row.id });
      if (res.code === 200) {
        ElMessage.success("删除成功");
        // 重新更新数据
        getDetailList();
      }
    })
    .catch(() => {});
};

// 获取显示的照片（最多显示3张）
const getDisplayPhotos = (photos: any[]) => {
  if (!photos || photos.length === 0) return [];
  return photos.slice(0, 3);
};

// 处理预览
const handlePreview = (photos: any[], index: number) => {
  if (!photos || photos.length === 0) return;

  currentPreviewPhotos.value = photos;
  previewList.value = photos.map((photo) => photo.url || photo);
  previewIndex.value = Math.min(index, photos.length - 1);
  showViewer.value = true;
};

// 关闭预览
const closePreview = () => {
  showViewer.value = false;
  previewList.value = [];
  previewIndex.value = 0;
  currentPreviewPhotos.value = [];
};

// 切换图片
const handleSwitch = (index: number) => {
  previewIndex.value = index;
};

// 关闭弹窗
const handleClose = () => {
  formRef.value?.resetFields();
  formRef.value?.clearValidate();
  dialogVisible.value = false;
  closePreview();
};

// 获取公司列表
const getCompanyListByProjId = async () => {
  const projId = props?.currentRow?.projId;
  if (!projId) {
    payComOptions.value = [];
    return;
  }
  try {
    payComOptions.value = [];
    const companies = await mdStore.getProjCompanyList(projId);
    payComOptions.value = companies || [];
  } catch (error) {
    console.error("获取公司列表失败:", error);
    payComOptions.value = [];
  }
};

// 获取明细数据
const getDetailList = async () => {
  try {
    const params = {
      bizBillId: props.currentRow.bizBillId,
      bizType: props.currentRow.bizType,
    };
    const res = await payRegisterApi.getPayRegisterList(params);
    if (res.code === 200) {
      const list = res.data || [];

      // 并发请求所有附件信息
      const promises = list.map(async (item) => {
        // 如果有附件ID，获取附件详情
        if (item.annexId) {
          try {
            const fileRes = await commonApi.getFileList({
              annexId: item.annexId,
            });
            if (
              fileRes.code === 200 &&
              fileRes.data &&
              fileRes.data.length > 0
            ) {
              // 获取第一个附件（根据实际情况调整）
              const file = fileRes.data[0];
              // 拼接完整路径
              const fullUrl = buildFileUrl(file.annexPath);
              return {
                ...item,
                receiptPhotos: [
                  {
                    id: file.id,
                    url: fullUrl,
                    name: file.annexName || file.name,
                    annexName: file.annexName || file.name,
                    annexPath: file.annexPath || file.url,
                  },
                ],
                // 保留原始annexId用于后续操作
                annexId: item.annexId,
              };
            }
          } catch (error) {
            console.error(`获取附件失败 (annexId: ${item.annexId}):`, error);
          }
        }

        // 没有附件或获取失败，返回原始数据
        return {
          ...item,
          receiptPhotos: [],
        };
      });

      // 等待所有并发请求完成
      const processedList = await Promise.all(promises);

      // 更新表格数据
      tableData.value = processedList || [];
    }
  } catch (error) {
    console.error("获取明细列表失败:", error);
    ElMessage.error("获取数据失败，请重试");
  }
};

const initData = async () => {
  console.log("initData", props.currentRow);
  await getDetailList();
};

watch(
  () => props.modelValue,
  async (val) => {
    dialogVisible.value = val;
    if (val) {
      formData.value.registrar = userStore.userInfo?.empName || "";
      formData.value.registrarDate = dateUtil().format("YYYY-MM-DD");
      await initData();
    }
  },
);

// 监听内部显示状态变化
watch(dialogVisible, (val) => {
  emit("update:modelValue", val);
});
</script>

<style lang="scss" scoped>
.title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
  padding-left: 12px;
  box-sizing: border-box;
  position: relative;
  &::before {
    content: "";
    width: 4px;
    height: 16px;
    background: linear-gradient(180deg, #409eff, #66b1ff);
    border-radius: 2px;
    position: absolute;
    left: 0;
    top: 5px;
  }
}

.photo-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;

  .photo-item-wrapper {
    position: relative;
    cursor: pointer;
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid #e4e7ed;
    transition: all 0.2s;

    &:hover {
      transform: scale(1.1);
      border-color: #409eff;
      z-index: 1;
    }

    .photo-item {
      width: 40px;
      height: 40px;
      display: block;
    }
  }

  .photo-more {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 4px;
    background: #f5f7fa;
    color: #409eff;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    border: 1px dashed #d9d9d9;
    transition: all 0.2s;

    &:hover {
      background: #ecf5ff;
      border-color: #409eff;
    }
  }
}
</style>
