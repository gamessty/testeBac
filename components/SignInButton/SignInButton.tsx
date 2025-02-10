"use client";
import { Button, Group } from "@mantine/core";
import { Link } from "../../i18n/routing";
import { useLocale, useTranslations } from "next-intl";
export default function SignInButton() {
    const t = useTranslations('Authentication');
    const locale = useLocale();

    return (
        <Group justify="center">
            <Button component={Link} href={"/signin?callbackUrl=" + encodeURIComponent(`/${locale}/app`)} variant="gradient" gradient={{ from: 'blue', to: 'cyan', deg: 90 }}>{t('signIn')}</Button>
        </Group>
    )
}