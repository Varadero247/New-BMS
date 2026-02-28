import { AIThreatType, ThreatScore } from './types';

export { AIThreatType, ThreatScore };

export class AIThreatClassifier {
  classify(input: string): ThreatScore {
    const scores: Partial<Record<AIThreatType, number>> = {};
    const indicators: string[] = [];

    let injScore = 0;
    if (/ignore.*instructions/i.test(input)) { injScore += 40; indicators.push('instruction_override'); }
    if (/you are now/i.test(input)) { injScore += 30; indicators.push('identity_override'); }
    if (/jailbreak/i.test(input)) { injScore += 50; indicators.push('jailbreak_keyword'); }
    if (/<script/i.test(input)) { injScore += 30; indicators.push('script_injection'); }
    if (/disregard.*(previous|all|above)/i.test(input)) { injScore += 40; indicators.push('disregard_instructions'); }
    if (/forget.*(everything|all|previous)/i.test(input)) { injScore += 30; indicators.push('forget_instructions'); }
    if (/new\s+(system\s+)?prompt:/i.test(input)) { injScore += 40; indicators.push('prompt_override'); }
    if (/\[system\]/i.test(input)) { injScore += 30; indicators.push('system_tag'); }
    if (/override.*(safety|guidelines|restrictions)/i.test(input)) { injScore += 40; indicators.push('safety_override'); }
    if (/dan\s+mode/i.test(input)) { injScore += 50; indicators.push('dan_mode'); }
    if (/developer\s+mode/i.test(input)) { injScore += 30; indicators.push('developer_mode'); }
    if (/act\s+as\s+(if|a|an)/i.test(input)) { injScore += 25; indicators.push('act_as'); }
    if (/pretend\s+(you\s+are|to\s+be)/i.test(input)) { injScore += 25; indicators.push('pretend'); }
    if (/simulate\s+being/i.test(input)) { injScore += 20; indicators.push('simulate'); }
    if (/roleplay\s+as/i.test(input)) { injScore += 20; indicators.push('roleplay'); }
    if (/javascript\s*:/i.test(input)) { injScore += 30; indicators.push('js_injection'); }
    if (/eval\s*\(/i.test(input)) { injScore += 30; indicators.push('eval_injection'); }
    if (/exec\s*\(/i.test(input)) { injScore += 30; indicators.push('exec_injection'); }
    if (/on(load|error|click|submit)\s*=/i.test(input)) { injScore += 25; indicators.push('event_injection'); }
    if (/export\s+all/i.test(input)) { injScore += 40; indicators.push('bulk_export_injection'); }
    scores['PROMPT_INJECTION'] = Math.min(100, injScore);

    let exfilScore = 0;
    if (/send.*@.*\./i.test(input)) { exfilScore += 60; indicators.push('email_exfil'); }
    if (/export all/i.test(input)) { exfilScore += 40; indicators.push('bulk_export'); }
    if (/dump.*database/i.test(input)) { exfilScore += 60; indicators.push('db_dump'); }
    if (/list\s+all\s+(users?|records?|passwords?|keys?)/i.test(input)) { exfilScore += 40; indicators.push('list_sensitive'); }
    if (/reveal.*(secrets?|data|keys?)/i.test(input)) { exfilScore += 50; indicators.push('reveal_data'); }
    if (/repeat.*(training|system)\s+prompt/i.test(input)) { exfilScore += 30; indicators.push('prompt_extraction'); }
    if (/show\s+me.*(system\s+)?prompt/i.test(input)) { exfilScore += 30; indicators.push('show_prompt'); }
    if (/print.*(system|initial).*(prompt|instructions)/i.test(input)) { exfilScore += 30; indicators.push('print_prompt'); }
    if (/output.*full.*(system\s+)?prompt/i.test(input)) { exfilScore += 30; indicators.push('output_prompt'); }
    if (/list\s+all\s+records/i.test(input)) { exfilScore += 25; indicators.push('list_records'); }
    scores['MODEL_INVERSION'] = Math.min(100, exfilScore);

    let costScore = 0;
    if (input.length > 40000) { costScore += 40; indicators.push('large_input'); }
    if (/repeat\s+\d+\s+times/i.test(input)) { costScore += 50; indicators.push('repetition_abuse'); }
    scores['COST_ABUSE'] = Math.min(100, costScore);

    let hallScore = 0;
    const lowConf = ['maybe', 'possibly', 'might', 'could be', 'not sure'];
    const matches = lowConf.filter(w => input.toLowerCase().includes(w));
    hallScore = matches.length * 15;
    scores['HALLUCINATION'] = Math.min(100, hallScore);

    const maxEntry = Object.entries(scores).reduce(
      (best, [type, score]) => (score > best.score ? { type: type as AIThreatType, score } : best),
      { type: 'UNKNOWN' as AIThreatType, score: 0 }
    );

    const totalScore = maxEntry.score;
    const severity = totalScore >= 80 ? 'CRITICAL' : totalScore >= 60 ? 'HIGH' : totalScore >= 30 ? 'MEDIUM' : 'LOW';
    const action = totalScore >= 80 ? 'BLOCK' : totalScore >= 60 ? 'CHALLENGE' : totalScore >= 30 ? 'MONITOR' : 'ALLOW';

    return {
      type: maxEntry.type,
      score: totalScore,
      confidence: Math.min(1, totalScore / 100),
      indicators,
      severity,
      action,
    };
  }

  classifyBatch(inputs: string[]): ThreatScore[] {
    return inputs.map(i => this.classify(i));
  }

  getHighestThreat(scores: ThreatScore[]): ThreatScore | null {
    if (scores.length === 0) return null;
    return scores.reduce((best, s) => (s.score > best.score ? s : best));
  }

  isSafeToProcess(score: ThreatScore): boolean {
    return score.action === 'ALLOW' || score.action === 'MONITOR';
  }
}
