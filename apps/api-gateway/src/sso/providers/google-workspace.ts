// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type { ProviderSetupGuide } from '../types';

export function getGoogleWorkspaceGuide(tenantDomain: string): ProviderSetupGuide {
  return {
    provider: 'google-workspace',
    estimatedMinutes: 20,
    adminConsoleUrl: 'https://admin.google.com/ac/apps/unified',
    steps: [
      {
        stepNumber: 1,
        title: 'Add a Custom SAML App',
        description: 'In the Google Admin Console, go to Apps → Web and mobile apps → Add app → Add custom SAML app.',
      },
      {
        stepNumber: 2,
        title: 'Get Google Identity Provider Details',
        description: 'On step 2, you will see Google\'s IdP information. Either download the metadata XML file, or copy the SSO URL, Entity ID, and Certificate. Paste the metadata XML content into the Nexara SSO wizard.',
      },
      {
        stepNumber: 3,
        title: 'Enter Service Provider Details',
        description: 'On step 3, enter these values:',
        copyableValues: {
          'ACS URL': `https://${tenantDomain}/api/auth/saml/callback`,
          'Entity ID': `urn:nexara:${tenantDomain}`,
          'Start URL': `https://${tenantDomain}`,
          'Name ID format': 'EMAIL',
          'Name ID': 'Basic Information > Primary email',
        },
      },
      {
        stepNumber: 4,
        title: 'Attribute Mapping',
        description: 'Add these attribute mappings:\n- Google Directory attribute: First name → App attribute: firstName\n- Google Directory attribute: Last name → App attribute: lastName\n- Google Directory attribute: Primary email → App attribute: email (this is usually done via Name ID automatically)',
      },
      {
        stepNumber: 5,
        title: 'Enable the App for Users',
        description: 'After saving, go to User access and set the service to ON for all users (or specific OUs). This may take up to 24 hours to propagate.',
      },
    ],
    nexaraValues: {
      entityId: `urn:nexara:${tenantDomain}`,
      acsUrl: `https://${tenantDomain}/api/auth/saml/callback`,
      sloUrl: `https://${tenantDomain}/api/auth/saml/logout`,
      metadataUrl: `https://${tenantDomain}/api/auth/saml/metadata`,
    },
    attributeDefaults: {
      email: 'email',
      firstName: 'firstName',
      lastName: 'lastName',
    },
  };
}
