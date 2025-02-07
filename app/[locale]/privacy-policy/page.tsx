import { Center, Paper } from "@mantine/core";
import PrivacyPolicy from "../../../components/PrivacyPolicy/PrivacyPolicy";

export default async function PrivacyPolicyPage() {
    return (
        <Center>
            <Paper px={"25%"} py={10} pb={85} shadow="sm" radius="md">
                <PrivacyPolicy />
            </Paper>
        </Center>
    );
}