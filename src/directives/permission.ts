import type { App, DirectiveBinding } from "vue";
import { useMenuStore } from "@/stores/menu-store";

// 权限指令
export const permissionDirective = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    setTimeout(() => {
      updateButtonState(el, binding.value);
    }, 100);
  },

  updated(el: HTMLElement, binding: DirectiveBinding) {
    updateButtonState(el, binding.value);
  },
};

// 更新按钮状态的函数
function updateButtonState(el: any, value: string | string[]) {
  const menuStore = useMenuStore();
  const permissionData = menuStore.permissionList || [];
  const permissions = Array.isArray(value) ? value : [value]; // 接收多个权限判断
  // 全部满足才有按钮权限
  const hasPermission = permissions.every((perm) =>
    permissionData.includes(perm)
  );
  //   console.log("按钮权限:", value, hasPermission);
  if (!hasPermission) {
    // 方案一：移除按钮
    // el.parentNode?.removeChild(el)

    // 方案二：禁用按钮
    el.setAttribute("disabled", "disabled");
    el.classList.add("is-disabled");

    // 保存原始点击事件以便恢复
    if (!el._originalOnClick) {
      el._originalOnClick = el.onclick;
    }
    el.onclick = null;
  } else {
    // 恢复按钮
    el.removeAttribute("disabled");
    el.classList.remove("is-disabled");

    // 恢复点击事件
    if (el._originalOnClick) {
      el.onclick = el._originalOnClick;
      delete el._originalOnClick;
    }
  }
}

// 注册全局指令
export function setupPermission(app: App) {
  app.directive("permission", permissionDirective);
}
