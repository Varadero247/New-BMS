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

  const { hazardDescription, activityLocation, whoAtRisk, hazardCategory } = body;

  if (!hazardDescription || hazardDescription.length < 20) {
    return NextResponse.json(
      { error: 'Hazard description must be at least 20 characters' },
      { status: 400 }
    );
  }

  const systemPrompt = `You are an ISO 45001:2018 occupational health and safety expert.
Given a hazard description, generate concise best-practice control measures following the strict Hierarchy of Controls (ISO 45001 Clause 8.1.2).

Respond ONLY with a JSON object — no markdown, no preamble — in this exact format:
{
  "elimination": "Specific elimination control for this hazard",
  "substitution": "Specific substitution control for this hazard",
  "engineering": "Specific engineering control for this hazard",
  "administrative": "Specific administrative control for this hazard",
  "ppe": "Specific PPE requirements with EN/ISO standards where applicable",
  "suggestedLikelihood": 3,
  "suggestedSeverity": 4
}

Rules:
- Be specific to the hazard described. Do not give generic advice.
- Each control should be 1-3 concise sentences.
- If a control level is genuinely not applicable, state why briefly.
- Likelihood scale: 1=Rare, 2=Unlikely, 3=Possible, 4=Likely, 5=Almost Certain
- Severity scale: 1=Negligible, 2=Minor, 3=Moderate, 4=Major, 5=Catastrophic
- Base likelihood and severity on the hazard WITHOUT any controls applied (initial/inherent risk).
- Include relevant EN/ISO PPE standards where applicable (e.g. EN 397, EN ISO 20345, EN 361).`;

  const userPrompt = [
    `Workplace Hazard: ${hazardDescription}`,
    activityLocation ? `Location/Activity: ${activityLocation}` : '',
    whoAtRisk ? `Who is at risk: ${whoAtRisk}` : '',
    hazardCategory ? `Hazard Category: ${hazardCategory}` : '',
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

    // Parse JSON from response (handle potential markdown code fences)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to parse AI response:', content);
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 502 });
    }

    const controls = JSON.parse(jsonMatch[0]);

    // Validate expected fields
    const result = {
      elimination: controls.elimination || '',
      substitution: controls.substitution || '',
      engineering: controls.engineering || '',
      administrative: controls.administrative || '',
      ppe: controls.ppe || '',
      suggestedLikelihood: Math.max(1, Math.min(5, controls.suggestedLikelihood || 3)),
      suggestedSeverity: Math.max(1, Math.min(5, controls.suggestedSeverity || 3)),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('AI control generation error:', error);
    return NextResponse.json({ error: 'Failed to generate controls' }, { status: 500 });
  }
}
