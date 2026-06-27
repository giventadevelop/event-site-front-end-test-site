-- Make the currently logged-in user an admin
-- Current user ID: user_2wT6JJrK52ESRL3wbw2K3ZFEYpK

-- Check if user exists
SELECT
  id,
  clerk_user_id,
  user_id,
  email,
  user_role,
  user_status,
  tenant_id
FROM user_profile
WHERE clerk_user_id = 'user_2wT6JJrK52ESRL3wbw2K3ZFEYpK'
  OR user_id = 'user_2wT6JJrK52ESRL3wbw2K3ZFEYpK';

-- If user exists, update to admin
UPDATE user_profile
SET
  user_role = 'ADMIN',
  user_status = 'APPROVED',
  updated_at = NOW()
WHERE (clerk_user_id = 'user_2wT6JJrK52ESRL3wbw2K3ZFEYpK'
  OR user_id = 'user_2wT6JJrK52ESRL3wbw2K3ZFEYpK')
  AND tenant_id = 'tenant_demo_001';

-- If user doesn't exist, insert new record
-- (You'll need to fill in the email and name)
INSERT INTO user_profile (
  tenant_id,
  user_id,
  clerk_user_id,
  email,
  first_name,
  last_name,
  user_role,
  user_status,
  created_at,
  updated_at
) VALUES (
  'tenant_demo_001',
  'user_2wT6JJrK52ESRL3wbw2K3ZFEYpK',
  'user_2wT6JJrK52ESRL3wbw2K3ZFEYpK',
  'YOUR_EMAIL@example.com',  -- Replace with actual email
  'Your First Name',         -- Replace with actual name
  'Your Last Name',          -- Replace with actual name
  'ADMIN',
  'APPROVED',
  NOW(),
  NOW()
)
ON CONFLICT (clerk_user_id, tenant_id)
DO UPDATE SET
  user_role = 'ADMIN',
  user_status = 'APPROVED',
  updated_at = NOW();

-- Verify the update
SELECT
  id,
  clerk_user_id,
  user_id,
  email,
  first_name,
  last_name,
  user_role,
  user_status,
  tenant_id
FROM user_profile
WHERE (clerk_user_id = 'user_2wT6JJrK52ESRL3wbw2K3ZFEYpK'
  OR user_id = 'user_2wT6JJrK52ESRL3wbw2K3ZFEYpK')
  AND tenant_id = 'tenant_demo_001';
