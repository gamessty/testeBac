import { Text, Title } from '@mantine/core';
import classes from './Welcome.module.css';
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
      <Text c="dimmed" style={{ textIndent: 60 }} ta="justify" size="lg" maw={750} mx="auto" mt="xl">
        {t('about')}
      </Text>
    </>
  );
}
