/**
 * Comprehensive test script for Tenant Management CRUD operations
 * This file can be used to test all CRUD operations for both organizations and settings
 */

import {
  fetchTenantOrganizations,
  createTenantOrganization,
  fetchTenantOrganization,
  updateTenantOrganization,
  patchTenantOrganization,
  deleteTenantOrganization,
  toggleTenantOrganizationStatus
} from './organizations/ApiServerActions';

import {
  fetchTenantSettings,
  createTenantSetting,
  fetchTenantSetting,
  updateTenantSetting,
  patchTenantSetting,
  deleteTenantSetting,
  fetchTenantSettingsByTenantId
} from './settings/ApiServerActions';

import type { TenantOrganizationFormDTO, TenantSettingsFormDTO } from './types';

// Test data for organizations
const testOrganizationData: TenantOrganizationFormDTO = {
  organizationName: 'Test Organization',
  tenantId: 'test_tenant_001',
  description: 'A test organization for CRUD testing',
  contactEmail: 'test@example.com',
  contactPhone: '+1-555-0123',
  website: 'https://test-org.example.com',
  address: '123 Test Street, Test City, TC 12345',
  primaryColor: '#3B82F6',
  secondaryColor: '#1E40AF',
  logoUrl: '',
  subscriptionStatus: 'TRIAL',
  subscriptionPlan: 'BASIC',
  isActive: true
};

// Test data for settings
const testSettingsData: TenantSettingsFormDTO = {
  tenantId: 'test_tenant_001',
  allowUserRegistration: true,
  enableWhatsappIntegration: false,
  enableEmailMarketing: true,
  enableEventManagement: true,
  enablePaymentProcessing: false,
  maxUsers: 100,
  maxEvents: 50,
  maxStorageGB: 10,
  maxApiCallsPerMonth: 1000,
  customCss: '/* Test custom CSS */',
  customJs: '// Test custom JS',
  emailProviderConfig: '{"provider": "test", "apiKey": "test-key"}'
};

export async function testOrganizationCRUD() {
  console.log('🧪 Testing Organization CRUD Operations...');

  try {
    // 1. CREATE - Create a new organization
    console.log('1️⃣ Creating organization...');
    const createdOrg = await createTenantOrganization(testOrganizationData);
    console.log('✅ Organization created:', createdOrg);

    const orgId = createdOrg.id;
    if (!orgId) {
      throw new Error('Created organization missing ID');
    }

    // 2. READ - Fetch the created organization
    console.log('2️⃣ Fetching organization...');
    const fetchedOrg = await fetchTenantOrganization(orgId);
    console.log('✅ Organization fetched:', fetchedOrg);

    // 3. READ - List organizations
    console.log('3️⃣ Listing organizations...');
    const orgsList = await fetchTenantOrganizations({ page: 0, pageSize: 10 }, {});
    console.log('✅ Organizations listed:', orgsList);

    // 4. UPDATE - Update the organization
    console.log('4️⃣ Updating organization...');
    const updatedData = {
      ...testOrganizationData,
      description: 'Updated test organization description',
      contactEmail: 'updated@example.com'
    };
    const updatedOrg = await updateTenantOrganization(orgId, updatedData);
    console.log('✅ Organization updated:', updatedOrg);

    // 5. PATCH - Partial update
    console.log('5️⃣ Patching organization...');
    const patchedOrg = await patchTenantOrganization(orgId, {
      subscriptionStatus: 'ACTIVE',
      subscriptionPlan: 'PREMIUM'
    });
    console.log('✅ Organization patched:', patchedOrg);

    // 6. TOGGLE - Toggle active status
    console.log('6️⃣ Toggling organization status...');
    const toggledOrg = await toggleTenantOrganizationStatus(orgId, false);
    console.log('✅ Organization status toggled:', toggledOrg);

    // 7. DELETE - Delete the organization
    console.log('7️⃣ Deleting organization...');
    await deleteTenantOrganization(orgId);
    console.log('✅ Organization deleted successfully');

    console.log('🎉 Organization CRUD test completed successfully!');
    return true;

  } catch (error) {
    console.error('❌ Organization CRUD test failed:', error);
    return false;
  }
}

export async function testSettingsCRUD() {
  console.log('🧪 Testing Settings CRUD Operations...');

  try {
    // 1. CREATE - Create new settings
    console.log('1️⃣ Creating settings...');
    const createdSettings = await createTenantSetting(testSettingsData);
    console.log('✅ Settings created:', createdSettings);

    const settingsId = createdSettings.id;
    if (!settingsId) {
      throw new Error('Created settings missing ID');
    }

    // 2. READ - Fetch the created settings
    console.log('2️⃣ Fetching settings...');
    const fetchedSettings = await fetchTenantSetting(settingsId);
    console.log('✅ Settings fetched:', fetchedSettings);

    // 3. READ - List settings
    console.log('3️⃣ Listing settings...');
    const settingsList = await fetchTenantSettings({ page: 0, pageSize: 10 }, {});
    console.log('✅ Settings listed:', settingsList);

    // 4. READ - Fetch settings by tenant ID
    console.log('4️⃣ Fetching settings by tenant ID...');
    const settingsByTenant = await fetchTenantSettingsByTenantId(testSettingsData.tenantId);
    console.log('✅ Settings by tenant ID:', settingsByTenant);

    // 5. UPDATE - Update the settings
    console.log('5️⃣ Updating settings...');
    const updatedData = {
      ...testSettingsData,
      enableWhatsappIntegration: true,
      maxUsers: 200
    };
    const updatedSettings = await updateTenantSetting(settingsId, updatedData);
    console.log('✅ Settings updated:', updatedSettings);

    // 6. PATCH - Partial update
    console.log('6️⃣ Patching settings...');
    await patchTenantSetting(settingsId, {
      enableEmailMarketing: false,
      maxEvents: 100
    });
    console.log('✅ Settings patched');

    // 7. DELETE - Delete the settings
    console.log('7️⃣ Deleting settings...');
    await deleteTenantSetting(settingsId);
    console.log('✅ Settings deleted successfully');

    console.log('🎉 Settings CRUD test completed successfully!');
    return true;

  } catch (error) {
    console.error('❌ Settings CRUD test failed:', error);
    return false;
  }
}

export async function testAllCRUDOperations() {
  console.log('🚀 Starting comprehensive CRUD operations test...');
  console.log('=' .repeat(60));

  const orgResult = await testOrganizationCRUD();
  console.log('=' .repeat(60));
  const settingsResult = await testSettingsCRUD();
  console.log('=' .repeat(60));

  if (orgResult && settingsResult) {
    console.log('🎉 All CRUD operations completed successfully!');
    console.log('✅ Tenant Management module is fully functional');
  } else {
    console.log('❌ Some CRUD operations failed. Please check the logs above.');
  }

  return orgResult && settingsResult;
}

// Individual test functions are already exported above

