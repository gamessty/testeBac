"use client";
import { useLocale, useTranslations } from "next-intl";
import { routing, usePathname, useRouter } from "../../i18n/routing";
import { NativeSelect, NativeSelectProps, Loader, em, MantineStyleProps, InputStylesNames } from "@mantine/core";
import { useSearchParams } from "next/navigation";
import { useMediaQuery } from "@mantine/hooks";
import { useState } from "react";

export default function LocalSelect({ dynamic = true, ...props}: Readonly<{ dynamic?: boolean} & Omit<NativeSelectProps, 'data' | 'fw' | 'w' | 'rightSectionWidth' | 'defaultValue' | 'onChange'>>) {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const isMobile = useMediaQuery(`(max-width: ${em(991)})`, true);
    const [loading, setLoading] = useState(false);

    const params = useSearchParams();
    const t = useTranslations('General.LocaleSwitcher');

    function handleChange(value: string) {
            setLoading(true);
            router.push(pathname + "?" + params.toString(), { locale: value });
    }
    return (
            <NativeSelect fw={500} disabled={loading} w={dynamic ? { xs: 60, md: 'initial' }: undefined} leftSection={loading ? <Loader size="xs" /> : undefined} onChange={(event) => handleChange(event.currentTarget.value)} rightSectionWidth={20} defaultValue={locale} data={
                routing.locales.map((lang) => ({
                    label: (isMobile && dynamic) ?  lang.toUpperCase() : t('locale', { locale: lang }),
                    value: lang
                }))
            } {...props}/>
    );
}