"use client";
import { TestGeneratorSelectorList } from '@/components/TestGeneratorSelector/TestGeneratorSelector.List';
import { Center, Container, Stack, Text } from '@mantine/core';

export default function TestGeneratorSelectorPage() {
    return (
        <Container fluid p="xl">
            <Stack justify="center" m="xl">
                <Text>Test Generator Selector Page</Text>
                <TestGeneratorSelectorList 
                    w="90wv" 
                    subjects={[]} 
                    chapters={[]} 
                    valueChapters={[]}
                    valueSubjects={[]}
                    defaultValuesSubjects={[]} 
                    defaultValuesChapters={[]} 
                    onSubjectsChange={() => {}} 
                    onChaptersChange={() => {}} 
                />
            </Stack>
        </Container>
    );
}