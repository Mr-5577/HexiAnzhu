export interface BackendMenuItem {
  id: number
  type: string // 'module' | 'menu' | 'button'
  name: string
  path?: string
  component?: string
  pid?: number
  sort: number
  parentId: number
  meta: {
    title: string
    icon: string
    keepAlive?: boolean
    isVisible?: boolean
    isMultiOpen?: boolean
  }
  children?: BackendMenuItem[]
}

export interface SidebarMenuItem {
  index: string
  title: string
  path?: string
  icon: string
  isVisible?: boolean
  children?: SidebarMenuItem[]
}

export interface ModuleItem {
  id: number
  name: string
  title: string
  icon: string
  sort: number
}