import { Center, Flex, Group, SegmentedControl, Stack, Text, useMantineColorScheme, VisuallyHidden } from "@mantine/core";
import { IconMoon, IconSun, IconSunMoon } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

type ColorScheme = 'light' | 'dark' | 'auto';

export default function ColorSchemeToggleIconSegmented() {
    const { colorScheme, setColorScheme } = useMantineColorScheme({ keepTransitions: true });
    const t = useTranslations('General.ColorSchemeToggle');

    function iconGenerator(colorSchemeP: ColorScheme) {
        switch (colorSchemeP) {
            case 'light':
                return <IconSun size={18} style={{ marginRight: '10px' }}/>;
            case 'dark':
                return <IconMoon size={18} style={{ marginRight: '10px' }}/>;
            case 'auto':
                return <IconSunMoon size={18} style={{ marginRight: '10px' }}/>;
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
            <Text size="sm" fw={500} mt={3}>
                {t('label')}
            </Text>
            <SegmentedControl transitionTimingFunction="linear" transitionDuration={500} onChange={(value) => setColorScheme(value as ColorScheme)} value={colorScheme} defaultValue={colorScheme} data={
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