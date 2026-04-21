import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SettingsSection from '../../src/components/shared/SettingsSection';

describe('SettingsSection', () => {
  it('renders section title', () => {
    const { getByText } = render(
      <SettingsSection title="Hỗ trợ" rows={[]} />,
    );
    expect(getByText('Hỗ trợ')).toBeTruthy();
  });

  it('renders all row labels', () => {
    const rows = [
      { label: 'Đánh giá ứng dụng', onPress: jest.fn() },
      { label: 'Hướng dẫn sử dụng', onPress: jest.fn() },
    ];
    const { getByText } = render(<SettingsSection title="Hỗ trợ" rows={rows} />);
    expect(getByText('Đánh giá ứng dụng')).toBeTruthy();
    expect(getByText('Hướng dẫn sử dụng')).toBeTruthy();
  });

  it('calls onPress when a row is tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <SettingsSection title="Test" rows={[{ label: 'Item', onPress }]} />,
    );
    fireEvent.press(getByText('Item'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders subtitle when provided', () => {
    const { getByText } = render(
      <SettingsSection
        title="Test"
        rows={[{ label: 'Item', subtitle: 'Sub text', onPress: jest.fn() }]}
      />,
    );
    expect(getByText('Sub text')).toBeTruthy();
  });
});
