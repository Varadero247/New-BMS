// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function POST(req: NextRequest) {
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'AI service not configured. Set ANTHROPIC_API_KEY in environment.' },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { incidentType, severity, description, location, injuryType } = body;

  if (!description || description.length < 20) {
    return NextResponse.json(
      { error: 'Incident description must be at least 20 characters' },
      { status: 400 }
    );
  }

  const systemPrompt = `You are an ISO 45001:2018 incident investigation specialist with expertise in 5-Whys analysis and ICAM (Incident Cause Analysis Method).

Given an incident description, perform a structured root cause analysis.

Respond ONLY with a JSON object — no markdown, no preamble — in this exact format:
{
  "immediateCause": "The direct, immediate cause of the incident (1-2 sentences)",
  "underlyingCause": "The underlying systemic or procedural cause (1-2 sentences)",
  "rootCause": "The fundamental root cause that if eliminated would prevent recurrence (1-2 sentences)",
  "contributingFactors": "Other factors that contributed to the incident (2-3 bullet points as a single string, separated by semicolons)",
  "recurrencePrevention": "Specific measures to prevent recurrence (2-3 actionable recommendations, separated by semicolons)"
}

Rules:
- Be specific to the incident described. Do not give generic advice.
- Use the 5-Whys methodology to drill down to root cause.
- Consider human factors, equipment, environment, and management systems.
- Recommendations must be practical and actionable.
- Each field should be concise but thorough.`;

  const userPrompt = [
    `Incident Description: ${description}`,
    incidentType ? `Incident Type: ${incidentType}` : '',
    severity ? `Severity: ${severity}` : '',
    location ? `Location: ${location}` : '',
    injuryType ? `Injury Type: ${injuryType}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 800,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Anthropic API error:', response.status, errorData);
      return NextResponse.json({ error: 'AI service temporarily unavailable' }, { status: 502 });
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;

    if (!content) {
      return NextResponse.json({ error: 'Empty response from AI service' }, { status: 502 });
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to parse AI response:', content);
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 502 });
    }

    const analysis = JSON.parse(jsonMatch[0]);

    const result = {
      immediateCause: analysis.immediateCause || '',
      underlyingCause: analysis.underlyingCause || '',
      rootCause: analysis.rootCause || '',
      contributingFactors: analysis.contributingFactors || '',
      recurrencePrevention: analysis.recurrencePrevention || '',
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('AI incident analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyse incident' }, { status: 500 });
  }
}
