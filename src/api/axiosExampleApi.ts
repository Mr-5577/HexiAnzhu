import { http } from "@/axios/service";
import type { ResponseData, PageParams, PageResponse } from "@/axios/types";

export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: string;
  status: number;
  createTime: string;
}

export interface CreateUserParams {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface UpdateUserParams extends Partial<CreateUserParams> {
  id: number;
}

// 获取用户列表
export const getUserList = (params: PageParams) => {
  return http.get<ResponseData<PageResponse<User>>>("/users", params);
};

// 获取用户详情
export const getUserDetail = (id: number) => {
  return http.get<ResponseData<User>>(`/users/${id}`);
};

// 创建用户
export const createUser = (data: CreateUserParams) => {
  return http.post<ResponseData<User>>("/users", data, {
    showSuccessMessage: true,
    successMessage: "用户创建成功",
  });
};

// 更新用户
export const updateUser = (data: UpdateUserParams) => {
  return http.put<ResponseData<User>>(`/users/${data.id}`, data, {
    showSuccessMessage: true,
    successMessage: "用户更新成功",
  });
};

// 删除用户
export const deleteUser = (id: number) => {
  return http.delete<ResponseData<void>>(
    `/users/${id}`,
    {},
    {
      showSuccessMessage: true,
      successMessage: "用户删除成功",
    }
  );
};

// 导出用户列表
export const exportUserList = (params: any, filename?: string) => {
  return http.exportFile(
    "/users/export",
    params,
    filename || "用户列表.xlsx",
    "post"
  );
};

// 下载用户模板
export const downloadUserTemplate = () => {
  return http.download("/users/template", {}, "用户导入模板.xlsx");
};

// 批量导入用户
export const importUsers = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return http.upload<ResponseData<{ success: number; failure: number }>>(
    "/users/import",
    formData,
    {
      showSuccessMessage: true,
      successMessage: "用户导入成功",
    }
  );
};
