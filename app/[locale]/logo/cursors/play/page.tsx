import { ActionIcon, Center } from "@mantine/core";
import { IconHandFinger, IconPlayerPlay, IconPlayerPlayFilled } from "@tabler/icons-react";

export default function Page() {
    return (
        <Center>
            <ActionIcon color="grape" radius="180" size={"100vh"}> <IconPlayerPlayFilled size={1200} /> </ActionIcon>
        </Center>
    )
}