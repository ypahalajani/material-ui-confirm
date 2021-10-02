import React, { useState, useCallback, Fragment, useEffect } from 'react';
import ConfirmContext from './ConfirmContext';
import ConfirmationDialog from './ConfirmationDialog';

const DEFAULT_OPTIONS = {
  title: 'Are you sure?',
  description: '',
  content: null,
  confirmationText: 'Ok',
  cancellationText: 'Cancel',
  dialogProps: {},
  confirmationButtonProps: {},
  cancellationButtonProps: {},
};

const buildOptions = (defaultOptions, options) => {
  const dialogProps = {
    ...(defaultOptions.dialogProps || DEFAULT_OPTIONS.dialogProps),
    ...(options.dialogProps || {}),
  };
  const confirmationButtonProps = {
    ...(defaultOptions.confirmationButtonProps || DEFAULT_OPTIONS.confirmationButtonProps),
    ...(options.confirmationButtonProps || {}),
  };
  const cancellationButtonProps = {
    ...(defaultOptions.cancellationButtonProps || DEFAULT_OPTIONS.cancellationButtonProps),
    ...(options.cancellationButtonProps || {}),
  };

  return {
    ...DEFAULT_OPTIONS,
    ...defaultOptions,
    ...options,
    dialogProps,
    confirmationButtonProps,
    cancellationButtonProps,
  }
};

const ConfirmProvider = ({ children, defaultOptions = {} }) => {
  const [options, setOptions] = useState({ ...DEFAULT_OPTIONS, ...defaultOptions });
  const [resolveReject, setResolveReject] = useState([]);
  const [resolve, reject] = resolveReject
  /**
   * Possible states:
   * 1. "Idle" initially
   * 2. "Open" when `confirm` is called
   * 3. "Submitting" when confimation or cancellation button is pressed.
   * After submitting, the state is back to "Idle" since the Dialog is closed.
   */
  const [state, setState] = useState('idle');

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve, reject) => {
      setOptions(buildOptions(defaultOptions, options));
      setResolveReject([resolve, reject]);
      setState('open')
    });
  }, []);

  const handleClose = useCallback(() => {
    setResolveReject([]);
    setState('idle');
  }, []);

  const handleCancel = useCallback(() => {
    if (state === 'open') {
      reject();
      setState('submitting');
    }
  }, [reject]);

  const handleConfirm = useCallback(() => {
    if (state === 'open') {
      resolve();
      setState('submitting');
    }
  }, [resolve, state]);

  useEffect(() => {
    if (state === 'submitting') {
      handleClose();
    }
  }, [state])

  return (
    <Fragment>
      <ConfirmContext.Provider value={confirm}>
        {children}
      </ConfirmContext.Provider>
      <ConfirmationDialog
        open={state === 'open'}
        options={options}
        onClose={handleClose}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    </Fragment>
  );
};

export default ConfirmProvider;
