import { http } from "@/axios/service";

export const menuApi = {
  // 获取菜单列表
  getMenuList: (data: any) => {
    return http.post("/auth/getMenuList", data);
  },
  // 编辑菜单
  editMenu: (data: any) => {
    return http.post("/auth/editMenu", data);
  },
  // 删除菜单
  delMenu: (data: any) => {
    return http.post("/auth/delMenu", data);
  },
  // 添加菜单
  addMenu: (data: any) => {
    return http.post("/auth/addMenu", data);
  },
};
