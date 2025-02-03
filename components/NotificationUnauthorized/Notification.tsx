'use client';
import { useShallowEffect } from "@mantine/hooks";
import { NotificationData, notifications } from "@mantine/notifications";



export default function Notification({ show, data }: {data: NotificationData, show: boolean}) {
    useShallowEffect(() => {
        if (show) {
            notifications.show(data)
        }
    }, [show, data]);
    return null;
}