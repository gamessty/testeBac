import { Button, Container, ContainerProps, em, Group, Stack, Stepper, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { Session } from "next-auth";
import { useTranslations } from "next-intl";
import { useState } from "react";
import ReturnButton from "../ReturnButton/ReturnButton";
import classes from './TestGenerator.module.css';

export default function TestGenerator({ session, ...props }: Readonly<{ session: Session } & ContainerProps>) {
    // ... rest of the code
    const t = useTranslations('Demo.TestGenerator');

    const [active, setActive] = useState(1);
    const nextStep = () => setActive((current) => (current < 4 ? current + 1 : current));
    const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));
    const isMobile = useMediaQuery(`(max-width: ${em(750)})`, true);

    return (
        <Container fluid p={{ base: 30, sm: 35 }} pt={{ base: 20, sm: 25 }} {...props}>
            <ReturnButton size="xs" className={classes["return-button"]} />
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
        </Container>
    )
}