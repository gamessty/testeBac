"use client";
import { Affix, Blockquote, Button, Center, Container, ContainerProps, em, FocusTrap, Group, Loader, Stack, Stepper, Text } from "@mantine/core";
import { useDidUpdate, useDisclosure, useMediaQuery } from "@mantine/hooks";
import { Chapter, Folder, Subject } from "@prisma/client";
import { IconAlertTriangleFilled, IconChevronRight } from "@tabler/icons-react";
import { Session } from "next-auth";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { generateTest } from "../../actions/PrismaFunctions/createUserTest";
import getChapters from "../../actions/PrismaFunctions/getChapters";
import getManyFolder from "../../actions/PrismaFunctions/getManyFolder";
import getSubjects from "../../actions/PrismaFunctions/getSubjects";
import ReturnButton from "../ReturnButton/ReturnButton";
import TestGeneratorSelector from "../TestGeneratorSelector/TestGeneratorSelector";
import { TestGeneratorSelectorList } from "../TestGeneratorSelector/TestGeneratorSelector.List";
import findFirstFocusable from "./findFirstFocusable";
import classes from './TestGenerator.module.css';
import TestTypeSelector from "./TestTypeSelector/TestTypeSelector";

interface TestConfiguration {
    category?: string;
    folderId?: string;
    subjectIds?: string[];
    subjectQuestionIds?: string[];
    chapterIds?: string[];
    testType?: string;
    configurations?: Record<string, any>;
}

export default function TestGenerator({ session, ...props }: Readonly<{ session: Session } & ContainerProps>) {
    const t = useTranslations('Dashboard.TestGenerator');

    const [configurations, setConfigurations] = useState<TestConfiguration>();
    const [allowedStep, setAllowedStep] = useState<number>(0);
    const [categories, setCategories] = useState<string[]>([]);
    const [folder, setFolder] = useState<Folder[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [error, setError] = useState<string | null>(null);
    const stepperRef = useRef<HTMLDivElement>(null);
    const [activeFocus] = useDisclosure(true);
    const [cancelLoading, setCancelLoading] = useState(false);

    useEffect(() => {
        async function fetchData() {
            const fetchedFolders = await getManyFolder();
            if (!Array.isArray(fetchedFolders) && fetchedFolders?.message) {
                return setError(fetchedFolders.message);
            }
            else if (Array.isArray(fetchedFolders)) {
                let fetchedCategories = [...new Set(fetchedFolders.map((test) => test.category))];
                setCategories(fetchedCategories);
                setFolder(fetchedFolders);
            }
        }
        fetchData();
    }, []);

    useDidUpdate(() => {
        setAllowedStep(0);
        setConfigurations((prev) => ({ category: prev?.category }));
    }, [configurations?.category]);

    useDidUpdate(() => {
        async function fetchData() {
            if (!configurations?.folderId) return;
            setSubjects([]);
            setConfigurations((prev) => ({ ...prev, subjectIds: [] }));
            const fetchedSubjects = await getSubjects({
                folderId: configurations?.folderId
            });
            if (!Array.isArray(fetchedSubjects) && fetchedSubjects?.message) {
                return setError(fetchedSubjects.message);
            }
            else if (Array.isArray(fetchedSubjects)) {
                setSubjects(fetchedSubjects);
            }
        }
        fetchData();
        setAllowedStep(1);
        setConfigurations((prev) => ({ category: prev?.category, folderId: prev?.folderId }));
    }, [configurations?.folderId]);

    useDidUpdate(() => {
        async function fetchData() {
            if (!subjects) return;
            setChapters([]);
            setConfigurations((prev) => ({ ...prev, chapterIds: [] }));
            for (let subjectId of subjects.filter((subject) => subject.folderId == configurations?.folderId).map((subject) => subject.id)) {
                const fetchedChapters = await getChapters({
                    subjectId: subjectId
                });
                if (!Array.isArray(fetchedChapters) && fetchedChapters?.message) {
                    return setError(fetchedChapters.message);
                }
                else if (Array.isArray(fetchedChapters)) {
                    setChapters((prev) => {
                        if (prev) return [...prev, ...fetchedChapters];
                        else return fetchedChapters;
                    });
                }
            }
        }
        fetchData();
    }, [subjects]);

    useDidUpdate(() => {
        if (!configurations) setAllowedStep(0);
        if (configurations?.category) setAllowedStep(1);
        if (configurations?.folderId) setAllowedStep(2);
        if (configurations?.chapterIds?.length || configurations?.subjectIds?.length) setAllowedStep(3);
    }, [configurations])

    const [active, setActive] = useState(0);
    const nextStep = () => { setActive((current) => (current < 4 ? current + 1 : current)); if (stepperRef.current) findFirstFocusable(stepperRef.current)?.focus(); };
    const prevStep = () => { setActive((current) => (current > 0 ? current - 1 : current)); if (stepperRef.current) findFirstFocusable(stepperRef.current)?.focus(); };
    const isMobile = useMediaQuery(`(max-width: ${em(750)})`, true);

    const handleLoadingCancel = () => {
        setCancelLoading(true);
        setTimeout(() => {
            setCancelLoading(false);
        }, 50);
    }

    useEffect(() => {
        const hasStartedConfiguration = configurations?.category && configurations.category.length > 0;

        // Handle beforeunload event (for page reload and tab close)
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasStartedConfiguration) {
                e.preventDefault();
                e.returnValue = '';
                return '';
            }
        };

        // For App Router we need to use browser history directly
        const handlePopState = (e: PopStateEvent) => {
            if (hasStartedConfiguration) {
                // Prevent the default back navigation
                e.preventDefault();

                // Show browser's native confirmation dialog
                if (confirm(t('exitConfiguration.message'))) {
                    // If user confirms, navigate back
                    window.removeEventListener('popstate', handlePopState);
                    window.removeEventListener('beforeunload', handleBeforeUnload);
                    window.history.back();
                } else {
                    // If user cancels, stay on the page by pushing current state again
                    window.history.pushState(null, '', window.location.href);
                    handleLoadingCancel();
                }
            }
        };

        // Push a new state so we can capture the popstate event
        if (hasStartedConfiguration) {
            window.history.pushState(null, '', window.location.href);
        }

        // Add event listeners
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('popstate', handlePopState);

        return () => {
            // Clean up event listeners
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [configurations?.category, t]);

    const handleGenerateTest = async () => {
        if (configurations) {
            const result = await generateTest(configurations);
            if (result.success) {
                // Handle success, e.g., navigate to the generated test page
            } else {
                // Handle error
                setError(result.message ?? null);
            }
        }
    };

    const handleConfigurationsChange = (configs: Record<string, any>) => {
        setConfigurations((prev) => {
            if (prev) return {
                ...prev,
                configurations: configs
            }
        });
    };



    return (
        <Container size="xl" p={{ base: 30, sm: 35 }} pt={{ base: 20, sm: 25 }} className={classes['main-container']} {...props}>
            <ReturnButton
                cancelLoading={cancelLoading}
                timeout={0}
                size="xs"
                className={classes["return-button"]}
            />
            {
                error && (
                    <Blockquote className={classes.blockquote} color="red" cite={"– " + t('errors.fetch.title', { error })} icon={<IconAlertTriangleFilled />}>
                        {t('errors.fetch.message', { error })}
                    </Blockquote>
                )
            }
            {!error &&
                <FocusTrap active={activeFocus}>
                    <Stack justify="space-between" h="100%" className={classes['main-stack']}>
                        <Stepper active={active} onStepClick={setActive} allowNextStepsSelect={false} ref={stepperRef}>
                            <Stepper.Step label={isMobile ? undefined : t('steps.1.label')} description={isMobile ? undefined : t('steps.1.description')}>
                                {categories && categories.length > 0 &&
                                    <TestGeneratorSelector
                                        value={configurations?.category}
                                        data={categories.map((category) => ({ name: category }))}
                                        onChange={(value) => {
                                            setConfigurations((prev) => {
                                                if (prev) return {
                                                    ...prev,
                                                    category: value
                                                }
                                                else {
                                                    return {
                                                        category: value
                                                    }
                                                }
                                            });
                                        }}
                                    />
                                }
                                {
                                    !categories || categories.length === 0 &&
                                    <Container fluid>
                                        <Center className={classes["loader"]}>
                                            <Loader color="grey" type="dots" />
                                        </Center>
                                    </Container>
                                }
                            </Stepper.Step>
                            <Stepper.Step label={isMobile ? undefined : t('steps.2.label')} description={isMobile ? undefined : t('steps.2.description')}>
                            <Text c='dimmed' fz="sm" mb={5} hidden={!isMobile}>{t('steps.2.description')}</Text>
                                <TestGeneratorSelector
                                    value={configurations?.folderId}
                                    data={folder.filter((folder) => folder.category == configurations?.category)}
                                    onChange={(value) => {
                                        setConfigurations((prev) => {
                                            if (prev) return {
                                                ...prev,
                                                folderId: value
                                            }
                                        });
                                    }}
                                />
                            </Stepper.Step>
                            <Stepper.Step label={isMobile ? undefined : t('steps.3.label')} description={isMobile ? undefined : t('steps.3.description')}>
                                <Text c='dimmed' fz="sm" mb={5} hidden={!isMobile}>{t('steps.3.description')}</Text>
                                <TestGeneratorSelectorList
                                    variant="card"
                                    subjects={subjects}
                                    chapters={chapters}
                                    valueChapters={configurations?.chapterIds ?? []}
                                    valueSubjects={configurations?.subjectQuestionIds ?? []}
                                    onChaptersChange={(value) => {
                                        setConfigurations((prev) => {
                                            if (prev) return {
                                                ...prev,
                                                chapterIds: value
                                            }
                                        });
                                    }}
                                    onSubjectsChange={(value) => {
                                        setConfigurations((prev) => {
                                            if (prev) return {
                                                ...prev,
                                                subjectQuestionIds: value
                                            }
                                        });
                                    }}
                                    onChapterSubjectChange={(value) => {
                                        setConfigurations((prev) => {
                                            if (prev) return {
                                                ...prev,
                                                subjectIds: value
                                            }
                                        });
                                    }}
                                />
                            </Stepper.Step>
                            <Stepper.Step label={isMobile ? undefined : t('steps.4.label')} description={isMobile ? undefined : t('steps.4.description')}>
                                <TestTypeSelector
                                    radius="lg"
                                    className={classes['test-type-selector']}
                                    value={configurations?.testType}
                                    onChange={(value) => {
                                        setConfigurations((prev) => {
                                            if (prev) return {
                                                ...prev,
                                                testType: value ?? undefined
                                            }
                                        });
                                    }}
                                    onConfigurationsChange={handleConfigurationsChange}
                                />
                            </Stepper.Step>
                            <Stepper.Completed>
                                Completed, click back button to get to previous step
                            </Stepper.Completed>
                        </Stepper>
                    </Stack>
                    <Affix position={{ bottom: 0, left: 0, right: 0 }} className={classes['stepper-buttons']}>
                        <Group justify="center">
                            <Button size="lg" disabled={active == 0} variant="default" onClick={prevStep}>{t('steps.back')}</Button>
                            <Button size="lg" rightSection={<IconChevronRight />} disabled={active + 1 > allowedStep} onClick={active == 3 ? handleGenerateTest : nextStep}>{active == 3 ? t('steps.generate') : t('steps.next')}</Button>
                        </Group>
                    </Affix>

                </FocusTrap>

            }
        </Container>
    )
}