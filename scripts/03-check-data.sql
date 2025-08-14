-- Check if seed data exists
SELECT 'test_users' as table_name, COUNT(*) as count FROM test_users
UNION ALL
SELECT 'tenants' as table_name, COUNT(*) as count FROM tenants
UNION ALL
SELECT 'apps' as table_name, COUNT(*) as count FROM apps
UNION ALL
SELECT 'org_apps' as table_name, COUNT(*) as count FROM org_apps;

-- Show all test users
SELECT id, email, name, role, tenant_id FROM test_users ORDER BY name;
