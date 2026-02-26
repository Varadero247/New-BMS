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

  const { requirementTitle, legislationRef, category, jurisdiction } = body;

  if (!requirementTitle || requirementTitle.length < 5) {
    return NextResponse.json(
      { error: 'Requirement title must be at least 5 characters' },
      { status: 400 }
    );
  }

  const systemPrompt = `You are an ISO 45001:2018 compliance expert specialising in UK and EU occupational health and safety legislation.

Given a legal requirement, perform a compliance assessment.

Respond ONLY with a JSON object — no markdown, no preamble — in this exact format:
{
  "keyObligations": "The key legal obligations under this requirement (3-5 bullet points separated by semicolons)",
  "gapAnalysis": "Common compliance gaps organisations face with this requirement (2-3 points separated by semicolons)",
  "requiredActions": "Specific actions required to achieve/maintain compliance (3-5 actionable items separated by semicolons)",
  "evidenceRequired": "Evidence and documentation required to demonstrate compliance (2-4 items separated by semicolons)",
  "penaltyForNonCompliance": "Potential penalties, enforcement actions, or consequences of non-compliance (1-2 sentences)"
}

Rules:
- Be specific to the legislation/standard referenced.
- Reference specific sections, clauses, or regulations where applicable.
- Include UK HSE enforcement context where relevant.
- Recommendations must be practical and actionable.
- If jurisdiction is non-UK, adapt to that jurisdiction's framework.`;

  const userPrompt = [
    `Legal Requirement: ${requirementTitle}`,
    legislationRef ? `Legislation Reference: ${legislationRef}` : '',
    category ? `Category: ${category}` : '',
    jurisdiction ? `Jurisdiction: ${jurisdiction}` : '',
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
      keyObligations: analysis.keyObligations || '',
      gapAnalysis: analysis.gapAnalysis || '',
      requiredActions: analysis.requiredActions || '',
      evidenceRequired: analysis.evidenceRequired || '',
      penaltyForNonCompliance: analysis.penaltyForNonCompliance || '',
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('AI legal analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyse legal requirement' }, { status: 500 });
  }
}
