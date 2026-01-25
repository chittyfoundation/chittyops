/**
 * ChittyFoundation Territory Governance
 * 
 * Defines cross-organizational territories and their governance structures.
 * Loads territory definitions from chittycanon database at runtime.
 * 
 * CANONICAL REFERENCE: chittyfoundation/chittycanon
 * All terms and structures defer to chittycanon specifications.
 */

import { CanonClient } from '@chittyfoundation/chittycanon-client';

// Static fallback territories (used when API unavailable)
const FALLBACK_TERRITORIES = [
    { 
        name: 'identity',
        owners: ['ChittyFoundation', 'ChittyOS'],
        canonicalRef: 'chittycanon/specs/CHITTYID.md',
        aspect: 'TY', // Identity aspect per chittycanon
        domain: ['identity', 'authentication']
    },
    { 
        name: 'registry',
        owners: ['ChittyFoundation', 'ChittyOS'],
        aspect: 'VY', // Connectivity aspect per chittycanon
        domain: ['registry', 'discovery']
    },
    { 
        name: 'ledger',
        owners: ['ChittyFoundation'],
        canonicalRef: 'chittycanon/CHARTER.md',
        aspect: 'RY', // Authority aspect per chittycanon
        domain: ['ledger', 'accounting']
    },
    { 
        name: 'operations',
        owners: ['ChittyFoundation', 'ChittyOS'],
        aspect: 'VY', // Operational connectivity
        domain: ['operations', 'automation']
    },
    { 
        name: 'finance',
        owners: ['ChittyCorp'],
        aspect: 'RY',
        domain: ['finance', 'treasury']
    },
    { 
        name: 'legal',
        owners: ['ChittyCorp'],
        aspect: 'RY',
        domain: ['legal', 'compliance']
    }
];

class TerritoryContract {
    constructor(canonClient = null) {
        this.version = '1.0.0';
        this.canonicalSource = 'chittyfoundation/chittycanon';
        
        // ChittyCanon API client
        this.canonClient = canonClient || new CanonClient(
            process.env.CHITTYCANON_API_URL || 'https://canon.chitty.cc'
        );
        
        // Cached territories
        this.territoriesCache = null;
        this.cacheTimestamp = null;
        this.cacheTTL = 300000; // 5 minutes
    }
    
    /**
     * Load territories from chittycanon database
     * Falls back to static definitions if unavailable
     */
    async loadTerritories() {
        // Check cache
        if (this.territoriesCache && this.cacheTimestamp) {
            const age = Date.now() - this.cacheTimestamp;
            if (age < this.cacheTTL) {
                return this.territoriesCache;
            }
        }
        
        try {
            // Query chittycanon for territory terms
            const result = await this.canonClient.getTerms({
                domain: 'governance',
                stage: 'canonical',
                limit: 100
            });
            
            if (result.error || result.fallback || !result.terms || result.terms.length === 0) {
                console.warn('ChittyCanon territories unavailable, using fallback');
                this.territoriesCache = FALLBACK_TERRITORIES;
                return this.territoriesCache;
            }
            
            // Filter for territory-related terms
            const territories = result.terms
                .filter(t => t.domain && (t.domain.includes('governance') || t.domain.includes('territory')))
                .map(t => this._mapTermToTerritory(t));
            
            // If no territories found, use fallback
            if (territories.length === 0) {
                console.warn('No territories found in chittycanon, using fallback');
                this.territoriesCache = FALLBACK_TERRITORIES;
            } else {
                this.territoriesCache = territories;
            }
            
            this.cacheTimestamp = Date.now();
            return this.territoriesCache;
            
        } catch (error) {
            console.warn('Failed to load territories from chittycanon:', error.message);
            this.territoriesCache = FALLBACK_TERRITORIES;
            return this.territoriesCache;
        }
    }
    
    /**
     * Get territory by name (async - loads from canon if needed)
     */
    async getTerritory(name) {
        const territories = await this.loadTerritories();
        return territories.find(t => t.name === name) || null;
    }
    
    /**
     * Get all territories
     */
    async getAllTerritories() {
        return await this.loadTerritories();
    }
    
    /**
     * Synchronous territory lookup (uses cache or fallback)
     */
    getTerritorySync(name) {
        const territories = this.territoriesCache || FALLBACK_TERRITORIES;
        return territories.find(t => t.name === name) || null;
    }
    
    /**
     * Map chittycanon term to territory structure
     */
    _mapTermToTerritory(term) {
        // Extract territory data from term metadata
        return {
            name: term.name,
            owners: term.metadata?.owners || [],
            aspect: term.metadata?.aspect || 'VY',
            domain: term.domain || [],
            canonicalRef: term.metadata?.reference || null,
            term_id: term.term_id
        };
    }
    
    /**
     * Validate naming against chittycanon conventions
     */
    async validateNaming(term, category) {
        try {
            const result = await this.canonClient.check(term, null, ['governance', 'territory']);
            
            if (result.canonical || result.provisional) {
                return { valid: true, canonical: result.canonical };
            }
            
            return {
                valid: false,
                rule: result.recommendations?.join(', ') || 'Term not canonical',
                recommendations: result.recommendations
            };
        } catch (error) {
            console.warn('ChittyCanon naming validation failed, using static rules:', error.message);
            return this._validateNamingStatic(term, category);
        }
    }
    
    /**
     * Static fallback naming validation
     */
    _validateNamingStatic(term, category) {
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
            rule: `Must match chittycanon pattern for ${category}`,
            fallback: true
        };
    }
    
    /**
     * Clear territory cache (force reload)
     */
    clearCache() {
        this.territoriesCache = null;
        this.cacheTimestamp = null;
    }
}

export { TerritoryContract, FALLBACK_TERRITORIES };

