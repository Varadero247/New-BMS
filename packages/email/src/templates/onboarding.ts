interface OnboardingVars {
  firstName: string;
  companyName: string;
  isoStandards: string;
  trialEndDate: string;
  platformUrl: string;
  ctaUrl: string;
}

const header = (title: string) => `
<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #1B3A6B 0%, #2B5EA7 100%); border-radius: 12px 12px 0 0; padding: 30px; color: white; text-align: center;">
  <h1 style="margin: 0; font-size: 22px;">${title}</h1>
</div>
<div style="background: #ffffff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; padding: 30px;">`;

const footer = `
<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
<p style="font-size: 12px; color: #999; text-align: center;">Nexara IMS — Every standard. One intelligent platform.<br>
<a href="{{unsubscribeUrl}}" style="color: #999;">Unsubscribe</a></p>
</div></body></html>`;

const cta = (url: string, text: string) =>
  `<a href="${url}" style="display: inline-block; background: #1B3A6B; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 16px 0;">${text}</a>`;

export function welcomeEmail(vars: OnboardingVars) {
  return {
    subject: 'Welcome to Nexara — your 21-day trial is live',
    html: `${header('Welcome to Nexara!')}
<p>Hi ${vars.firstName},</p>
<p>Your 21-day free trial of Nexara IMS is now active. Here are your first three steps:</p>
<ol>
  <li><strong>Log in</strong> and explore your ${vars.isoStandards || 'ISO'} management dashboard</li>
  <li><strong>Create your first record</strong> — try adding a risk assessment or audit</li>
  <li><strong>Invite your team</strong> — collaboration makes compliance effortless</li>
</ol>
${cta(vars.platformUrl, 'Go to Nexara')}
<p>Your trial runs until <strong>${vars.trialEndDate}</strong>. No credit card required.</p>
<p>Best,<br>The Nexara Team</p>
${footer}`,
    text: `Hi ${vars.firstName}, Welcome to Nexara! Your 21-day trial is live. Log in at ${vars.platformUrl}. Trial ends ${vars.trialEndDate}.`,
  };
}

export function inactiveEmail(vars: OnboardingVars) {
  return {
    subject: 'We noticed you haven\'t started yet — here\'s a quick walkthrough',
    html: `${header('Need a hand getting started?')}
<p>Hi ${vars.firstName},</p>
<p>We noticed you haven't created any records yet in Nexara. No worries — here's a 3-minute video walkthrough to help you get started:</p>
${cta(vars.platformUrl, 'Watch Quick Start Guide')}
<p>Your trial ends on ${vars.trialEndDate} — plenty of time to see the difference Nexara makes.</p>
<p>Best,<br>The Nexara Team</p>
${footer}`,
    text: `Hi ${vars.firstName}, Need help getting started? Watch our quick start guide at ${vars.platformUrl}. Trial ends ${vars.trialEndDate}.`,
  };
}

export function activeEmail(vars: OnboardingVars) {
  return {
    subject: 'Great start! Here\'s your next step with Nexara',
    html: `${header('You\'re off to a great start!')}
<p>Hi ${vars.firstName},</p>
<p>You've been making great progress with Nexara. Based on your ${vars.isoStandards} standards, here's what to try next:</p>
<ul>
  <li>Set up automated compliance reminders</li>
  <li>Import existing documentation</li>
  <li>Invite team members to collaborate</li>
</ul>
${cta(vars.platformUrl, 'Continue in Nexara')}
<p>Best,<br>The Nexara Team</p>
${footer}`,
    text: `Hi ${vars.firstName}, Great start! Based on your ${vars.isoStandards} standards, try setting up automated compliance reminders next.`,
  };
}

export function featureHighlightEmail(vars: OnboardingVars) {
  return {
    subject: 'Discover the feature most relevant to your ISO standards',
    html: `${header('Feature Spotlight')}
<p>Hi ${vars.firstName},</p>
<p>Managing ${vars.isoStandards}? Here's the feature that makes the biggest difference:</p>
<div style="background: #f0f4ff; border-radius: 8px; padding: 20px; margin: 16px 0;">
  <h3 style="margin: 0 0 8px 0; color: #1B3A6B;">AI-Powered Gap Analysis</h3>
  <p style="margin: 0;">Automatically identify gaps in your compliance framework and get actionable recommendations. Most users save 8+ hours per week.</p>
</div>
${cta(vars.platformUrl, 'Try It Now')}
<p>Best,<br>The Nexara Team</p>
${footer}`,
    text: `Hi ${vars.firstName}, Here's a feature spotlight for your ${vars.isoStandards} management: AI-Powered Gap Analysis.`,
  };
}

export function caseStudyEmail(vars: OnboardingVars) {
  return {
    subject: 'How companies like yours reduced audit prep time by 60%',
    html: `${header('Customer Success Story')}
<p>Hi ${vars.firstName},</p>
<p>A mid-size manufacturing company managing ISO 9001 and 14001 switched to Nexara and:</p>
<ul>
  <li>Reduced audit preparation time by <strong>60%</strong></li>
  <li>Eliminated <strong>12 hours/week</strong> of manual compliance tracking</li>
  <li>Passed their surveillance audit with <strong>zero non-conformances</strong></li>
</ul>
<p>Sound like something ${vars.companyName} could benefit from?</p>
${cta(vars.ctaUrl, 'See How It Works')}
<p>Best,<br>The Nexara Team</p>
${footer}`,
    text: `Hi ${vars.firstName}, A company like yours reduced audit prep by 60% with Nexara. See how at ${vars.ctaUrl}.`,
  };
}

export function expiryWarningEmail(vars: OnboardingVars) {
  return {
    subject: 'Your trial ends in 3 days — here\'s everything you\'d keep',
    html: `${header('Your Trial Ends Soon')}
<p>Hi ${vars.firstName},</p>
<p>Your Nexara trial ends on <strong>${vars.trialEndDate}</strong>. Here's what you'd keep access to with a paid plan:</p>
<ul>
  <li>All ${vars.isoStandards} management modules</li>
  <li>AI-powered gap analysis & recommendations</li>
  <li>Automated audit scheduling & evidence collection</li>
  <li>Real-time compliance dashboards</li>
  <li>Unlimited document management</li>
</ul>
${cta(vars.ctaUrl, 'Upgrade Now')}
<p>Questions? Reply to this email — we're happy to help.</p>
<p>Best,<br>The Nexara Team</p>
${footer}`,
    text: `Hi ${vars.firstName}, Your trial ends ${vars.trialEndDate}. Upgrade now to keep access to all features.`,
  };
}

export function extensionEmail(vars: OnboardingVars) {
  return {
    subject: 'Get 7 more free days — just book a quick call',
    html: `${header('Need More Time?')}
<p>Hi ${vars.firstName},</p>
<p>We know evaluating compliance software takes time. Book a quick 15-minute call with our team and we'll extend your trial by 7 days — no obligation.</p>
${cta('https://calendly.com/nexara/demo', 'Book a 15-Minute Call')}
<p>We'll walk you through the features most relevant to ${vars.companyName}'s ${vars.isoStandards} management needs.</p>
<p>Best,<br>The Nexara Team</p>
${footer}`,
    text: `Hi ${vars.firstName}, Need more time? Book a 15-minute call and get 7 extra days free.`,
  };
}

export function finalOfferEmail(vars: OnboardingVars) {
  return {
    subject: '20% off your first 3 months — today only',
    html: `${header('Exclusive Offer for You')}
<p>Hi ${vars.firstName},</p>
<p>Your trial has ended, but we'd love to keep you onboard. As a thank you for trying Nexara:</p>
<div style="background: #f0fdf4; border: 2px solid #16a34a; border-radius: 8px; padding: 20px; margin: 16px 0; text-align: center;">
  <h2 style="margin: 0; color: #16a34a;">20% off your first 3 months</h2>
  <p style="margin: 8px 0 0;">Use code <strong>WELCOME20</strong> at checkout</p>
</div>
${cta(vars.ctaUrl, 'Claim Your Discount')}
<p>This offer expires in 48 hours.</p>
<p>Best,<br>The Nexara Team</p>
${footer}`,
    text: `Hi ${vars.firstName}, Get 20% off your first 3 months with code WELCOME20. Offer expires in 48 hours.`,
  };
}
