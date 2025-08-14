-- Insert demo apps
INSERT INTO apps (id, name, description, icon) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Prompt', 'AI-powered chat assistant', '💬'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Translate', 'Language translation tool', '🌐')
ON CONFLICT (id) DO NOTHING;

-- Insert demo organizations
INSERT INTO organizations (id, name) VALUES
  ('550e8400-e29b-41d4-a716-446655440010', 'Acme Corp'),
  ('550e8400-e29b-41d4-a716-446655440011', 'Beta Inc'),
  ('550e8400-e29b-41d4-a716-446655440012', 'Gamma LLC')
ON CONFLICT (id) DO NOTHING;

INSERT INTO test_users (id, email, password, name, role, organization_id) VALUES
  ('550e8400-e29b-41d4-a716-446655440020', 'admin@example.com', 'admin123', 'Super Admin', 'super_admin', NULL),
  ('550e8400-e29b-41d4-a716-446655440021', 'john@acme.com', 'password', 'John Doe', 'member', '550e8400-e29b-41d4-a716-446655440010'),
  ('550e8400-e29b-41d4-a716-446655440022', 'jane@beta.com', 'password', 'Jane Smith', 'member', '550e8400-e29b-41d4-a716-446655440011'),
  ('550e8400-e29b-41d4-a716-446655440023', 'bob@gamma.com', 'password', 'Bob Wilson', 'member', '550e8400-e29b-41d4-a716-446655440012')
ON CONFLICT (id) DO NOTHING;

INSERT INTO org_apps (organization_id, app_id, enabled) VALUES
  ('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', true), -- Acme Corp - Prompt
  ('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440002', true), -- Acme Corp - Translate
  ('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', true), -- Beta Inc - Prompt
  ('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440002', true)  -- Gamma LLC - Translate
ON CONFLICT (organization_id, app_id) DO NOTHING;
