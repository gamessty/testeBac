
//TBD, WIP
//ADD TEST TYPE AT THE BEGGINING IN THE FIRST STEP REQUIRED TO ADVANCE, GET THE ENUM TYPES FROM PRISMA I THINK
//NEED TO ADD A WAY TO HANDLE THE SUBJECTS THAT HAVE NO CHAPTERS BUT QUESTIONS, PROBABLY MAKE A NEW TEST GENERATION NEXT TO THE THA CHAPTERS, ABOVE THEM, BUT BELOW THE SUBJECTS THAT HAVE CHAPTERS
//ADD FINAL TEST CONFIGURATION
//IMPROVE THE FETCH WAY, DON'T FETCH AGAIN IF THE DATA IS ALREADY FETCHED AND STORED IN THE STATE (USECONTEXT?)
//ADD A WAY TO SELECT THE NUMBER OF QUESTIONS PER CHAPTER, PROBABLY IN THE FINAL STEP
import { Blockquote, Box, Button, Center, Container, ContainerProps, Divider, em, Group, Loader, Overlay, Stack, Stepper, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { Session } from "next-auth";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import ReturnButton from "../ReturnButton/ReturnButton";
import classes from './TestGenerator.module.css';
import getManyFolder from "../../actions/PrismaFunctions/getManyFolder";
import { Chapter, Folder, Subject } from "@prisma/client";
import { IconAlertTriangleFilled, IconArrowAutofitRight, IconArrowRight, IconChevronCompactRight, IconChevronRight } from "@tabler/icons-react";
import TestGeneratorSelector from "../TestGeneratorSelector/TestGeneratorSelector";
import getSubjects from "../../actions/PrismaFunctions/getSubjects";
import getChapters from "../../actions/PrismaFunctions/getChapters";
import TestGeneratorSelectorChip from "../TestGeneratorSelector/TestGeneratorSelector.Chip";

interface TestConfiguration {
    category: string;
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

    useEffect(() => {
        async function fetchData() {
            if (!configurations?.folder) return;
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

    useEffect(() => {
        async function fetchData() {
            if (!configurations?.subjects) return;
            setChapters([]);
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

    useEffect(() => {
        if (!configurations) setAllowedStep(0);
        if (configurations?.category) setAllowedStep(1);
        if (configurations?.folder) setAllowedStep(2);
        if (configurations?.chapters?.length) setAllowedStep(3);
    }, [configurations])

    const [active, setActive] = useState(0);
    const nextStep = () => setActive((current) => (current < 4 ? current + 1 : current));
    const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));
    const isMobile = useMediaQuery(`(max-width: ${em(750)})`, true);

    return (
        <Container size="lg" p={{ base: 30, sm: 35 }} pt={{ base: 20, sm: 25 }} className={classes['main-container']} {...props}>
            <ReturnButton size="xs" className={classes["return-button"]} />
            {
                error && (
                    <Blockquote className={classes.blockquote} color="red" cite={"– " + t('errors.fetch.title', { error })} icon={<IconAlertTriangleFilled />}>
                        {t('errors.fetch.message', { error })}
                    </Blockquote>
                )
            }
            {!error &&
                <Container>
                    <Stack justify="space-between" h="100%">
                        <Stepper active={active} onStepClick={setActive} allowNextStepsSelect={false}>
                            <Stepper.Step label={isMobile ? undefined : t('steps.1.label')} description={isMobile ? undefined : t('steps.1.description')}>
                                {categories && categories.length > 0 &&
                                    <TestGeneratorSelector
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
                                        allowMultiple={true}
                                        chipProps={{
                                            variant: 'light',
                                        }}
                                    />
                                }
                                <Divider className={classes['divider']} />
                                {
                                    <TestGeneratorSelector
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
                                {typeof configurations?.subjects}
                            </Stepper.Step>
                            <Stepper.Step label={isMobile ? undefined : t('steps.4.label')} description={isMobile ? undefined : t('steps.4.description')}>
                                {
                                    "TUNE IT UP"
                                }
                            </Stepper.Step>
                            <Stepper.Completed>
                                Completed, click back button to get to previous step
                            </Stepper.Completed>
                        </Stepper>

                        <Group justify="center" mt="xl">
                            <Button disabled={active == 0} variant="default" onClick={prevStep}>{t('steps.back')}</Button>
                            <Button rightSection={ <IconChevronRight /> } disabled={active + 1 > allowedStep} onClick={nextStep}>{active == 3 ? t('steps.generate') : t('steps.next')}</Button>
                        </Group>
                    </Stack>
                </Container>
            }
        </Container>
    )
}