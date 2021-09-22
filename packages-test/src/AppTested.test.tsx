import React from 'react';
import { render, screen } from '@testing-library/react';
import AppTested, { TestedButton } from './AppTested';

test('renders tested App', () => {
    render(<AppTested />);
    const buttonElement = screen.getByText(/test/i);
    expect(buttonElement).toBeInTheDocument();
});

test('renders button', () => {
    render(<TestedButton label="abcde" />);
    const buttonElement = screen.getByText(/abcde/i);
    expect(buttonElement).toBeInTheDocument();
});
