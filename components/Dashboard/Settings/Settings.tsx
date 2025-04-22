"use client";
import React, { useState } from 'react';
import { ITabModuleProps } from '@/data';
import {
  Affix,
  Badge,
  Button,
  ButtonGroup,
  Fieldset,
  Grid,
  Group,
  Loader,
  LoadingOverlay,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
  Transition,
  useMatches,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

import { chkP, getInitialsColor } from '../../../utils';
import AvatarFallback from '../../AvatarFallback/AvatarFallback';
import { CodingLanguageSelect } from '../../CodingLanguageSelect/CodingLanguageSelect';
import ColorSchemeToggleIconSegmented from '../../ColorSchemeToggleIconSegmented/ColorSchemeToggleIconSegmented';
import LocaleSelect from '../../LocaleSelect/LocaleSelect';
import classes from './Settings.module.css';

// Use a server action for user updates
import { putUser } from '../../../actions/PrismaFunctions/putUser';
import { Link } from '@/i18n/routing';

interface SettingsProps extends ITabModuleProps {}

interface Role {
  id: string;
  name: string;
}

interface SettingsFormValues {
  name?: string;
  username?: string;
  preferences: { codingLanguage: string };
}

export default function Settings({ session, style }: Readonly<SettingsProps>) {
  const t = useTranslations('Dashboard.Settings');
  const router = useRouter();
  const affixPosition = useMatches({
    base: { bottom: 100, left: 20 },
    sm: { bottom: 20, left: 320 },
  });

  // Initialize form with session user data
  const form = useForm<SettingsFormValues>({
    initialValues: {
      name: session?.user?.name ?? '',
      username: session?.user?.username ?? '',
      preferences: { codingLanguage: session?.user?.preferences.codingLanguage },
    },
    validate: {
      name: (val) => (!val || val.trim() === '' ? t('Account.name.error') : null),
      username: (val) => (!val || val.trim() === '' ? t('Account.username.error') : null),
    },
  });

  const [loading, setLoading] = useState(false);

  // Determine if form has unsaved changes
  const hasChanges = form.isDirty();

  // Handle form submission
  const handleSubmit = async (values: SettingsFormValues) => {
    setLoading(true);
    await putUser({ id: session?.user?.id!, data: values });
    setLoading(false);
    form.resetDirty();
    router.refresh();
  };

  return (
    <Grid p={{ base: 30, sm: 35 }} pt={{ base: 20, sm: 25 }} pb={15} style={style}>
      {/* Page Title */}
      <Grid.Col span={12}>
        <Title order={1} ta="left">
          {t('title')}
        </Title>
      </Grid.Col>

      {/* Account Section */}
      <Grid.Col span={12}>
        <Title order={2} ta="left">
          {t('account')}
        </Title>
        {session && (
          <Group mt={10} justify="flex-start">
            <AvatarFallback
              key={session.user?.email}
              src={session.user?.image ?? undefined}
              name={session.user?.username ?? session.user?.email ?? undefined}
              color="initials"
            />
            <Stack gap={2} align="flex-start" justify="center">
              <Text fw={500}>{session.user?.username ?? session.user?.email}</Text>
              <Text c="dimmed" size="sm">
                {session.user?.email}
              </Text>
              <Group gap={4}>
                {session.user?.roles?.map((role: Role) => (
                  <Tooltip key={role.id} label={role.name} color={getInitialsColor(role.name)} withArrow>
                    <Badge variant="dot" color={getInitialsColor(role.name)} radius="xs">
                      {role.name}
                    </Badge>
                  </Tooltip>
                ))}
              </Group>
            </Stack>
          </Group>
        )}

        <Fieldset
          w={{ base: '100%', md: '75%', xl: '55%', xxl: '40%' }}
          legend={t('Account.personalInfo')}
          className={classes.fieldset}
        >
          {/* Loading overlay during save */}
          <LoadingOverlay
            visible={loading}
            zIndex={1000}
            overlayProps={{ radius: 'sm', blur: 2 }}
          />

          <TextInput
            mb={10}
            label={t('Account.name.label')}
            placeholder={t('Account.name.placeholder')}
            {...form.getInputProps('name')}
          />
          <TextInput
            mb={10}
            label={t('Account.username.label')}
            placeholder={t('Account.username.placeholder')}
            {...form.getInputProps('username')}
          />
          <CodingLanguageSelect
            mb={10}
            label={t('Account.codingLanguage.label')}
            loadAsync={false}
            defaultOption={session.user.preferences.codingLanguage}
            onChange={(lang) => form.setFieldValue('preferences.codingLanguage', lang.aliases[0] || lang.language)}
          />
        </Fieldset>
      </Grid.Col>

      {/* Display Settings */}
      <Grid.Col span={12}>
        <Title order={2} ta="left">
          {t('display')}
        </Title>
        <Stack align="flex-start">
          <LocaleSelect dynamic={false} mt="md" />
          <ColorSchemeToggleIconSegmented />
        </Stack>
      </Grid.Col>

      {/* Debug Section (conditional) */}
      {chkP('developer:debug', session?.user) && (
        <Grid.Col span={12}>
          <Title order={2} ta="left">
            {t('debug')}
          </Title>
          <ButtonGroup mt={10}>
            <Button component={Link} href="./app/demo/" variant="outline">
              {t('demoComponents')}
            </Button>
          </ButtonGroup>
        </Grid.Col>
      )}

      {/* Save Button Affix */}
      <Affix position={affixPosition}>
        <Transition transition="slide-up" mounted={hasChanges}>
          {(styles) => (
            <Button
              leftSection={loading ? <Loader size="xs" /> : <IconDeviceFloppy />}
              style={styles}
              className={classes['save-button']}
              onClick={() => form.onSubmit(handleSubmit)()}
              disabled={!hasChanges || loading}
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