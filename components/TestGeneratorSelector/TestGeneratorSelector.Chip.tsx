import { Chip } from "@mantine/core";
import { Folder, Subject, Chapter } from "@prisma/client";
import { useState } from "react";
import styles from './TestGeneratorSelector.Chip.module.css';

type label = {
    name: string;
    id?: string;
}

interface TestGeneratorSelectorChipPropsBase {
    data: Folder[] | Subject[] | Chapter[] | label[];
    allowMultiple?: boolean;
}

interface TestGeneratorSelectorChipPropsSingle extends TestGeneratorSelectorChipPropsBase {
    allowMultiple?: false;
    onChange?: (value: string) => void;
}

interface TestGeneratorSelectorChipPropsMultiple extends TestGeneratorSelectorChipPropsBase {
    allowMultiple: true;
    onChange?: (value: string[]) => void;
}

type TestGeneratorSelectorChipProps = TestGeneratorSelectorChipPropsSingle | TestGeneratorSelectorChipPropsMultiple;

function determineType(data: Folder[] | Subject[] | Chapter[] | unknown[]): 'Folder' | 'Subject' | 'Chapter' | 'Unknown' {
    if ((data[0] as Folder)?.category) {
        return 'Folder';
    } else if ((data[0] as Subject)?.folderId) {
        return 'Subject';
    } else if ((data[0] as Chapter)?.subjectId) {
        return 'Chapter';
    }
    return 'Unknown';
}

export default function TestGeneratorSelectorChip({ data, allowMultiple = false, onChange }: Readonly<TestGeneratorSelectorChipProps>) {
    const [value, setValue] = useState<string | string[]>();

    function handleChange(selected: string | string[]) {
        setValue(selected);
        if (onChange) {
            onChange(selected as any);
        }
    };

    let chips;

    switch (determineType(data)) {
        case 'Folder':
            chips = (data as Folder[]).map((folder) => (
                <Chip className={styles["chip"]} key={folder.id} value={folder.id}>{folder.name}</Chip>
            ));
            break;
        case 'Subject':
            chips = (data as Subject[]).map((subject) => (
                <Chip className={styles["chip"]} key={subject.id} value={subject.id}>{subject.name}</Chip>
            ));
            break;
        case 'Chapter':
            chips = (data as Chapter[]).map((chapter) => (
                <Chip className={styles["chip"]} key={chapter.id} value={chapter.id}>{chapter.name}</Chip>
            ));
            break;
        default:
            chips = (data as label[]).map((label) => (
                <Chip className={styles["chip"]} key={label.id ?? label.name} value={label.id ?? label.name}>{label.name}</Chip>
            ));

    }

    return (
        <Chip.Group multiple={allowMultiple} value={value} onChange={handleChange}>
            {
                chips
            }
        </Chip.Group>);
}