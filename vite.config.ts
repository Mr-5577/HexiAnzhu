import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), "");
  const isDev = mode === "development";
  const isProd = mode === "production";
  const isStaging = mode === "staging";

  return {
    plugins: [
      vue(),
      Components({
        resolvers: [
          ElementPlusResolver(),
          IconsResolver({
            enabledCollections: ["ep"],
          }),
        ],
        dts: true,
      }),
      Icons({
        autoInstall: true,
        compiler: "vue3",
      }),
    ],
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
        "@components": resolve(__dirname, "src/components"),
        "@views": resolve(__dirname, "src/views"),
        "@utils": resolve(__dirname, "src/utils"),
        "@stores": resolve(__dirname, "src/stores"),
        "@assets": resolve(__dirname, "src/assets"),
      },
    },
    base: "./",
    server: {
      host: true,
      port: 3000,
      open: true,
      hmr: true, // 热更新
      proxy: isDev
        ? {
            "/auth": {
              target: env.VITE_API_BASE_URL || "http://localhost:8080",
              changeOrigin: true, // 允许跨域
              rewrite: (path) => path,  // 保持路径不变
              // rewrite: (path) => path.replace(/^\/api/, ""),
            },
            "/emp": {
              target: env.VITE_API_BASE_URL,
              changeOrigin: true,
              rewrite: (path) => path,
            },
          }
        : undefined,
    },
    build: {
      outDir: `dist-${mode}`, // 根据不同环境输出到不同目录
      sourcemap: isDev || isStaging,
      minify: isProd ? "esbuild" : false,
    },
  };
});
