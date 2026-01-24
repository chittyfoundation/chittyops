/**
 * ChittyFoundation Hook Governance Primitives
 * 
 * Defines the canonical contracts for hooks across all ChittyOS organizations.
 * Implementation lives in ChittyOS/chittyops.
 */

class HookContract {
    constructor() {
        this.version = '1.0.0';
        this.types = ['git', 'terminal', 'custom'];
        this.lifecycle = ['pre', 'execute', 'post', 'error'];
    }

    validate(hook) {
        const errors = [];
        if (!this.types.includes(hook.type)) {
            errors.push(`Invalid hook type: ${hook.type}`);
        }
        if (!hook.name || typeof hook.name !== 'string') {
            errors.push('Hook must have a name');
        }
        return { valid: errors.length === 0, errors };
    }
}

module.exports = { HookContract };
