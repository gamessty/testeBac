"use client";
import { Button, DefaultMantineColor } from "@mantine/core"
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";

interface SignOutButtonClientProps {
    session?: any,
    fullWidth?: boolean
    color?: DefaultMantineColor
}

export default function SignOutButtonClient({ session, fullWidth, color }: Readonly<SignOutButtonClientProps>) {
    const t =  useTranslations('Authentication');
 
    if (!session?.user) return null
    return (
            <Button color={color} fullWidth={fullWidth} onClick={() => signOut()}>{t('signOut')}</Button>
    )
}