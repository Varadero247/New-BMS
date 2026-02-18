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

  const { objectiveTitle, category, department, targetDate } = body;

  if (!objectiveTitle || objectiveTitle.length < 5) {
    return NextResponse.json(
      { error: 'Objective title must be at least 5 characters' },
      { status: 400 }
    );
  }

  const systemPrompt = `You are an ISO 45001:2018 OHS objectives specialist (Clause 6.2 - OHS Objectives and Planning to Achieve Them).

Given an objective title, generate a SMART objective statement with measurable KPIs and practical milestones.

Respond ONLY with a JSON object — no markdown, no preamble — in this exact format:
{
  "objectiveStatement": "A SMART (Specific, Measurable, Achievable, Relevant, Time-bound) objective statement (2-3 sentences)",
  "ohsPolicyLink": "How this objective links to the OHS policy (1 sentence)",
  "kpiDescription": "A specific, measurable KPI to track progress (1 sentence)",
  "resourcesRequired": "Resources needed to achieve this objective (2-3 items separated by semicolons)",
  "suggestedMilestones": [
    { "title": "Milestone 1 title", "weeksFromStart": 4 },
    { "title": "Milestone 2 title", "weeksFromStart": 8 },
    { "title": "Milestone 3 title", "weeksFromStart": 12 }
  ]
}

Rules:
- Make the objective SMART — specific and measurable.
- KPIs should be quantitative where possible (%, count, rate).
- Milestones should be progressive and lead to objective completion.
- Include 3-5 milestones appropriate to the objective complexity.
- Resources should be realistic and practical.
- Link to ISO 45001 policy commitments where applicable.`;

  const userPrompt = [
    `Objective: ${objectiveTitle}`,
    category ? `Category: ${category}` : '',
    department ? `Department: ${department}` : '',
    targetDate ? `Target Date: ${targetDate}` : '',
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
      objectiveStatement: analysis.objectiveStatement || '',
      ohsPolicyLink: analysis.ohsPolicyLink || '',
      kpiDescription: analysis.kpiDescription || '',
      resourcesRequired: analysis.resourcesRequired || '',
      suggestedMilestones: Array.isArray(analysis.suggestedMilestones)
        ? analysis.suggestedMilestones.map((m: Record<string, unknown>) => ({
            title: m.title || '',
            weeksFromStart: m.weeksFromStart || 4,
          }))
        : [],
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('AI objectives assist error:', error);
    return NextResponse.json({ error: 'Failed to generate objective assistance' }, { status: 500 });
  }
}
