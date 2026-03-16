# CLAUDE.md

## Project Overview

ChittyOps (Foundation) provides canonical operational primitives and governance frameworks that all ChittyOS organizations reference and implement. It is a monorepo of publishable packages defining hook lifecycle contracts, cross-organizational territory governance, and the ChittyCanon client SDK. This is NOT a deployed service -- it provides contracts and standards consumed by downstream implementations (CHITTYOS/chittyops handles CI/CD and deployment execution).

**Repo:** `CHITTYFOUNDATION/chittyops`
**Type:** Package monorepo (not a deployed service)
**Stack:** Node.js, npm workspaces
**Canonical URI:** `chittycanon://core/services/chitty-ops` | Tier 1

## Common Commands

```bash
npm run build    # Build all workspace packages
npm test         # Run tests across all workspace packages
npm run lint     # ESLint across all packages (packages/*/src)
```

Per-package commands (run from package directory):
```bash
cd packages/hookify && npm test        # Test hookify package
cd packages/territories && npm test    # Test territories package
```

## Architecture

npm workspaces monorepo with three publishable packages. Defines the Foundation-level governance contracts that CHITTYOS/chittyops implements.

### Foundation -> Implementation Flow

```
Foundation (this repo)
+-- Defines: Governance, Contracts, Standards
        |
        v
CHITTYOS/chittyops
+-- Implements: CI/CD, Deployments, Workflows
```

### Packages

| Package | Path | Purpose |
|---------|------|---------|
| `@chittyfoundation/hookify` | `packages/hookify/` | Hook lifecycle contracts and governance policies |
| `@chittyfoundation/territories` | `packages/territories/` | Cross-organizational territory definitions and coordination contracts |
| `@chittyfoundation/chittycanon-client` | `packages/chittycanon-client/` | ChittyCanon API client SDK |

### Package Dependencies

- `hookify` depends on `@chittyfoundation/chittycanon-client` (file reference)
- `territories` depends on `@chittyfoundation/chittycanon-client` (file reference)
- `chittycanon-client` has no internal dependencies

### Territory Definitions

| Territory | Owners | Services |
|-----------|--------|----------|
| Identity | Foundation + ChittyOS | ChittyID, ChittyAuth |
| Registry | Foundation + ChittyOS | ChittyRegistry, ChittySchema |
| Ledger | Foundation | ChittyLedger, ChittyChain, ChittyCanon |
| Operations | Foundation (governance) + ChittyOS (implementation) | ChittyOps, ChittyConnect |

## Key Files

- `package.json` -- Root workspace configuration
- `packages/hookify/src/index.js` -- Hook lifecycle contracts entry
- `packages/hookify/package.json` -- Hookify package definition
- `packages/territories/src/index.js` -- Territory governance entry
- `packages/territories/package.json` -- Territories package definition
- `packages/chittycanon-client/src/index.js` -- ChittyCanon client SDK entry
- `packages/chittycanon-client/package.json` -- Client SDK package definition
- `CHARTER.md` -- Service charter (Foundation governance scope)
- `CHITTY.md` -- Architecture one-pager

## Related Services

- **ChittyCanon** -- Canonical standards that ops primitives enforce (upstream)
- **CHITTYOS/chittyops** -- Implements Foundation-defined contracts (downstream)
- **ChittyGov** -- Business governance alignment (peer)
- **All Organizations** -- Consume operational primitives (downstream)
