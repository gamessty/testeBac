"use client";
import { Affix, Avatar, Button, Grid, Group, Stack, Title, Transition, useMatches, Text, MantineStyleProp, Fieldset, TextInput } from "@mantine/core";
import { useSetState } from "@mantine/hooks";
import { IconDeviceFloppy } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import LocaleSwitch from "../../LocaleSwitch/LocaleSwitch";
import ColorSchemeToggleIconSegmented from "../../ColorSchemeToggleIconSegmented/ColorSchemeToggleIconSegmented";
import { Session, User } from "next-auth";
import userUpdate from "../../PrismaFunctions/userUpdate";

interface SettingsProps {
    session: Session | null | undefined;
    style?: MantineStyleProp;
}

export default function Settings({ session, style }: Readonly<SettingsProps>) {
    // TO-DO: Implement the settings logic and add the necessary modification to the saveChanges button Affix
    const [userChanges, setUserChanges] = useSetState(session?.user ?? {} as User);
    const t = useTranslations('Dashboard.Settings');

    function isEmpty(obj: any) {
        for (const prop in obj) {
            if (Object.hasOwn(obj, prop)) {
                return false;
            }
        }

        return true;
    }

    const getNew = (newObj: any, oldObj: any) => {
        if (Object.keys(oldObj).length == 0 
            && Object.keys(newObj).length > 0)
            return newObj;
    
        let diff = {} as any;
        for (const key in oldObj) {
            if (newObj[key] && oldObj[key] != newObj[key] ) {
                diff[key] = newObj[key]; 
            }
        }
    
        if (Object.keys(diff).length > 0) 
            return diff;
        
        return oldObj;
    }

    const affixPosition = useMatches({
        base: { bottom: 95, left: 20 },
        sm: { bottom: 20, left: 320 }
    })

    return (
        <Grid p={{ base: 30, sm: 50 }} style={style}>
            <Grid.Col span={12}>
                <Title order={1} ta="left">
                    {t('title')}
                </Title>
            </Grid.Col>
            <Grid.Col span={12}>
                <Title order={2} ta="left">
                    {t('account')}
                </Title>
                {session &&
                    <Group mt={10} justify="flex-start">
                        <Avatar key={session?.user?.email} src={session?.user?.image ?? undefined} name={session?.user?.email ?? undefined} color='initials' />
                        <Stack
                            gap={0}
                            align="flex-start"
                            justify="center"
                        >
                            <Text fw={500} mb={-5} ta="center" display={{ base: "none", md: "inherit" }}>{session?.user?.username ?? session?.user?.email}</Text>
                            <Text c="dimmed" size='sm' ta="center" display={{ base: session?.user?.username ? "inherit" : "none" }}>{session?.user?.email}</Text>
                        </Stack>
                    </Group>
                }
                <Fieldset w={"30%"} legend={t('Account.personalInfo')} mt={10}>
                    <TextInput
                        onChange={(Event) => setUserChanges({ username: Event.currentTarget.value })}
                        label={t('Account.username.label')}
                        value={userChanges.username ?? ''}
                        placeholder={t('Account.username.placeholder')}
                    />
                </Fieldset>
            </Grid.Col>
            <Grid.Col span={12}>
                <Title order={2} ta="left">
                    {t('display')}
                </Title>
                <Stack align="flex-start" mt={10}>
                    <LocaleSwitch />
                    <ColorSchemeToggleIconSegmented />
                </Stack>
            </Grid.Col>
            <Affix position={affixPosition}>
                <Transition transition="slide-up" mounted={JSON.stringify(userChanges) !== JSON.stringify(session?.user)}>
                    {(transitionStyles) => (
                        <Button
                            leftSection={<IconDeviceFloppy size={18} />}
                            style={transitionStyles}
                            onClick={() => userUpdate({ id: session?.user?.id, data: getNew(userChanges, session?.user) })}
                        >
                            {t('saveChanges')}
                        </Button>
                    )}
                </Transition>
            </Affix>
        </Grid>
    );
}