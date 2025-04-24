"use client";
import { CodeHighlight } from "@mantine/code-highlight";
import { Card, CardProps, Checkbox, Flex, Group, Image, Radio, Stack, Text, Title } from "@mantine/core";
import { HotkeyItem, useHotkeys } from "@mantine/hooks";
import { Montserrat } from "next/font/google";
import { useEffect, useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import classes from './Question.module.css';
import { IconCheck, IconX } from "@tabler/icons-react";

// Folosim fontul Montserrat pentru un look mai modern
const montserrat = Montserrat({ subsets: ['latin'] });

// Definim tipul pentru răspunsul selectat (poate fi un string, un array de string-uri sau nedefinit)
type ChoiceType = string | string[] | undefined;

// Definim cum arată datele de localizare
interface Localization {
    locale: string;
    text: string;
}

// Funcție ajutătoare ca să luăm textul în limba corectă
function getLocalizedText(localizations: Localization[] | undefined, defaultText: string, userLocale: string): string {
    // Dacă nu avem traduceri, dăm textul default
    if (!localizations || localizations.length === 0) {
        return defaultText;
    }

    // Încercăm să găsim o potrivire exactă pentru limba utilizatorului (ex: 'ro-RO')
    const exactMatch = localizations.find(item => item.locale === userLocale);
    if (exactMatch) {
        return exactMatch.text;
    }

    // Dacă nu găsim exact, încercăm să potrivim doar limba (ex: 'ro' din 'ro-RO')
    const languageCode = userLocale.split('-')[0];
    const languageMatch = localizations.find(item => item.locale.startsWith(languageCode));
    if (languageMatch) {
        return languageMatch.text;
    }

    // Dacă nici așa nu merge, returnăm textul default
    return defaultText;
}

// Definim ce props primește componenta noastră QuestionCard
interface QuestionCardProps {
    question: string, // Textul întrebării
    options: { // Variantele de răspuns
        id: string,
        option: string,
        image?: string | null, // Imagine opțională pentru variantă
        code?: { language: string, code: string }, // Cod opțional pentru variantă
        isCorrect?: boolean, // Dacă varianta e corectă (pentru feedback)
        localization?: { locale: string, text: string }[] // Traduceri pentru variantă
    }[],
    type: 'singleChoice' | 'multipleChoice', // Tipul întrebării (un singur răspuns sau mai multe)
    additionalData?: { // Date suplimentare pentru întrebare
        image?: string | null, // Imagine opțională
        code?: { language: string, code: string }, // Cod opțional
        explanation?: { // Explicația răspunsului corect
            code?: { language: string, code: string },
            markdown?: string | null,
            localization?: { locale: string, text: string }[] // Traduceri pentru explicație
        },
        localization?: { locale: string, text: string }[] // Traduceri pentru întrebare
    },
    questionNumber: number, // Numărul întrebării
    feedback?: { // Feedback după ce am răspuns
        correct: string[],
        incorrect: string[],
        missed: string[],
    },
    answered?: boolean, // Dacă s-a răspuns deja la întrebare
    value?: ChoiceType, // Răspunsul selectat (controlat din exterior)
    onChange?: (value: ChoiceType) => void // Funcție apelată când schimbăm răspunsul
}

// Componenta principală pentru afișarea unei întrebări
export default function QuestionCard({
    question,
    options,
    type,
    additionalData,
    questionNumber,
    feedback,
    answered = false, // Default e false, adică nu s-a răspuns
    value,
    onChange,
    ...props // Restul props-urilor le pasăm la Card-ul Mantine
}: Readonly<QuestionCardProps & CardProps>) {
    // Luăm funcția de traducere și limba curentă
    const t = useTranslations('General');
    const locale = useLocale();

    // Stocăm intern răspunsul selectat, ca să putem lucra cu el în componentă
    const [internalValue, setInternalValue] = useState<string | string[] | undefined>(value);

    // Actualizăm starea internă dacă se schimbă valoarea din exterior (ex: când navigăm între întrebări)
    useEffect(() => {
        setInternalValue(value);
    }, [value, question]); // Reacționăm la schimbarea valorii sau a întrebării

    // Funcție apelată când selectăm/deselectăm o variantă
    const handleChange = useCallback((val: string | string[]) => {
        setInternalValue(val); // Actualizăm starea internă

        // Dacă e întrebare cu răspunsuri multiple, ne asigurăm că trimitem un array (facem o copie)
        if (type === 'multipleChoice' && Array.isArray(val)) {
            onChange?.(val.slice());
        } else {
            // Altfel, trimitem valoarea simplă
            onChange?.(val);
        }
    }, [onChange, type]); // Dependențe: funcția onChange și tipul întrebării

    // Resetăm valoarea internă când se schimbă întrebarea (ca să nu rămână selectată varianta de la întrebarea anterioară)
    useEffect(() => {
        return () => {
            setInternalValue(undefined);
        };
    }, [question]); // Reacționăm la schimbarea întrebării

    // Definim hotkey-uri (A, B, C...) pentru selectarea variantelor
    const hotkeys: HotkeyItem[] = options.map((option, index) => [
        String.fromCharCode(65 + index), // Generăm litera corespunzătoare (A, B, C...)
        () => {
            // Nu facem nimic dacă s-a răspuns deja
            if (answered) return;

            if (type === 'singleChoice') {
                // La single choice, dacă apăsăm pe aceeași literă, deselectăm; altfel, selectăm noua variantă
                handleChange(internalValue === option.id ? '' : option.id);
            } else {
                // La multiple choice, adăugăm sau scoatem ID-ul din array
                const newChoice = Array.isArray(internalValue) ? internalValue : [];
                if (newChoice.includes(option.id)) {
                    handleChange(newChoice.filter(item => item !== option.id)); // Scoatem
                } else {
                    handleChange([...newChoice, option.id]); // Adăugăm
                }
            }
        },
        { usePhysicalKeys: true } // Folosim tastele fizice, nu maparea caracterelor
    ]);

    // Înregistrăm hotkey-urile definite mai sus
    useHotkeys(hotkeys);

    // Ne asigurăm că additionalData nu e null, ca să nu dea erori mai jos
    additionalData ??= {
        image: undefined,
        code: undefined
    };

    // Funcție care determină statusul unei variante (corect, incorect, ratat) pe baza feedback-ului
    const getOptionStatus = (optionId: string): string | undefined => {
        if (!feedback) return undefined; // Nu avem feedback, nu avem status

        if (feedback.correct.includes(optionId)) return 'correct';
        if (feedback.incorrect.includes(optionId)) return 'incorrect';
        if (feedback.missed.includes(optionId)) return 'missed'; // Asta e pentru variantele corecte pe care nu le-am bifat

        return undefined; // Niciun status special
    };

    // Funcție care returnează iconița potrivită pentru status (check sau X)
    const getStatusIcon = (status: string | undefined) => {
        switch (status) {
            case 'missed': // La cele ratate arătăm tot check, că erau corecte
            case 'correct':
                return IconCheck;
            case 'incorrect':
                return IconX;
            default:
                return IconCheck; // Default e check
        }
    };

    // Funcție care verifică dacă o variantă trebuie să apară ca bifată
    const isChecked = (optionId: string): boolean | undefined => {
        // Dacă avem feedback, bifăm tot ce e corect, incorect sau ratat (ca să vedem clar ce s-a întâmplat)
        if (feedback) {
            return feedback.correct.includes(optionId) ||
                feedback.incorrect.includes(optionId) ||
                feedback.missed.includes(optionId);
        }

        // Dacă nu avem feedback, verificăm selecția curentă
        if (Array.isArray(internalValue)) {
            // La multiple choice, verificăm dacă ID-ul e în array
            return internalValue.includes(optionId);
        }

        // La single choice, verificăm dacă ID-ul e egal cu valoarea selectată
        return internalValue === optionId;
    };

    // Verificăm dacă e întrebare cu un singur răspuns, ca să știm ce componentă să folosim (Radio sau Checkbox)
    const isSingleChoice = type === 'singleChoice';

    // Luăm codul de afișat pentru întrebare (dacă există)
    const codeToDisplay = additionalData.code;

    // Luăm textul întrebării în limba corectă
    const localizedQuestion = getLocalizedText(
        additionalData?.localization,
        question,
        locale
    );

    // Procesăm variantele ca să avem textul în limba corectă
    const localizedOptions = options.map(option => {
        return {
            ...option,
            option: getLocalizedText(option.localization, option.option, locale)
        };
    });

    // Generăm componentele Card pentru fiecare variantă de răspuns
    const optionCards = localizedOptions.map((option) => {
        // Luăm statusul variantei (dacă avem feedback)
        const optionStatus = feedback ? getOptionStatus(option.id) : undefined;
        // Alegem componenta potrivită (Radio.Card sau Checkbox.Card)
        const OptionComponent = isSingleChoice ? Radio.Card : Checkbox.Card;

        // Luăm codul specific variantei (dacă există)
        const optionCode = option.code;

        // Returnăm componenta Card pentru variantă
        return (
            <OptionComponent
                className={`${classes.root} ${montserrat.className}`} // Aplicăm clasele CSS și fontul
                value={option.id} // Valoarea asociată (ID-ul variantei)
                key={'option-' + option.id} // Cheie unică pentru React
                data-status={optionStatus} // Stocăm statusul în data-attribute pentru CSS
                disabled={answered} // Dezactivăm dacă s-a răspuns deja
            >
                <Group wrap="nowrap" align="flex-start">
                    {/* Afișăm indicatorul de Radio sau Checkbox */}
                    {isSingleChoice ? (
                        <Radio.Indicator
                            icon={getStatusIcon(optionStatus)} // Iconița potrivită (check/X)
                            checked={isChecked(option.id)} // Dacă e bifat
                            classNames={{ indicator: classes.indicator }} // Clase CSS custom
                        />
                    ) : (
                        <Checkbox.Indicator
                            icon={getStatusIcon(optionStatus)}
                            checked={isChecked(option.id)}
                            classNames={{ indicator: classes.indicator }}
                        />
                    )}
                    {/* Conținutul variantei (text, imagine, cod) */}
                    <div style={{ width: '100%' }}>
                        <Text className={classes.label}>{option.option}</Text>
                        {/* Afișăm imaginea dacă există */}
                        {option.image && (
                            <Image
                                src={option.image}
                                alt="option image"
                                className={classes['question-image']}
                                style={{ marginTop: 10 }}
                            />
                        )}
                        {/* Afișăm codul dacă există */}
                        {optionCode && (
                            <CodeHighlight
                                language={optionCode.language}
                                copyLabel={t('copyLabel')} // Text pentru butonul de copiere
                                copiedLabel={t('copiedLabel')} // Text după copiere
                                code={optionCode.code}
                                classNames={{ copy: classes['copy-code'] }} // Clasă CSS custom pentru buton
                                mt={10} // Margin top
                            />
                        )}
                    </div>
                </Group>
            </OptionComponent>
        );
    });

    // Luăm textul explicației în limba corectă (dacă există)
    const localizedExplanation = additionalData?.explanation?.markdown
        ? getLocalizedText(
            additionalData?.explanation?.localization,
            additionalData.explanation.markdown,
            locale
          )
        : null;

    // Returnăm structura finală a componentei Card pentru întrebare
    return (
        <Card
            shadow="xs"
            padding="lg"
            withBorder
            {...props} // Pasăm restul props-urilor
            autoFocus // Punem focus pe card când apare
            data-question // Marcaj pentru CSS sau testare
            data-answered={answered ? "true" : "false"} // Marcaj dacă s-a răspuns
            className={classes.questionCard} // Clasă CSS principală
            key={`question-${questionNumber}`} // Cheie unică
        >
            {/* Titlul întrebării (cu număr) */}
            <Title order={4} style={{ marginBottom: 10 }} className={classes['title']} key={`question-${questionNumber}-title`}>
                {questionNumber ? questionNumber + ". " : ''}{localizedQuestion}
            </Title>
            {/* Imaginea principală a întrebării (dacă există) */}
            {additionalData?.image && (
                <Image
                key={`question-${questionNumber}-image`}
                    className={classes['question-image']}
                    src={additionalData.image}
                    alt="question image"
                    style={{ width: '100%', marginBottom: 10 }}
                />
            )}
            {/* Container Flex pentru cod și variante (coloană pe mobil, rând pe desktop) */}
            <Flex h="100%"
                key={`question-${questionNumber}-flex`}
                direction={{ base: 'column', 'md': 'row' }}
                gap="md"
                align="stretch"
            >
                {/* Afișăm blocul de cod principal (dacă există) */}
                {codeToDisplay && (
                    <CodeHighlight
                        language={codeToDisplay.language}
                        copyLabel={t('copyLabel')}
                        copiedLabel={t('copiedLabel')}
                        code={codeToDisplay.code}
                        classNames={{ root: classes["copy-root"], copy: classes['copy-code'] }}
                    />
                )}

                {/* Grupăm variantele de răspuns (Radio sau Checkbox) */}
                {isSingleChoice ? (
                    <Radio.Group
                        style={{ flexGrow: 1 }} // Ocupă spațiul rămas
                        value={internalValue as string | undefined} // Valoarea selectată
                        onChange={handleChange as (val: string) => void} // Handler pentru schimbare
                        id={`question-options-${questionNumber}`} // ID unic
                    >
                        <Stack gap="0"> {/* Aranjăm variantele vertical fără spațiu */}
                            {optionCards} {/* Afișăm cardurile variantelor generate mai sus */}
                        </Stack>
                    </Radio.Group>
                ) : (
                    <Checkbox.Group
                        style={{ flexGrow: 1 }}
                        value={internalValue as string[] | undefined} // Array-ul de valori selectate
                        onChange={handleChange as (val: string[]) => void}
                        id={`question-options-${questionNumber}`}
                    >
                        <Stack gap="0">
                            {optionCards}
                        </Stack>
                    </Checkbox.Group>
                )}
            </Flex>

            {/* Afișăm cardul cu explicația dacă avem feedback și există explicație (text sau cod) */}
            {feedback && (additionalData?.explanation?.markdown || additionalData.explanation?.code) && (
                <Card mt="md" withBorder p="sm" radius="sm" bg="rgba(0,0,0,0.03)" className={classes['explanation']} key={`question-${questionNumber}-explanation`}>
                    <Title order={5} mb="xs">{t('explanation')}</Title> {/* Titlul secțiunii de explicație */}
                    {/* Afișăm textul explicației (localizat sau default) */}
                    <Text size="sm">{localizedExplanation ?? additionalData.explanation.markdown}</Text>
                    {/* Afișăm codul din explicație (dacă există) */}
                    {additionalData.explanation.code && (
                        <CodeHighlight
                            language={additionalData.explanation.code.language}
                            code={additionalData.explanation.code.code}
                            copyLabel={t('copyLabel')}
                            copiedLabel={t('copiedLabel')}
                            mt="xs"
                        />
                    )}
                </Card>
            )}
        </Card>
    );
}