import { Center } from "@mantine/core";
import DemoMenu from "../../../../components/Demo/DemoMenu/DemoMenu";

export default function demoPage() {
    return <Center h="100vh" w="100vw">
        <DemoMenu miw={{ base: "20rem", sm: "25rem" }} />
    </Center>;
}