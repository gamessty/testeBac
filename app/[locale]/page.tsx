import { Center, Container, Stack } from "@mantine/core";
import { Welcome } from "../../components/Welcome/Welcome";
import NavbarHomepage from "../../components/NavbarHomepage/NavbarHomepage";

export default function HomePage() {
    return (
        <Container mx={{ xs: "3%", sm: "5%", md: "10%", lg: "15%", xl: "25%"}} mt={30} fluid>
            <NavbarHomepage />
            <Center>
                <Stack
                    align="stretch"
                    justify="center"
                    gap="md"
                    mt={200}
                >
                    <Welcome />
                </Stack>
            </Center>
        </Container>
    );
}