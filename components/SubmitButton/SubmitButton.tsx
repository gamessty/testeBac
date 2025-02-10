'use client'

import { Button, ButtonProps, Loader } from '@mantine/core'
import { useFormStatus } from 'react-dom'

export default function SubmitButton(props: Readonly<ButtonProps>) {
    const { leftSection, ...rest } = props
    const { pending } = useFormStatus()

    return (
        <Button type='submit' disabled={pending} leftSection={pending ? <Loader size={18} /> : leftSection} {...rest}/>
    )
}