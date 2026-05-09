/**
 * ChittyFoundation Hook Governance Primitives
 * 
 * Defines the canonical contracts for hooks across all ChittyOS organizations.
 * Implementation lives in ChittyOS/chittyops.
 * 
 * CANONICAL REFERENCE: chittyfoundation/chittycanon
 * - Naming follows chittycanon GOVERNANCE.md grammatical rules
 * - Principles defer to chittycanon CHARTER.md
 * - Terms validated against canonical definitions
 */

import { CanonClient } from '@chittyfoundation/chittycanon-client';

class HookContract {
    constructor(canonClient = null) {
        this.version = '1.0.0';
        this.canonicalSource = 'chittyfoundation/chittycanon';
        this.types = ['git', 'terminal', 'custom'];
        this.lifecycle = ['pre', 'execute', 'post', 'error'];
        
        // ChittyCanon API client for runtime validation
        this.canonClient = canonClient || new CanonClient(
            process.env.CHITTYCANON_API_URL || 'https://canon.chitty.cc'
        );
    }

    /**
     * Validate hook against foundation contracts
     * Now includes runtime validation against chittycanon database
     */
    async validate(hook) {
        const errors = [];
        
        // Basic validation
        if (!hook.name || typeof hook.name !== 'string') {
            errors.push('Hook must have a name');
        }
        if (!this.types.includes(hook.type)) {
            errors.push(`Invalid hook type: ${hook.type}`);
        }
        
        // Runtime validation against chittycanon
        if (hook.name) {
            const canonResult = await this.validateAgainstCanon(hook.name, hook.description);
            if (!canonResult.valid) {
                errors.push(...canonResult.errors);
            }
        }
        
        return { valid: errors.length === 0, errors };
    }
    
    /**
     * Validate naming against chittycanon database
     * Uses live API validation instead of static rules
     */
    async validateAgainstCanon(name, description = null) {
        try {
            const result = await this.canonClient.check(name, description, ['operations', 'automation', 'hooks']);
            
            // If term is canonical or provisional, it's valid
            if (result.canonical || result.provisional) {
                return { valid: true, errors: [], canonical: result.canonical };
            }
            
            // If API returned fallback (unavailable), use static validation
            if (result.fallback) {
                return this.validateCanonicalNamingStatic(name);
            }
            
            // Term not canonical - provide recommendations
            const errors = [`Hook name '${name}' is not canonical or provisional`];
            if (result.recommendations && result.recommendations.length > 0) {
                errors.push(`Recommendations: ${result.recommendations.join(', ')}`);
            }
            
            return { valid: false, errors };
        } catch (error) {
            console.warn(`ChittyCanon validation failed for '${name}', using static fallback:`, error.message);
            return this.validateCanonicalNamingStatic(name);
        }
    }
    
    /**
     * Static fallback validation (used when API unavailable)
     * Validates against chittycanon GOVERNANCE.md rules
     */
    validateCanonicalNamingStatic(name) {
        // Per chittycanon: hyphenated lowercase for compound terms
        // Processes should be gerunds or nouns
        const validPattern = /^[a-z]+(-[a-z]+)*$/;
        const valid = validPattern.test(name);
        
        return {
            valid,
            errors: valid ? [] : [`Hook name '${name}' does not follow chittycanon naming conventions (use hyphenated lowercase)`],
            fallback: true
        };
    }
    
    /**
     * Record observation of hook usage to chittycanon
     */
    async recordObservation(hookName, executionData) {
        try {
            await this.canonClient.recordObservation(hookName, {
                usage_type: executionData.success ? 'correct' : 'incorrect',
                service: 'chittyops',
                context: {
                    execution_time_ms: executionData.executionTime,
                    hook_type: executionData.type,
                    success: executionData.success
                },
                notes: executionData.notes
            });
        } catch (error) {
            console.warn(`Failed to record observation for '${hookName}':`, error.message);
        }
    }
}

class HookRegistry {
    constructor(canonClient = null) {
        this.hooks = new Map();
        this.hookContract = new HookContract(canonClient);
    }

    async register(hook) {
        const validation = await this.hookContract.validate(hook);
        if (!validation.valid) {
            throw new Error(`Hook validation failed: ${validation.errors.join(', ')}`);
        }
        this.hooks.set(hook.name, hook);
        return hook;
    }

    get(name) {
        return this.hooks.get(name);
    }

    getAll() {
        return Array.from(this.hooks.values());
    }
}

class HookGovernance {
    constructor(canonClient = null) {
        this.canonClient = canonClient || new CanonClient(
            process.env.CHITTYCANON_API_URL || 'https://canon.chitty.cc'
        );
        this.policies = {
            blocking: {
                'pre-commit': true,
                'pre-push': true,
                'post-commit': false,
                'post-push': false
            },
            timeout: {
                default: 30000,
                'pre-commit': 10000,
                'pre-push': 30000
            },
            priority: {
                'pre-commit': 10,
                'post-commit': 5,
                default: 1
            }
        };
    }

    async validateHookName(name, description = null) {
        const result = await this.canonClient.check(name, description, ['operations', 'automation', 'hooks']);
        return result;
    }

    async recordHookExecution(hookName, executionData) {
        await this.canonClient.recordObservation(hookName, {
            usage_type: executionData.success ? 'correct' : 'incorrect',
            service: 'chittyops',
            context: executionData.context,
            notes: executionData.notes
        });
    }

    getPolicy(hookName, policyType) {
        const policies = this.policies[policyType];
        return policies[hookName] || policies.default;
    }

    isBlocking(hookName) {
        return this.getPolicy(hookName, 'blocking');
    }

    getTimeout(hookName) {
        return this.getPolicy(hookName, 'timeout');
    }

    getPriority(hookName) {
        return this.getPolicy(hookName, 'priority');
    }
}

/**
 * Canonical deployment governance policies for ChittyOS workers.
 *
 * These contracts define the rules that all downstream CI/CD implementations
 * (CHITTYOS/chittyops) must enforce. Codified in response to the
 * chittyagent-tasks queue incident where a worker deployed at v1.2.0 ahead of
 * main referenced a `notify_policy` column that did not exist in the database
 * while a migration freeze was active.
 *
 * Cross-references:
 *   chittyfoundation/.chittyops#2  — ecosystem-governance incident
 *   chittyos/chittyops#45          — CI/CD drift angle + policy proposals
 */
class DeploymentGovernance {
    constructor() {
        // Canonical deployment governance policies.
        // enforcement: 'block' — CI must fail hard.
        // enforcement: 'alert' — CI/beacon must surface a warning.
        this.policies = {
            'deploy-from-main': {
                id: 'deploy-from-main',
                description: 'Deployments must only be executed from commits reachable from origin/main',
                enforcement: 'block',
                rationale: 'Prevents deployed workers from drifting ahead of the main branch'
            },
            'version-pin': {
                id: 'version-pin',
                description: 'CI must fail if the worker\'s declared version constant does not match the tag or commit that produced the deployment',
                enforcement: 'block',
                rationale: 'Ensures version constants are trustworthy and traceable'
            },
            'migration-freeze-interlock': {
                id: 'migration-freeze-interlock',
                description: 'If a worker repository carries a migration freeze notice, CI must refuse to deploy code that introduces new schema column references until the freeze is lifted',
                enforcement: 'block',
                rationale: 'Prevents schema drift between the deployed worker and its database'
            },
            'beacon-mismatch-alert': {
                id: 'beacon-mismatch-alert',
                description: 'ChittyBeacon must emit an alert when a deployed worker\'s reported version is not present in the git log on main',
                enforcement: 'alert',
                rationale: 'Provides early detection of deployment drift before it causes incidents'
            }
        };
    }

    /**
     * Return all deployment governance policies.
     * @returns {{ id: string, description: string, enforcement: string, rationale: string }[]}
     */
    getPolicies() {
        return Object.values(this.policies);
    }

    /**
     * Return a single policy by ID, or null if not found.
     * @param {string} policyId
     * @returns {Object|null}
     */
    getPolicy(policyId) {
        return this.policies[policyId] || null;
    }

    /**
     * Evaluate a pending deployment against all blocking governance policies.
     *
     * @param {Object}  deployment
     * @param {boolean} deployment.onMain              - Commit is reachable from origin/main
     * @param {boolean} deployment.versionMatches      - Declared version matches the tag/commit
     * @param {boolean} deployment.migrationFreezeActive - A migration freeze notice is present
     * @param {boolean} deployment.addsNewColumnRefs   - Deployment adds new schema column references
     * @returns {{ allowed: boolean, violations: { policy: string, severity: string, message: string }[], blocked: { policy: string, severity: string, message: string }[] }}
     */
    checkDeployment(deployment) {
        const violations = [];

        if (!deployment.onMain) {
            violations.push({
                policy: 'deploy-from-main',
                severity: 'block',
                message: 'Deployment commit is not reachable from origin/main'
            });
        }

        if (!deployment.versionMatches) {
            violations.push({
                policy: 'version-pin',
                severity: 'block',
                message: 'Declared worker version does not match the tag/commit producing this deployment'
            });
        }

        if (deployment.migrationFreezeActive && deployment.addsNewColumnRefs) {
            violations.push({
                policy: 'migration-freeze-interlock',
                severity: 'block',
                message: 'Migration freeze is active but deployment introduces new schema column references'
            });
        }

        const blocked = violations.filter(v => v.severity === 'block');

        return {
            allowed: blocked.length === 0,
            violations,
            blocked
        };
    }
}

export { HookContract, HookRegistry, HookGovernance, DeploymentGovernance };

