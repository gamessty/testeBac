"use client";
import { Affix, Avatar, Button, Grid, Group, Stack, Title, Transition, useMatches, Text, MantineStyleProp, Fieldset, TextInput, JsonInput, Loader } from "@mantine/core";
import { useSetState } from "@mantine/hooks";
import { IconDeviceFloppy } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import LocaleSwitch from "../../LocaleSwitch/LocaleSwitch";
import ColorSchemeToggleIconSegmented from "../../ColorSchemeToggleIconSegmented/ColorSchemeToggleIconSegmented";
import { Session, User } from "next-auth";
import putUser from "../../PrismaFunctions/putUser";

interface SettingsProps {
    session: Session | null | undefined;
    style?: MantineStyleProp;
}

interface SettingsUser extends User {
    loading?: boolean;
}

export default function Settings({ session, style }: Readonly<SettingsProps>) {
    // TO-DO: Implement the settings logic and add the necessary modification to the saveChanges button Affix
    const [userChanges, setUserChanges] = useSetState((session?.user ?? {}) as SettingsUser);
    const t = useTranslations('Dashboard.Settings');

    function isEmpty(obj: any) {
        for (const prop in obj) {
            if (Object.hasOwn(obj, prop)) {
                return false;
            }
        }

        return true;
    }

    function isDifferent(newObj: any, oldObj: any, updateAndLoadExcluded: boolean = false) {
        let diff = getObjectDiff(newObj, oldObj) ?? {};
        if (updateAndLoadExcluded) {
            if (diff?.updatedAt) delete diff.updatedAt;
            if (diff?.createdAt) delete diff.createdAt;
            if (diff?.loading) delete diff.loading;
        }
        return !isEmpty(diff);
    }

    const getNew = (newObj: any, oldObj: any, loadingStateExcluded: boolean = true) => {
        if (Object.keys(oldObj).length == 0
            && Object.keys(newObj).length > 0)
            return newObj;

        let diff = {} as any;
        for (const key in oldObj) {
            if (newObj[key] && oldObj[key] != newObj[key]) {
                diff[key] = newObj[key];
            }
        }

        if (loadingStateExcluded) {
            if (diff?.loading) delete diff.loading;
        }

        if (Object.keys(diff).length > 0)
            return diff;


        return oldObj;
    }

    function getObjectDiff(current: { [s: string]: unknown; } | ArrayLike<unknown>, original: { [x: string]: any; }) {
        const changes = {} as any;

        // Check current object's properties
        for (const [key, value] of Object.entries(current)) {
            if (!(key in original)) {
                changes[key] = {
                    oldValue: undefined,
                    newValue: value
                };
                continue;
            }

            const originalValue = original[key];
            const currentValue = value;

            // Handle different types of comparisons
            if (
                originalValue !== currentValue &&
                String(originalValue) !== String(currentValue) &&
                JSON.stringify(originalValue) !== JSON.stringify(currentValue)
            ) {
                changes[key] = {
                    oldValue: originalValue,
                    newValue: currentValue
                };
            }
        }

        // Check for removed properties
        for (const key of Object.keys(original)) {
            if (!(key in current)) {
                changes[key] = {
                    oldValue: original[key],
                    newValue: undefined
                };
            }
        }

        return Object.keys(changes).length === 0 ? null : changes;
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
                        <Avatar key={session?.user?.email} src={session?.user?.image ?? undefined} name={session?.user?.username ?? session?.user?.email ?? undefined} color='initials' />
                        <Stack
                            gap={0}
                            align="flex-start"
                            justify="center"
                        >
                            <Text fw={500} mb={-5} ta="center">{session?.user?.username ?? session?.user?.email}</Text>
                            <Text c="dimmed" size='sm' ta="center" display={{ base: session?.user?.username ? "inherit" : "none" }}>{session?.user?.email}</Text>
                        </Stack>
                    </Group>
                }
                <Fieldset w={{ base: "90%", md: "75%", xl: "50%", "xxl": "30%" }} legend={t('Account.personalInfo')} mt={10}>
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
                <Stack align="flex-start" >
                    <LocaleSwitch />
                    <ColorSchemeToggleIconSegmented />
                </Stack>
            </Grid.Col>
            {session?.user.roles.includes("admin") &&
                <Grid.Col span={12}>
                    <Title order={2} ta="left">
                        {t('debug')}
                    </Title>
                    <Text mt={10} c="dimmed" size="sm">BASIC STRING COMPARE: {(JSON.stringify(userChanges) !== JSON.stringify(session?.user)).toString()}</Text>
                    <Text mt={10} c="dimmed" size="sm">FUNCTION COMPARE: {isDifferent(userChanges, session?.user, true).toString()}</Text>
                    <Grid columns={12} mt={10} w="100%">
                        <Grid.Col span={6}>
                            <JsonInput
                                formatOnBlur
                                autosize
                                value={JSON.stringify(userChanges, null, 2)}
                                minRows={4}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <JsonInput
                                formatOnBlur
                                autosize
                                value={JSON.stringify(session?.user, null, 2)}
                                minRows={4}
                            />
                        </Grid.Col>
                    </Grid>
                </Grid.Col>
            }
            <Affix position={affixPosition}>
                <Transition transition="slide-up" mounted={isDifferent(userChanges, session?.user, true)}>
                    {(transitionStyles) => (
                        <Button
                            leftSection={userChanges.loading ? <Loader size="xs" color="white" type="bars" /> : <IconDeviceFloppy />}
                            style={transitionStyles}
                            onClick={async () => {
                                setUserChanges({ loading: true });
                                await putUser({ id: session?.user?.id, data: getNew(userChanges, session?.user) });
                                setUserChanges({ loading: undefined });
                            }}
                            disabled={userChanges.loading}
                        >
                            {t('saveChanges')}
                        </Button>
                    )}
                </Transition>
            </Affix>
        </Grid>
    );
}