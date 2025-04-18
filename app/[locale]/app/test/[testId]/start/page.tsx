import { Text } from "@mantine/core";

export default async function TestStart({
    params
}: Readonly<{ params: Promise<{ testId: string }> }>)
{
    let { testId } = await params;
    return (
        <Text>
            Test Start Page: {testId}
        </Text>
    );
}