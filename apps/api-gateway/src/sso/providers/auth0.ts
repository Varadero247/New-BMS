// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type { ProviderSetupGuide } from '../types';

export function getAuth0Guide(tenantDomain: string): ProviderSetupGuide {
  return {
    provider: 'auth0',
    estimatedMinutes: 10,
    adminConsoleUrl: 'https://manage.auth0.com/#/applications',
    steps: [
      {
        stepNumber: 1,
        title: 'Create an Application',
        description: 'In the Auth0 Dashboard, go to Applications → Applications → Create Application. Select "Regular Web Applications" and click Create.',
      },
      {
        stepNumber: 2,
        title: 'Configure Allowed URLs',
        description: 'In the Settings tab, add these values:',
        copyableValues: {
          'Allowed Callback URLs': `https://${tenantDomain}/api/auth/oidc/callback`,
          'Allowed Logout URLs': `https://${tenantDomain}`,
          'Allowed Web Origins': `https://${tenantDomain}`,
        },
      },
      {
        stepNumber: 3,
        title: 'Get Discovery URL',
        description: 'Your Auth0 OIDC discovery URL follows this format: https://YOUR_AUTH0_DOMAIN/.well-known/openid-configuration. Replace YOUR_AUTH0_DOMAIN with your Auth0 tenant domain (e.g. mycompany.auth0.com). Paste this URL into the Nexara SSO wizard.',
      },
      {
        stepNumber: 4,
        title: 'Copy Client Credentials',
        description: 'From the Settings tab, copy your Client ID and Client Secret. You will need these when prompted by the Nexara wizard.',
      },
      {
        stepNumber: 5,
        title: 'Configure Claims',
        description: 'Ensure Auth0 returns email, given_name, and family_name claims. You may need to enable the "Email" and "Profile" scopes and configure rules to include these in the ID token.',
      },
    ],
    nexaraValues: {
      entityId: `https://${tenantDomain}`,
      acsUrl: `https://${tenantDomain}/api/auth/oidc/callback`,
      sloUrl: `https://${tenantDomain}/api/auth/oidc/logout`,
      metadataUrl: `https://${tenantDomain}/api/auth/oidc/.well-known/openid-configuration`,
    },
    attributeDefaults: {
      email: 'email',
      firstName: 'given_name',
      lastName: 'family_name',
    },
  };
}
