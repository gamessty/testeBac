import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { Button, ButtonGroupProps } from '@mantine/core';
import { useCounter, usePagination, useUncontrolled } from '@mantine/hooks';
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
}

export default function FontSizeSelectorButton({
    value,
    defaultValue,
    data,
    onChange,
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
            <Button variant="default" radius="md" onClick={pagination.previous}>
                <IconChevronDown color="var(--mantine-color-red-text)" />
            </Button>
            <Button.GroupSection variant="default" bg="var(--mantine-color-body)" className={classes['middle-section']} miw={80}>
                {data[pagination.active].label}
            </Button.GroupSection>
            <Button variant="default" radius="md" onClick={pagination.next}>
                <IconChevronUp color="var(--mantine-color-teal-text)" />
            </Button>
        </Button.Group>
    );
}