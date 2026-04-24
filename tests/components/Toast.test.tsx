import React from 'react';
import { render, act } from '@testing-library/react-native';
import { ToastProvider, useToast } from '../../src/components/shared/ToastProvider';

const ToastConsumer = ({ type, message }: { type: 'success' | 'error' | 'info'; message: string }) => {
  const { showToast } = useToast();
  React.useEffect(() => { showToast(message, type); }, []);
  return null;
};

describe('ToastProvider', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders children without crashing', () => {
    const { getByText } = render(
      <ToastProvider>
        <React.Fragment><></></React.Fragment>
      </ToastProvider>,
    );
    expect(true).toBeTruthy();
  });

  it('shows a success toast message', async () => {
    const { findByText } = render(
      <ToastProvider>
        <ToastConsumer type="success" message="Đã lưu thành công" />
      </ToastProvider>,
    );
    
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(await findByText('Đã lưu thành công')).toBeTruthy();
  });

  it('shows an error toast message', async () => {
    const { findByText } = render(
      <ToastProvider>
        <ToastConsumer type="error" message="Có lỗi xảy ra" />
      </ToastProvider>,
    );

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(await findByText('Có lỗi xảy ra')).toBeTruthy();
  });
});
