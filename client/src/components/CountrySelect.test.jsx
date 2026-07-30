import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '../lib/i18n.js';
import CountrySelect from './CountrySelect.jsx';
import { listCountries, getCountry } from '../lib/countries.js';

vi.mock('../lib/countries.js', () => ({
  listCountries: vi.fn(),
  getCountry: vi.fn(),
}));

describe('CountrySelect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCountry.mockResolvedValue({ country: { nameEn: '', nameFr: '', nameEs: '' } });
  });

  it('shows a "no results" message when the search returns nothing', async () => {
    listCountries.mockResolvedValue({ countries: [] });

    render(<CountrySelect value="" onChange={() => {}} placeholder="country" />);
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'zzznonexistent' } });

    await waitFor(() => expect(screen.getByText('no destinations found')).toBeInTheDocument());
  });

  it('lists matching countries and calls onChange when one is picked', async () => {
    listCountries.mockResolvedValue({
      countries: [{ cca2: 'FR', nameEn: 'France', nameFr: 'France', nameEs: 'Francia', flagSvgUrl: '' }],
    });
    const onChange = vi.fn();

    render(<CountrySelect value="" onChange={onChange} placeholder="country" />);
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'fra' } });

    const option = await screen.findByText('France');
    fireEvent.click(option);

    expect(onChange).toHaveBeenCalledWith('FR');
  });

  it('closes the dropdown on Escape', async () => {
    listCountries.mockResolvedValue({ countries: [] });

    render(<CountrySelect value="" onChange={() => {}} placeholder="country" />);
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'zz' } });
    await waitFor(() => expect(screen.getByText('no destinations found')).toBeInTheDocument());

    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByText('no destinations found')).not.toBeInTheDocument();
  });
});
