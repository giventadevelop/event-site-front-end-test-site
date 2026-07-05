/**
 * DTOs for the gas station COO module (site_type = GAS_STATION).
 * Mirror backend entities in event-site-manager-service.
 */

export type GasStationSystemType =
  | 'POS'
  | 'FUEL_CONTROLLER'
  | 'INVENTORY'
  | 'PAYROLL_SCHEDULING'
  | 'ACCOUNTING'
  | 'LOTTERY'
  | 'CAR_WASH'
  | 'FOODSERVICE'
  | 'OTHER';

export type GasStationConnectionMode = 'API' | 'FILE_UPLOAD' | 'SFTP' | 'MANUAL';

export type GasStationRecommendationCategory =
  | 'FUEL_PRICING'
  | 'ORDERING'
  | 'STAFFING'
  | 'INVENTORY'
  | 'LOSS_PREVENTION'
  | 'MAINTENANCE'
  | 'ANOMALY'
  | 'COMPLIANCE'
  | 'OTHER';

export type GasStationRecommendationStatus =
  | 'NEW'
  | 'VIEWED'
  | 'ACCEPTED'
  | 'DISMISSED'
  | 'COMPLETED';

export interface GasStationLocationDTO {
  id?: number | null;
  tenantId: string;
  stationName: string;
  stationCode: string;
  brand?: string;
  region?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  stateProvince?: string;
  zipCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  sellsFuel?: boolean;
  fuelDispenserCount?: number;
  hasCarWash?: boolean;
  hasFoodservice?: boolean;
  hasLottery?: boolean;
  is24Hours?: boolean;
  isActive?: boolean;
  /** When true and active, this location counts toward the subscription quantity */
  includedInSubscription?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GasStationIntegrationDTO {
  id?: number | null;
  tenantId: string;
  stationId: number;
  systemType: GasStationSystemType;
  providerName?: string;
  connectionMode?: GasStationConnectionMode;
  configJson?: string;
  credentialsRef?: string;
  syncFrequency?: string;
  lastSyncAt?: string;
  lastSyncStatus?: string;
  isEnabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GasStationDailyMetricsDTO {
  id?: number | null;
  tenantId: string;
  stationId: number;
  metricDate: string; // date (YYYY-MM-DD)
  fuelGallonsSold?: number;
  fuelRevenueUsd?: number;
  fuelMarginCentsPerGallon?: number;
  inStoreSalesUsd?: number;
  foodserviceSalesUsd?: number;
  lotterySalesUsd?: number;
  transactionsCount?: number;
  laborHours?: number;
  laborCostUsd?: number;
  wasteCostUsd?: number;
  shrinkCostUsd?: number;
  expectedProfitUsd?: number;
  actualProfitUsd?: number;
  metricsJson?: string;
  sourceModelRunId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GasStationRecommendationDTO {
  id?: number | null;
  tenantId: string;
  /** null / undefined = tenant/chain-level recommendation (not tied to one station) */
  stationId?: number | null;
  recommendationDate: string; // date (YYYY-MM-DD)
  category: GasStationRecommendationCategory;
  title: string;
  detail?: string;
  estimatedImpactUsd?: number;
  priority?: number;
  confidencePct?: number;
  explanation?: string;
  status?: GasStationRecommendationStatus;
  ownerFeedback?: string;
  sourceModelRunId?: string;
  createdAt?: string;
  updatedAt?: string;
}
