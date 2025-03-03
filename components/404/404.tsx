'use client';
//NEEDS TRANSLATION
import { Button, Center, Container, Group, Text, Title } from '@mantine/core';
import { Illustration } from './Illustration';
import classes from './404.module.css';
import { useTranslations } from 'next-intl';
import { Link } from '../../i18n/routing';

export default function NothingFoundBackground() {
  const t = useTranslations('General.NotFound');
  return (
    <Container className={classes.root} fluid>
      <Center className={classes.center}>
        <div className={classes.inner}>
          <Illustration className={classes.image} />
          <div className={classes.content}>
            <Title className={classes.title}>{t('title')}</Title>
            <Text c="dimmed" size="lg" ta="center" className={classes.description}>
              {t('description')}
            </Text>
            <Group justify="center">
              <Button component={Link} href='/app' variant='light' size="md">{t('button')}</Button>
            </Group>
          </div>
        </div>
      </Center>
    </Container>
  );
}