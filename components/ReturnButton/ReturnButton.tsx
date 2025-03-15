"use client";
import { ButtonProps, Button, ActionIcon, ActionIconProps } from "@mantine/core";
import { IconArrowBackUp } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";


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
    const t = useTranslations('General');
    if (justIcon) {
        return (
            <ActionIcon
                {...props as ActionIconProps}
                onClick={() => router.back()}
                display={path.split("/").at(-1) == hideFrom ? "none" : undefined}
                title={t('return')}
            >
                <IconArrowBackUp />
            </ActionIcon>
        )
    }
    else {
        return (
            <Button
                {...props as ButtonProps}
                variant="light"
                display={path.split("/").at(-1) == hideFrom ? "none" : undefined}
                onClick={() => router.back()}
                leftSection={<IconArrowBackUp />}
            >
                {t('return')}
            </Button>
        );
    }
}