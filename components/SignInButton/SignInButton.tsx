"use client";
import { Button, Group } from "@mantine/core";
import { Link } from "../../i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
export default function SignInButton() {
    const t = useTranslations('Authentication');
    const locale = useLocale();
    const [loading, setLoading] = useState(false);

    return (
        <Group justify="center">
            <Button component={Link} loading={loading} href={"/signin?callbackUrl=" + encodeURIComponent(`/${locale}/app`)} onClick={() => setLoading(true)} variant="gradient" gradient={{ from: 'blue', to: 'cyan', deg: 90 }}>{t('signIn')}</Button>
        </Group>
    )
}