import { MantineStyleProp, Text } from "@mantine/core";

interface TestsProps {
    style?: MantineStyleProp;
}

export default function Tests({ style }: Readonly<TestsProps>) {
    return (
        <Text p={{base: 30, sm: 50}}  style={style}>
            Tests
        </Text>
    );
    }