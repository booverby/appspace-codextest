-- Check current user and session state
SELECT 'Current demo user cookie check' as check_type;

-- Check test users
SELECT 'Test Users:' as info;
SELECT id, name, email, role, organization_id, created_at
FROM test_users 
ORDER BY name;

-- Check organizations
SELECT 'Organizations:' as info;
SELECT id, name, created_at
FROM organizations
ORDER BY name;

-- Check apps
SELECT 'Apps:' as info;
SELECT id, name, description, created_at 
FROM apps 
ORDER BY name;

-- Check org_apps relationships
SELECT 'Org-App Relationships:' as info;
SELECT oa.*, t.name as organization_name, a.name as app_name
FROM org_apps oa
JOIN organizations t ON oa.organization_id = t.id
JOIN apps a ON oa.app_id = a.id
ORDER BY t.name, a.name;

-- Check API keys
SELECT 'API Keys:' as info;
SELECT ak.id, t.name as organization_name, ak.provider,
       CASE WHEN ak.encrypted_key IS NOT NULL THEN 'Has Key' ELSE 'No Key' END as key_status,
       ak.created_at
FROM api_keys ak
JOIN organizations t ON ak.organization_id = t.id
ORDER BY t.name, ak.provider;

-- Check for John's specific setup
SELECT 'John Doe Setup Check:' as info;
SELECT 
  u.name as user_name,
  u.email,
  u.role,
  t.name as organization_name,
  COUNT(oa.app_id) as enabled_apps,
  COUNT(ak.id) as api_keys
FROM test_users u
LEFT JOIN organizations t ON u.organization_id = t.id
LEFT JOIN org_apps oa ON t.id = oa.organization_id AND oa.enabled = true
LEFT JOIN api_keys ak ON t.id = ak.organization_id
WHERE u.email = 'john@acme.com'
GROUP BY u.id, u.name, u.email, u.role, t.name;
