import { Button, Group } from "@mantine/core";
import { IconBrandGithub } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

export default function GithubRepo() {
    const t = useTranslations('HomePage');
    return (
        <Group justify="center" mt={30}>
            <Button variant="subtle" leftSection={<IconBrandGithub size={16} />} component="a" href="https://github.com/gamessty/testeBac">
                {t('viewOnGithub')}
            </Button>
        </Group>
    );
}