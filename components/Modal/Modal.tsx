'use client';
import { useShallowEffect } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { ModalSettings } from "@mantine/modals/lib/context";

export default function Modal({ show, data }: {data: ModalSettings, show: boolean}) {
    useShallowEffect(() => {
        if (show) {
            modals.open(data)
        }
    }, [show, data]);
    return null;
}