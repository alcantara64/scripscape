import { createRef } from "react"
import type { Drawer } from "react-native-drawer-layout"

export const drawerRef = createRef<{
  openDrawer: () => void
  closeDrawer: () => void
}>()
