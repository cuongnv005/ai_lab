import { MenuItem, BreadcrumbItem } from "@/shared/types/menu";
import { IPermissionChecker } from "@/shared/types/identity";

/**
 * Checks if a menu item is authorized for the current user.
 */
export const isMenuItemAuthorized = (
  item: MenuItem,
  checker: IPermissionChecker
): boolean => {
  // If no permission and no roles required, it's public
  if (!item.permission && (!item.roles || item.roles.length === 0)) {
    return true;
  }

  // Check roles first if specified
  if (item.roles && item.roles.length > 0) {
    if (!checker.hasAnyRole(item.roles)) {
      return false;
    }
  }

  // Check permissions
  if (item.permission) {
    if (Array.isArray(item.permission)) {
      const strategy = item.permissionMatch || "any";
      if (strategy === "all") {
        return checker.hasAllPermissions(item.permission);
      } else {
        return checker.hasAnyPermission(item.permission);
      }
    } else {
      return checker.can(item.permission);
    }
  }

  return true;
};

/**
 * Recursively filters menu items based on permissions.
 */
export const filterMenuByPermissions = (
  items: MenuItem[],
  checker: IPermissionChecker
): MenuItem[] => {
  return items
    .filter((item) => isMenuItemAuthorized(item, checker))
    .map((item) => {
      if (item.children && item.children.length > 0) {
        const filteredChildren = filterMenuByPermissions(item.children, checker);
        return { ...item, children: filteredChildren };
      }
      return item;
    })
    .filter((item) => {
      // Hide item if it has no path AND no visible children (it's an empty group)
      if (!item.path && (!item.children || item.children.length === 0)) {
        return false;
      }
      return true;
    });
};

/**
 * Generates breadcrumbs from the menu configuration based on the current pathname.
 */
export const generateBreadcrumbs = (
  items: MenuItem[],
  pathname: string,
  t: (key: string) => string
): BreadcrumbItem[] => {
  const breadcrumbs: BreadcrumbItem[] = [];

  const findPath = (menuItems: MenuItem[], currentPath: string): boolean => {
    for (const item of menuItems) {
      // Check if current item matches or is a prefix
      const isMatch = item.exact 
        ? pathname === item.path 
        : pathname.startsWith(item.path || "");

      if (item.path && isMatch) {
        breadcrumbs.push({ label: t(item.label), path: item.path });
        return true;
      }

      if (item.children) {
        if (findPath(item.children, currentPath)) {
          breadcrumbs.unshift({ label: t(item.label), path: item.path });
          return true;
        }
      }
    }
    return false;
  };

  findPath(items, pathname);
  
  if (breadcrumbs.length > 0) {
    breadcrumbs[breadcrumbs.length - 1].isLast = true;
  }
  
  return breadcrumbs;
};
