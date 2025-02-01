import { Center, Container, Stack } from "@mantine/core";
import { Welcome } from "../../components/Welcome/Welcome";
import NavbarHomepage from "../../components/NavbarHomepage/NavbarHomepage";
import AppRedirect from "../../components/AppRedirect/AppRedirect";

export default function HomePage() {
    return (
        <Container mx={{ xs: "3%", sm: "5%", md: "10%", lg: "15%", xl: "25%"}} mt={30} fluid>
            <NavbarHomepage />
            <Center>
                <Stack
                    align="stretch"
                    justify="center"
                    gap="md"
                    mt={{ base: "20vh", mt: "25vh" }}
                >
                    <Welcome />
                    <AppRedirect />
                </Stack>
            </Center>
        </Container>
    );
}