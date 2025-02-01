import { MantineStyleProp, Text } from "@mantine/core";

interface StatsProps {
    style?: MantineStyleProp;
}

export default function Stats({ style }: Readonly<StatsProps>) {
  return (
    <Text p={{base: 30, sm: 50}} style={style}>
      Stats
    </Text>
  );
}