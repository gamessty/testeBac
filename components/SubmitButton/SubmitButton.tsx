'use client';
import { Button, ButtonProps, Loader } from '@mantine/core';
import { useFormStatus } from 'react-dom';

export default function SubmitButton({ type = 'section', ...props }: Readonly<{ type?: 'full' | 'default' | 'section' } & ButtonProps>) {
    const { leftSection, ...rest } = props
    const { pending } = useFormStatus()

    switch (type) {
        case 'full':
            return (
                <Button type='submit' loading={pending} {...rest} />
            )
        case 'section':
        default:
            return (
                <Button type='submit' disabled={pending} leftSection={pending ? <Loader size={18} /> : leftSection} {...rest} />
            )
    }
}