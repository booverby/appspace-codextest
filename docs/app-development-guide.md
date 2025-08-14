# App Development Guide for Nordic AI Platform

## Overview

The Nordic AI platform uses a multi-organization architecture where individual applications can be developed and deployed independently while leveraging shared system infrastructure.

## App Architecture

### System vs App Code Separation

**System Code** (Platform Infrastructure):
- `/lib/` - Core utilities, database clients, authentication
- `/components/ui/` - Shared UI component library
- `/app/api/admin/` - Platform administration APIs
- `/app/api/auth/` - Authentication and authorization
- `/components/admin-dashboard.tsx` - Platform admin interface
- `/components/member-dashboard.tsx` - User dashboard

**App Code** (Individual Applications):
- `/apps/[app-name]/` - App-specific pages and components
- `/components/apps/[app-name]/` - App-specific components
- `/app/api/apps/[app-name]/` - App-specific API routes

### App Interface Contract

Every app must implement the following interface:

\`\`\`typescript
interface AppDefinition {
  id: string;                    // Unique app identifier
  name: string;                  // Display name
  description: string;           // Brief description
  icon: string;                  // Icon identifier
  version: string;               // Semantic version
  category: AppCategory;         // App category
  permissions: Permission[];     // Required permissions
  settings?: AppSettings;        // Optional configuration
}

interface AppComponent {
  // Main app component that receives user context
  component: React.ComponentType<AppProps>;
  
  // Optional configuration component for admin
  configComponent?: React.ComponentType<AppConfigProps>;
}

interface AppProps {
  user: User;
  organization: Organization;
  apiKeys: Record<string, string>;
  onUsageLog: (action: string, metadata?: any) => void;
}
\`\`\`

## App Development Process

### 1. App Planning
- Define app purpose and functionality
- Identify required external APIs and permissions
- Plan user interface and user experience
- Document configuration requirements

### 2. App Structure
Create the following files:
\`\`\`
/apps/[app-name]/
  ├── page.tsx              # Main app page
  ├── components/           # App-specific components
  │   ├── [app-name]-app.tsx
  │   └── [app-name]-config.tsx
  └── api/                  # App-specific API routes
      └── route.ts
\`\`\`

### 3. App Registration
Apps are registered in the database with:
- Basic metadata (name, description, icon)
- Version information
- Required permissions
- Configuration schema

### 4. Organization Enablement
- Apps must be explicitly enabled for organizations
- Admins control which apps are available to their users
- Usage is tracked per organization

## Development Guidelines

### Authentication & Authorization
- Always verify user authentication using `getUser()`
- Check organization membership before app access
- Validate app is enabled for user's organization
- Log all significant user actions

### API Key Management
- Use organization's encrypted API keys for external services
- Never expose API keys to client-side code
- Implement proper error handling for API failures
- Respect rate limits and usage quotas

### UI/UX Standards
- Follow the platform's design system
- Use consistent typography and spacing
- Implement responsive design for mobile/desktop
- Provide clear error messages and loading states

### Performance & Security
- Implement proper input validation
- Use server-side rendering where appropriate
- Optimize for fast loading times
- Follow security best practices for data handling

## App Categories

- **AI & ML** - AI-powered applications and tools
- **Productivity** - Workflow and productivity enhancement
- **Communication** - Messaging and collaboration tools
- **Analytics** - Data analysis and reporting
- **Integration** - Third-party service integrations
- **Utility** - General purpose utilities and tools

## Testing Requirements

- Unit tests for core functionality
- Integration tests for API endpoints
- User acceptance testing for UI flows
- Performance testing for resource usage

## Deployment Process

1. **Development** - Build and test locally
2. **Review** - Code review and security audit
3. **Staging** - Deploy to staging environment
4. **Production** - Deploy to production with monitoring

## Support & Maintenance

- Monitor app usage and performance
- Respond to user feedback and bug reports
- Maintain compatibility with platform updates
- Provide documentation and user guides
