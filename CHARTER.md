---
uri: chittycanon://docs/ops/policy/chitty-ops-charter
namespace: chittycanon://docs/ops
type: policy
version: 1.0.0
status: DRAFT
registered_with: chittycanon://core/services/canon
title: "ChittyOps (Foundation) Charter"
certifier: chittycanon://core/services/chittycertify
visibility: PUBLIC
---

# ChittyOps (Foundation) Charter

## Classification
- **Canonical URI**: `chittycanon://core/services/chitty-ops`
- **Tier**: 1 (Core Identity)
- **Organization**: CHITTYFOUNDATION
- **Domain**: ops.chitty.foundation

## Mission

ChittyOps (Foundation) provides **canonical operational primitives** and **governance frameworks** that all ChittyOS organizations reference and implement. It defines hook lifecycle contracts, territory governance, and cross-organizational coordination standards. This is the Foundation governance layer — implementation lives in CHITTYOS/chittyops.

## Scope

### IS Responsible For
- Hook lifecycle contracts and governance policies (`@chittyfoundation/hookify`)
- Cross-organizational territory definitions (`@chittyfoundation/territories`)
- Operational governance standards
- Canonical process definitions
- ChittyCanon client SDK (`packages/chittycanon-client`)

### IS NOT Responsible For
- CI/CD pipeline implementation (CHITTYOS/chittyops)
- Deployment execution (CHITTYOS/chittyops)
- Operational workflow execution (CHITTYOS/chittyops)
- Service monitoring (ChittyMonitor)

## Three Aspects (TY VY RY)

Source: `chittycanon://gov/governance#three-aspects`

| Aspect | Abbrev | Question | ChittyOps Answer |
|--------|--------|----------|------------------|
| **Identity** | TY | What IS it? | Foundation operational primitives — canonical hook contracts, territory governance, cross-org standards |
| **Connectivity** | VY | How does it ACT? | Publishes `@chittyfoundation/hookify`, `@chittyfoundation/territories`, `@chittyfoundation/chittycanon-client` packages; consumed by all orgs |
| **Authority** | RY | Where does it SIT? | Tier 1 Core Identity — defines the contracts that CHITTYOS/chittyops implements; Foundation is upstream, implementation is downstream |

## Dependencies

| Type | Service | Purpose |
|------|---------|---------|
| Upstream | ChittyCanon | Canonical standards that ops primitives enforce |
| Downstream | CHITTYOS/chittyops | Implements Foundation-defined contracts |
| Downstream | All Organizations | Consume operational primitives |
| Peer | ChittyGov | Business governance alignment |

## Packages

| Package | Purpose |
|---------|---------|
| `@chittyfoundation/hookify` | Hook lifecycle contracts, governance policies |
| `@chittyfoundation/territories` | Cross-org territory definitions, coordination contracts |
| `@chittyfoundation/chittycanon-client` | ChittyCanon client SDK |

## Territories

| Territory | Owners | Services |
|-----------|--------|----------|
| Identity | Foundation + ChittyOS | ChittyID, ChittyAuth |
| Registry | Foundation + ChittyOS | ChittyRegistry, ChittySchema |
| Ledger | Foundation | ChittyLedger, ChittyChain, ChittyCanon |
| Operations | Foundation (governance) + ChittyOS (implementation) | ChittyOps, ChittyConnect |

## Ownership

| Role | Owner |
|------|-------|
| Service Owner | ChittyFoundation |
| Technical Lead | @chittyos-infrastructure |
| Contact | ops@chitty.foundation |

## Compliance

- [ ] Service registered in ChittyRegistry
- [ ] CLAUDE.md development guide present
- [ ] CHITTY.md badge/one-pager present
- [ ] Package publishing pipeline functional

## Document Triad

This charter is part of a synchronized documentation triad. Changes to shared fields must propagate.

| Field | Canonical Source | Also In |
|-------|-----------------|---------|
| Canonical URI | CHARTER.md (Classification) | CHITTY.md (blockquote) |
| Tier | CHARTER.md (Classification) | CHITTY.md (blockquote) |
| Domain | CHARTER.md (Classification) | CHITTY.md (blockquote), CLAUDE.md (header) |
| Packages | CHARTER.md (Packages) | CHITTY.md (Packages table), CLAUDE.md (Architecture) |
| Dependencies | CHARTER.md (Dependencies) | CHITTY.md (Dependencies table), CLAUDE.md (Architecture) |
| Certification badge | CHITTY.md (Certification) | CHARTER.md frontmatter `status` |

**Related docs**: [CHITTY.md](CHITTY.md) (badge/one-pager) | [CLAUDE.md](CLAUDE.md) (developer guide)

---
*Charter Version: 1.0.0 | Last Updated: 2026-02-23*
