import { HTMLAttributes, useState } from 'react';
import { FloatingIndicator, UnstyledButton, UnstyledButtonProps } from '@mantine/core';
import classes from './FontSizeSelector.module.css';
import { useUncontrolled } from '@mantine/hooks';

interface DataType {
    value: string;
    label: string;
}

interface FontSizeSelectorProps {
    value?: string;
    defaultValue?: string;
    data: DataType[];
    onChange?: (value: string) => void;
}

export default function FontSizeSelector({ value, defaultValue, data, onChange, ...props }: Readonly<FontSizeSelectorProps & Omit<HTMLAttributes<HTMLDivElement>, 'onChange'>>) {
  const { className: classNameProp, ...others } = props;
  const [rootRef, setRootRef] = useState<HTMLDivElement | null>(null);
  const [controlsRefs, setControlsRefs] = useState<Record<string, HTMLButtonElement | null>>({});
  const [_value, handleChange] = useUncontrolled({
    value,
    defaultValue,
    onChange
  });

  const setControlRef = (index: string) => (node: HTMLButtonElement) => {
    controlsRefs[index] = node;
    setControlsRefs(controlsRefs);
  };

  const controls = data.map((item, index) => (
    <UnstyledButton
      key={item.value}
      className={classes.control}
      ref={setControlRef(item.value)}
      onClick={() => handleChange(item.value)}
      mod={{ active: _value === item.value }}
    >
      <span className={classes.controlLabel}>{item.label}</span>
    </UnstyledButton>
  ));

  return (
    <div {...others} className={classes.root + " " + classNameProp} ref={setRootRef}>
      {controls}

      <FloatingIndicator
        target={controlsRefs[_value]}
        parent={rootRef}
        className={classes.indicator}
      />
    </div>
  );
}