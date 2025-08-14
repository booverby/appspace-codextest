"use client"

// Example app templates and utilities for developers

export const APP_TEMPLATES = {
  basic: {
    name: "Basic CRUD App",
    description: "Simple create, read, update, delete functionality",
    files: [
      "components/apps/[app-name]/[app-name]-app.tsx",
      "app/apps/[app-name]/page.tsx",
      "app/api/apps/[app-name]/route.ts",
    ],
    permissions: ["[app-name]:read", "[app-name]:write"],
    database: true,
  },

  apiIntegration: {
    name: "External API Integration",
    description: "App that integrates with external APIs",
    files: [
      "components/apps/[app-name]/[app-name]-app.tsx",
      "app/apps/[app-name]/page.tsx",
      "app/api/apps/[app-name]/route.ts",
      "lib/[app-name]-client.ts",
    ],
    permissions: ["[app-name]:read"],
    database: false,
  },

  dashboard: {
    name: "Analytics Dashboard",
    description: "Data visualization and analytics app",
    files: [
      "components/apps/[app-name]/[app-name]-app.tsx",
      "components/apps/[app-name]/charts/",
      "app/apps/[app-name]/page.tsx",
      "app/api/apps/[app-name]/route.ts",
      "app/api/apps/[app-name]/analytics/route.ts",
    ],
    permissions: ["[app-name]:read", "[app-name]:analytics"],
    database: true,
  },

  workflow: {
    name: "Workflow Management",
    description: "Multi-step process management app",
    files: [
      "components/apps/[app-name]/[app-name]-app.tsx",
      "components/apps/[app-name]/workflow/",
      "app/apps/[app-name]/page.tsx",
      "app/api/apps/[app-name]/route.ts",
      "app/api/apps/[app-name]/workflows/route.ts",
      "lib/[app-name]-workflow.ts",
    ],
    permissions: ["[app-name]:read", "[app-name]:write", "[app-name]:manage"],
    database: true,
  },
}

export const VALIDATION_RULES = {
  appName: {
    minLength: 3,
    maxLength: 50,
    pattern: /^[a-z][a-z0-9-]*[a-z0-9]$/,
    message: "App name must be lowercase, start with a letter, and contain only letters, numbers, and hyphens",
  },

  displayName: {
    minLength: 3,
    maxLength: 100,
    pattern: /^[A-Za-z0-9\s\-_]+$/,
    message: "Display name must contain only letters, numbers, spaces, hyphens, and underscores",
  },

  description: {
    minLength: 10,
    maxLength: 500,
    message: "Description must be between 10 and 500 characters",
  },

  version: {
    pattern: /^\d+\.\d+\.\d+$/,
    message: "Version must follow semantic versioning (e.g., 1.0.0)",
  },
}

export const PERMISSION_TEMPLATES = {
  read: "[app-name]:read",
  write: "[app-name]:write",
  delete: "[app-name]:delete",
  admin: "[app-name]:admin",
  manage: "[app-name]:manage",
  analytics: "[app-name]:analytics",
  export: "[app-name]:export",
  import: "[app-name]:import",
}

export const CODE_GENERATORS = {
  generateAppComponent: (appName: string, displayName: string) => `
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Organization } from '@/lib/types';

interface ${toPascalCase(appName)}Props {
  user: User;
  organization: Organization;
  onUsageLog: (action: string, details?: any) => void;
}

export function ${toPascalCase(appName)}({ user, organization, onUsageLog }: ${toPascalCase(appName)}Props) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/apps/${appName}');
      const result = await response.json();
      setData(result.data || []);
      onUsageLog('data_viewed', { count: result.data?.length || 0 });
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">${displayName}</h1>
        <Button onClick={fetchData} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Welcome to ${displayName}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This is your ${displayName} app. Start building your features here.
          </p>
        </CardContent>
      </Card>

      {/* Add your app content here */}
    </div>
  );
}
`,

  generateApiRoute: (appName: string) => `
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { validateAppAccess } from '@/lib/app-framework';

export async function GET(request: NextRequest) {
  try {
    const { user, organization } = await validateAppAccess(request, '${appName}', ['${appName}:read']);
    const supabase = createClient();
    
    // Fetch your data here
    const { data, error } = await supabase
      .from('${appName}_data')
      .select('*')
      .eq('organization_id', organization.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error('${appName} GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, organization } = await validateAppAccess(request, '${appName}', ['${appName}:write']);
    const body = await request.json();
    const supabase = createClient();
    
    // Validate input
    if (!body.name || body.name.length < 3) {
      return NextResponse.json(
        { error: 'Name is required and must be at least 3 characters' },
        { status: 400 }
      );
    }
    
    // Create data
    const { data, error } = await supabase
      .from('${appName}_data')
      .insert({
        ...body,
        organization_id: organization.id,
        created_by: user.id,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Log usage
    await logAppUsage(user.id, organization.id, '${appName}', 'create', { itemId: data.id });
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error('${appName} POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create data' },
      { status: 500 }
    );
  }
}
`,

  generatePageRoute: (appName: string, displayName: string) => `
import { AppWrapper } from '@/lib/app-wrapper';
import { ${toPascalCase(appName)} } from '@/components/apps/${appName}/${appName}-app';

export default function ${toPascalCase(appName)}Page() {
  return (
    <AppWrapper
      appId="${appName}"
      requiredPermissions={['${appName}:read']}
    >
      {({ user, organization, onUsageLog }) => (
        <${toPascalCase(appName)}
          user={user}
          organization={organization}
          onUsageLog={onUsageLog}
        />
      )}
    </AppWrapper>
  );
}

export const metadata = {
  title: '${displayName} - Nordic AI',
  description: '${displayName} application for Nordic AI platform'
};
`,

  generateDatabaseSchema: (appName: string) => `
-- Database schema for ${appName} app
CREATE TABLE IF NOT EXISTS ${appName}_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES test_users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  data JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_${appName}_data_organization_id ON ${appName}_data(organization_id);
CREATE INDEX IF NOT EXISTS idx_${appName}_data_created_by ON ${appName}_data(created_by);
CREATE INDEX IF NOT EXISTS idx_${appName}_data_status ON ${appName}_data(status);

-- Enable RLS (Row Level Security)
ALTER TABLE ${appName}_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "${appName}_organization_isolation" ON ${appName}_data
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM test_users WHERE id = auth.uid()
  ));

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_${appName}_data_updated_at 
  BEFORE UPDATE ON ${appName}_data 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`,
}

// Utility functions
function toPascalCase(str: string): string {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("")
}

export function validateAppSubmission(appData: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Validate app name
  if (!appData.name || !VALIDATION_RULES.appName.pattern.test(appData.name)) {
    errors.push(VALIDATION_RULES.appName.message)
  }

  // Validate display name
  if (!appData.displayName || !VALIDATION_RULES.displayName.pattern.test(appData.displayName)) {
    errors.push(VALIDATION_RULES.displayName.message)
  }

  // Validate description
  if (
    !appData.description ||
    appData.description.length < VALIDATION_RULES.description.minLength ||
    appData.description.length > VALIDATION_RULES.description.maxLength
  ) {
    errors.push(VALIDATION_RULES.description.message)
  }

  // Validate version
  if (!appData.version || !VALIDATION_RULES.version.pattern.test(appData.version)) {
    errors.push(VALIDATION_RULES.version.message)
  }

  // Validate permissions
  if (!appData.permissions || !Array.isArray(appData.permissions) || appData.permissions.length === 0) {
    errors.push("At least one permission must be specified")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
