import type { IIdentity, IPermissionChecker } from "../types/identity";

const BKS_SUPER_ADMIN_ROLE = "admin";

/**
 * Creates a permission checker instance for a given identity.
 * This can be used on both client and server.
 */
export const createPermissionChecker = (identity: IIdentity | null): IPermissionChecker => {
  const isAdmin = (): boolean => {
    if (!identity) return false;
    return !!(identity.role === BKS_SUPER_ADMIN_ROLE || (identity.roles && identity.roles.includes(BKS_SUPER_ADMIN_ROLE)));
  };

  const hasRole = (role: string): boolean => {
    if (!identity) return false;
    if (isAdmin()) return true;
    return !!(identity.role === role || (identity.roles && identity.roles.includes(role)));
  };

  const can = (permission: string, resourceOwnerId?: string) => {
    if (!identity) return false;
    
    // Admin always has permission
    if (isAdmin()) return true;

    // Check basic permission
    const hasBasePermission = identity.permissions && identity.permissions.includes(permission);
    if (!hasBasePermission) return false;

    // If resource ownership is required
    if (resourceOwnerId) {
      return identity.id === resourceOwnerId;
    }

    return true;
  };

  const hasAnyPermission = (permissions: string[]) => {
    if (!identity) return false;
    if (isAdmin()) return true;
    return permissions.some((p) => identity.permissions && identity.permissions.includes(p));
  };

  const hasAllPermissions = (permissions: string[]) => {
    if (!identity) return false;
    if (isAdmin()) return true;
    return permissions.every((p) => identity.permissions && identity.permissions.includes(p));
  };

  const hasAnyRole = (roles: string[]) => {
    if (!identity) return false;
    if (isAdmin()) return true;
    return roles.some((r) => identity.role === r || (identity.roles && identity.roles.includes(r)));
  };

  return { 
    isAdmin, 
    hasRole, 
    can, 
    hasAnyPermission, 
    hasAllPermissions, 
    hasAnyRole, 
    identity
  };
};

/**
 * Server-side helper to get permissions for the current user.
 * Call this in Server Components or Server Actions.
 * Note: The actual user fetching should be provided by the caller or injected to keep this utility generic.
 */
export const createServerPermissionChecker = async (fetchIdentity: () => Promise<IIdentity | null>): Promise<IPermissionChecker> => {
  try {
    const identity = await fetchIdentity();
    return createPermissionChecker(identity);
  } catch (error) {
    console.error("Failed to fetch identity for server-side permission check:", error);
    return createPermissionChecker(null);
  }
};
