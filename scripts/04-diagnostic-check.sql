-- Check if test users exist
SELECT 'TEST USERS:' as check_type;
SELECT id, email, name, tenant_id, role FROM test_users;

-- Check if tenants exist
SELECT 'TENANTS:' as check_type;
SELECT id, name FROM tenants;

-- Check if apps exist
SELECT 'APPS:' as check_type;
SELECT id, name FROM apps;

-- Check if org_apps relationships exist
SELECT 'ORG_APPS:' as check_type;
SELECT oa.*, t.name as tenant_name, a.name as app_name 
FROM org_apps oa
JOIN tenants t ON oa.tenant_id = t.id
JOIN apps a ON oa.app_id = a.id;

-- Check if API keys exist
SELECT 'API KEYS:' as check_type;
SELECT ak.id, ak.tenant_id, ak.provider, t.name as tenant_name, 
       LENGTH(ak.encrypted_key) as key_length
FROM api_keys ak
JOIN tenants t ON ak.tenant_id = t.id;

-- Check John's specific setup
SELECT 'JOHN SETUP:' as check_type;
SELECT 
    u.email,
    u.name,
    u.tenant_id,
    t.name as tenant_name,
    COUNT(oa.app_id) as enabled_apps,
    COUNT(ak.id) as api_keys
FROM test_users u
LEFT JOIN tenants t ON u.tenant_id = t.id
LEFT JOIN org_apps oa ON u.tenant_id = oa.tenant_id AND oa.enabled = true
LEFT JOIN api_keys ak ON u.tenant_id = ak.tenant_id
WHERE u.email = 'john@acme.com'
GROUP BY u.id, u.email, u.name, u.tenant_id, t.name;
