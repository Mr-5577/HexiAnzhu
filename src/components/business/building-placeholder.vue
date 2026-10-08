<template>
    <div class="building-wrapper">
        <div class="building-content">
            <!-- 图标区域 -->
            <div class="icon-wrapper">
                <el-icon :size="80" color="#409EFF">
                    <Tools />
                </el-icon>
            </div>

            <!-- 标题 -->
            <h2 class="title">功能开发中</h2>

            <!-- 描述 -->
            <p class="desc">该功能正在紧锣密鼓地建设中，敬请期待...</p>

            <!-- 装饰进度条 -->
            <div class="progress-bar">
                <div class="progress-inner"></div>
            </div>

            <!-- 返回按钮 -->
            <!-- <el-button type="primary" @click="handleBack" class="back-btn">
                <el-icon>
                    <ArrowLeft />
                </el-icon>
                返回
            </el-button> -->
        </div>
    </div>
</template>

<script setup lang="ts">
import { Tools, ArrowLeft } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const handleBack = () => {
    router.back();
};
</script>

<style lang="scss" scoped>
.building-wrapper {
    width: 100%;
    height: 100%;
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f7fa;

    .building-content {
        text-align: center;
        padding: 60px 40px;

        .icon-wrapper {
            margin-bottom: 24px;
            animation: float 2s ease-in-out infinite;
        }

        .title {
            font-size: 28px;
            font-weight: 600;
            color: #303133;
            margin-bottom: 12px;
        }

        .desc {
            font-size: 16px;
            color: #909399;
            margin-bottom: 30px;
        }

        .progress-bar {
            width: 200px;
            height: 6px;
            margin: 0 auto 30px;
            background: #e4e7ed;
            border-radius: 3px;
            overflow: hidden;

            .progress-inner {
                width: 60%;
                height: 100%;
                background: linear-gradient(90deg, #409EFF, #79bbff);
                border-radius: 3px;
                animation: progressMove 2s ease-in-out infinite;
            }
        }

        .back-btn {
            padding: 10px 30px;
        }
    }
}

// 浮动动画
@keyframes float {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-10px);
    }
}

// 进度条动画
@keyframes progressMove {
    0% {
        transform: translateX(-30%);
    }

    100% {
        transform: translateX(100%);
    }
}
</style>