"use client";
import { Alert, AlertProps, Paper } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import { useState } from "react";

export default function ErrorAlert(props: Readonly<AlertProps & { withOuterLayer?: boolean}>) {
    const [show, setShow] = useState(true);
    const { children, withOuterLayer, ...rest } = props;
    if(withOuterLayer) 
        return (
            <Paper shadow="xl" radius="md" p="xl" withBorder>
                <Alert {...rest} mt={10} variant="light" color="red" withCloseButton icon={<IconAlertTriangle />} onClose={() => { setShow(false) }} hidden={!show}>
                    {children}
                </Alert>
            </Paper>
        )
    return (
        <Alert {...rest} mt={10} variant="light" color="red" withCloseButton icon={<IconAlertTriangle />} onClose={() => { setShow(false) }} hidden={!show}>
            {children}
        </Alert>
    );
}