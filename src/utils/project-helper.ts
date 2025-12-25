/**
 * 项目数据接口
 */
export interface ProjectItem {
  id: number;
  pid: number;
  mguId: number;
  projType: number;
  projName: string;
  xsProjId: number;
  sort: number;
  isDel: boolean;
  [key: string]: any; // 允许其他字段
}

/**
 * 通过 xsProjId 查找项目的 id
 * @param projects 项目数组
 * @param xsProjId 要查找的 xsProjId
 * @returns 匹配到的项目 id，未找到返回 undefined
 */
export const findProjectIdByXsProjId = (
  projects: ProjectItem[],
  xsProjId: number
): number | undefined => {
  if (!projects || !Array.isArray(projects)) {
    console.warn("项目数据无效");
    return undefined;
  }

  const project = projects.find((item) => item.xsProjId === xsProjId);
  return project?.id;
};

/**
 * 批量通过 xsProjId 查找项目 id
 * @param projects 项目数组
 * @param xsProjIds xsProjId 数组
 * @returns 匹配到的项目 id 数组，顺序与输入一致
 */
export const findProjectIdsByXsProjIds = (
  projects: ProjectItem[],
  xsProjIds: number[]
): number[] => {
  if (!projects || !Array.isArray(projects)) {
    console.warn("项目数据无效");
    return [];
  }

  return xsProjIds
    .map((xsProjId) => findProjectIdByXsProjId(projects, xsProjId))
    .filter((id): id is number => id !== undefined);
};

/**
 * 通过 xsProjId 查找整个项目对象
 * @param projects 项目数组
 * @param xsProjId 要查找的 xsProjId
 * @returns 匹配到的项目对象，未找到返回 undefined
 */
export const findProjectByXsProjId = (
  projects: ProjectItem[],
  xsProjId: number
): ProjectItem | undefined => {
  if (!projects || !Array.isArray(projects)) {
    console.warn("项目数据无效");
    return undefined;
  }

  return projects.find((item) => item.xsProjId === xsProjId);
};
