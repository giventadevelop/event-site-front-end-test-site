'use server';

import { auth } from '@clerk/nextjs/server';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getTenantId, getApiBaseUrl } from '@/lib/env';
import { parseProfileSiteListResponse } from '@/lib/parseProfileSiteResponses';
import { fetchAdminProfileServer } from '@/app/admin/manage-usage/ApiServerActions';
import type { UserProfileDTO } from '@/types';
import type {
  GasStationAccessContext,
  GasStationUserStationAssignmentDTO,
} from '@/types/gasStation';
import {
  canAccessGasStationAdminModule,
  getGasStationAccessScope,
} from '@/lib/gasStationAccess';

function getApiBase() {
  return getApiBaseUrl();
}

export async function fetchGasStationAssignmentsForUserServer(
  userProfileId: number
): Promise<GasStationUserStationAssignmentDTO[]> {
  try {
    const params = new URLSearchParams({
      'tenantId.equals': getTenantId(),
      'userProfileId.equals': String(userProfileId),
      size: '500',
    });
    const res = await fetchWithJwtRetry(
      `${getApiBase()}/api/gas-station-user-station-assignments?${params}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return parseProfileSiteListResponse<GasStationUserStationAssignmentDTO>(data);
  } catch (error) {
    console.error('[fetchGasStationAssignmentsForUserServer]', error);
    return [];
  }
}

export async function fetchAllGasStationAssignmentsServer(): Promise<GasStationUserStationAssignmentDTO[]> {
  try {
    const params = new URLSearchParams({
      'tenantId.equals': getTenantId(),
      size: '1000',
    });
    const res = await fetchWithJwtRetry(
      `${getApiBase()}/api/gas-station-user-station-assignments?${params}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return parseProfileSiteListResponse<GasStationUserStationAssignmentDTO>(data);
  } catch (error) {
    console.error('[fetchAllGasStationAssignmentsServer]', error);
    return [];
  }
}

export async function createGasStationAssignmentServer(
  userProfileId: number,
  stationId: number,
  assignedByUserProfileId?: number | null
): Promise<GasStationUserStationAssignmentDTO | null> {
  try {
    const body = {
      tenantId: getTenantId(),
      userProfileId,
      stationId,
      assignedByUserProfileId: assignedByUserProfileId ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const res = await fetchWithJwtRetry(`${getApiBase()}/api/gas-station-user-station-assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  } catch (error) {
    console.error('[createGasStationAssignmentServer]', error);
    return null;
  }
}

export async function deleteGasStationAssignmentServer(id: number): Promise<boolean> {
  try {
    const res = await fetchWithJwtRetry(
      `${getApiBase()}/api/gas-station-user-station-assignments/${id}`,
      { method: 'DELETE' }
    );
    return res.ok;
  } catch (error) {
    console.error('[deleteGasStationAssignmentServer]', error);
    return false;
  }
}

/** Replace all station assignments for a manager (diff-based). */
export async function replaceGasStationAssignmentsForUserServer(
  userProfileId: number,
  stationIds: number[],
  assignedByUserProfileId?: number | null
): Promise<boolean> {
  try {
    const existing = await fetchGasStationAssignmentsForUserServer(userProfileId);
    const desired = new Set(stationIds);
    const existingIds = new Set(existing.map((a) => a.stationId));

    const toRemove = existing.filter((a) => a.id != null && !desired.has(a.stationId));
    const toAdd = stationIds.filter((id) => !existingIds.has(id));

    for (const row of toRemove) {
      if (row.id == null) continue;
      const ok = await deleteGasStationAssignmentServer(row.id);
      if (!ok) return false;
    }

    for (const stationId of toAdd) {
      const created = await createGasStationAssignmentServer(
        userProfileId,
        stationId,
        assignedByUserProfileId
      );
      if (!created) return false;
    }

    return true;
  } catch (error) {
    console.error('[replaceGasStationAssignmentsForUserServer]', error);
    return false;
  }
}

export async function resolveGasStationAccessForProfile(
  profile: UserProfileDTO | null
): Promise<GasStationAccessContext> {
  const userRole = profile?.userRole ?? null;
  const scope = getGasStationAccessScope(userRole);
  const canAccessModule = canAccessGasStationAdminModule(userRole);

  if (!canAccessModule || !profile?.id) {
    return {
      canAccessModule: false,
      scope: 'NONE',
      allowedStationIds: [],
      userProfileId: profile?.id ?? null,
      userRole,
    };
  }

  if (scope === 'ALL') {
    return {
      canAccessModule: true,
      scope: 'ALL',
      allowedStationIds: null,
      userProfileId: profile.id,
      userRole,
    };
  }

  const assignments = await fetchGasStationAssignmentsForUserServer(profile.id);
  return {
    canAccessModule: true,
    scope: 'ASSIGNED',
    allowedStationIds: assignments.map((a) => a.stationId),
    userProfileId: profile.id,
    userRole,
  };
}

export async function resolveGasStationAccessForCurrentUser(): Promise<GasStationAccessContext> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        canAccessModule: false,
        scope: 'NONE',
        allowedStationIds: [],
        userProfileId: null,
        userRole: null,
      };
    }
    const profile = await fetchAdminProfileServer(userId);
    return resolveGasStationAccessForProfile(profile);
  } catch (error) {
    console.error('[resolveGasStationAccessForCurrentUser]', error);
    return {
      canAccessModule: false,
      scope: 'NONE',
      allowedStationIds: [],
      userProfileId: null,
      userRole: null,
    };
  }
}

export async function assertGasStationTenantAdminAccess(): Promise<GasStationAccessContext> {
  const access = await resolveGasStationAccessForCurrentUser();
  if (access.scope !== 'ALL') {
    throw new Error('Gas station tenant admin role required for this action.');
  }
  return access;
}
