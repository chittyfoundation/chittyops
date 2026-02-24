---
uri: chittycanon://docs/ops/architecture/chitty-ops
namespace: chittycanon://docs/ops
type: summary
version: 1.0.0
status: DRAFT
registered_with: chittycanon://core/services/canon
title: "ChittyOps (Foundation)"
certifier: chittycanon://core/services/chittycertify
visibility: PUBLIC
---

# ChittyOps (Foundation)

> `chittycanon://core/services/chitty-ops` | Tier 1 (Core Identity) | ops.chitty.foundation

## What It Does

Foundation-level operational primitives, governance frameworks, and cross-organizational territory definitions. Defines the canonical contracts that CHITTYOS/chittyops implements. Foundation is upstream — water doesn't flow uphill.

## Architecture

Monorepo with publishable packages. Not a deployed service — provides contracts, standards, and SDK packages consumed by all organizations.

### Stack
- **Runtime**: Package library (not a deployed service)
- **Packages**: `packages/hookify`, `packages/territories`, `packages/chittycanon-client`

### Key Components
- `packages/hookify/` — Hook lifecycle contracts and governance policies
- `packages/territories/` — Cross-org territory definitions and coordination
- `packages/chittycanon-client/` — ChittyCanon client SDK

### Foundation → Implementation Flow
```
Foundation (this repo)
└── Defines: Governance, Contracts, Standards
        │
        ▼
CHITTYOS/chittyops
└── Implements: CI/CD, Deployments, Workflows
```

## Three Aspects (TY VY RY)

| Aspect | Abbrev | Answer |
|--------|--------|--------|
| **Identity** | TY | Foundation operational primitives — canonical hook contracts, territory governance |
| **Connectivity** | VY | Publishes hookify, territories, chittycanon-client packages; consumed by all orgs |
| **Authority** | RY | Tier 1 — defines contracts that downstream orgs implement; Foundation upstream |

## ChittyOS Ecosystem

### Certification
- **Badge**: ChittyOS Compatible
- **Certifier**: ChittyCertify (`chittycanon://core/services/chittycertify`)
- **Last Certified**: --

### ChittyDNA
- **ChittyID**: --
- **DNA Hash**: --
- **Lineage**: root (operational governance)

### Dependencies
| Service | Purpose |
|---------|---------|
| ChittyCanon | Canonical standards that ops primitives enforce |
| CHITTYOS/chittyops | Implements Foundation-defined contracts |
| ChittyGov | Business governance alignment |

### Packages
| Package | Purpose |
|---------|---------|
| `@chittyfoundation/hookify` | Hook lifecycle contracts |
| `@chittyfoundation/territories` | Territory governance |
| `@chittyfoundation/chittycanon-client` | ChittyCanon client SDK |

## Document Triad

This badge is part of a synchronized documentation triad. Changes to shared fields must propagate.

| Field | Canonical Source | Also In |
|-------|-----------------|---------|
| Canonical URI | CHARTER.md (Classification) | CHITTY.md (blockquote) |
| Tier | CHARTER.md (Classification) | CHITTY.md (blockquote) |
| Domain | CHARTER.md (Classification) | CHITTY.md (blockquote), CLAUDE.md (header) |
| Packages | CHARTER.md (Packages) | CHITTY.md (Packages table), CLAUDE.md (Architecture) |
| Dependencies | CHARTER.md (Dependencies) | CHITTY.md (Dependencies table), CLAUDE.md (Architecture) |
| Certification badge | CHITTY.md (Certification) | CHARTER.md frontmatter `status` |

**Related docs**: [CHARTER.md](CHARTER.md) (charter/policy) | [CLAUDE.md](CLAUDE.md) (developer guide)
