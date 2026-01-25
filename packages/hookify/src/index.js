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

export { HookContract, HookRegistry, HookGovernance };

