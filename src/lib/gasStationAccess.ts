/**
 * Gas station location-scoped roles and access helpers.
 *
 * Role matrix (tenant-scoped):
 * - SUPER_ADMIN, ADMIN, GAS_STATION_ADMIN → all locations in tenant
 * - GAS_STATION_MANAGER → only rows in gas_station_user_station_assignment
 * - Others → no gas station admin module
 */

export const GAS_STATION_ALL_LOCATIONS_ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'GAS_STATION_ADMIN',
] as const;

export const GAS_STATION_MANAGER_ROLE = 'GAS_STATION_MANAGER' as const;

export const GAS_STATION_MODULE_ROLES = [
  ...GAS_STATION_ALL_LOCATIONS_ROLES,
  GAS_STATION_MANAGER_ROLE,
] as const;

export type GasStationModuleRole = (typeof GAS_STATION_MODULE_ROLES)[number];

export type GasStationAccessScope = 'ALL' | 'ASSIGNED' | 'NONE';

export interface GasStationUserStationAssignmentDTO {
  id?: number | null;
  tenantId: string;
  userProfileId: number;
  stationId: number;
  assignedByUserProfileId?: number | null;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  /** Populated on list endpoints when backend joins station */
  stationName?: string;
  stationCode?: string;
}

export interface GasStationAccessContext {
  canAccessModule: boolean;
  scope: GasStationAccessScope;
  /** null = unrestricted (all tenant locations); empty array = manager with no assignments yet */
  allowedStationIds: number[] | null;
  userProfileId: number | null;
  userRole: string | null;
}

export function isGasStationAllLocationsRole(role: string | null | undefined): boolean {
  if (!role) return false;
  return (GAS_STATION_ALL_LOCATIONS_ROLES as readonly string[]).includes(role);
}

export function isGasStationManagerRole(role: string | null | undefined): boolean {
  return role === GAS_STATION_MANAGER_ROLE;
}

export function canAccessGasStationAdminModule(role: string | null | undefined): boolean {
  if (!role) return false;
  return (GAS_STATION_MODULE_ROLES as readonly string[]).includes(role);
}

export function getGasStationAccessScope(role: string | null | undefined): GasStationAccessScope {
  if (isGasStationAllLocationsRole(role)) return 'ALL';
  if (isGasStationManagerRole(role)) return 'ASSIGNED';
  return 'NONE';
}

export function filterByAllowedStationIds<T extends { stationId?: number | null }>(
  items: T[],
  allowedStationIds: number[] | null
): T[] {
  if (allowedStationIds === null) return items;
  const allowed = new Set(allowedStationIds);
  return items.filter((item) => {
    if (item.stationId == null) {
      // Chain-level rows: visible only if manager has at least one assigned station
      return allowedStationIds.length > 0;
    }
    return allowed.has(item.stationId);
  });
}

export function filterLocationsByAllowedStationIds<T extends { id?: number | null }>(
  locations: T[],
  allowedStationIds: number[] | null
): T[] {
  if (allowedStationIds === null) return locations;
  const allowed = new Set(allowedStationIds);
  return locations.filter((loc) => loc.id != null && allowed.has(loc.id));
}

export const GAS_STATION_ROLE_LABELS: Record<string, string> = {
  GAS_STATION_ADMIN: 'Gas Station Admin (all locations)',
  GAS_STATION_MANAGER: 'Gas Station Manager (assigned locations)',
};
