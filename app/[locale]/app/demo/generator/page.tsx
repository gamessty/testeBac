import { Affix, Center, Group } from "@mantine/core";
import TestGenerator from "../../../../../components/Demo/TestGenerator/TestGenerator";
import LocaleSwitch from "../../../../../components/LocaleSwitch/LocaleSwitch";
import ColorSchemeToggleIcon from "../../../../../components/ColorSchemeToggleIcon/ColorSchemeToggleIcon";

export default function QuestionDemo() {

    return (
        <>
            <Center h="100vh" w="100vw">
                <TestGenerator />
            </Center>
            <Affix position={{ bottom: 20, right: 20 }}>
                <Group align="end">
                    <LocaleSwitch />
                    <ColorSchemeToggleIcon size="40" />
                </Group>
            </Affix>
        </>
    );
}