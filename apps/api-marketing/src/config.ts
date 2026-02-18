export const AutomationConfig = {
  founder: {
    email: process.env.FOUNDER_EMAIL || 'founder@nexara.app',
    name: process.env.FOUNDER_NAME || 'Founder',
    calendlyUrl: process.env.CALENDLY_URL || 'https://calendly.com/nexara/demo',
  },
  hubspot: {
    apiKey: process.env.HUBSPOT_API_KEY || '',
    portalId: process.env.HUBSPOT_PORTAL_ID || '',
    pipelineId: process.env.HUBSPOT_PIPELINE_ID || '',
    stageIds: {
      prospecting: process.env.HS_STAGE_PROSPECTING || '',
      qualified: process.env.HS_STAGE_QUALIFIED || '',
      demo: process.env.HS_STAGE_DEMO || '',
      proposal: process.env.HS_STAGE_PROPOSAL || '',
      closedWon: process.env.HS_STAGE_CLOSED_WON || '',
      closedLost: process.env.HS_STAGE_CLOSED_LOST || '',
    },
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },
  intercom: {
    accessToken: process.env.INTERCOM_ACCESS_TOKEN || '',
    appId: process.env.INTERCOM_APP_ID || '',
  },
  linkedin: {
    dailyOutreachLimit: 20,
  },
  health: {
    criticalThreshold: 40,
    atRiskThreshold: 70,
  },
  partner: {
    minPayoutAmount: 100,
    commissionRates: {
      REFERRAL: 0.25,
      CO_SELL: 0.325,
      RESELLER: 0.375,
      GCC_SPECIALIST: 0.3,
    } as Record<string, number>,
  },
  trial: {
    durationDays: 21,
    extensionDays: 7,
  },
  featureFlags: {
    AUTOMATION_MONTHLY_TRACKING: process.env.AUTOMATION_MONTHLY_TRACKING !== 'false',
    AUTOMATION_FINANCE: process.env.AUTOMATION_FINANCE !== 'false',
    AUTOMATION_SUPPORT: process.env.AUTOMATION_SUPPORT !== 'false',
    AUTOMATION_COMPLIANCE: process.env.AUTOMATION_COMPLIANCE !== 'false',
    AUTOMATION_INTELLIGENCE: process.env.AUTOMATION_INTELLIGENCE !== 'false',
  },
  platformUrl: process.env.PLATFORM_URL || 'https://app.nexara.io',
};
