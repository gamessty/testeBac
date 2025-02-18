"use client";
import { Stepper, Group, Button, Box, Paper, em, Stack, LoadingOverlay } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function TestGenerator() {
    const t = useTranslations('Demo.TestGenerator');
    const [active, setActive] = useState(1);
    const nextStep = () => setActive((current) => (current < 4 ? current + 1 : current));
    const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));
    const isMobile = useMediaQuery(`(max-width: ${em(750)})`, true);

    return (
        <Paper w={{ base: "90%", sm: "80%", md: "70%", lg: "60%" }} pos="relative" h="35%" p="lg" withBorder ta="center">
            <LoadingOverlay visible={active == 4} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
            <Stack justify="space-between" h="100%">
                <Stepper active={active} onStepClick={setActive} allowNextStepsSelect={false}>
                    <Stepper.Step label={isMobile ? undefined : t('steps.1.label')} description={isMobile ? undefined : t('steps.1.description')}>
                        Step 1 content: What type of test is it? BAC/ ENTRANCE
                    </Stepper.Step>
                    <Stepper.Step label={isMobile ? undefined : t('steps.2.label')} description={isMobile ? undefined : t('steps.2.description')}>
                        Step 2 content: What folder is it in case of BAC/ WHAT UNIVERSITY/EXAM CENTER in case of ENTRANCE? ALSO SELECT THE SUBJECT
                    </Stepper.Step>
                    <Stepper.Step label={isMobile ? undefined : t('steps.3.label')} description={isMobile ? undefined : t('steps.3.description')}>
                        Step 3 content: What chapters to test from?
                    </Stepper.Step>
                    <Stepper.Completed>
                        Completed, click back button to get to previous step
                    </Stepper.Completed>
                </Stepper>

                <Group justify="center" mt="xl">
                    <Button variant="default" onClick={prevStep}>{t('steps.back')}</Button>
                    <Button onClick={nextStep}>{t('steps.next')}</Button>
                </Group>
            </Stack>
        </Paper>
    );
}