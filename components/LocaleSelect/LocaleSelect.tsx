"use client";
import { useLocale, useTranslations } from "next-intl";
import { routing, usePathname, useRouter } from "../../i18n/routing";
import { NativeSelect, em } from "@mantine/core";
import { useSearchParams } from "next/navigation";
import { useMediaQuery } from "@mantine/hooks";

export default function LocalSelect() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const isMobile = useMediaQuery(`(max-width: ${em(991)})`, true);

    const params = useSearchParams();
    const t = useTranslations('General.LocaleSwitcher');

    function handleChange(value: string) {
        setTimeout(() => {
            router.push(pathname + "?" + params.toString(), { locale: value });
        }, 480);
    }
    return (
            <NativeSelect fw={500} w={{ xs: 60, md: 'initial' }} onChange={(event) => handleChange(event.currentTarget.value)} rightSectionWidth={20} defaultValue={locale} data={
                routing.locales.map((lang) => ({
                    label: isMobile ?  lang.toUpperCase() : t('locale', { locale: lang }),
                    value: lang
                }))
            } />
    );
}