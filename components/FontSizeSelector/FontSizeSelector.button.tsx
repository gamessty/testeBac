import { Button, ButtonGroupProps, Loader } from '@mantine/core';
import { usePagination, useUncontrolled } from '@mantine/hooks';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import classes from './FontSizeSelector.button.module.css';

interface DataType {
    value: string;
    label: string;
}

interface FontSizeSelectorButtonProps {
    value?: string;
    defaultValue?: string;
    data: DataType[];
    onChange?: (value: string) => void;
    disabled?: boolean;
}

export default function FontSizeSelectorButton({
    value,
    defaultValue,
    data,
    onChange,
    disabled,
    ...props
}: Readonly<FontSizeSelectorButtonProps & ButtonGroupProps>) {

    const [_value, handleChange] = useUncontrolled({
        value,
        defaultValue,
        onChange
    });

    const pagination = usePagination({ total: data.length, initialPage: data.findIndex((item) => item.value == defaultValue), onChange: (page) => handleChange(data[page].value), page: data.findIndex((item) => item.value == _value) });

    return (
        <Button.Group { ...props }>
            <Button variant="default" radius="md" className={classes['button']} onClick={pagination.previous} disabled={disabled}>
                <IconChevronDown color="var(--mantine-color-red-text)" />
            </Button>
            <Button.GroupSection variant="default" bg="var(--mantine-color-body)" className={classes['middle-section']} data-disabled={disabled} miw={80}>
                {disabled ? <Loader type='dots' color='teal' /> : data[pagination.active]?.label}
            </Button.GroupSection>
            <Button variant="default" radius="md" className={classes['button']} onClick={pagination.next} disabled={disabled}>
                <IconChevronUp color="var(--mantine-color-teal-text)" />
            </Button>
        </Button.Group>
    );
}