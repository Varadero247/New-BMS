// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type { ProviderSetupGuide } from '../types';

export function getOktaGuide(tenantDomain: string): ProviderSetupGuide {
  const entityId = `urn:nexara:${tenantDomain}`;
  const acsUrl = `https://${tenantDomain}/api/auth/saml/callback`;

  return {
    provider: 'okta',
    estimatedMinutes: 15,
    adminConsoleUrl: 'https://your-org.okta.com/admin/apps/active',
    steps: [
      {
        stepNumber: 1,
        title: 'Create a New App Integration',
        description: 'In the Okta Admin Console, go to Applications → Applications → Create App Integration. Select "SAML 2.0" as the sign-on method and click Next.',
      },
      {
        stepNumber: 2,
        title: 'General Settings',
        description: 'Enter "Nexara IMS" as the App name. Optionally upload the Nexara logo. Click Next.',
      },
      {
        stepNumber: 3,
        title: 'SAML Settings',
        description: 'Enter these values in the SAML Settings form:',
        copyableValues: {
          'Single sign on URL': acsUrl,
          'Audience URI (SP Entity ID)': entityId,
          'Name ID format': 'EmailAddress',
          'Application username': 'Email',
        },
      },
      {
        stepNumber: 4,
        title: 'Attribute Statements',
        description: 'Add these Attribute Statements:\n- Name: email | Value: user.email\n- Name: firstName | Value: user.firstName\n- Name: lastName | Value: user.lastName',
      },
      {
        stepNumber: 5,
        title: 'Get Metadata',
        description: 'After saving, click "View SAML setup instructions". Copy the "Identity Provider Metadata" URL or download the XML file. Paste the URL (or XML content) into the Nexara SSO wizard.',
      },
      {
        stepNumber: 6,
        title: 'Assign People',
        description: 'Go to the Assignments tab of your new app. Click Assign → Assign to People or Groups to grant access to Nexara users.',
      },
    ],
    nexaraValues: {
      entityId,
      acsUrl,
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
