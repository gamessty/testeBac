import { FloatingIndicator, UnstyledButton } from '@mantine/core';
import { useUncontrolled } from '@mantine/hooks';
import { HTMLAttributes, useState, useCallback, useMemo, useRef } from 'react';
import classes from './FontSizeSelector.module.css';

interface DataType {
    value: string;
    label: string;
}

interface FontSizeSelectorProps {
    value?: string;
    defaultValue?: string;
    data: DataType[];
    onChange?: (value: string) => void;
    disabled?: boolean;
}

export default function FontSizeSelector({ value, defaultValue, data, onChange, disabled, ...props }: Readonly<FontSizeSelectorProps & Omit<HTMLAttributes<HTMLDivElement>, 'onChange'>>) {
  const { className: classNameProp, ...others } = props;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const controlsRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [_value, handleChange] = useUncontrolled({
    value,
    defaultValue,
    onChange
  });

  const setControlRef = useCallback((index: string) => (node: HTMLButtonElement) => {
    controlsRefs.current[index] = node;
  }, []);

  const handleButtonClick = useCallback((value: string) => {
    handleChange(value);
  }, [handleChange]);

  const controls = useMemo(() => data.map((item) => (
    <UnstyledButton
      disabled={disabled}
      key={item.value}
      className={classes.control}
      ref={setControlRef(item.value)}
      onClick={() => handleButtonClick(item.value)}
      mod={{ active: _value === item.value }}
    >
      <span className={classes.controlLabel}>{item.label}</span>
    </UnstyledButton>
  )), [data, disabled, _value, setControlRef, handleButtonClick]);

  const memoizedIndicator = useMemo(() => (
    <FloatingIndicator
      target={controlsRefs.current[_value]}
      parent={rootRef.current}
      className={classes.indicator}
    />
  ), [_value]);

  return (
    <div {...others} className={`${classes.root} ${classNameProp}`} ref={rootRef}>
      {controls}
      {memoizedIndicator}
    </div>
  );
}