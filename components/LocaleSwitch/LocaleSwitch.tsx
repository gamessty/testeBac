import { useLocale, useTranslations } from "next-intl";
import { routing, usePathname, useRouter } from "../../i18n/routing";
import { SegmentedControl, Stack, Text } from "@mantine/core";
import { useSearchParams } from "next/navigation";

export default function LocaleSwitch() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const params = useSearchParams();
    const t = useTranslations('General.LocaleSwitcher');

    function handleChange(value: string) {
        setTimeout(() => {
            router.push(pathname + "?" + params.toString(), { locale: value });
        }, 480);
    }
    return (
        <Stack gap="5">
            <Text size="sm" fw={500} mt={3}>
                {t('label')}
            </Text>
            <SegmentedControl transitionTimingFunction="linear" transitionDuration={500} onChange={handleChange} defaultValue={locale} data={
                routing.locales.map((lang) => ({
                    label: t('locale', { locale: lang }),
                    value: lang
                }))
            } />
        </Stack>
    );
}