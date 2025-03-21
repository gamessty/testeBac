
//TBD, WIP
//ADD TEST TYPE AT THE BEGGINING IN THE FIRST STEP REQUIRED TO ADVANCE, GET THE ENUM TYPES FROM PRISMA I THINK
//NEED TO ADD A WAY TO HANDLE THE SUBJECTS THAT HAVE NO CHAPTERS BUT QUESTIONS, PROBABLY MAKE A NEW TEST GENERATION NEXT TO THE THA CHAPTERS, ABOVE THEM, BUT BELOW THE SUBJECTS THAT HAVE CHAPTERS
//ADD FINAL TEST CONFIGURATION
//IMPROVE THE FETCH WAY, DON'T FETCH AGAIN IF THE DATA IS ALREADY FETCHED AND STORED IN THE STATE (USECONTEXT?)
//ADD A WAY TO SELECT THE NUMBER OF QUESTIONS PER CHAPTER, PROBABLY IN THE FINAL STEP
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

interface TestConfiguration {
    category?: string;
    folder?: Folder;
    subjects?: Subject[];
    chapters?: Chapter[];
}

export default function TestGenerator({ session, ...props }: Readonly<{ session: Session } & ContainerProps>) {
    // ... rest of the code
    const t = useTranslations('Dashboard.TestGenerator');

    const [configurations, setConfigurations] = useState<TestConfiguration>();
    const [allowedStep, setAllowedStep] = useState<number>(0);
    const [categories, setCategories] = useState<string[]>([]);
    const [folder, setFolder] = useState<Folder[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [error, setError] = useState<string | null>(null);
    const submitButtonRef = useRef<HTMLButtonElement>(null);
    const stepperRef = useRef<HTMLDivElement>(null);
    const [activeFocus, { open: openFocusTrap }] = useDisclosure(true);
    //ADD INVISIBLE AUTOFOCUS ELEMENT WITHIN THE TRAP SO THAT THE FOCUS IS NOT LOST WHEN NEXT BUTTON IS DISABLED

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
        setAllowedStep(1);
        setConfigurations((prev) => ({ category: prev?.category, folder: prev?.folder }));
    }, [configurations?.folder]); //PROBABLY MERGE THESE TWO HOOKS AS THEY CHECK FOR UPDATES ON THE SAME THING.

    useDidUpdate(() => {
        async function fetchData() {
            if (!configurations?.folder) return;
            setSubjects([]);
            setConfigurations((prev) => ({ ...prev, subjects: [] }));
            const fetchedSubjects = await getSubjects({
                folderId: configurations?.folder?.id
            });
            if (!Array.isArray(fetchedSubjects) && fetchedSubjects?.message) {
                return setError(fetchedSubjects.message);
            }
            else if (Array.isArray(fetchedSubjects)) {
                setSubjects(fetchedSubjects);
            }
        }
        fetchData();
    }, [configurations?.folder]);

    useDidUpdate(() => {
        async function fetchData() {
            if (!configurations?.subjects) return;
            setChapters([]);
            setConfigurations((prev) => ({ ...prev, chapters: [] }));
            for (let subject of configurations.subjects) {
                const fetchedChapters = await getChapters({
                    subjectId: subject.id
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
    }, [configurations?.subjects]);

    useDidUpdate(() => {
        openFocusTrap();
        if (!configurations) setAllowedStep(0);
        if (configurations?.category) setAllowedStep(1);
        if (configurations?.folder) setAllowedStep(2);
        if (configurations?.chapters?.length) setAllowedStep(3);
        if(!submitButtonRef.current?.disabled) submitButtonRef.current?.focus();
        else if(stepperRef.current) findFirstFocusable(stepperRef.current)?.focus();
    }, [configurations])

    const [active, setActive] = useState(0);
    const nextStep = () => { setActive((current) => (current < 4 ? current + 1 : current)); if(stepperRef.current) findFirstFocusable(stepperRef.current)?.focus(); };
    const prevStep = () => { setActive((current) => (current > 0 ? current - 1 : current)); if(stepperRef.current) findFirstFocusable(stepperRef.current)?.focus(); };
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
                            <Stepper.Step  label={isMobile ? undefined : t('steps.1.label')} description={isMobile ? undefined : t('steps.1.description')}>
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
                                {
                                    <TestGeneratorSelector
                                        value={configurations?.folder?.id}
                                        data={folder.filter((folder) => folder.category == configurations?.category)}
                                        onChange={(value) => {
                                            setConfigurations((prev) => {
                                                if (prev) return {
                                                    ...prev,
                                                    folder: folder.find((folder) => folder.id == value)
                                                }
                                            });
                                        }}
                                    />
                                }
                            </Stepper.Step>
                            <Stepper.Step label={isMobile ? undefined : t('steps.3.label')} description={isMobile ? undefined : t('steps.3.description')}>
                                {
                                    <TestGeneratorSelectorChip
                                        label="Select Subjects"
                                        data={subjects.filter((subject) => subject.folderId == configurations?.folder?.id)}
                                        onChange={(value) => {
                                            setConfigurations((prev) => {
                                                if (prev) {
                                                    return {
                                                        ...prev,
                                                        subjects: value.map((subject) => subjects.find((s) => s.id == subject) as Subject)
                                                    }
                                                }
                                            });
                                        }}
                                        value={configurations?.subjects?.map((subject) => subject.id)}
                                        allowMultiple={true}
                                        chipProps={{
                                            size: 'sm',
                                            radius: 'sm',
                                            variant: 'light',
                                        }}
                                    />
                                }
                                <Divider className={classes['divider']} />
                                {
                                    <TestGeneratorSelector
                                        value={configurations?.chapters?.map((chapter) => chapter.id)}
                                        data={chapters.filter((chapter) => configurations?.subjects?.map((subject) => subject.id).includes(chapter.subjectId))}
                                        allowMultiple={true}
                                        onChange={(value) => {
                                            setConfigurations((prev) => {
                                                if (prev) return {
                                                    ...prev,
                                                    chapters: value.map((chapter) => chapters.find((c) => c.id == chapter) as Chapter)
                                                }
                                            });
                                        }}
                                        loaderProps={{
                                            mb: 30,
                                            color: 'grey',
                                            type: 'dots'
                                        }}
                                        loader={(configurations?.subjects && configurations?.subjects?.length !== 0) && chapters.length === 0}
                                    />
                                }
                            </Stepper.Step>
                            <Stepper.Step label={isMobile ? undefined : t('steps.4.label')} description={isMobile ? undefined : t('steps.4.description')}>
                                <TestTypeSelector radius="lg" className={classes['test-type-selector']} />
                            </Stepper.Step>
                            <Stepper.Completed>
                                Completed, click back button to get to previous step
                            </Stepper.Completed>
                        </Stepper>

                        <Group justify="center" mt="xl">
                            <Button disabled={active == 0} variant="default" onClick={prevStep}>{t('steps.back')}</Button>
                            <Button ref={submitButtonRef} rightSection={<IconChevronRight />} disabled={active + 1 > allowedStep} onClick={nextStep}>{active == 3 ? t('steps.generate') : t('steps.next')}</Button>
                        </Group>
                    </Stack>
                </FocusTrap>
            }
        </Container>
    )
}