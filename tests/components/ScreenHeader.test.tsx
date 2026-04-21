import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ScreenHeader from '../../src/components/shared/ScreenHeader';

describe('ScreenHeader', () => {
  it('renders the title', () => {
    const { getByText } = render(<ScreenHeader title="Test Title" />);
    expect(getByText('Test Title')).toBeTruthy();
  });

  it('renders back button when onBack is provided', () => {
    const onBack = jest.fn();
    const { getByTestId } = render(<ScreenHeader title="Test" onBack={onBack} />);
    expect(getByTestId('screen-header-back')).toBeTruthy();
  });

  it('calls onBack when back button is pressed', () => {
    const onBack = jest.fn();
    const { getByTestId } = render(<ScreenHeader title="Test" onBack={onBack} />);
    fireEvent.press(getByTestId('screen-header-back'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('does not render back button when onBack is not provided', () => {
    const { queryByTestId } = render(<ScreenHeader title="Test" />);
    expect(queryByTestId('screen-header-back')).toBeNull();
  });

  it('renders right element when provided', () => {
    const { getByText } = render(
      <ScreenHeader title="Test Title 2" rightElement={<React.Fragment />} />,
    );
    expect(getByText('Test Title 2')).toBeTruthy();
  });
});
