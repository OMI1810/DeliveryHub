import { UserRole, type TProtectUserData } from "@/types/auth.types";

export type TUserDataState = {
  idUser: string;
  role: UserRole;
  isLoggedIn: boolean;
  isGod: boolean;
  isModerator: boolean;
  isOwner: boolean;
  isDeliveryman: boolean;
  isCashier: boolean;
};

/**
 * Нормализует роли из разных форматов:
 * - string[] → ['CLIENT', 'DELIVERYMAN']
 * - object[] → [{ role: 'CLIENT' }, { role: 'DELIVERYMAN' }] (Prisma)
 * - string → 'CLIENT'
 */
const extractRoles = (roles: unknown): UserRole[] => {
  if (!roles) return [];
  if (typeof roles === "string") return [roles as UserRole];
  if (Array.isArray(roles)) {
    return roles.map((item) => {
      if (typeof item === "string") return item as UserRole;
      if (item && typeof item === "object" && "role" in item) {
        return (item as { role: string }).role as UserRole;
      }
      return item as UserRole;
    });
  }
  return [];
};

const hasRole = (roles: unknown, target: UserRole): boolean => {
  const arr = extractRoles(roles);
  return arr.includes(target);
};

export const transformUserToState = (
  user: TProtectUserData,
): TUserDataState | null => {
  const roles = user.role;
  const roleList = extractRoles(roles);

  return {
    idUser: user.idUser,
    role: roleList[0] ?? UserRole.CLIENT,
    isLoggedIn: true,
    isGod: hasRole(roles, UserRole.GOD),
    isModerator: hasRole(roles, UserRole.MODERATOR),
    isOwner: hasRole(roles, UserRole.OWNER),
    isDeliveryman: hasRole(roles, UserRole.DELIVERYMAN),
    isCashier: hasRole(roles, UserRole.CASHIER),
  };
};
