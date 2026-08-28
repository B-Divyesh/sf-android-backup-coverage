import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

type Claim = { id: string; claim: string; where: string; test: string; sandbox: string };

describe('public claim registry', () => {
  const claims = JSON.parse(readFileSync(resolve('.factory/claims.json'), 'utf8')) as Claim[];
  const browserTests = readFileSync(resolve('tests/e2e/app.spec.ts'), 'utf8');

  it('lists each claim once with one matching tagged browser test', () => {
    expect(claims.length).toBeGreaterThan(0);
    expect(new Set(claims.map(({ id }) => id)).size).toBe(claims.length);
    for (const claim of claims) {
      expect(claim.claim.length).toBeGreaterThan(0);
      expect(claim.where.length).toBeGreaterThan(0);
      expect(claim.sandbox.length).toBeGreaterThan(0);
      expect(claim.test).toBe(`npm test -- --grep @claim:${claim.id}`);
      expect(browserTests.match(new RegExp(`@claim:${claim.id}(?![a-z0-9-])`, 'g'))).toHaveLength(1);
    }
  });

  it('does not contain unregistered claim tags', () => {
    const tags = [...browserTests.matchAll(/@claim:([a-z0-9-]+)/g)].map((match) => match[1]);
    expect(tags.sort()).toEqual(claims.map(({ id }) => id).sort());
  });
});
