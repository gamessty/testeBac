import { Center, Flex, Group, SegmentedControl, Stack, Text, useMantineColorScheme, VisuallyHidden } from "@mantine/core";
import { IconMoon, IconSun, IconSunMoon } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import styles from './ColorSchemeToggleIconSegmented.module.css';

type ColorScheme = 'light' | 'dark' | 'auto';

export default function ColorSchemeToggleIconSegmented() {
    const { colorScheme, setColorScheme } = useMantineColorScheme({ keepTransitions: true });
    const t = useTranslations('General.ColorSchemeToggle');

    function iconGenerator(colorSchemeP: ColorScheme) {
        switch (colorSchemeP) {
            case 'light':
                return <IconSun size={18} className={styles.icon} />;
            case 'dark':
                return <IconMoon size={18} className={styles.icon} />;
            case 'auto':
                return <IconSunMoon size={18} className={styles.icon} />;
        }
    }

    function labelGenerator(colorSchemeP: ColorScheme) {
        return (
            <Center>
                {iconGenerator(colorSchemeP)}<span>{t('colorScheme', { colorScheme: colorSchemeP })}</span>
                <VisuallyHidden>{t('colorScheme', { colorScheme: colorSchemeP })}</VisuallyHidden>
            </Center>
        )
    }

    return (
        <Stack gap="5">
            <Text className={styles.text}>
                {t('label')}
            </Text>
            <SegmentedControl transitionTimingFunction="linear" transitionDuration={250} onChange={(value) => setColorScheme(value as ColorScheme)} value={colorScheme} defaultValue={colorScheme} data={
                [
                    {
                        label: labelGenerator('light'),
                        value: 'light'
                    },
                    {
                        label: labelGenerator('dark'),
                        value: 'dark'
                    },
                    {
                        label: labelGenerator('auto'),
                        value: 'auto'
                    }
                ]
            } />
        </Stack>
    );
}