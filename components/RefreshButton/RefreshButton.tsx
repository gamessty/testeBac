"use client";
import { Button, ButtonProps } from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import React from "react";

export default function RefreshButton(props: Readonly<ButtonProps>) {
    const t = useTranslations("General");
    const [loading, setLoading] = React.useState(false);

    const handleReload = () => {
        setLoading(true);
        window.location.reload();
    };

    return (
        <Button loading={loading} onClick={handleReload} leftSection={<IconRefresh />} {...props}>{t('refresh')}</Button>
    )
}