import { UniWorkApi } from '../api';

describe('UniWorkApi', () => {
  it('sends the Clerk bearer token and JSON request body', async () => {
    const fetcher = jest.fn(async (_url: string | URL | Request, init?: RequestInit) => new Response(JSON.stringify({ userId: 'u1' }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    const api = new UniWorkApi('https://api.example.test', async () => 'test-token', undefined, fetcher as typeof fetch);
    await api.saveProfile({ fullName: 'A', age: 22, gender: 'OTHER', address: 'X', phoneNumber: '12345678', nic: '123456789V', university: 'U', faculty: 'F' });
    const [, request] = fetcher.mock.calls[0];
    expect(new Headers(request?.headers).get('Authorization')).toBe('Bearer test-token');
    expect(JSON.parse(String(request?.body))).toMatchObject({ fullName: 'A' });
  });

  it('rejects unauthorized calls and clears the Clerk session', async () => {
    const signOut = jest.fn();
    const fetcher = jest.fn(async () => new Response(JSON.stringify({ code: 'INVALID_TOKEN', message: 'Unauthorized' }), { status: 401 }));
    const api = new UniWorkApi('https://api.example.test', async () => 'expired', signOut, fetcher as typeof fetch);
    await expect(api.getProfile()).rejects.toMatchObject({ status: 401, code: 'INVALID_TOKEN' });
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it('rejects calls without an access token', async () => {
    const fetcher = jest.fn(); const signOut = jest.fn();
    const api = new UniWorkApi('https://api.example.test', async () => null, signOut, fetcher as typeof fetch);
    await expect(api.getProfile()).rejects.toMatchObject({ status: 401, code: 'UNAUTHENTICATED' });
    expect(signOut).toHaveBeenCalledTimes(1); expect(fetcher).not.toHaveBeenCalled();
  });

  it('submits a payment complaint without a client supplied agreed amount', async () => {
    const fetcher = jest.fn(async (_url: string | URL | Request, _init?: RequestInit) => new Response(JSON.stringify({ disputeId: 'case-1' }), { status: 201, headers: { 'Content-Type': 'application/json' } }));
    const api = new UniWorkApi('https://api.example.test', async () => 'student-token', undefined, fetcher as typeof fetch);
    await api.filePaymentDispute('task-1', { reason: 'INCORRECT_PAYMENT_AMOUNT', actualAmountLkr: 500, statement: 'I received less than agreed.' });
    const [url, request] = fetcher.mock.calls[0];
    expect(url).toBe('https://api.example.test/api/v1/student/tasks/task-1/payment-disputes');
    expect(JSON.parse(String(request?.body))).toEqual({ reason: 'INCORRECT_PAYMENT_AMOUNT', actualAmountLkr: 500, statement: 'I received less than agreed.' });
    expect(new Headers(request?.headers).get('Authorization')).toBe('Bearer student-token');
  });
});
