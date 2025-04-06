"use client";
import { Button, ButtonProps } from "@mantine/core";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function SignOutButtonClient({ session, ...props }: Readonly<ButtonProps & { session?: Session | null }>) {
    const t =  useTranslations('Authentication');
    const [loading, setLoading] = useState(false);
    if (!session?.user) return null
    return (
            <Button {...props} loading={loading} onClick={() => { setLoading(true); signOut() } }>{t('signOut')}</Button>
    )
}