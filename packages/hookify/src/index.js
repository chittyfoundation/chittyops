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

class HookContract {
    constructor() {
        this.version = '1.0.0';
        this.canonicalSource = 'chittyfoundation/chittycanon';
        this.types = ['git', 'terminal', 'custom'];
        this.lifecycle = ['pre', 'execute', 'post', 'error'];
    }

    validate(hook) {
        const errors = [];
        
        // Validate against chittycanon conventions
        if (!this.validateCanonicalNaming(hook.name)) {
            errors.push(`Hook name '${hook.name}' does not follow chittycanon naming conventions`);
        }
        
        if (!this.types.includes(hook.type)) {
            errors.push(`Invalid hook type: ${hook.type}`);
        }
        if (!hook.name || typeof hook.name !== 'string') {
            errors.push('Hook must have a name');
        }
        return { valid: errors.length === 0, errors };
    }
    
    /**
     * Validate naming against chittycanon GOVERNANCE.md rules
     */
    validateCanonicalNaming(name) {
        // Per chittycanon: hyphenated lowercase for compound terms
        // Processes should be gerunds or nouns
        const validPattern = /^[a-z]+(-[a-z]+)*$/;
        return validPattern.test(name);
    }
}

module.exports = { HookContract };
