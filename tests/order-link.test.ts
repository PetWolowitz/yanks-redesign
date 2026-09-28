// Il link alla pagina ordine: id e token solo nel fragment, letti senza fidarsi.
import { describe, expect, it } from 'vitest';
import { orderLink, parseOrderFragment, parseStoredAccess } from '../src/lib/shop/order-link';

const access = { id: '6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b', token: 'AbC_123-xyzAbC_123-xyzAbC_123-xyzAbC_123-x' };

describe('orderLink', () => {
  it('mette id e token nel fragment, mai nella query', () => {
    const link = orderLink('https://example.dev', 'nl', access);
    expect(link).toBe(`https://example.dev/nl/shop/order/#id=${access.id}&t=${access.token}`);
    expect(new URL(link).search).toBe('');
  });

  it('andata e ritorno: il fragment si rilegge uguale', () => {
    expect(parseOrderFragment(new URL(orderLink('https://example.dev', 'en', access)).hash)).toEqual(access);
  });
});

describe('parseOrderFragment', () => {
  it('senza id o token: null', () => {
    expect(parseOrderFragment('')).toBeNull();
    expect(parseOrderFragment('#id=abc')).toBeNull();
    expect(parseOrderFragment('#t=abc')).toBeNull();
  });

  it('caratteri fuori forma: null', () => {
    expect(parseOrderFragment('#id=<script>&t=abc')).toBeNull();
    expect(parseOrderFragment('#id=abc&t=a+b/c=')).toBeNull();
  });
});

describe('parseStoredAccess', () => {
  it('legge quello che salva il checkout', () => {
    expect(parseStoredAccess(JSON.stringify(access))).toEqual(access);
  });

  it('non si fida: JSON rotto o campi sbagliati danno null', () => {
    expect(parseStoredAccess(null)).toBeNull();
    expect(parseStoredAccess('{rotto')).toBeNull();
    expect(parseStoredAccess('{"id":1,"token":"x"}')).toBeNull();
  });
});
