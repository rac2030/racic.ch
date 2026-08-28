import { jest, describe, test, expect, beforeEach } from '@jest/globals';

function setupGlobals() {
  const mockClients = {
    matchAll: jest.fn().mockResolvedValue([]),
    claim: jest.fn().mockResolvedValue(undefined),
  };

  const mockCache = {
    put: jest.fn().mockResolvedValue(undefined),
  };

  const mockCaches = {
    keys: jest.fn().mockResolvedValue([]),
    open: jest.fn().mockResolvedValue(mockCache),
    delete: jest.fn().mockResolvedValue(true),
    match: jest.fn().mockResolvedValue(null),
  };

  const mockSelf = {
    clients: mockClients,
    skipWaiting: jest.fn(),
    addEventListener: jest.fn(),
  };

  (globalThis as any).self = mockSelf;
  (globalThis as any).caches = mockCaches;
  (globalThis as any).localStorage = {
    getItem: jest.fn().mockReturnValue(null),
    setItem: jest.fn(),
  };

  return { mockSelf, mockClients, mockCaches, mockCache };
}

describe('Service Worker — exported functions', () => {
  beforeEach(() => {
    jest.resetModules();
    setupGlobals();
  });

  test('getVersion returns 0 by default', async () => {
    const { getVersion } = await import('../../src/lib/sw');
    expect(getVersion()).toBe('0');
  });

  test('getVersion returns localStorage value', async () => {
    (globalThis as any).localStorage.getItem.mockReturnValue('5');
    const { getVersion } = await import('../../src/lib/sw');
    expect(getVersion()).toBe('5');
  });

  test('getVersion returns 0 on error', async () => {
    (globalThis as any).localStorage.getItem.mockImplementation(() => {
      throw new Error('no localStorage');
    });
    const { getVersion } = await import('../../src/lib/sw');
    expect(getVersion()).toBe('0');
  });

  test('setVersion writes to localStorage', async () => {
    const { setVersion } = await import('../../src/lib/sw');
    setVersion('42');
    expect((globalThis as any).localStorage.setItem).toHaveBeenCalledWith('racic-ch-cache-version', '42');
  });

  test('setVersion silently fails on error', async () => {
    (globalThis as any).localStorage.setItem.mockImplementation(() => {
      throw new Error('no localStorage');
    });
    const { setVersion } = await import('../../src/lib/sw');
    expect(() => setVersion('1')).not.toThrow();
  });

  test('notifyClients sends message to all clients', async () => {
    const mockClient = { postMessage: jest.fn() };
    const g = setupGlobals();
    g.mockClients.matchAll.mockResolvedValue([mockClient]);
    const { notifyClients } = await import('../../src/lib/sw');
    notifyClients('NEW_VERSION', { version: 3 });
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(mockClient.postMessage).toHaveBeenCalledWith({ type: 'NEW_VERSION', version: 3 });
  });

  test('notifyClients sends message without data', async () => {
    const mockClient = { postMessage: jest.fn() };
    const g = setupGlobals();
    g.mockClients.matchAll.mockResolvedValue([mockClient]);
    const { notifyClients } = await import('../../src/lib/sw');
    notifyClients('TEST');
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(mockClient.postMessage).toHaveBeenCalledWith({ type: 'TEST' });
  });

  test('CACHE_NAME starts with racic-ch-', async () => {
    const { CACHE_NAME } = await import('../../src/lib/sw');
    expect(CACHE_NAME).toMatch(/^racic-ch-/);
  });
});

describe('Service Worker — event listeners', () => {
  let refs: ReturnType<typeof setupGlobals>;

  beforeEach(() => {
    jest.resetModules();
    refs = setupGlobals();
  });

  test('registers install, activate, message, and fetch listeners', async () => {
    await import('../../src/lib/sw');
    const eventTypes = refs.mockSelf.addEventListener.mock.calls.map((c: any[]) => c[0]);
    expect(eventTypes).toContain('install');
    expect(eventTypes).toContain('activate');
    expect(eventTypes).toContain('message');
    expect(eventTypes).toContain('fetch');
  });

  test('install handler calls skipWaiting', async () => {
    await import('../../src/lib/sw');
    const call = refs.mockSelf.addEventListener.mock.calls.find((c: any[]) => c[0] === 'install');
    call![1]({ waitUntil: jest.fn() } as any);
    expect(refs.mockSelf.skipWaiting).toHaveBeenCalled();
  });

  test('message handler calls skipWaiting for SKIP_WAITING', async () => {
    await import('../../src/lib/sw');
    const call = refs.mockSelf.addEventListener.mock.calls.find((c: any[]) => c[0] === 'message');
    call![1]({ data: { type: 'SKIP_WAITING' } } as any);
    expect(refs.mockSelf.skipWaiting).toHaveBeenCalled();
  });

  test('message handler ignores non-SKIP_WAITING', async () => {
    await import('../../src/lib/sw');
    const call = refs.mockSelf.addEventListener.mock.calls.find((c: any[]) => c[0] === 'message');
    refs.mockSelf.skipWaiting.mockClear();
    call![1]({ data: { type: 'OTHER' } } as any);
    expect(refs.mockSelf.skipWaiting).not.toHaveBeenCalled();
  });

  test('message handler ignores null data', async () => {
    await import('../../src/lib/sw');
    const call = refs.mockSelf.addEventListener.mock.calls.find((c: any[]) => c[0] === 'message');
    refs.mockSelf.skipWaiting.mockClear();
    call![1]({ data: null } as any);
    expect(refs.mockSelf.skipWaiting).not.toHaveBeenCalled();
  });

  test('activate handler cleans old caches and claims clients', async () => {
    refs.mockCaches.keys.mockResolvedValue(['old-cache-1', 'old-cache-2', 'racic-ch-v1']);
    await import('../../src/lib/sw');
    const call = refs.mockSelf.addEventListener.mock.calls.find((c: any[]) => c[0] === 'activate');
    const waitUntilPromise = new Promise<void>((resolve) => {
      call![1]({
        waitUntil: (p: Promise<any>) => { p.then(() => resolve()); },
      } as any);
    });
    await waitUntilPromise;
    expect(refs.mockCaches.delete).toHaveBeenCalledWith('old-cache-1');
    expect(refs.mockCaches.delete).toHaveBeenCalledWith('old-cache-2');
    expect(refs.mockCaches.delete).not.toHaveBeenCalledWith('racic-ch-v1');
    expect(refs.mockClients.claim).toHaveBeenCalled();
  });

  test('fetch handler ignores non-GET requests', async () => {
    await import('../../src/lib/sw');
    const call = refs.mockSelf.addEventListener.mock.calls.find((c: any[]) => c[0] === 'fetch');
    const mockEvent = {
      request: { method: 'POST' },
      respondWith: jest.fn(),
    };
    call![1](mockEvent as any);
    expect(mockEvent.respondWith).not.toHaveBeenCalled();
  });

  test('fetch handler responds with cache for GET requests', async () => {
    refs.mockCaches.match.mockResolvedValue(new Response('cached'));
    await import('../../src/lib/sw');
    const call = refs.mockSelf.addEventListener.mock.calls.find((c: any[]) => c[0] === 'fetch');
    const mockEvent = {
      request: { method: 'GET' },
      respondWith: jest.fn(),
    };
    call![1](mockEvent as any);
    expect(mockEvent.respondWith).toHaveBeenCalled();
  });
});
