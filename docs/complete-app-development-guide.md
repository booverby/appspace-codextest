# Complete Guide to Adding New Apps to Nordic AI

## Overview

Nordic AI uses a standardized app framework that ensures consistency, security, and maintainability across all applications. This guide provides everything you need to know to develop, submit, and deploy new apps.

## Table of Contents

1. [Requirements](#requirements)
2. [App Architecture](#app-architecture)
3. [Development Process](#development-process)
4. [Code Standards](#code-standards)
5. [Testing Guidelines](#testing-guidelines)
6. [Submission Process](#submission-process)
7. [Examples](#examples)

## Requirements

### Technical Requirements

- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Authentication**: Must integrate with Nordic AI's auth system
- **Database**: Use Supabase client for data operations
- **API**: Follow RESTful conventions
- **Performance**: Apps must load within 2 seconds
- **Accessibility**: WCAG 2.1 AA compliance required

### Functional Requirements

- **User Permissions**: Respect organization-level access controls
- **Usage Logging**: All actions must be logged for analytics
- **Error Handling**: Graceful error handling with user-friendly messages
- **Responsive Design**: Must work on mobile, tablet, and desktop
- **Data Validation**: Client and server-side validation required

### Security Requirements

- **Input Sanitization**: All user inputs must be sanitized
- **CSRF Protection**: Use built-in Next.js CSRF protection
- **Rate Limiting**: Implement appropriate rate limiting
- **Data Encryption**: Sensitive data must be encrypted at rest
- **Audit Trail**: All data modifications must be auditable

## App Architecture

### File Structure

\`\`\`
components/apps/[app-name]/
├── [app-name]-app.tsx          # Main app component
├── components/                 # App-specific components
│   ├── [feature]-form.tsx
│   ├── [feature]-list.tsx
│   └── [feature]-dialog.tsx
├── hooks/                      # App-specific hooks
│   ├── use-[app-name].ts
│   └── use-[feature].ts
├── types/                      # App-specific types
│   └── [app-name].types.ts
└── utils/                      # App-specific utilities
    └── [app-name].utils.ts

app/apps/[app-name]/
└── page.tsx                    # App route page

app/api/apps/[app-name]/
├── route.ts                    # Main API endpoints
└── [feature]/
    └── route.ts                # Feature-specific endpoints
\`\`\`

### Core Components

Every app must implement these core interfaces:

\`\`\`typescript
interface AppComponent {
  user: User;
  organization: Organization;
  onUsageLog: (action: string, details?: any) => void;
}

interface AppMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  category: AppCategory;
  permissions: Permission[];
  dependencies: string[];
}
\`\`\`

## Development Process

### Step 1: Planning and Design

1. **Define App Purpose**: Clear description of what the app does
2. **Identify User Stories**: List all user interactions and workflows
3. **Design UI/UX**: Create wireframes or mockups
4. **Plan Data Model**: Define database schema if needed
5. **Security Review**: Identify potential security concerns

### Step 2: Setup Development Environment

1. **Clone Repository**: Get the latest Nordic AI codebase
2. **Install Dependencies**: Run `npm install`
3. **Setup Database**: Ensure Supabase connection is working
4. **Create App Structure**: Use the provided templates

### Step 3: Implementation

#### 3.1 Create App Component

\`\`\`typescript
// components/apps/my-app/my-app.tsx
import { AppWrapper } from '@/lib/app-wrapper';
import { User, Organization } from '@/lib/types';

interface MyAppProps {
  user: User;
  organization: Organization;
  onUsageLog: (action: string, details?: any) => void;
}

export function MyApp({ user, organization, onUsageLog }: MyAppProps) {
  // App implementation here
  
  const handleAction = async () => {
    try {
      // Perform action
      onUsageLog('action_performed', { userId: user.id });
    } catch (error) {
      console.error('Action failed:', error);
      // Handle error gracefully
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My App</h1>
      </div>
      
      {/* App content */}
    </div>
  );
}
\`\`\`

#### 3.2 Create App Page

\`\`\`typescript
// app/apps/my-app/page.tsx
import { AppWrapper } from '@/lib/app-wrapper';
import { MyApp } from '@/components/apps/my-app/my-app';

export default function MyAppPage() {
  return (
    <AppWrapper
      appId="my-app"
      requiredPermissions={['my-app:read']}
    >
      {({ user, organization, onUsageLog }) => (
        <MyApp 
          user={user} 
          organization={organization} 
          onUsageLog={onUsageLog} 
        />
      )}
    </AppWrapper>
  );
}
\`\`\`

#### 3.3 Create API Routes

\`\`\`typescript
// app/api/apps/my-app/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { validateAppAccess } from '@/lib/app-framework';

export async function GET(request: NextRequest) {
  try {
    const { user, organization } = await validateAppAccess(request, 'my-app', ['my-app:read']);
    const supabase = createClient();
    
    // Fetch data
    const { data, error } = await supabase
      .from('my_app_data')
      .select('*')
      .eq('organization_id', organization.id);
    
    if (error) throw error;
    
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, organization } = await validateAppAccess(request, 'my-app', ['my-app:write']);
    const body = await request.json();
    const supabase = createClient();
    
    // Validate input
    if (!body.name || body.name.length < 3) {
      return NextResponse.json(
        { error: 'Name must be at least 3 characters' },
        { status: 400 }
      );
    }
    
    // Create data
    const { data, error } = await supabase
      .from('my_app_data')
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
    await logAppUsage(user.id, organization.id, 'my-app', 'create', { itemId: data.id });
    
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create data' },
      { status: 500 }
    );
  }
}
\`\`\`

### Step 4: Database Schema (if needed)

\`\`\`sql
-- scripts/apps/my-app-schema.sql
CREATE TABLE IF NOT EXISTS my_app_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES test_users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_my_app_data_organization_id ON my_app_data(organization_id);
CREATE INDEX IF NOT EXISTS idx_my_app_data_created_by ON my_app_data(created_by);

-- Enable RLS (Row Level Security)
ALTER TABLE my_app_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can only access their organization's data" ON my_app_data
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM test_users WHERE id = auth.uid()
  ));
\`\`\`

## Code Standards

### TypeScript Standards

- Use strict TypeScript configuration
- Define interfaces for all data structures
- Use proper error handling with try/catch
- Implement proper type guards for runtime validation

### React Standards

- Use functional components with hooks
- Implement proper error boundaries
- Use React.memo for performance optimization where needed
- Follow React best practices for state management

### Styling Standards

- Use Tailwind CSS utility classes
- Follow the design system color palette
- Ensure responsive design with mobile-first approach
- Use shadcn/ui components when available

### API Standards

- Follow RESTful conventions
- Use proper HTTP status codes
- Implement consistent error response format
- Add request/response validation

## Testing Guidelines

### Unit Testing

\`\`\`typescript
// __tests__/my-app.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MyApp } from '@/components/apps/my-app/my-app';

const mockProps = {
  user: { id: '1', name: 'Test User', email: 'test@example.com' },
  organization: { id: '1', name: 'Test Org' },
  onUsageLog: jest.fn()
};

describe('MyApp', () => {
  it('renders app title', () => {
    render(<MyApp {...mockProps} />);
    expect(screen.getByText('My App')).toBeInTheDocument();
  });

  it('logs usage when action is performed', async () => {
    render(<MyApp {...mockProps} />);
    
    const actionButton = screen.getByText('Perform Action');
    fireEvent.click(actionButton);
    
    expect(mockProps.onUsageLog).toHaveBeenCalledWith(
      'action_performed',
      { userId: '1' }
    );
  });
});
\`\`\`

### Integration Testing

\`\`\`typescript
// __tests__/api/my-app.test.ts
import { GET, POST } from '@/app/api/apps/my-app/route';
import { NextRequest } from 'next/server';

describe('/api/apps/my-app', () => {
  it('should fetch data for authorized user', async () => {
    const request = new NextRequest('http://localhost:3000/api/apps/my-app', {
      headers: { authorization: 'Bearer valid-token' }
    });
    
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.data).toBeDefined();
  });

  it('should create data with valid input', async () => {
    const request = new NextRequest('http://localhost:3000/api/apps/my-app', {
      method: 'POST',
      headers: { 
        authorization: 'Bearer valid-token',
        'content-type': 'application/json'
      },
      body: JSON.stringify({ name: 'Test Item', description: 'Test Description' })
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.data.name).toBe('Test Item');
  });
});
\`\`\`

## Submission Process

### Step 1: Code Review Checklist

- [ ] All code follows established patterns and standards
- [ ] TypeScript types are properly defined
- [ ] Error handling is implemented throughout
- [ ] Security best practices are followed
- [ ] Performance considerations are addressed
- [ ] Accessibility requirements are met
- [ ] Tests are written and passing
- [ ] Documentation is complete

### Step 2: Submit App Registration

1. **Navigate to Admin Panel**: Go to `/admin/add-app`
2. **Fill Out App Details**:
   - App Name (unique identifier)
   - Display Name (user-friendly name)
   - Description (clear explanation of functionality)
   - Category (select appropriate category)
   - Version (semantic versioning: 1.0.0)
   - Required Permissions (list all needed permissions)

3. **Upload Code**: Provide links to your implementation files
4. **Submit for Review**: Click submit to send for admin approval

### Step 3: Review Process

1. **Automated Checks**: System validates code structure and standards
2. **Security Review**: Security team reviews for vulnerabilities
3. **Functionality Testing**: QA team tests all features
4. **Performance Testing**: Load testing and optimization review
5. **Approval/Rejection**: Admin approves or provides feedback

### Step 4: Deployment

Once approved:
1. App is automatically deployed to production
2. Permissions are configured in the system
3. App becomes available to authorized users
4. Usage analytics begin tracking

## Examples

### Example 1: Simple Data Manager

A basic CRUD app for managing custom data:

\`\`\`typescript
// components/apps/data-manager/data-manager.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DataItem {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export function DataManager({ user, organization, onUsageLog }) {
  const [items, setItems] = useState<DataItem[]>([]);
  const [newItem, setNewItem] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/apps/data-manager');
      const data = await response.json();
      setItems(data.items);
      onUsageLog('items_viewed', { count: data.items.length });
    } catch (error) {
      console.error('Failed to fetch items:', error);
    }
  };

  const createItem = async () => {
    if (!newItem.name.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/apps/data-manager', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
      
      if (response.ok) {
        const data = await response.json();
        setItems([...items, data.item]);
        setNewItem({ name: '', description: '' });
        onUsageLog('item_created', { itemId: data.item.id });
      }
    } catch (error) {
      console.error('Failed to create item:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Data Manager</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Item</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Item name"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          />
          <Input
            placeholder="Description"
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
          />
          <Button onClick={createItem} disabled={loading}>
            {loading ? 'Creating...' : 'Create Item'}
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {items.map((item) => (
          <Card key={item.id}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Created: {new Date(item.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
\`\`\`

### Example 2: API Integration App

An app that integrates with external APIs:

\`\`\`typescript
// components/apps/weather-app/weather-app.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WeatherData {
  location: string;
  temperature: number;
  description: string;
  humidity: number;
}

export function WeatherApp({ user, organization, onUsageLog }) {
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = async () => {
    if (!location.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/apps/weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setWeather(data.weather);
        onUsageLog('weather_fetched', { location, userId: user.id });
      } else {
        setError(data.error || 'Failed to fetch weather');
      }
    } catch (error) {
      setError('Network error occurred');
      console.error('Weather fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Weather App</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Get Weather Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter city name"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchWeather()}
            />
            <Button onClick={fetchWeather} disabled={loading}>
              {loading ? 'Loading...' : 'Get Weather'}
            </Button>
          </div>
          
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
        </CardContent>
      </Card>

      {weather && (
        <Card>
          <CardHeader>
            <CardTitle>Weather in {weather.location}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Temperature</p>
                <p className="text-2xl font-bold">{weather.temperature}°C</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Humidity</p>
                <p className="text-2xl font-bold">{weather.humidity}%</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Conditions</p>
                <p className="text-lg">{weather.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
\`\`\`

## Best Practices

### Performance

- Use React.memo for expensive components
- Implement proper loading states
- Use pagination for large data sets
- Optimize API calls with caching
- Minimize bundle size with code splitting

### Security

- Always validate user input
- Use parameterized queries for database operations
- Implement proper authentication checks
- Log security-relevant events
- Follow OWASP security guidelines

### User Experience

- Provide clear error messages
- Implement loading states for all async operations
- Use consistent UI patterns
- Ensure keyboard navigation works
- Test with screen readers

### Maintenance

- Write comprehensive documentation
- Use meaningful variable and function names
- Keep functions small and focused
- Implement proper error logging
- Plan for future feature additions

## Support and Resources

### Getting Help

- **Documentation**: Check this guide and existing app examples
- **Code Review**: Request code review before submission
- **Testing**: Use the provided testing utilities
- **Deployment**: Follow the deployment checklist

### Useful Links

- [React Documentation](https://react.dev)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Supabase Documentation](https://supabase.com/docs)

### Contact

For questions or support:
- Create an issue in the repository
- Contact the development team
- Join the developer Slack channel

---

This guide should provide everything needed to successfully develop and deploy new apps in the Nordic AI platform. Follow these guidelines carefully to ensure your app meets all requirements and provides a great user experience.
