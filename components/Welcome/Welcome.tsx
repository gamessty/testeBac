import { Text, Title } from '@mantine/core';
import classes from './Welcome.module.scss';
import { useTranslations } from 'next-intl';

export function Welcome() {
  const t = useTranslations('HomePage');

  return (
    <>
      <Title className={classes.title} ta="center" mt={10}>
        {t('title') + ' '}
        <Text inherit variant="gradient" component="span" gradient={{ from: 'pink', to: 'yellow' }}>
          testeBac
        </Text>
      </Title>
      <Text c="dimmed" style={{ textIndent: 60 }} ta="justify" size="md" maw={770} mx="auto" mt="lg">
        {t('about')}
      </Text>
    </>
  );
}
