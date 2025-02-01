import { Affix, Avatar, Button, Grid, Group, Stack, Title, Transition, useMatches, Text, MantineStyleProp } from "@mantine/core";
import { useSetState } from "@mantine/hooks";
import { IconDeviceFloppy } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import LocaleSwitch from "../../LocaleSwitch/LocaleSwitch";
import ColorSchemeToggleIconSegmented from "../../ColorSchemeToggleIconSegmented/ColorSchemeToggleIconSegmented";
import { Session } from "next-auth";

interface SettingsProps {
    session: Session | null | undefined;
    style?: MantineStyleProp;
}

export default function Settings({ session, style }: Readonly<SettingsProps>) {
    // TO-DO: Implement the settings logic and add the necessary modification to the saveChanges button Affix
    const [changes, setChanges] = useSetState({});
    const t = useTranslations('Dashboard.Settings');

    function isEmpty(obj: any) {
        for (const prop in obj) {
            if (Object.hasOwn(obj, prop)) {
                return false;
            }
        }

        return true;
    }

    const affixPosition = useMatches({
        base: { bottom: 95, left: 20 },
        sm: { bottom: 20, left: 320 }
    })

    return (
        <Grid p={{base: 30, sm: 50}} style={style}>
            <Grid.Col span={12}>
                <Title order={1} ta="left">
                    {t('title')}
                </Title>
            </Grid.Col>
            <Grid.Col span={12}>
                <Title order={2} ta="left">
                    {t('account')}
                </Title>
                { session && <Group mt={10} justify="flex-start"> <Avatar key={session?.user?.email} src={session?.user?.image ?? undefined} name={session?.user?.email ?? undefined} color='initials' /> <Text fw={500} ta="center">{session?.user?.email}</Text></Group>}
            </Grid.Col>
            <Grid.Col span={12}>
                <Title order={2} ta="left">
                    {t('display')}
                </Title>
                <Stack align="flex-start"mt={10}>
                    <LocaleSwitch />
                    <ColorSchemeToggleIconSegmented />
                </Stack>
            </Grid.Col>
            <Affix position={affixPosition}>
                <Transition transition="slide-up" mounted={!isEmpty(changes)}>
                    {(transitionStyles) => (
                        <Button
                            leftSection={<IconDeviceFloppy size={18} />}
                            style={transitionStyles}
                            onClick={() => scrollTo({ top: 0 })}
                        >
                            {t('saveChanges')}
                        </Button>
                    )}
                </Transition>
            </Affix>
        </Grid>
    );
}