'use client';
import styles from './ErrorOverlay.module.css';
import { useRouter } from "@/i18n/routing";
import { Button, Container, Group, Modal, Text } from "@mantine/core";
import { useTranslations } from "next-intl";


interface ErrorOverlayProps {
    error?: string
}

export default function ErrorOverlay({ error }: Readonly<ErrorOverlayProps>) {
    const t = useTranslations('General.Errors');
    const router = useRouter();
    if (!error || error === '') return null;

    const data = {
        title: t.has(`${error}.title`) ? t(`${error}.title`) : t('UNKNOWN.title'),
        children: (
            <Container fluid className={styles.modalContainer}>
                <Text>{t.has(`${error}.message`) ? t(`${error}.message`) : t('UNKNOWN.message')}</Text>
                <Group classNames={{ root: styles.modalButtons }}>
                    <Button onClick={() => router.push('/app?tab=tests')} variant="outline" color="gray">
                        {t('goBack')}
                    </Button>
                </Group>
            </Container>
        ),
        centered: true,
        size: 'lg',
        radius: 'sm',
        styles: {
            close: {
                display: 'none',
            }
        }
    }

    return (
        <Modal
            classNames={{
                title: styles.modalTitle,
                content: styles.modalContent,
            }}
            opened={true}
            {...data}
            onClose={() => {
                router.push('/app?tab=tests')
            }}
        />
    )
}