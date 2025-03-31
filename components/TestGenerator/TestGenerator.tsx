"use client";
import { Blockquote, Box, Button, Center, Container, ContainerProps, Divider, em, FocusTrap, Group, Loader, Overlay, Stack, Stepper, Text } from "@mantine/core";
import { useDidUpdate, useDisclosure, useFocusReturn, useFocusTrap, useMediaQuery } from "@mantine/hooks";
import { Session } from "next-auth";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import ReturnButton from "../ReturnButton/ReturnButton";
import classes from './TestGenerator.module.css';
import getManyFolder from "../../actions/PrismaFunctions/getManyFolder";
import { Chapter, Folder, Subject } from "@prisma/client";
import { IconAlertTriangleFilled, IconArrowAutofitRight, IconArrowRight, IconChevronCompactRight, IconChevronRight } from "@tabler/icons-react";
import TestGeneratorSelector from "../TestGeneratorSelector/TestGeneratorSelector";
import getSubjects from "../../actions/PrismaFunctions/getSubjects";
import getChapters from "../../actions/PrismaFunctions/getChapters";
import TestGeneratorSelectorChip from "../TestGeneratorSelector/TestGeneratorSelector.Chip";
import findFirstFocusable from "./findFirstFocusable";
import TestTypeSelector from "./TestTypeSelector/TestTypeSelector";
import { useRouter } from "next/navigation";
import { modals } from "@mantine/modals";
import { generateTest } from "../../actions/PrismaFunctions/createUserTest";

interface TestConfiguration {
    category?: string;
    folderId?: string;
    subjectIds?: string[];
    chapterIds?: string[];
    testType?: string;
    configurations?: Record<string, any>;
}

export default function TestGenerator({ session, ...props }: Readonly<{ session: Session } & ContainerProps>) {
    const t = useTranslations('Dashboard.TestGenerator');
    const router = useRouter();

    const [configurations, setConfigurations] = useState<TestConfiguration>();
    const [allowedStep, setAllowedStep] = useState<number>(0);
    const [categories, setCategories] = useState<string[]>([]);
    const [folder, setFolder] = useState<Folder[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [error, setError] = useState<string | null>(null);
    const stepperRef = useRef<HTMLDivElement>(null);
    const [activeFocus] = useDisclosure(true);

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
            if (!configurations?.subjectIds) return;
            setChapters([]);
            setConfigurations((prev) => ({ ...prev, chapterIds: [] }));
            for (let subjectId of configurations.subjectIds) {
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
    }, [configurations?.subjectIds]);

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

    const confirmTestConfigurationExitProps = {
        title: t('exitConfiguration.title'),
        centered: true,
        children: (
            <Text size="sm">
                {t('exitConfiguration.message')}
            </Text>
        ),
        labels: { confirm: t('exitConfiguration.confirm'), cancel: t('exitConfiguration.cancel') },
        confirmProps: { color: 'red' },
    }

    const confirmationModal = () => {
        modals.openConfirmModal({ onConfirm: () => { router.back(); }, ...confirmTestConfigurationExitProps });
    };

    useEffect(() => {
        window.onpopstate = (event) => {
            confirmationModal();
        }
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            confirmationModal();
            return (event.returnValue = t('exitConfiguration.message'));
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [router]);

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
            <ReturnButton timeout={!configurations?.category || configurations?.category?.length == 0 ? undefined : 0} confirmModal={!configurations?.category || configurations?.category?.length == 0 ? undefined : confirmTestConfigurationExitProps} size="xs" className={classes["return-button"]} />
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
                                <TestGeneratorSelectorChip
                                    label="Select Subjects"
                                    data={subjects.filter((subject) => subject.folderId == configurations?.folderId && subject.type == "CHAPTER")}
                                    onChange={(value) => {
                                        setConfigurations((prev) => {
                                            if (prev) {
                                                return {
                                                    ...prev,
                                                    subjectIds: value
                                                }
                                            }
                                        });
                                    }}
                                    value={configurations?.subjectIds}
                                    allowMultiple={true}
                                    chipProps={{
                                        size: 'sm',
                                        radius: 'sm',
                                        variant: 'light',
                                    }}
                                />
                                <Divider className={classes['divider']} />
                                {
                                    subjects.filter((subject) => subject.folderId == configurations?.folderId && subject.type == "QUESTION").length !== 0 &&
                                    <>
                                        <TestGeneratorSelector
                                            value={configurations?.subjectIds}
                                            data={subjects.filter((subject) => subject.folderId == configurations?.folderId && subject.type == "QUESTION")}
                                            allowMultiple={true}
                                            onChange={(value) => {
                                                setConfigurations((prev) => {
                                                    if (prev) return {
                                                        ...prev,
                                                        subjectIds: value
                                                    }
                                                });
                                            }}
                                        />
                                        <Divider className={classes['divider']} />
                                    </>
                                }
                                <TestGeneratorSelector
                                    value={configurations?.chapterIds}
                                    data={chapters.filter((chapter) => configurations?.subjectIds?.includes(chapter.subjectId))}
                                    allowMultiple={true}
                                    onChange={(value) => {
                                        setConfigurations((prev) => {
                                            if (prev) return {
                                                ...prev,
                                                chapterIds: value
                                            }
                                        });
                                    }}
                                    loaderProps={{
                                        mb: 30,
                                        color: 'grey',
                                        type: 'dots'
                                    }}
                                    loader={(configurations?.subjectIds && configurations?.subjectIds?.length !== 0) && chapters.length === 0}
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

                        <Group justify="center" mt="xl">
                            <Button disabled={active == 0} variant="default" onClick={prevStep}>{t('steps.back')}</Button>
                            <Button rightSection={<IconChevronRight />} disabled={active + 1 > allowedStep} onClick={active == 3 ? handleGenerateTest : nextStep}>{active == 3 ? t('steps.generate') : t('steps.next')}</Button>
                        </Group>
                    </Stack>
                </FocusTrap>
            }
        </Container>
    )
}