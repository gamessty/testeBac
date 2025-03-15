"use client";
import { ButtonProps, Button, ActionIcon, ActionIconProps, Loader } from "@mantine/core";
import { useIsomorphicEffect, useShallowEffect } from "@mantine/hooks";
import { IconArrowBackUp } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";


interface ReturnButtonBaseProps {
    hideFrom?: string;
    justIcon?: boolean;
}

interface ReturnButtonProps extends ReturnButtonBaseProps, ButtonProps {
    justIcon?: false;
}

interface ReturnButtonPropsJustIcon extends ReturnButtonBaseProps, ActionIconProps {
    justIcon: true;
}

type ReturnButtonType = ReturnButtonProps | ReturnButtonPropsJustIcon;

export default function ReturnButton({ justIcon, hideFrom, ...props }: Readonly<ReturnButtonType>) {
    const router = useRouter();
    const path = usePathname();
    const [loading, setLoading] = useState(false);
    const t = useTranslations('General');
    function handleRouterBack() {
        setLoading(true);
        setTimeout(() => {
            router.back();
        }, 100);
    }
    useEffect(() => {
        setLoading(false);
    }, [path]);
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
                onClick={handleRouterBack}
                loading={loading}
                leftSection={<IconArrowBackUp />}
            >
                {t('return')}
            </Button>
        );
    }
}