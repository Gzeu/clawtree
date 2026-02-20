# Talent Tree

## Branches

| Branch | Unlock Condition | Nodes |
|---|---|---|
| 🌱 Foundation | Always unlocked | inception-oracle, skill-clawhub, clawguard, openclaw-skillscan, clawhub-publisher |
| 🌐 Web Intelligence | skill-clawhub installed | decodo, web-monitor, amadeus-hotels, web-intel-oracle |
| 🔗 Blockchain & Web3 | skill-clawhub installed | multiversx-wallet, nft-monitor, defi-tracker, on-chain-oracle |
| 🛡️ Security & Trust | clawguard installed | clawhub-blocklist, prime-skill-auditor, supply-chain-guard, trust-oracle |
| 🤖 AI & LLM | skill-clawhub installed | model-router, rag-pipeline, prompt-chain, multi-agent-orchestra |
| 📊 Data & Analytics | skill-clawhub installed | csv-processor, data-pipeline, analytics-engine, insight-oracle |
| ⚙️ DevOps & Infra | skill-clawhub installed | tautulli-monitor, rlm-controller, ci-guardian |
| 📡 Comms | skill-clawhub installed | comms-notifier, comms-router, comms-oracle |

## XP System

- Each skill use: +10 XP
- Chain bonus (compatible skills used together): +25 XP
- Evolution threshold: defined per node in `evolveAt`
- Evolution: T1 → T2 → T3 → T4 → T5 (max)

## Modes

- **AUTO**: agent recommends and installs based on usage
- **MANUAL**: user controls every install
- **HYBRID** (default): auto recommend, manual approve
