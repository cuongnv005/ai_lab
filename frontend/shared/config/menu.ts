import { LayoutDashboard } from "lucide-react";
import { MenuItem } from "../types/menu";

export const menuConfig: MenuItem[] = [
  {
    id: "dashboard",
    label: "menu.dashboard",
    icon: LayoutDashboard,
    path: "/",
    exact: true,
  },
];
