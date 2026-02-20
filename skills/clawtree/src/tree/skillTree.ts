// Core type definitions for the Talent Tree

export type SkillStatus = "locked" | "available" | "installed" | "evolved" | "mastered";
export type TreeMode    = "auto" | "manual" | "hybrid";

export interface SkillNode {
  slug:          string;
  name:          string;
  description:   string;
  tier:          number;          // 1–5
  status:        SkillStatus;
  xp:            number;          // total XP earned
  usageCount:    number;          // raw usage count
  evolveAt:      number;          // usage count threshold for evolution
  prerequisites: string[];        // slugs that must be installed first
  unlocks:       string[];        // slugs this node unlocks
  chainsWith:    string[];        // compatible for chain bonus
}

export interface Branch {
  name:   string;
  label:  string;                 // display label with emoji
  nodes:  SkillNode[];
}

export interface TalentTree {
  version:  string;
  mode:     TreeMode;
  totalXP:  number;
  branches: Record<string, Branch>;
}

// ── DEFAULT TREE DEFINITION ───────────────────────────────────────────────────

export function defaultTree(): TalentTree {
  return {
    version:  "1.0.0",
    mode:     "hybrid",
    totalXP:  0,
    branches: {
      foundation: {
        name:  "foundation",
        label: "🌱 Foundation",
        nodes: [
          node("clawtree",             "ClawTree",              "Meta-skill: manages the talent tree itself",             1, "installed", 5,  [], [], ["skill-clawhub", "clawguard"]),
          node("skill-clawhub",         "ClawHub CLI",           "Install, update and publish skills via ClawHub CLI",     1, "available", 10, ["clawtree"],      ["clawhub-publisher"],                ["clawtree"]),
          node("clawguard",             "ClawGuard",             "Real-time security scanner for installed skills",        2, "available", 15, ["clawtree"],      ["openclaw-skillscan", "clawhub-blocklist"], ["clawtree"]),
          node("openclaw-skillscan",    "SkillScan Static",      "Static analysis and dependency audit for skills",        3, "locked",    20, ["clawguard"],     [],                                  ["clawguard"]),
          node("clawhub-publisher",     "ClawHub Publisher",     "Automated publish pipeline to ClawHub registry",        4, "locked",    30, ["skill-clawhub"], [],                                  ["skill-clawhub"]),
        ],
      },
      web: {
        name:  "web",
        label: "🌐 Web Intelligence",
        nodes: [
          node("decodo",               "Decodo Scraper",        "Headless web scraping with anti-bot bypass",            1, "locked", 15, ["skill-clawhub"], ["web-monitor"],      ["web-monitor", "rag-pipeline"]),
          node("web-monitor",           "Web Monitor",           "Track page changes and alert on updates",                2, "locked", 20, ["decodo"],        ["web-intel-oracle"], ["comms-notifier"]),
          node("amadeus-hotels",        "Amadeus Hotels",        "Hotel search and availability via Amadeus API",          2, "locked", 20, ["skill-clawhub"], [],                  []),
          node("web-intel-oracle",      "Web Intel Oracle",      "Synthesize web signals into actionable intelligence",    4, "locked", 40, ["web-monitor"],   [],                  ["insight-oracle"]),
        ],
      },
      blockchain: {
        name:  "blockchain",
        label: "🔗 Blockchain & Web3",
        nodes: [
          node("multiversx-wallet",     "MultiversX Wallet",     "Query balances, transactions on MultiversX",             1, "locked", 15, ["skill-clawhub"], ["nft-monitor"],     ["on-chain-oracle"]),
          node("nft-monitor",           "NFT Monitor xPortal",   "Track NFT collection activity and floor prices",         2, "locked", 20, ["multiversx-wallet"], ["defi-tracker"], ["comms-notifier"]),
          node("defi-tracker",          "DeFi Tracker",          "Monitor DeFi positions, yields and liquidations",        3, "locked", 25, ["nft-monitor"],   ["on-chain-oracle"], ["analytics-engine"]),
          node("on-chain-oracle",       "On-Chain Oracle",       "Aggregate on-chain data into structured insights",       5, "locked", 50, ["defi-tracker"],  [],                  ["insight-oracle"]),
        ],
      },
      security: {
        name:  "security",
        label: "🛡️ Security & Trust",
        nodes: [
          node("clawhub-blocklist",     "ClawHub Blocklist",     "Block known malicious skills and authors",               1, "locked", 10, ["clawguard"],           [], ["clawguard"]),
          node("prime-skill-auditor",   "Prime Skill Auditor",   "Deep security audit of skill permissions and code",      2, "locked", 20, ["clawhub-blocklist"],   [], ["openclaw-skillscan"]),
          node("supply-chain-guard",    "Supply Chain Guard",    "Detect compromised dependencies in skill packages",      4, "locked", 35, ["prime-skill-auditor"],[], []),
          node("trust-oracle",          "Trust Oracle",          "Unified trust score per skill and author",               5, "locked", 50, ["supply-chain-guard"],  [], ["clawhub-publisher"]),
        ],
      },
      ai: {
        name:  "ai",
        label: "🤖 AI & LLM",
        nodes: [
          node("model-router",          "Model Router",          "Route prompts to optimal LLM based on task type",        1, "locked", 15, ["skill-clawhub"], ["rag-pipeline"],     ["prompt-chain"]),
          node("rag-pipeline",          "RAG Pipeline",          "Retrieval-augmented generation with local vector store",  2, "locked", 25, ["model-router"],  ["prompt-chain"],     ["decodo"]),
          node("prompt-chain",          "Prompt Chain",          "Sequential multi-step prompt orchestration",             3, "locked", 30, ["rag-pipeline"],  ["multi-agent-orchestra"], ["model-router"]),
          node("multi-agent-orchestra", "Multi-Agent Orchestra", "Coordinate multiple OpenClaw agents in parallel",        5, "locked", 60, ["prompt-chain"],  [],                  ["clawtree"]),
        ],
      },
      data: {
        name:  "data",
        label: "📊 Data & Analytics",
        nodes: [
          node("csv-processor",         "CSV Processor",         "Parse, transform and validate CSV/JSON datasets",         1, "locked", 10, ["skill-clawhub"], ["data-pipeline"],    ["analytics-engine"]),
          node("data-pipeline",         "Data Pipeline",         "ETL pipeline builder with scheduling support",            2, "locked", 20, ["csv-processor"],  ["analytics-engine"], ["csv-processor"]),
          node("analytics-engine",      "Analytics Engine",      "Statistical analysis and trend detection",               3, "locked", 30, ["data-pipeline"],  ["insight-oracle"],   ["on-chain-oracle"]),
          node("insight-oracle",        "Insight Oracle",        "Synthesize analytics into human-readable briefings",      5, "locked", 50, ["analytics-engine"],[], ["comms-oracle", "web-intel-oracle"]),
        ],
      },
      devops: {
        name:  "devops",
        label: "⚙️ DevOps & Infra",
        nodes: [
          node("tautulli-monitor",      "Tautulli Monitor",      "Monitor Plex media server stats and playback",            1, "locked", 10, ["skill-clawhub"], ["rlm-controller"],   []),
          node("rlm-controller",        "RLM Controller",        "Rate-limit manager for multi-agent API calls",            2, "locked", 20, ["tautulli-monitor"],[], ["multi-agent-orchestra"]),
          node("ci-guardian",           "CI Guardian",           "Block deploys if skill tests or audits fail",             4, "locked", 35, ["rlm-controller"],  [], ["clawhub-publisher"]),
        ],
      },
      comms: {
        name:  "comms",
        label: "📡 Comms",
        nodes: [
          node("comms-notifier",        "Comms Notifier",        "Send alerts via Telegram, Discord, email",                1, "locked", 10, ["skill-clawhub"], ["comms-router"],     ["nft-monitor", "web-monitor"]),
          node("comms-router",          "Comms Router",          "Route notifications by priority and channel",             2, "locked", 20, ["comms-notifier"],  ["comms-oracle"],     ["comms-notifier"]),
          node("comms-oracle",          "Comms Oracle",          "Compose and schedule digest communications",              4, "locked", 40, ["comms-router"],    [],                  ["insight-oracle"]),
        ],
      },
    },
  };
}

function node(
  slug:     string, name:    string, description: string,
  tier:     number, status:  SkillStatus, evolveAt: number,
  prerequisites: string[], unlocks: string[], chainsWith: string[]
): SkillNode {
  return { slug, name, description, tier, status, xp: 0, usageCount: 0, evolveAt, prerequisites, unlocks, chainsWith };
}
