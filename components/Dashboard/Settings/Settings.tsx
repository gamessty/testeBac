"use client";
import { Affix, Button, Grid, Group, Stack, Title, Transition, useMatches, Text, MantineStyleProp, Fieldset, TextInput, JsonInput, Loader, Tooltip, Badge, Slider, Input, InputLabel, ButtonGroup, SegmentedControl } from "@mantine/core";
import { useDebouncedValue, useDidUpdate, useIsFirstRender, useLocalStorage, useSet, useSetState } from "@mantine/hooks";
import { IconDeviceFloppy } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import LocaleSwitch from "../../LocaleSwitch/LocaleSwitch";
import ColorSchemeToggleIconSegmented from "../../ColorSchemeToggleIconSegmented/ColorSchemeToggleIconSegmented";
import { Session, User } from "next-auth";
import putUser from "../../../actions/PrismaFunctions/putUser";
import { chkP, getDifferences, getInitialsColor } from "../../../utils";
import AvatarFallback from "../../AvatarFallback/AvatarFallback";
import { useState } from "react";
import LocaleSelect from "../../LocaleSelect/LocaleSelect";
import { useGetCookie, useSetCookie } from "cookies-next";
import classes from './Settings.module.css';
import { Link } from "../../../i18n/routing";
import LoadingButton from "../../LoadingButton/LoadingButton";
import { CodingLanguageSelect } from "../../CodingLanguageSelect/CodingLanguageSelect";
import createSampleData from "../../../actions/PrismaFunctions/createSampleData";
import FontSizeSelector from "@/components/FontSizeSelector/FontSizeSelector";
import FontSizeSelectorButton from "@/components/FontSizeSelector/FontSizeSelector.button";

const fontSizeMarks = generateNumberArray(70, 130, 10).map(value => ({ value: value.toString(), label: `${value}%` }));

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
    const getCookie = useGetCookie();
    const setCookie = useSetCookie();
    const [fontSize, setFontSize] = useState(Number(getCookie('fontSize')) || 100);

    useDidUpdate(() => {
        document.documentElement.style.fontSize = `${fontSize}%`;
        setCookie('fontSize', fontSize);
    }, [fontSize]);

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
        let diff = getObjectDiff(newObj, oldObj, { emptyStringIsNull: true }) ?? {};
        if (updateAndLoadExcluded) {
            if (diff?.updatedAt) delete diff.updatedAt;
            if (diff?.createdAt) delete diff.createdAt;
            if (diff?.loading) delete diff.loading;
        }
        return !isEmpty(diff);
    }

    function getObjectDiff(current: { [s: string]: unknown; } | ArrayLike<unknown>, original: { [x: string]: any; }, options: { emptyStringIsNull?: boolean; } = { emptyStringIsNull: false }) {
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

            const isEmptyString = (val: any) => options.emptyStringIsNull && (val === '' || val === null || val === undefined);

            if (
                (isEmptyString(originalValue) && isEmptyString(currentValue)) ||
                (originalValue !== currentValue &&
                    String(originalValue) !== String(currentValue) &&
                    JSON.stringify(originalValue) !== JSON.stringify(currentValue))
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
        base: { bottom: 100, left: 20 },
        sm: { bottom: 20, left: 320 }
    })

    return (
        <Grid p={{ base: 30, sm: 35 }} pt={{ base: 20, sm: 25 }} maw={"100vw"} pb={95} style={style}>
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
                        <AvatarFallback key={session?.user?.email} src={session.user?.image ?? undefined} name={session?.user?.username ?? session?.user?.email ?? undefined} color='initials' />
                        <Stack
                            gap={2}
                            align="flex-start"
                            justify="center"
                        >
                            <Text fw={500} mb={-5} ta="center">{session?.user?.username ?? session?.user?.email}</Text>
                            <Text c="dimmed" size='sm' ta="center" display={{ base: session?.user?.username ? "inherit" : "none" }}>{session?.user?.email}</Text>
                            <Grid gutter={3} w="100%">
                                {(session?.user?.roles?.length ?? 0) > 1 &&
                                    session?.user?.roles?.map((role) => (
                                        <Grid.Col pt={0} mt={-6} span="content" key={role.id}>
                                            <Tooltip tt="capitalize" label={role.name} color={getInitialsColor(role.name)} withArrow>
                                                <Badge size="sm" variant="dot" color={getInitialsColor(role.name)} radius="xs" tt="capitalize">{role.name}</Badge>
                                            </Tooltip>
                                        </Grid.Col>
                                    ))
                                }
                            </Grid>
                        </Stack>
                    </Group>
                }
                <Fieldset w={{ base: "90%", md: "75%", xl: "55%", "xxl": "40%" }} legend={t('Account.personalInfo')} mt={10}>
                    <TextInput
                        mb={10}
                        onChange={(Event) => setUserChanges({ name: Event.currentTarget.value })}
                        label={t('Account.name.label')}
                        value={userChanges.name ?? ''}
                        placeholder={t('Account.name.placeholder')}
                    />
                    <TextInput
                        mb={10}
                        onChange={(Event) => setUserChanges({ username: Event.currentTarget.value })}
                        label={t('Account.username.label')}
                        value={userChanges.username ?? ''}
                        placeholder={t('Account.username.placeholder')}
                    />
                    <CodingLanguageSelect
                        mb={10}
                        label={t('Account.codingLanguage.label')}
                        loadAsync={false}
                        defaultOption={session?.user.preferences.codingLanguage}
                        onChange={(language) => setUserChanges({ preferences: { codingLanguage: language.aliases[0] ?? language.language } })}
                    />
                    <InputLabel>{t('fontSize.label')}</InputLabel>
                    <FontSizeSelector
                        value={fontSize.toString()}
                        data={fontSizeMarks}
                        onChange={(value) => setFontSize(Number(value))}
                        className={classes["font-size-segmented-control"] + " " + classes["hide-on-mobile"]}
                    />
                    <FontSizeSelectorButton
                        hiddenFrom="md"
                        value={fontSize.toString()}
                        data={fontSizeMarks}
                        onChange={(value) => setFontSize(Number(value))}
                        className={classes["font-size-segmented-control"]}
                    />
                </Fieldset>
            </Grid.Col>
            <Grid.Col span={12}>
                <Title order={2} ta="left">
                    {t('display')}
                </Title>
                <Stack align="flex-start" >
                    <LocaleSelect dynamic={false} mt="md" />
                    <ColorSchemeToggleIconSegmented />
                </Stack>
            </Grid.Col>
            {chkP("developer:debug", session?.user) &&
                <Grid.Col span={12}>
                    <Title order={2} ta="left">
                        {t('debug')}
                    </Title>
                    <ButtonGroup mt={10}>
                        <LoadingButton mt={10} variant="outline" component={Link} href="./app/demo/">{t('demoComponents')}</LoadingButton>
                        {
                            chkP("developer:*", session?.user) &&
                            <Button variant="outline" mt={10} onClick={async () => {
                                createSampleData();
                            }}>{t('createSampleData')}</Button>
                        }
                    </ButtonGroup>
                    <Text mt={10} c="dimmed" size="sm">BASIC STRING COMPARE: {(JSON.stringify(userChanges) !== JSON.stringify(session?.user)).toString()}</Text>
                    <Text mt={10} c="dimmed" size="sm">FUNCTION COMPARE: {isDifferent(userChanges, session?.user, true).toString()}</Text>
                    <Grid columns={12} mt={10} w="100%" grow>
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
                        <Grid.Col span={6}>
                            <JsonInput
                                formatOnBlur
                                autosize
                                value={JSON.stringify(getDifferences(userChanges, session?.user, { ignoredKeys: ['updatedAt', 'createdAt'] }) ?? {}, null, 2)}
                                minRows={4}
                            />
                        </Grid.Col>
                    </Grid>
                </Grid.Col>
            }
            <Affix position={affixPosition}
            >
                <Transition transition="slide-up" mounted={!isEmpty(getDifferences(userChanges, session?.user, { ignoredKeys: ['updatedAt', 'createdAt'] }))}>
                    {(transitionStyles) => (
                        <Button
                            leftSection={userChanges.loading ? <Loader size="xs" color="white" type="bars" /> : <IconDeviceFloppy />}
                            style={transitionStyles}
                            className={classes["save-button"]}
                            onClick={async () => {
                                setUserChanges({ loading: true });
                                await putUser({ id: session?.user?.id, data: getDifferences(userChanges, session?.user, { ignoredKeys: ['updatedAt', 'createdAt'] }) });
                                setUserChanges({ loading: undefined });
                            }}
                            disabled={userChanges.loading}
                        >
                            <Text truncate inherit>
                                {t('saveChanges')}
                            </Text>
                        </Button>
                    )}
                </Transition>
            </Affix>
        </Grid>
    );
}

/**
 * Generates an array of numbers from min to max with a specified step.
 * @param {number} min - The minimum value.
 * @param {number} max - The maximum value.
 * @param {number} step - The step value.
 * @returns {number[]} - The generated array of numbers.
 */
export function generateNumberArray(min: number, max: number, step: number): number[] {
    const result: number[] = [];
    for (let i = min; i <= max; i += step) {
        result.push(i);
    }
    return result;
}