# @chittyfoundation/chittycanon-client

Lightweight API client for the ChittyCanon ontology governance service.

## Installation

```bash
npm install @chittyfoundation/chittycanon-client
```

## Usage

### Basic Usage

```javascript
import { CanonClient } from '@chittyfoundation/chittycanon-client';

const client = new CanonClient('https://canon.chitty.cc');

// Check if a term is canonical
const result = await client.check('hook-manager');
console.log(result.canonical); // true/false
console.log(result.recommendations); // Suggestions if not canonical

// Get canonical terms
const terms = await client.getTerms({ stage: 'canonical', domain: 'operations' });
console.log(terms.terms);

// Record an observation
await client.recordObservation('pre-commit', {
  usage_type: 'correct',
  service: 'chittyops',
  context: { execution_time_ms: 142 }
});
```

### Convenience Functions

```javascript
import { check, getTerms, getTerm } from '@chittyfoundation/chittycanon-client';

// Use default client (reads CHITTYCANON_API_URL env var)
const validation = await check('hookify', 'Hook management tool', ['operations']);
const terms = await getTerms({ stage: 'provisional' });
const term = await getTerm('hook-lifecycle');
```

## API

### `CanonClient`

#### Constructor

```javascript
new CanonClient(baseUrl, options)
```

**Parameters:**
- `baseUrl` (string) - ChittyCanon API URL (default: `https://canon.chitty.cc`)
- `options` (object) - Client options
  - `cacheTTL` (number) - Cache TTL in seconds (default: 300)
  - `enableCache` (boolean) - Enable in-memory caching (default: true)
  - `timeout` (number) - Request timeout in ms (default: 5000)
  - `retries` (number) - Number of retries (default: 2)

#### Methods

##### `check(term, definition, domain)`

Validate a term against the canonical ontology.

**Parameters:**
- `term` (string) - Term to check
- `definition` (string, optional) - Term definition
- `domain` (array, optional) - Domain(s) the term belongs to

**Returns:** Promise<Object>
```javascript
{
  term: 'hook-manager',
  canonical: true,           // Is this term canonical?
  provisional: false,        // Is this term provisional?
  existing_term: {...},      // Existing term data if found
  recommendations: [],       // Suggestions if not canonical
  scores: {...}              // Collision/similarity scores
}
```

##### `getTerms(filters)`

Get terms from the ontology.

**Parameters:**
- `filters` (object) - Query filters
  - `stage` (string) - Filter by stage: 'canonical', 'provisional', etc.
  - `domain` (string) - Filter by domain
  - `limit` (number) - Result limit (default: 50)

**Returns:** Promise<Object>
```javascript
{
  terms: [...],
  count: 42,
  stage: 'canonical'
}
```

##### `getTerm(id)`

Get a single term by ID or name.

**Parameters:**
- `id` (string) - Term ID or name

**Returns:** Promise<Object|null> - Term object or null if not found

##### `recordObservation(termId, observation)`

Record an observation for a term (usage metrics).

**Parameters:**
- `termId` (string) - Term ID or name
- `observation` (object)
  - `usage_type` (string) - 'correct', 'incorrect', or 'confused'
  - `service` (string) - Service reporting the observation
  - `context` (object, optional) - Additional context data
  - `notes` (string, optional) - Optional notes

**Returns:** Promise<Object>

##### `getSources(domain)`

Get standards sources with authority scores.

**Parameters:**
- `domain` (string, optional) - Filter by domain

**Returns:** Promise<Object>
```javascript
{
  sources: [
    {
      name: 'IETF',
      domain: ['networking', 'protocols'],
      ty_score: 0.9,
      vy_score: 0.85,
      ry_score: 0.8
    }
  ]
}
```

##### `health()`

Check ChittyCanon service health.

**Returns:** Promise<Object>
```javascript
{
  service: 'chittycanon',
  status: 'healthy',
  version: '0.1.0'
}
```

##### `clearCache()`

Clear the in-memory cache.

## Environment Variables

- `CHITTYCANON_API_URL` - ChittyCanon API base URL (default: `https://canon.chitty.cc`)

## Features

### Automatic Caching

The client caches API responses for 5 minutes by default to reduce load on the ChittyCanon service.

```javascript
const client = new CanonClient('https://canon.chitty.cc', {
  cacheTTL: 600,      // Cache for 10 minutes
  enableCache: true   // Enable caching
});
```

### Automatic Retries

Failed requests are automatically retried with exponential backoff.

```javascript
const client = new CanonClient('https://canon.chitty.cc', {
  retries: 3,         // Retry up to 3 times
  timeout: 10000      // 10 second timeout
});
```

### Graceful Degradation

If the ChittyCanon API is unavailable, the client returns fallback responses instead of throwing errors.

```javascript
const result = await client.check('my-term');
if (result.fallback) {
  console.warn('Using fallback validation - ChittyCanon unavailable');
}
```

## References

- [ChittyCanon Service](https://canon.chitty.cc)
- [Ontology Lifecycle Spec](https://github.com/chittyfoundation/chittycanon/blob/main/specs/ONTOLOGY_LIFECYCLE.md)
- [ChittyCanon CHARTER](https://github.com/chittyfoundation/chittycanon/blob/main/CHARTER.md)
- [ChittyCanon GOVERNANCE](https://github.com/chittyfoundation/chittycanon/blob/main/GOVERNANCE.md)

## License

MIT
