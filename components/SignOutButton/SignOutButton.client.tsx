"use client";
import { Button, Group } from "@mantine/core"
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";

interface SignOutButtonClientProps {
    session?: any,
    fullWidth?: boolean
}

export default function SignOutButtonClient({ session, fullWidth }: Readonly<SignOutButtonClientProps>) {
    const t =  useTranslations('Authentication');

 
    if (!session?.user) return null
    return (
        <Group justify="center" mt={10}>
            <Button fullWidth={fullWidth} onClick={() => signOut()}>{t('signOut')}</Button>
        </Group>
    )
}