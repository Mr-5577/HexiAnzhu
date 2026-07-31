/**
 * 文件路径处理工具
 */

// 如果需要根据环境切换
const ANNEX_BASE_URL = import.meta.env.VITE_ANNEX_BASE_URL || 'http://annex-test.hexianzhu.com:9090';
/**
 * 规范化文件路径：将反斜杠 \ 替换为正斜杠 /
 */
const normalizeFilePath = (filePath: string): string => {
  if (!filePath) return "";
  // 将所有反斜杠替换为正斜杠
  return filePath.replace(/\\/g, "/");
};

/**
 * 构建完整的附件访问URL
 * @param filePath 文件路径
 * @returns 完整的URL
 */
export const buildFileUrl = (filePath: string): string => {
  if (!filePath) return "";

  // 1. 规范化路径（替换反斜杠）
  let normalizedPath = normalizeFilePath(filePath);

  // 2. 去除路径开头的斜杠（避免双斜杠）
  if (normalizedPath.startsWith("/")) {
    normalizedPath = normalizedPath.substring(1);
  }

  // 3. 拼接完整URL
  return `${ANNEX_BASE_URL}/${normalizedPath}`;
};

/**
 * 批量构建文件URL
 */
export const buildFileUrls = (filePaths: string[]): string[] => {
  return filePaths.map((path) => buildFileUrl(path));
};

export default {
  buildFileUrl,
  buildFileUrls,
  normalizeFilePath,
  ANNEX_BASE_URL,
};
