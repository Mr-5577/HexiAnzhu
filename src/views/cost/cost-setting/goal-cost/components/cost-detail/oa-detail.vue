<!-- OA  目标成本明细 -->
<template>
    <div class="cost-detail-content">
        <div class="detail-card">
            <el-tabs v-model="activeTab">
                <el-tab-pane label="目标成本明细" name="detail"> </el-tab-pane>
                <el-tab-pane label="相关附件" name="attachment"> </el-tab-pane>
                <el-tab-pane label="面积数据" name="areaData"> </el-tab-pane>
            </el-tabs>
            <div class="tab-content">
                <keep-alive>
                    <component :key="activeTab" :is="currentComponent" :mode="mode" :projId="projId" :costMid="costMid"
                        :areaVerMid="areaVerMid" />
                </keep-alive>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import Detail from "./detail.vue";
import Attachment from "./attachment.vue";
import AreaData from "./area-data.vue";

defineOptions({ name: "cost-detail" });

const route = useRoute();

const activeTab = ref("detail");

const tabComponents: Record<string, any> = {
    detail: Detail, // 明细
    attachment: Attachment, // 附件
    areaData: AreaData, // 面积数据
};

// 当前显示组件内容
const currentComponent = computed(() => tabComponents[activeTab.value]);

const mode = route.query.mode as "add" | "edit" | "detail";
const projId = route.query.projId ? Number(route.query.projId) : null; // 项目ID
const costMid = route.query.costMid ? Number(route.query.costMid) : null; // 成本版本ID
const areaVerMid = route.query.areaVerMid ? Number(route.query.areaVerMid) : null; // 面积版本ID

onMounted(() => { });
</script>

<style lang="scss" scoped>
.cost-detail-content {
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    /* 外层灰底，保留灰色边距 */
    background: #f0f2f6;
    padding: 10px;
    overflow: hidden;

    .detail-card {
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: column;
        /* 白底卡片悬浮在灰底上，tabs 一并纳入 */
        background: #fff;
        border-radius: 8px;
        box-sizing: border-box;
        padding: 0 15px 15px;
        overflow: hidden;

        :deep(.el-tabs) {
            flex-shrink: 0;

            .el-tabs__header {
                margin: 0 0 12px 0;
            }

            .el-tabs__item {
                font-size: 14px;
            }
        }

        .tab-content {
            flex: 1;
            min-height: 0;
            background: #fff;
            box-sizing: border-box;
        }
    }
}
</style>
