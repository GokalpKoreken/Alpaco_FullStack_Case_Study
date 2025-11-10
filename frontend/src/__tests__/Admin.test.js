import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Admin from '../pages/Admin';
import axios from 'axios';

jest.mock('axios');

test('creates drop and shows result', async () => {
  axios.post.mockResolvedValueOnce({ data: { drop: { id: 1, title: 'X' } } });
  render(<Admin />);
  const title = screen.getByPlaceholderText(/title/i);
  const desc = screen.getByPlaceholderText(/description/i);
  fireEvent.change(title, { target: { value: 'X' } });
  fireEvent.change(desc, { target: { value: 'D' } });
  const btn = screen.getByText(/Create/i);
  fireEvent.click(btn);
  const output = await screen.findByText(/drop/i);
  expect(output).toBeInTheDocument();
});
