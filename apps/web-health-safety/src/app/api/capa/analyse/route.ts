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

  const { capaType, source, priority, problemStatement } = body;

  if (!problemStatement || problemStatement.length < 20) {
    return NextResponse.json(
      { error: 'Problem statement must be at least 20 characters' },
      { status: 400 }
    );
  }

  const systemPrompt = `You are an ISO 45001:2018 CAPA (Corrective and Preventive Action) expert using 5-Why root cause analysis methodology.

Given a problem statement, perform a structured CAPA analysis.

Respond ONLY with a JSON object — no markdown, no preamble — in this exact format:
{
  "rootCauseAnalysis": "5-Why root cause analysis result (show the chain of whys, 2-3 sentences)",
  "containmentActions": "Immediate containment actions to prevent further harm (2-3 actions separated by semicolons)",
  "correctiveActions": [
    { "title": "Corrective action 1", "owner": "Suggested role/department", "timeframe": "e.g. 1 week" },
    { "title": "Corrective action 2", "owner": "Suggested role/department", "timeframe": "e.g. 2 weeks" }
  ],
  "preventiveActions": [
    { "title": "Preventive action 1", "owner": "Suggested role/department", "timeframe": "e.g. 1 month" },
    { "title": "Preventive action 2", "owner": "Suggested role/department", "timeframe": "e.g. 3 months" }
  ],
  "successCriteria": "How to measure success of the CAPA (1-2 sentences)",
  "verificationMethod": "Method to verify effectiveness (1-2 sentences)"
}

Rules:
- Be specific to the problem described. Do not give generic advice.
- Corrective actions address the immediate problem and root cause.
- Preventive actions prevent similar problems from occurring elsewhere.
- Include 2-4 corrective actions and 1-3 preventive actions.
- Success criteria should be measurable and verifiable.
- Consider human factors, systems, procedures, and training.`;

  const userPrompt = [
    `Problem Statement: ${problemStatement}`,
    capaType ? `CAPA Type: ${capaType}` : '',
    source ? `Source: ${source}` : '',
    priority ? `Priority: ${priority}` : '',
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
        max_tokens: 1000,
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
      rootCauseAnalysis: analysis.rootCauseAnalysis || '',
      containmentActions: analysis.containmentActions || '',
      correctiveActions: Array.isArray(analysis.correctiveActions)
        ? analysis.correctiveActions.map((a: Record<string, unknown>) => ({
            title: a.title || '',
            owner: a.owner || '',
            timeframe: a.timeframe || '',
          }))
        : [],
      preventiveActions: Array.isArray(analysis.preventiveActions)
        ? analysis.preventiveActions.map((a: Record<string, unknown>) => ({
            title: a.title || '',
            owner: a.owner || '',
            timeframe: a.timeframe || '',
          }))
        : [],
      successCriteria: analysis.successCriteria || '',
      verificationMethod: analysis.verificationMethod || '',
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('AI CAPA analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyse CAPA' }, { status: 500 });
  }
}
