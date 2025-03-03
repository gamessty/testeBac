import { Center } from "@mantine/core";
import DemoMenu from "../../../../components/Demo/DemoMenu/DemoMenu";

export default function demoPage() {
    return <Center h="100%" w="100%">
        <DemoMenu miw={{ base: "20rem", sm: "25rem" }} />
    </Center>;
}