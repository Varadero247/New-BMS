// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type { ProviderSetupGuide } from '../types';

export function getAzureADGuide(tenantDomain: string): ProviderSetupGuide {
  const entityId = `urn:nexara:${tenantDomain}`;
  const acsUrl = `https://${tenantDomain}/api/auth/saml/callback`;
  const sloUrl = `https://${tenantDomain}/api/auth/saml/logout`;
  const metadataUrl = `https://${tenantDomain}/api/auth/saml/metadata`;

  return {
    provider: 'azure-ad',
    estimatedMinutes: 20,
    adminConsoleUrl: 'https://portal.azure.com/#blade/Microsoft_AAD_IAM/StartboardApplicationsMenuBlade/AllApps',
    steps: [
      {
        stepNumber: 1,
        title: 'Create an Enterprise Application',
        description: 'Sign in to the Azure Portal. Navigate to Azure Active Directory → Enterprise applications → New application → Create your own application. Enter "Nexara IMS" as the name and select "Integrate any other application you don\'t find in the gallery (Non-gallery)". Click Create.',
        screenshotHint: 'Azure Portal > Azure Active Directory > Enterprise Applications > New Application',
      },
      {
        stepNumber: 2,
        title: 'Configure Single Sign-On',
        description: 'In the newly created application, click "Set up single sign on" in the left menu, then select "SAML" as the sign-on method.',
        screenshotHint: 'Enterprise App > Single sign-on > SAML',
      },
      {
        stepNumber: 3,
        title: 'Enter Nexara Details',
        description: 'Click the Edit button in "Basic SAML Configuration" and enter the following values exactly:',
        copyableValues: {
          'Identifier (Entity ID)': entityId,
          'Reply URL (Assertion Consumer Service URL)': acsUrl,
          'Sign on URL (optional)': `https://${tenantDomain}`,
        },
      },
      {
        stepNumber: 4,
        title: 'Configure Attributes & Claims',
        description: 'Click Edit on "Attributes & Claims". Ensure these claims are mapped: emailaddress → user.mail, givenname → user.givenname, surname → user.surname. The email claim is critical — without it users cannot log in.',
        screenshotHint: 'SAML Setup > Attributes & Claims > Edit',
      },
      {
        stepNumber: 5,
        title: 'Get the Metadata URL',
        description: 'Scroll to section "3 - SAML Signing Certificate". Copy the "App Federation Metadata URL" value and paste it into the Nexara SSO wizard on the next step.',
        screenshotHint: 'SAML Setup > SAML Signing Certificate > App Federation Metadata URL',
      },
      {
        stepNumber: 6,
        title: 'Assign Users or Groups',
        description: 'Click "Users and groups" in the left menu. Click "Add user/group" and assign the users or groups who should have access to Nexara. Users not assigned here will not be able to log in via SSO.',
        screenshotHint: 'Enterprise App > Users and groups > Add user/group',
      },
    ],
    nexaraValues: { entityId, acsUrl, sloUrl, metadataUrl },
    attributeDefaults: {
      email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
      firstName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
      lastName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
    },
  };
}
