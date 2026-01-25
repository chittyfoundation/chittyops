/**
 * ChittyFoundation Territory Governance
 * 
 * Defines cross-organizational territories and their governance structures.
 * 
 * CANONICAL REFERENCE: chittyfoundation/chittycanon
 * All terms and structures defer to chittycanon specifications.
 */

class TerritoryContract {
    constructor() {
        this.version = '1.0.0';
        this.canonicalSource = 'chittyfoundation/chittycanon';
        
        // Territory definitions align with chittycanon CHARTER.md Section 2
        this.territories = {
            identity: { 
                owners: ['ChittyFoundation', 'ChittyOS'],
                canonicalRef: 'chittycanon/specs/CHITTYID.md',
                aspect: 'TY' // Identity aspect per chittycanon
            },
            registry: { 
                owners: ['ChittyFoundation', 'ChittyOS'],
                aspect: 'VY' // Connectivity aspect per chittycanon
            },
            ledger: { 
                owners: ['ChittyFoundation'],
                canonicalRef: 'chittycanon/CHARTER.md',
                aspect: 'RY' // Authority aspect per chittycanon
            },
            operations: { 
                owners: ['ChittyFoundation', 'ChittyOS'],
                aspect: 'VY' // Operational connectivity
            }
        };
    }
    
    getTerritory(name) {
        return this.territories[name] || null;
    }
    
    /**
     * Validate naming against chittycanon conventions
     */
    validateNaming(term, category) {
        // Per chittycanon GOVERNANCE.md - grammatical alignment
        const rules = {
            'Core Types': /^[A-Z][a-z]+$/, // Singular nouns
            'Aspects': /ty$|vy$|ry$/i, // Ends with aspect suffix
            'Structures': /^[A-Z][a-z]+$/, // Singular nouns (Ledger, Chain, Canon)
            'Qualities': /able$|ible$|ent$|ant$/i // Adjectives
        };
        
        const pattern = rules[category];
        if (!pattern) return { valid: true, note: 'No rule defined' };
        
        return {
            valid: pattern.test(term),
            rule: `Must match chittycanon pattern for ${category}`
        };
    }
}

module.exports = { TerritoryContract };
