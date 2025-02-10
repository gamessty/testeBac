"use client";
import { Button, ButtonProps } from "@mantine/core"
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";

export default function SignOutButtonClient({ session, ...props }: Readonly<ButtonProps & { session: Session | null }>) {
    const t =  useTranslations('Authentication');
 
    if (!session?.user) return null
    return (
            <Button {...props} onClick={() => signOut()}>{t('signOut')}</Button>
    )
}