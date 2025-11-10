import React from 'react';
import { render, screen } from '@testing-library/react';
import Drops from '../pages/Drops';
import axios from 'axios';

jest.mock('axios');

test('renders no active drops message when backend returns empty list', async () => {
  axios.get.mockResolvedValueOnce({ data: { drops: [] } });
  render(<Drops />);
  const el = await screen.findByText(/No active drops/i);
  expect(el).toBeInTheDocument();
});
