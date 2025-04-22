"use client";
import { Affix, Button, Center, Group, SegmentedControl, Stack } from "@mantine/core";
import QuestionCard from "../../../../../components/Test/Question/Question";
import React, { useState } from "react";

export default function QuestionDemo() {
    const [q, setQ] = useState(0);
    const [choice, setChoice] = useState<string | string[] | undefined>(undefined);
    const [answered, setAnswered] = useState(false);
    const [feedback, setFeedback] = useState<{
        correct: string[],
        incorrect: string[],
        missed: string[]
    } | undefined>(undefined);

    const handleCheck = () => {
        // Generate feedback based on current selection and correct answers
        const question = demoQuestionData[q];
        const correctOptionIds = question.options
            .filter(opt => opt.isCorrect)
            .map(opt => opt.id);
        
        // Handle both single and multiple choice
        const selectedIds = Array.isArray(choice) ? choice : (choice ? [choice] : []);
        
        const correct = selectedIds.filter(id => correctOptionIds.includes(id));
        const incorrect = selectedIds.filter(id => !correctOptionIds.includes(id));
        const missed = correctOptionIds.filter(id => !selectedIds.includes(id));
        
        setFeedback({ correct, incorrect, missed });
        setAnswered(true);
    };

    const handleReset = () => {
        setFeedback(undefined);
        setChoice(undefined);
        setAnswered(false);
    };


    return (
        <>
            <Center h="100vh" w="100vw">
                <Stack w={{ base: "90%", md: "60%" }}>
                    <QuestionCard 
                        type={demoQuestionData[q].type}
                        additionalData={demoQuestionData[q].additionalData}
                        question={demoQuestionData[q].question}
                        options={demoQuestionData[q].options}
                        questionNumber={demoQuestionData[q].questionNumber}
                        feedback={feedback}
                        answered={answered}
                        value={choice}
                        onChange={setChoice}
                    />
                    
                    <Group justify="center" mt="md">
                        {!answered ? (
                            <Button 
                                color="blue" 
                                onClick={handleCheck}
                                disabled={!choice || (Array.isArray(choice) && choice.length === 0)}
                            >
                                Check Answer
                            </Button>
                        ) : (
                            <Button color="gray" onClick={handleReset}>
                                Reset
                            </Button>
                        )}
                    </Group>
                </Stack>
            </Center>
            <Affix position={{ bottom: 20, right: 20 }}>
                <SegmentedControl 
                    data={demoQuestionData.map((item, index) => ({ 
                        value: index.toString(), 
                        label: item.folder 
                    }))} 
                    onChange={(value) => {
                        setQ(Number(value));
                        handleReset();
                    }}
                />
            </Affix>
        </>
    );
}

// Enhanced interface with all required properties
interface AdditionalData {
    image?: string;
    code?: { 
        language: string; 
        code: string; 
    };
    explanation?: {
        code?: { language: string; code: string; };
        markdown?: string;
    };
    localization?: { locale: string; text: string; }[];
}

interface QuestionOption {
    id: string;
    option: string;
    image?: string;
    code?: { language: string; code: string; };
    isCorrect: boolean;
    localization?: { locale: string; text: string; }[];
}

interface QuestionData {
    category: string;
    subject: string;
    folder: string;
    type: 'multipleChoice' | 'singleChoice';
    additionalData: AdditionalData;
    chapter: number;
    questionNumber: number;
    question: string;
    options: QuestionOption[];
}

// Enhanced sample data with all required properties
const demoQuestionData: QuestionData[] = [
    {
        "category": 'admission',
        "subject": 'biology',
        "folder": "UMFCV",
        "type": "multipleChoice",
        "additionalData": {
            "image": undefined,
            "explanation": {
                "code": undefined,
                "markdown": "Sistemul de organe reprezintă un nivel de organizare superior organelor. Celelalte opțiuni reprezintă niveluri inferioare sau egale cu organele."
            },
        },
        "chapter": 1,
        "questionNumber": 1,
        "question": "Care dintre următoarele variante reprezintă un nivel de organizare superior organelor:",
        "options": [
            {
                "id": "a1",
                "option": "atomii",
                "isCorrect": false,
            },
            {
                "id": "a2",
                "option": "moleculele",
                "isCorrect": false,
            },
            {
                "id": "a3",
                "option": "celulele",
                "isCorrect": false,
            },
            {
                "id": "a4",
                "option": "țesuturile",
                "isCorrect": false,
            },
            {
                "id": "a5",
                "option": "sistemul de organe",
                "isCorrect": true,
            }
        ]
    },
    {
        "category": 'admission',
        "subject": 'informatics',
        "folder": "POLIBUC",
        "type": "singleChoice",
        "additionalData": {
            "image": undefined,
            "code":
                {
                    "language": "cpp",
                    "code": `int f(int n,int x)
{ 
    if(n>0)
        return f(f(n-2,x)-2,x-5);
    return x;
}`
                },
            "explanation": {
                "markdown": "Pentru a calcula f(2,5), trebuie să-i urmărim execuția pas cu pas:\nf(2,5) = f(f(0,5)-2, 0)\nf(0,5) = 5\nf(2,5) = f(5-2, 0) = f(3, 0)\nf(3,0) = f(f(1,0)-2, -5)\nf(1,0) = f(f(-1,0)-2, -5) = f(-2, -5)\nf(-2, -5) = -5\nf(1,0) = f(-5-2, -5) = f(-7, -5) = -5\nf(3,0) = f(-5-2, -5) = f(-7, -5) = -5\nf(2,5) = -5"
            },
        },
        "chapter": 1,
        "questionNumber": 2,
        "question": "Subprogramul f este definit alăturat. Indicați valoarea f(2,5).",
        "options": [
            {
                "id": "b1",
                "option": "3",
                "isCorrect": false,
            },
            {
                "id": "b2",
                "option": "0",
                "isCorrect": false,
            },
            {
                "id": "b3",
                "option": "-2",
                "isCorrect": false,
            },
            {
                "id": "b4",
                "option": "-5",
                "isCorrect": true,
            }
        ]
    },
    {
        "category": 'admission',
        "subject": 'chemistry',
        "folder": "UMFCV",
        "type": 'singleChoice',
        "additionalData": {
            "image": "/grila21cap9.webp",
            //"explanation": {
            //    "code": [],
            //    "markdown": "Conform nomenclaturii din chimia organică, structurile prezentate corespund glicină (I), acid glutamic (II) și cisteină (III)."
            //},
        },
        "chapter": 9,
        "questionNumber": 21,
        "question": 'Denumirile uzuale ale următorilor aminoacizi sunt:',
        "options": [
            {
                "id": "c1",
                "option": "I: β-alanină, II: valină, III: serină;",
                "isCorrect": false,
            },
            {
                "id": "c2",
                "option": "I: glicină, II: lisină, III: serină;",
                "isCorrect": false,
            },
            {
                "id": "c3",
                "option": "I: glicină, II: lisină; III: cisteină;",
                "isCorrect": false,
            },
            {
                "id": "c4",
                "option": "I: valină, II: acid asparagic , III: cisteină;",
                "isCorrect": false,
            },
            {
                "id": "c5",
                "option": "I: glicină, II: acid glutamic, III: cisteină.",
                "isCorrect": true,
            }
        ]
    }
];
