import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { StudentCategoriesPage } from './student-categories-page';

const api = vi.hoisted(() => vi.fn());
vi.mock('./use-api', () => ({ useAuthenticatedApi: () => api }));
vi.mock('./google-map-picker', () => ({ GoogleMapPicker: ({ onChange, onAddressChange }: { onChange: (value: { latitude: number; longitude: number }) => void; onAddressChange: (value: string) => void }) =>
  <button type="button" onClick={() => { onChange({ latitude: 6.927078234234, longitude: 79.861243123124 }); onAddressChange('Colombo'); }}>Pick map location</button>,
}));

const student = { userId: 'd404985d-c57f-4ddd-91ca-21a0ab075908', name: 'Example Student', primaryArea: 'Colombo', summary: 'Experienced with moving tasks.', primaryCategory: 'MOVING_PACKING', rating: 4.5, reviewCount: 2, nicReviewed: true };
const offer = { directTaskId: 'offer-id', studentName: student.name, description: 'Help move boxes', amountLkr: 2500, locationAddress: 'Colombo', status: 'SENT' };

beforeEach(() => {
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { callback(0); return 1; });
  vi.stubGlobal('cancelAnimationFrame', () => {});
  HTMLElement.prototype.scrollIntoView = vi.fn();
  let sent = false;
  api.mockImplementation(async (path: string, options?: RequestInit) => {
    if (path === '/api/v1/poster/direct-tasks' && options?.method === 'POST') { sent = true; return offer; }
    if (path === '/api/v1/poster/direct-tasks') return sent ? [offer] : [];
    if (path === '/api/v1/public/categories/MOVING_PACKING/students') return [student];
    throw new Error('Unexpected request: ' + path);
  });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); api.mockReset(); });

describe('Student Categories quote flow', () => {
  it('scrolls to the selected category and shows students', async () => {
    render(<StudentCategoriesPage />);
    fireEvent.click(screen.getByRole('button', { name: /Moving & Packing/i }));
    expect(await screen.findByText('Example Student')).toBeInTheDocument();
    await waitFor(() => expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalled());
    expect(screen.getAllByRole('button', { name: /Moving & Packing/i })[0]).toHaveAttribute('aria-pressed', 'true');
  });

  it('submits rounded coordinates and refreshes Sent Quotes', async () => {
    render(<StudentCategoriesPage />);
    fireEvent.click(screen.getByRole('button', { name: /Moving & Packing/i }));
    fireEvent.click(await screen.findByRole('button', { name: /Example Student/i }));
    fireEvent.click(screen.getByRole('button', { name: /Send a Quote/i }));
    fireEvent.change(screen.getByLabelText('Work description'), { target: { value: 'Help move boxes' } });
    fireEvent.change(screen.getByLabelText('Date and time'), { target: { value: '2026-12-01T14:30' } });
    fireEvent.change(screen.getByLabelText('Budget (LKR)'), { target: { value: '2500' } });
    fireEvent.click(screen.getByRole('button', { name: 'Pick map location' }));
    fireEvent.click(screen.getByRole('button', { name: 'Send Quote' }));
    await waitFor(() => expect(api).toHaveBeenCalledWith('/api/v1/poster/direct-tasks', expect.objectContaining({ method: 'POST' })));
    const request = api.mock.calls.find(([path, options]) => path === '/api/v1/poster/direct-tasks' && options?.method === 'POST');
    expect(JSON.parse(request?.[1]?.body as string)).toMatchObject({ latitude: 6.927078, longitude: 79.861243, amountLkr: 2500, locationAddress: 'Colombo', category: 'MOVING_PACKING' });
    expect(await screen.findByText('LKR 2,500')).toBeInTheDocument();
  });

  it('shows inline field feedback before an invalid quote reaches the API', async () => {
    render(<StudentCategoriesPage />);
    fireEvent.click(screen.getByRole('button', { name: /Moving & Packing/i }));
    fireEvent.click(await screen.findByRole('button', { name: /Example Student/i }));
    fireEvent.click(screen.getByRole('button', { name: /Send a Quote/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Send Quote' }));
    expect(screen.getByText('Describe the work in 1–2,000 characters.')).toBeInTheDocument();
    expect(screen.getByText('Select a valid location on the map or use your current location.')).toBeInTheDocument();
    expect(api).not.toHaveBeenCalledWith('/api/v1/poster/direct-tasks', expect.objectContaining({ method: 'POST' }));
  });
});
