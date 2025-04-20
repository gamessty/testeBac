"use client";
import { Affix, Blockquote, Button, Center, Container, em, FocusTrap, Group, Loader, LoadingOverlay, Stack, Stepper, Text } from "@mantine/core";
import { useDidUpdate, useDisclosure, useMediaQuery } from "@mantine/hooks";
import { Chapter, Folder, Subject } from "@prisma/client";
import { IconAlertTriangleFilled, IconChevronRight } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
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
import { ITabModuleProps } from "@/data";

interface TestConfiguration {
    category?: string;
    folderId?: string;
    subjectIds?: string[];
    subjectQuestionIds?: string[];
    chapterIds?: string[];
    testType?: string;
    configurations?: Record<string, any>;
}

interface QuestionRange {
    min: number;
    max: number;
    count: number;
}

export default function TestGenerator({ style, triggerloading }: Readonly<ITabModuleProps>) {
    const tError = useTranslations('General.Errors');
    const t = useTranslations('Dashboard.TestGenerator');
    const router = useRouter();

    const [configurations, setConfigurations] = useState<TestConfiguration>();
    const [allowedStep, setAllowedStep] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<string[]>([]);
    const [folder, setFolder] = useState<Folder[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [error, setError] = useState<string | null>(null);
    const stepperRef = useRef<HTMLDivElement>(null);
    const [activeFocus] = useDisclosure(true);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [questionDistribution, setQuestionDistribution] = useState<Record<string, number>>({});
    const [questionRanges, setQuestionRanges] = useState<Record<string, QuestionRange>>({});
    const [totalAvailableQuestions, setTotalAvailableQuestions] = useState<number>(0);
    const lastNotificationRef = useRef<number>(0);

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
        if (!configurations) {
            setAllowedStep(0);
            return;
        }
        let step = 0;
        if (configurations?.category) step = 1;
        if (configurations?.folderId) step = 2;
        if (configurations?.chapterIds?.length || configurations?.subjectQuestionIds?.length) step = 3;
        if (configurations?.testType && configurations?.configurations) step = 4;
        setAllowedStep(step);
    }, [configurations]);

    const [active, setActive] = useState(0);

    // compute dynamic pool size
    const totalPool = Object.values(questionRanges).reduce((acc, r) => acc + (r.max - r.min + 1), 0);

    const nextStep = () => {
        // clamp at step before final configuration
        if (active === 2 && configurations?.testType === 'simple' && configurations?.configurations) {
            const currentVal = Number(configurations.configurations.numberOfQuestions);
            const allowedMax = totalPool;
            if (currentVal > allowedMax) {
                setConfigurations(prev => ({
                    ...prev!,
                    configurations: {
                        ...(prev?.configurations || {}),
                        numberOfQuestions: allowedMax
                    }
                }));
                
                // Only show notification if we haven't shown one in the last second
                const now = Date.now();
                if (now - lastNotificationRef.current > 1000) {
                    lastNotificationRef.current = now;
                    notifications.show({
                        color: 'yellow',
                        title: t('warnings.configuration.title', { allowedMax }),
                        message: t('warnings.configuration.adjusted', { allowedMax })
                    });
                }
                return;
            }
        }
        setActive((current) => (current < 4 ? current + 1 : current));
        if (stepperRef.current) findFirstFocusable(stepperRef.current)?.focus();
    };
    const prevStep = () => { setActive((current) => (current > 0 ? current - 1 : current)); if (stepperRef.current) findFirstFocusable(stepperRef.current)?.focus(); };
    const isMobile = useMediaQuery(`(max-width: ${em(750)})`, true);

    useEffect(() => {
        if (active >= 3) {
            // If no test type is selected, default to "simple" (the first entry)
            if (!configurations?.testType) {
                setConfigurations(prev => ({ ...prev!, testType: "simple" }));
            }
        }
    }, [active, configurations]);

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
            triggerloading(true);
            setLoading(true);
            // Calculate total selected questions
            const totalSelectedQuestions = Object.values(questionDistribution).reduce((sum, count) => sum + count, 0);
            
            // If numberOfQuestions is not specified and we have distribution, use the total
            if (totalSelectedQuestions > 0 && 
                configurations.configurations && 
                configurations.configurations.numberOfQuestions === undefined) {
                
                // Create a temporary configuration with numberOfQuestions for the API call
                const configWithNumber = {
                    ...configurations,
                    configurations: {
                        ...configurations.configurations,
                        numberOfQuestions: totalSelectedQuestions
                    }
                };
                
                // Proceed with the modified config without updating state
                const result = await generateTest({
                    ...configWithNumber,
                    questionDistribution
                });
                
                // Handle result as before
                if (result.success) {
                    router.push(`/app/test/${result.testId}`);
                } else {
                    triggerloading(false);
                    setLoading(false);
                    notifications.show({
                        color: 'red',
                        title: tError.has(`${result.message}.title`) ? tError(`${result.message}.title`) : tError('UNKNOWN.title'),
                        message: tError.has(`${result.message}.title`) ? tError(`${result.message}.title`) : tError('UNKNOWN.messageCode', { code: result.message })
                    });
                }
                return;
            }
            
            // If no questions selected in the distribution
            if (totalSelectedQuestions === 0 && Object.keys(questionDistribution).length > 0) {
                notifications.show({
                    color: 'red',
                    title: t('errors.noQuestions.title'),
                    message: t('errors.noQuestions.message') || "You need to select at least one question from the available sources."
                });
                return;
            }
            
            // Proceed with normal generate test if we're not using distribution or numberOfQuestions is set
            const result = await generateTest({
                ...configurations,
                questionDistribution
            });
            
            if (result.success) {
                // Redirect to the generated test page
                router.push(`/app/test/${result.testId}`);
            } else {
                // Show error notification using separate translation keys for title and message
                notifications.show({
                    color: 'red',
                    title: tError.has(`${result.message}.title`) ? tError(`${result.message}.title`) : tError('UNKNOWN.title'),
                    message: tError.has(`${result.message}.title`) ? tError(`${result.message}.title`) : tError('UNKNOWN.messageCode', { code: result.message })
                });
            }
        }
    };

    const handleConfigurationsChange = (configs: Record<string, any> | ((current: Record<string, any> | undefined) => Record<string, any>)) => {
        // Handle both direct objects and callback functions
        if (typeof configs === 'function') {
            setConfigurations((prev) => {
                const currentConfigs = prev?.configurations || {};
                const newConfigs = configs(currentConfigs);
                
                console.log('Updated configs via callback:', newConfigs);
                
                return {
                    ...prev,
                    configurations: newConfigs
                };
            });
            return;
        }
        
        // Avoid triggering setState if configs is undefined or null
        if (!configs) return;
        
        console.log('Direct configs update:', configs);
        
        setConfigurations((prev) => {
            // If prev doesn't exist, initialize with the new configs
            if (!prev) return { configurations: { ...configs } };
            
            // If prev.configurations doesn't exist, just add the new configs
            if (!prev.configurations) {
                return {
                    ...prev,
                    configurations: { ...configs }
                };
            }
            
            // Create copy of the current and new configurations for comparison
            const currentConfigs = { ...prev.configurations };
            const newConfigs = { ...configs };
            
            // Return the updated state only if there are actual differences
            // This avoids unnecessary state updates
            if (JSON.stringify(currentConfigs) !== JSON.stringify(newConfigs)) {
                return {
                    ...prev,
                    configurations: newConfigs
                };
            }
            
            // No changes detected, return previous state
            return prev;
        });
    };

    const handleQuestionDistributionChange = useCallback(
        (distribution: Record<string, number>) => {
            setQuestionDistribution(distribution);
            
            // Calculate new total from the distribution
            const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
            
            // If we have a numberOfQuestions config that's larger than our selected questions,
            // update it to match the total selected
            if (configurations?.testType === 'simple' && 
                configurations?.configurations?.numberOfQuestions && 
                Number(configurations.configurations.numberOfQuestions) > total && 
                total > 0) {
                
                setConfigurations(prev => ({
                    ...prev!,
                    configurations: {
                        ...(prev?.configurations || {}),
                        numberOfQuestions: total
                    }
                }));
                
                // Only show notification if we haven't shown one in the last second
                const now = Date.now();
                if (now - lastNotificationRef.current > 1000) {
                    lastNotificationRef.current = now;
                    notifications.show({
                        color: 'yellow',
                        title: t('warnings.configuration.title', { allowedMax: total }),
                        message: t('warnings.configuration.adjusted', { allowedMax: total })
                    });
                }
            }
        },
        [configurations, t]
    );

    const handleTotalQuestionsChange = useCallback((total: number) => {
        setTotalAvailableQuestions(total);
        
        // If total question count changes and we have a simple test type with numberOfQuestions
        // that exceeds our total, automatically adjust it
        if (configurations?.testType === 'simple' && 
            configurations?.configurations?.numberOfQuestions && 
            Number(configurations.configurations.numberOfQuestions) > total) {
            
            setConfigurations(prev => ({
                ...prev!,
                configurations: {
                    ...(prev?.configurations || {}),
                    numberOfQuestions: total
                }
            }));
            
            if (total > 0) {
                // Only show notification if we haven't shown one in the last second
                const now = Date.now();
                if (now - lastNotificationRef.current > 1000) {
                    lastNotificationRef.current = now;
                    notifications.show({
                        color: 'yellow',
                        title: t('warnings.configuration.title', { allowedMax: total }),
                        message: t('warnings.configuration.adjusted', { allowedMax: total })
                    });
                }
            }
        }
    }, [configurations, t]);

    return (
        <Container size="xl" p={{ base: 30, sm: 35 }} pt={{ base: 20, sm: 25 }} className={classes['main-container']} style={style}>
            <ReturnButton
                cancelLoading={cancelLoading}
                timeout={0}
                size="xs"
                className={classes["return-button"]}
            />
            <LoadingOverlay visible={loading} zIndex={1100} loaderProps={{ type: 'dots', color: "teal" }}/>
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
                                            <Loader color="teal" type="dots" />
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
                                    variant="compact"
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
                                    onQuestionDistributionChange={handleQuestionDistributionChange}
                                    onTotalQuestionsChange={handleTotalQuestionsChange}
                                    selectedSubjects={configurations?.subjectQuestionIds ?? []}
                                    selectedChapters={configurations?.chapterIds ?? []}
                                    subjects={subjects}
                                    chapters={chapters}
                                    configs={configurations?.configurations}
                                />
                            </Stepper.Step>
                            <Stepper.Completed>
                                Completed, click back button to get to previous step
                            </Stepper.Completed>
                        </Stepper>
                    </Stack>
                    <Affix position={{ bottom: 0, left: 0, right: 0 }}>
                        <Group justify="center" className={classes['stepper-buttons']}>
                            <Button size="lg" disabled={active == 0} variant="default" onClick={prevStep}>{t('steps.back')}</Button>
                            <Button size="lg" rightSection={<IconChevronRight />}
                                disabled={active + 1 > allowedStep || (active == 3 && configurations?.configurations?.numberOfQuestions <= 0)}
                                onClick={active == 3 ? handleGenerateTest : nextStep}>
                                    {active == 3 ? t('steps.generate') : t('steps.next')}
                            </Button>
                        </Group>
                    </Affix>
                </FocusTrap>
            }
        </Container>
    )
}