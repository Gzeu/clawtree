/**
 * InjectionHeuristics — lightweight prompt-injection detector.
 *
 * Scans skill metadata and user queries for patterns commonly used in
 * prompt-injection attacks. Not a silver bullet — use as a first line of defence.
 */

interface HeuristicResult {
  safe:       boolean;
  confidence: number;    // 0.0 – 1.0
  matches:    string[];  // Which patterns triggered
}

const INJECTION_PATTERNS: { pattern: RegExp; label: string; weight: number }[] = [
  { pattern: /ignore\s+(all\s+)?previous\s+instructions/i,    label: "ignore-instructions", weight: 0.9 },
  { pattern: /you\s+are\s+now\s+(a|an)\s+/i,                  label: "persona-override",    weight: 0.8 },
  { pattern: /disregard\s+(your\s+)?system\s+prompt/i,        label: "system-prompt-bypass", weight: 0.9 },
  { pattern: /do\s+not\s+follow\s+your\s+instructions/i,      label: "instruction-bypass",  weight: 0.85 },
  { pattern: /print\s+(your\s+)?(system\s+)?prompt/i,         label: "prompt-extraction",   weight: 0.8 },
  { pattern: /reveal\s+(your\s+)?(secret|password|api.?key)/i, label: "secret-extraction",  weight: 0.95 },
  { pattern: /execute\s+(the\s+following\s+)?command/i,       label: "command-injection",   weight: 0.7 },
  { pattern: /<\s*script[^>]*>/i,                              label: "script-tag",          weight: 0.6 },
  { pattern: /;\s*(rm|del|format|drop|truncate)\s+/i,         label: "destructive-command", weight: 0.95 },
  { pattern: /base64_decode|eval\s*\(/i,                       label: "code-eval",           weight: 0.8 },
];

const BLOCK_THRESHOLD   = 0.7;
const WARNING_THRESHOLD = 0.4;

/** Scan a text for prompt-injection patterns. */
export function scanForInjection(text: string): HeuristicResult {
  const matches: string[] = [];
  let totalWeight = 0;

  for (const { pattern, label, weight } of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      matches.push(label);
      totalWeight += weight;
    }
  }

  const confidence = Math.min(1, totalWeight);

  return {
    safe:       confidence < BLOCK_THRESHOLD,
    confidence,
    matches,
  };
}

/** Scan skill.json metadata fields for injection attempts. */
export function scanSkillMetadata(skillJson: Record<string, any>): HeuristicResult {
  const fieldsToCheck = [
    skillJson.name,
    skillJson.description,
    skillJson.author,
    JSON.stringify(skillJson.tags ?? []),
  ].filter(Boolean).join(" ");

  return scanForInjection(fieldsToCheck);
}

/** Returns a human-readable risk label. */
export function riskLabel(confidence: number): "safe" | "warning" | "blocked" {
  if (confidence < WARNING_THRESHOLD) return "safe";
  if (confidence < BLOCK_THRESHOLD)   return "warning";
  return "blocked";
}
