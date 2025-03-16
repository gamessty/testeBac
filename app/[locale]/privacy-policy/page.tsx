import { Center, Paper } from "@mantine/core";
import PrivacyPolicy from "../../../components/PrivacyPolicy/PrivacyPolicy";
import ReturnButton from "../../../components/ReturnButton/ReturnButton";

export default async function PrivacyPolicyPage() {
    return (
        <>
            <ReturnButton ml="md" mt="md" />
            <Center>
                <Paper px={"25%"} py={10} pb={85} shadow="sm" radius="md">
                    <PrivacyPolicy />
                </Paper>
            </Center>
        </>
    );
}