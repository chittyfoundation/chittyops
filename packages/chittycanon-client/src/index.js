/**
 * ChittyCanon API Client
 * 
 * Lightweight client for interacting with the ChittyCanon ontology governance service.
 * Provides term validation, collision detection, and observation reporting.
 * 
 * Canonical Authority: chittycanon://service/canon
 * Service URI: https://canon.chitty.cc
 * 
 * References:
 * - chittyfoundation/chittycanon/CHARTER.md - Canon authority
 * - chittyfoundation/chittycanon/specs/ONTOLOGY_LIFECYCLE.md - Term lifecycle
 * - chittyfoundation/chittycanon/GOVERNANCE.md - Grammatical rules
 */

/**
 * ChittyCanon API Client
 */
export class CanonClient {
  /**
   * @param {string} baseUrl - Base URL for ChittyCanon API (default: https://canon.chitty.cc)
   * @param {Object} options - Client options
   * @param {number} options.cacheTTL - Cache TTL in seconds (default: 300)
   * @param {boolean} options.enableCache - Enable in-memory caching (default: true)
   * @param {number} options.timeout - Request timeout in ms (default: 5000)
   * @param {number} options.retries - Number of retries (default: 2)
   */
  constructor(baseUrl = 'https://canon.chitty.cc', options = {}) {
    this.baseUrl = baseUrl;
    this.cacheTTL = options.cacheTTL || 300;
    this.enableCache = options.enableCache !== false;
    this.timeout = options.timeout || 5000;
    this.retries = options.retries || 2;
    
    // In-memory cache
    this.cache = new Map();
  }

  /**
   * Check if a term is canonical, provisional, or needs validation
   * @param {string} term - Term to check
   * @param {string} definition - Optional definition
   * @param {string[]} domain - Optional domain array
   * @returns {Promise<Object>} Validation result
   */
  async check(term, definition = null, domain = null) {
    const cacheKey = `check:${term}:${definition}:${domain?.join(',')}`;
    
    // Check cache
    if (this.enableCache) {
      const cached = this._getFromCache(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this._fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term, definition, domain })
      });

      if (!response.ok) {
        throw new Error(`ChittyCanon API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      // Cache result
      if (this.enableCache) {
        this._setCache(cacheKey, result);
      }

      return result;
    } catch (error) {
      console.warn(`ChittyCanon check failed for '${term}':`, error.message);
      // Return fallback result
      return {
        term,
        canonical: false,
        provisional: false,
        error: error.message,
        recommendations: [`Unable to validate '${term}' - ChittyCanon API unavailable`],
        fallback: true
      };
    }
  }

  /**
   * Get terms from the ontology
   * @param {Object} filters - Query filters
   * @param {string} filters.stage - Filter by stage (canonical, provisional, etc.)
   * @param {string} filters.domain - Filter by domain
   * @param {number} filters.limit - Result limit (default: 50)
   * @returns {Promise<Object>} Terms list
   */
  async getTerms(filters = {}) {
    const cacheKey = `terms:${JSON.stringify(filters)}`;
    
    // Check cache
    if (this.enableCache) {
      const cached = this._getFromCache(cacheKey);
      if (cached) return cached;
    }

    const params = new URLSearchParams();
    if (filters.stage) params.append('stage', filters.stage);
    if (filters.domain) params.append('domain', filters.domain);
    if (filters.limit) params.append('limit', filters.limit.toString());

    try {
      const response = await this._fetch(`/api/terms?${params}`);

      if (!response.ok) {
        throw new Error(`ChittyCanon API error: ${response.status}`);
      }

      const result = await response.json();
      
      // Cache result
      if (this.enableCache) {
        this._setCache(cacheKey, result);
      }

      return result;
    } catch (error) {
      console.warn('ChittyCanon getTerms failed:', error.message);
      return { terms: [], count: 0, error: error.message, fallback: true };
    }
  }

  /**
   * Get a single term by ID or name
   * @param {string} id - Term ID or name
   * @returns {Promise<Object|null>} Term object or null
   */
  async getTerm(id) {
    const cacheKey = `term:${id}`;
    
    // Check cache
    if (this.enableCache) {
      const cached = this._getFromCache(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this._fetch(`/api/terms/${encodeURIComponent(id)}`);

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`ChittyCanon API error: ${response.status}`);
      }

      const result = await response.json();
      
      // Cache result
      if (this.enableCache) {
        this._setCache(cacheKey, result);
      }

      return result;
    } catch (error) {
      console.warn(`ChittyCanon getTerm failed for '${id}':`, error.message);
      return null;
    }
  }

  /**
   * Record an observation for a term
   * @param {string} termId - Term ID or name
   * @param {Object} observation - Observation data
   * @param {string} observation.usage_type - Usage type: 'correct', 'incorrect', 'confused'
   * @param {string} observation.service - Service reporting the observation
   * @param {Object} observation.context - Optional context data
   * @param {string} observation.notes - Optional notes
   * @returns {Promise<Object>} Observation result
   */
  async recordObservation(termId, observation) {
    try {
      const response = await this._fetch(`/api/terms/${encodeURIComponent(termId)}/observations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(observation)
      });

      if (!response.ok) {
        throw new Error(`ChittyCanon API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn(`ChittyCanon recordObservation failed for '${termId}':`, error.message);
      return { error: error.message, recorded: false };
    }
  }

  /**
   * Get standards sources with authority scores
   * @param {string} domain - Optional domain filter
   * @returns {Promise<Array>} Standards sources
   */
  async getSources(domain = null) {
    const cacheKey = `sources:${domain}`;
    
    // Check cache
    if (this.enableCache) {
      const cached = this._getFromCache(cacheKey);
      if (cached) return cached;
    }

    const params = domain ? `?domain=${encodeURIComponent(domain)}` : '';

    try {
      const response = await this._fetch(`/api/sources${params}`);

      if (!response.ok) {
        throw new Error(`ChittyCanon API error: ${response.status}`);
      }

      const result = await response.json();
      
      // Cache result
      if (this.enableCache) {
        this._setCache(cacheKey, result);
      }

      return result;
    } catch (error) {
      console.warn('ChittyCanon getSources failed:', error.message);
      return { sources: [], error: error.message, fallback: true };
    }
  }

  /**
   * Check service health
   * @returns {Promise<Object>} Health status
   */
  async health() {
    try {
      const response = await this._fetch('/health');
      
      if (!response.ok) {
        return { status: 'unhealthy', error: `HTTP ${response.status}` };
      }

      return await response.json();
    } catch (error) {
      return { status: 'unreachable', error: error.message };
    }
  }

  /**
   * Clear the cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Internal fetch with retry logic
   */
  async _fetch(path, options = {}) {
    const url = `${this.baseUrl}${path}`;
    let lastError;

    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        lastError = error;
        if (attempt < this.retries) {
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
        }
      }
    }

    throw lastError;
  }

  /**
   * Get from cache if not expired
   */
  _getFromCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.cacheTTL * 1000) {
      this.cache.delete(key);
      return null;
    }

    return cached.value;
  }

  /**
   * Set cache value
   */
  _setCache(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }
}

/**
 * Default singleton instance
 */
let defaultClient = null;

/**
 * Get or create the default client instance
 * @param {Object} options - Client options
 * @returns {CanonClient}
 */
export function getDefaultClient(options = {}) {
  if (!defaultClient) {
    const baseUrl = process.env.CHITTYCANON_API_URL || 'https://canon.chitty.cc';
    defaultClient = new CanonClient(baseUrl, options);
  }
  return defaultClient;
}

/**
 * Convenience methods using default client
 */
export async function check(term, definition = null, domain = null) {
  return getDefaultClient().check(term, definition, domain);
}

export async function getTerms(filters = {}) {
  return getDefaultClient().getTerms(filters);
}

export async function getTerm(id) {
  return getDefaultClient().getTerm(id);
}

export async function recordObservation(termId, observation) {
  return getDefaultClient().recordObservation(termId, observation);
}

export async function getSources(domain = null) {
  return getDefaultClient().getSources(domain);
}

export default CanonClient;
