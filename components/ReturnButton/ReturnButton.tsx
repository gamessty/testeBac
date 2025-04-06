"use client";
import { ActionIcon, ActionIconProps, Button, ButtonProps } from "@mantine/core";
import { useMounted } from "@mantine/hooks";
import { modals, openConfirmModal } from "@mantine/modals";
import { IconArrowBackUp } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";


interface ReturnButtonBaseProps {
    hideFrom?: string;
    justIcon?: boolean;
    timeout?: number;
    cancelLoading?: boolean;
    confirmModal?: Omit<Parameters<typeof openConfirmModal>[0], 'onConfirm'>;
}

interface ReturnButtonProps extends ReturnButtonBaseProps, ButtonProps {
    justIcon?: false;
}

interface ReturnButtonPropsJustIcon extends ReturnButtonBaseProps, ActionIconProps {
    justIcon: true;
}

type ReturnButtonType = ReturnButtonProps | ReturnButtonPropsJustIcon;

export default function ReturnButton({ justIcon, cancelLoading, confirmModal, hideFrom, timeout = 100, ...props }: Readonly<ReturnButtonType>) {
    const router = useRouter();
    const path = usePathname();
    const [loading, setLoading] = useState(false);
    const mounted = useMounted();
    const t = useTranslations('General');
    function handleRouterBack() {
        setLoading(true);
        setTimeout(() => {
            router.back();
        }, timeout);
    }

    useEffect(() => {
        setLoading(false);
    }, [path]);

    useEffect(() => {
        if(cancelLoading) setLoading(false);
    }, [cancelLoading]);

    const confirmationModal = () => {
        modals.openConfirmModal({ onConfirm: handleRouterBack , ...confirmModal});
    };
    
    if(mounted && (typeof window !== "undefined") && window.history.length <= 1) return null;
    if (justIcon) {
        return (
            <ActionIcon
                {...props as ActionIconProps}
                onClick={handleRouterBack}
                display={path.split("/").at(-1) == hideFrom ? "none" : undefined}
                title={t('return')}
                loading={loading}
            >
            </ActionIcon>
        )
    }
    else {
        return (
            <Button
                {...props as ButtonProps}
                variant="light"
                display={path.split("/").at(-1) == hideFrom ? "none" : undefined}
                onClick={confirmModal ? confirmationModal : handleRouterBack}
                loading={loading}
                leftSection={<IconArrowBackUp />}
            >
                {t('return')}
            </Button>
        );
    }
}