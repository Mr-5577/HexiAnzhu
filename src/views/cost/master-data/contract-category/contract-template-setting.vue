<template>
  <div class="tpl-setting" v-if="conTypeId">
    <!-- 板块过滤（动态取数） -->
    <div class="seg-bar">
      <span class="seg-label">板块</span>
      <el-select
        :model-value="segId"
        placeholder="请选择板块"
        clearable
        style="width: 220px"
        :loading="segLoading"
        @change="onSegChange"
      >
        <el-option
          v-for="s in segOptions"
          :key="s.id"
          :label="s.segName"
          :value="s.id"
        />
      </el-select>
    </div>

    <div class="split" v-if="segId !== '' && segId !== null">
      <!-- 左：版本列表 -->
      <div class="ver-list">
        <div class="ver-list-title">模板版本</div>
        <div
          v-for="(v, i) in versions"
          :key="v.id ?? 'new-' + i"
          class="ver-item"
          :class="{ active: i === currentIdx }"
          @click="selectVersion(i)"
        >
          <div class="ver-name">
            {{ v.verNo }}
            <el-tag v-if="v.isEnabled" size="small" type="success" effect="dark">生效中</el-tag>
            <el-tag v-else size="small" type="info" effect="plain">草稿</el-tag>
          </div>
          <div class="ver-sub">
            {{ v.conTemplateId && v.conTemplateId !=0 ? "已挂模板" : "未挂模板" }} ·
            {{ v.isMustUse ? "必用" : "非必用" }}
          </div>
          <span
            v-if="versions.length > 1"
            class="ver-del"
            title="删除版本"
            @click.stop="delVersion(i)"
            >✕</span
          >
        </div>
        <div
          class="add-ver"
          :class="{ 'is-disabled': !canAddVersion }"
          :title="!canAddVersion ? '请先保存当前版本后再新增' : ''"
          @click="addVersion"
        >
          + 新增版本
        </div>
      </div>

      <!-- 右：设置表单 -->
      <div class="ver-form" v-loading="saving">
        <div class="form-head">
          <span>{{ currentVersion?.verNo }}</span>
          <el-tag v-if="currentVersion?.isEnabled" size="small" type="success" effect="dark">生效中</el-tag>
          <el-tag v-else size="small" type="info" effect="plain">草稿</el-tag>
        </div>

        <el-form label-position="top">
          <el-form-item label="是否必须使用模板">
            <el-switch v-model="currentVersion.isMustUse" @change="markDirty" />
            <span class="hint">开启后该类别合同必须基于模板起草</span>
          </el-form-item>

          <el-form-item label="是否生效">
            <el-switch v-model="currentVersion.isEnabled" @change="onEnabledChange" />
            <span class="hint">同一分类 + 板块下仅可 1 个版本生效</span>
          </el-form-item>

          <el-form-item prop="annexList" label="合同模板" required>
            <base-upload
              v-model:file-list="conTemplateAnnex"
              :limit="1"
              :multiple="false"
              :showIcon="true"
              accept=".docx"
              :showTip="true"
              :maxSize="20"
              :unrestricted="true"
              :tipText="'仅支持.docx 附件，保存前必须上传，文件不超过20M，且只能上传一个'"
              button-text="上传模板（.docx）"
              size="default"
              @success="onUploadSuccess"
            />
          </el-form-item>

          <el-form-item label="审核要点">
            <el-input
              v-model="currentVersion.reviewChecklist"
              type="textarea"
              :rows="5"
              placeholder="请输入该模板版本的合同审核要点"
              @input="markDirty"
            />
          </el-form-item>
        </el-form>

        <div class="form-actions">
          <el-button @click="resetCurrent">取消</el-button>
          <el-button type="primary" @click="saveVersion">保存</el-button>
        </div>
      </div>
    </div>

    <el-empty v-else description="请选择板块后查看合同模板设置" />
  </div>
  <el-empty v-else description="请先在左侧选择一个合同类别" />
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { ContractTemplateVersion } from "@/types/cost/master-data/contract-category-type";
import { conTypeApi } from "@/api/cost/master-data/contract-category-api";
import { loadOptions } from "@/composables/use-options-loader";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api";
import BaseUpload from "@/components/base/base-upload.vue";
import { commonApi } from "@/api/cost/common-api";
import { buildFileUrl } from "@/utils/file-path-util";

const props = defineProps<{
  /** 当前选中的合同分类ID（来自左侧树） */
  conTypeId: number | null;
}>();

// ---- 板块 ----
const segOptions = ref<any[]>([]);
const segLoading = ref(false);
const segId = ref<number | string>("");

// ---- 版本 ----
const versions = ref<ContractTemplateVersion[]>([]);
const currentIdx = ref(0);
const dirty = ref(false);
const loading = ref(false);
const saving = ref(false);
const conTemplateAnnex = ref<any[]>([]);

const currentVersion = computed(
  () => versions.value[currentIdx.value] ?? ({} as ContractTemplateVersion)
);

const onUploadSuccess = (file: any) => {
    conTemplateAnnex.value=[file]
  };

const getAnnexInfo =async (annexId) =>{
    if (currentVersion.value.conTemplateId) {
        try {
            const fileRes = await commonApi.getFileList({
              annexId: annexId,
            });
            if (
              fileRes.code === 200 &&
              fileRes.data &&
              fileRes.data.length > 0
            ) {
              // 获取第一个附件（根据实际情况调整）
              const file = fileRes.data[0];
              const fullUrl = buildFileUrl(file.annexPath);
              conTemplateAnnex.value = [
                {
                    id: file.id,
                    url: fullUrl,
                    name: file.annexName || file.name,
                    annexName: file.annexName || file.name,
                    annexPath: file.annexPath || file.url,
                }
              ]
            }
        }
        catch  (error){
            console.error(`获取附件失败 (annexId: ${currentVersion.value.conTemplateId}):`, error);
        }
    }
}

// 版本号工具：解析数字 / 取下一个序号（按 v1、v2… 递增）
const verNum = (v: any): number => {
  const m = /^v(\d+)$/.exec(String(v ?? ""));
  return m ? Number(m[1]) : Number.MAX_SAFE_INTEGER;
};
const nextVerNo = (): string => {
  let max = 0;
  for (const v of versions.value) {
    const n = verNum(v.verNo);
    if (n !== Number.MAX_SAFE_INTEGER) max = Math.max(max, n);
  }
  return "v" + (max + 1);
};

// 仅当上一个版本已保存（有 id）时才允许新增，保证“一个填完才能加下一个”
const canAddVersion = computed(() => {
  if (versions.value.length === 0) return true;
  const last = versions.value[versions.value.length - 1];
  return last.id != null;
});

// 切换分类时重置
watch(
  () => props.conTypeId,
  () => {
    segId.value = "";
    versions.value = [];
    dirty.value = false;
  }
);

const getSegOptions = () =>
  loadOptions(
    () => dictionaryApi.getsegmentList(),
    segOptions,
    "获取业务板块列表失败:",
  );

onMounted(getSegOptions);

// 把后端单条版本数据映射为本地结构；
// 关键点：annex（合同模板附件）是每个版本自带的，在 normalize 里就映射好，
// 这样切换版本时每个版本都会显示自己的附件，不会相互覆盖。
const normalize = (v: any): ContractTemplateVersion => ({
  id: v.id,
  conTypeId: props.conTypeId as number,
  verNo: v.verNo,
  segId: v.segId,
  isMustUse: !!v.isMustUse,
  isEnabled: !!v.isEnabled,
  conTemplateName: v.conTemplateName,
  conTemplateId: v.conTemplateId,
  reviewChecklist: v.reviewChecklist,
  createId: v.createId,
  createDate: v.createDate,
  operId: v.operId,
  operDate: v.operDate,
});

const newDraft = (): ContractTemplateVersion => ({
  conTypeId: props.conTypeId as number,
  segId: segId.value as number | string,
  verNo: nextVerNo(),
  isMustUse: false,
  isEnabled: false,
  reviewChecklist: "",
});

const loadVersions = async () => {
  if (!props.conTypeId || segId.value === "" || segId.value == null) return;
  try {
    loading.value = true;
    versions.value = []; // 先清空，避免 nextVerNo 取到上一板块的旧数据
    const res = await conTypeApi.getTemplateList({
      conTypeId: props.conTypeId,
      segId: segId.value,
    });
    let list: ContractTemplateVersion[] = [];
    if (res.code === 200) {
      list = ((res.data as any[]) || []).map(normalize);
      list.sort((a, b) => verNum(a.verNo) - verNum(b.verNo)); // 按版本号升序展示
    }
    if (list.length === 0) list.push(newDraft()); // 尚无版本时给一个空白草稿（v1）
    versions.value = list;
    currentIdx.value = 0;
    dirty.value = false;
  } finally {
    loading.value = false;
  }
};

// ---- 脏数据拦截：切换板块 / 切换版本 前提示 ----
const tryLeave = async (onLeave: () => void | Promise<void>) => {
  if (!dirty.value) {
    await onLeave();
    getAnnexInfo(currentVersion.value.conTemplateId);
    return;
  }
  try {
    await ElMessageBox.confirm("模板设置已修改，是否保存？", "提示", {
      confirmButtonText: "保存",
      cancelButtonText: "不保存",
      type: "warning",
    });
    const ok = await saveVersion();
    if (!ok) return; // 校验失败则停留
    await onLeave();
    getAnnexInfo(currentVersion.value.conTemplateId);
  } catch (action) {
    if (action === "cancel") {
      // 不保存，直接离开
      dirty.value = false;
      await onLeave();
      getAnnexInfo(currentVersion.value.conTemplateId);
    }
    // 关闭/ESC：停留，不离开
  }
};

const onSegChange = (val: number | string) => {
  tryLeave(async () => {
    segId.value = val;
    await loadVersions();
  });
};

const selectVersion = (i: number) => {
  if (i === currentIdx.value) return;
  tryLeave(() => {
    currentIdx.value = i;
  });
};

const addVersion = () => {
  if (!canAddVersion.value) return; // 上一个版本未保存，禁止新增
  // 带出上一版（列表最后一条）的设置；新版本默认不生效，避免破坏"仅 1 个生效"
  debugger
  const src = versions.value[versions.value.length - 1] ?? null;
  const draft: ContractTemplateVersion = {
    conTypeId: props.conTypeId as number,
    segId: segId.value as number | string,
    isMustUse: src ? src.isMustUse : false,
    isEnabled: false,
    verNo: nextVerNo(),
    conTemplateName: src?.conTemplateName,
    conTemplateId: src?.conTemplateId,
    reviewChecklist: src?.reviewChecklist ?? "",
  };
  versions.value.push(draft);
  currentIdx.value = versions.value.length - 1;
  dirty.value = true;
  getAnnexInfo(src?.conTemplateId);
};

const delVersion = async (i: number) => {
  if (versions.value.length <= 1) return;
  const target = versions.value[i];
  if (target.id != null) {
    try {
      await ElMessageBox.confirm(`确定删除版本 ${i + 1} 吗？`, "提示", {
        confirmButtonText: "删除",
        cancelButtonText: "取消",
        type: "warning",
      });
      const res = await conTypeApi.delTemplate({ id: target.id });
      if (res.code !== 200) {
        ElMessage.error(res.msg || "删除失败");
        return;
      }
      ElMessage.success("删除成功");
    } catch {
      return;
    }
  }
  const wasEff = versions.value[i].isEnabled;
  versions.value.splice(i, 1);
  if (wasEff && versions.value.length) versions.value[0].isEnabled = true;
  if (currentIdx.value >= versions.value.length)
    currentIdx.value = versions.value.length - 1;
  dirty.value = true;
};

// 是否生效：排他（保证永远只有 1 个生效）
const onEnabledChange = (val: boolean) => {
  if (val) {
    versions.value.forEach((v, i) => {
      if (i !== currentIdx.value) v.isEnabled = false;
    });
  }
  markDirty();
};

const markDirty = () => {
  dirty.value = true;
};

// 上传成功 / 移除：把附件文件同步回 conTemplateId/conTemplateName，并标记脏数据
// const syncTemplateFromAnnex = () => {
//   const v = currentVersion.value;
//   const f = v?.annex && v.annex.length ? v.annex[0] : null;
//   v.conTemplateId = f ? (f.id ?? f.annexId ?? undefined) : undefined;
//   v.conTemplateName = f ? (f.name ?? f.annexName ?? undefined) : undefined;
// };
// const onUploadSuccess = () => {
//   syncTemplateFromAnnex();
//   markDirty();
// };
// const onUploadRemove = () => {
//   syncTemplateFromAnnex();
//   markDirty();
// };

// ---- 保存 ----
const saveVersion = async (): Promise<boolean> => {
  const v = currentVersion.value;
  if (!v) return false;
  // 逻辑2：模板必须上传才能保存（以 annex 数组为准）
//   if (!v.annex || v.annex.length === 0) {
  if (conTemplateAnnex.value.length === 0) {
    ElMessage.error("请先上传合同模板后再保存");
    return false;
  }
  // 确保单值字段与 annex[0] 一致
  //syncTemplateFromAnnex();
  // 逻辑1：生效版本永远只能有 1 个
  if (v.isEnabled) {
    versions.value.forEach((x, i) => {
      if (i !== currentIdx.value) x.isEnabled = false;
    });
  }
  debugger
  const payload: ContractTemplateVersion = {
    id: v.id,
    conTypeId: props.conTypeId as number,
    segId: segId.value as number | string,
    isMustUse: v.isMustUse,
    isEnabled: v.isEnabled,
    verNo: v.verNo,
    conTemplateName: conTemplateAnnex.value[0].name,
    conTemplateId: conTemplateAnnex.value[0].id,//v.conTemplateId,
    reviewChecklist: v.reviewChecklist,
    // 若后端要求直接收附件数组，可一并带上：annex: v.annex,
  };
  try {
    
    saving.value = true;
    const res = await conTypeApi.saveTemplate(payload);
    if (res.code === 200) {
      ElMessage.success("保存成功");
      await loadVersions(); // 重新拉取，拿回 id / 时间戳 / 附件
      return true;
    } else {
      ElMessage.error(res.msg || "保存失败");
      return false;
    }
  } catch {
    return false;
  } finally {
    saving.value = false;
  }
};

const resetCurrent = () => {
  loadVersions();
};

// 供父组件在切换分类前调用
const beforeLeave = async (): Promise<boolean> => {
  if (!dirty.value) return true;
  try {
    await ElMessageBox.confirm("模板设置已修改，是否保存？", "提示", {
      confirmButtonText: "保存",
      cancelButtonText: "不保存",
      type: "warning",
    });
    return await saveVersion();
  } catch (action) {
    if (action === "cancel") {
      dirty.value = false;
      return true;
    }
    return false;
  }
};

defineExpose({ beforeLeave });
</script>

<style lang="scss" scoped>
.tpl-setting {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}
.seg-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: #fafafa;
  .seg-label {
    font-size: 13px;
    color: var(--el-text-color-regular);
    white-space: nowrap;
  }
}
.split {
  flex: 1;
  display: flex;
  min-height: 0;
}
.ver-list {
  width: 180px;
  flex-shrink: 0;
  border-right: 1px solid var(--el-border-color-lighter);
  padding: 12px;
  overflow: auto;
  background: #fcfcfd;
  .ver-list-title {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-bottom: 10px;
  }
}
.ver-item {
  position: relative;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 8px;
  cursor: pointer;
  background: #fff;
  transition: 0.15s;
  &:hover {
    border-color: var(--el-color-primary-light-3);
  }
  &.active {
    border-color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }
  .ver-name {
    font-size: 13px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .ver-sub {
    font-size: 11px;
    color: var(--el-text-color-secondary);
    margin-top: 4px;
  }
  .ver-del {
    position: absolute;
    top: 8px;
    right: 8px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    display: none;
    &:hover {
      color: var(--el-color-danger);
    }
  }
  &:hover .ver-del {
    display: block;
  }
}
.add-ver {
  border: 1px dashed var(--el-color-primary);
  color: var(--el-color-primary);
  border-radius: 6px;
  padding: 9px;
  text-align: center;
  cursor: pointer;
  font-size: 13px;
  background: #fff;
  &:hover {
    background: var(--el-color-primary-light-9);
  }
  &.is-disabled {
    border-color: var(--el-border-color);
    color: var(--el-text-color-disabled);
    background: #fff;
    cursor: not-allowed;
    &:hover {
      background: #fff;
    }
  }
}
.ver-form {
  flex: 1;
  padding: 16px;
  overflow: auto;
  .form-head {
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .hint {
    margin-left: 10px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
  .file-chip {
    display: flex;
    align-items: center;
    gap: 8px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 4px;
    padding: 8px 10px;
    margin-top: 8px;
    background: #fff;
    .docx {
      background: #2b579a;
      color: #fff;
      font-size: 11px;
      border-radius: 3px;
      padding: 2px 5px;
    }
    .fname {
      flex: 1;
    }
  }
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 10px;
  }
}
</style>
