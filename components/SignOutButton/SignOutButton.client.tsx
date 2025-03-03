"use client";
import { Button, ButtonProps } from "@mantine/core"
import { Session } from "next-auth";
import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function SignOutButtonClient({ ...props }: Readonly<ButtonProps & { session?: Session | null }>) {
    const t =  useTranslations('Authentication');
    const session = useSession().data;
    const [loading, setLoading] = useState(false);
    if (!session?.user) return null
    return (
            <Button {...props} loading={loading} onClick={() => { setLoading(true); signOut() } }>{t('signOut')}</Button>
    )
}