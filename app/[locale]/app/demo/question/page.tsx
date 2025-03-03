"use client";
import { Affix, Center, SegmentedControl } from "@mantine/core";
import QuestionCard from "../../../../../components/Test/Question/Question";
import React from "react";

export default function QuestionDemo() {
    const [q, setQ] = React.useState(0);

    return (
        <>
            <Center h="100%" w="100%">
                <QuestionCard type={demoQuestionData[q].type} w={{ base: "80%", md: "50%" }} additionalData={demoQuestionData[q].additionalData} question={demoQuestionData[q].question} options={demoQuestionData[q].options} questionNumber={demoQuestionData[q].questionNumber} />
            </Center>
            <Affix position={{ bottom: 20, right: 20 }}>
                <SegmentedControl data={demoQuestionData.map((item, index) => ({ value: index.toString(), label: item.folder }))} onChange={(value) => setQ(Number(value))}/>
            </Affix>
        </>
    );
}
interface AdditionalData {
    center: string;
    image?: string;
    code?: {
        language: string;
        code: string;
    };
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
    options: string[];
}

const demoQuestionData: QuestionData[] = [{
    "category": 'admission',
    "subject": 'biology',
    "folder": "UMFCV",
    "type": "multipleChoice",
    "additionalData": {
        "center": "UMFCV",
        "image": undefined,
        "code": undefined
    },
    "chapter": 1,
    "questionNumber": 1,
    "question": "Care dintre următoarele variante reprezintă un nivel de organizare superior organelor:",
    "options": [
        "atomii",
        "moleculele",
        "celulele",
        "țesuturile",
        "sistemul de organe"
    ]
},
{
    "category": 'admission',
    "subject": 'informatics',
    "folder": "POLIBUC",
    "type": "singleChoice",
    "additionalData": {
        "center": "Politehnica Bucuresti",
        "image": undefined,
        "code": {
            "language": "cpp",
            "code": `int f(int n,int x)
{ if(n>0)
    return f(f(n-2,x)-2,x-5);
    return x;
}`
        }
    },
    "chapter": 1,
    "questionNumber": 2,
    "question": "Subprogramul f este definit alăturat. Indicați valoarea f(2,5).",
    "options": [
        "3",
        "0",
        "-2",
        "-5"
    ]
},
{
    "category": 'admission',
    "subject": 'chemistry',
    "folder": "UMFCV",
    type: 'singleChoice',
    "additionalData": {
        "center": "UMFCV",
        "image": "/grila21cap9.webp",
        "code": undefined
    },
    "chapter": 9,
    "questionNumber": 21,
    question: 'Denumirile uzuale ale următorilor aminoacizi sunt:',
    options: [
        "I: β-alanină, II: valină, III: serină;",
        "I: glicină, II: lisină, III: serină;",
        "I: glicină, II: lisină; III: cisteină;",
        "I: valină, II: acid asparagic , III: cisteină;",
        "I: glicină, II: acid glutamic, III: cisteină."
    ]
}]
