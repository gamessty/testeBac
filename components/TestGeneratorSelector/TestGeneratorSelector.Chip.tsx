import { Chip, ChipProps, Group, InputLabel } from "@mantine/core";
import { useUncontrolled } from "@mantine/hooks";
import { Chapter, Folder, Subject } from "@prisma/client";
import styles from './TestGeneratorSelector.Chip.module.css';

type label = {
    name: string;
    id?: string;
}

interface TestGeneratorSelectorChipPropsBase {
    data: Folder[] | Subject[] | Chapter[] | label[];
    allowMultiple?: boolean;
    label?: string;
    chipProps?: Omit<ChipProps, 'children' | 'value' | 'onChange'>;
}

interface TestGeneratorSelectorChipPropsSingle extends TestGeneratorSelectorChipPropsBase {
    allowMultiple?: false;
    value?: string; // for controlled component
    defaultValue?: string; // for uncontrolled component
    onChange?: (value: string) => void;
}

interface TestGeneratorSelectorChipPropsMultiple extends TestGeneratorSelectorChipPropsBase {
    allowMultiple: true;
    value?: string[]; // for controlled component, if null (by default) then it will be an "uncontrolled" component
    defaultValue?: string[]; // for uncontrolled component
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

interface InterceptEnterKeyDownInput<T> {
    e: React.KeyboardEvent<HTMLInputElement>;
    /** Value for controlled state */
    currentValue?: T;

    /** Controlled state onChange handler */
    handleChange: (value: T) => void;

    callback?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}


function interceptEnterKeyDown(input: InterceptEnterKeyDownInput<string | string[]>): void {
    const { e, currentValue, handleChange } = input;
    const value = e.currentTarget.value;
    if (e.key === 'Enter') {
        if (typeof currentValue === 'string') handleChange(value);
        else if (currentValue?.includes(value)) {
            handleChange(currentValue.filter((val: any) => val !== value));
        } else if(currentValue) {
            handleChange([...currentValue, value]);
        } else {
            handleChange([value]);
        }
    }
}

export default function TestGeneratorSelectorChip({ data, allowMultiple = false, value, defaultValue, onChange, label, chipProps }: Readonly<TestGeneratorSelectorChipProps>) {
    const { onKeyDown, ...chipPropsRest } = chipProps ?? {};
    chipProps = chipPropsRest;
    const [_value, handleChange] = useUncontrolled<typeof value>({
        value,
        defaultValue,
        onChange: (val: string | string[] | undefined) => onChange?.(val as any),
    });

    let chips;

    switch (determineType(data)) {
        case 'Folder':
            chips = (data as Folder[]).map((folder) => (
                <Chip onKeyDown={ (e) => interceptEnterKeyDown({ e, handleChange, currentValue: _value, callback: onKeyDown }) } {...chipProps} className={styles["chip"]} key={folder.id} value={folder.id}>{folder.name}</Chip>
            ));
            break;
        case 'Subject':
            chips = (data as Subject[]).map((subject) => (
                <Chip onKeyDown={ (e) => interceptEnterKeyDown({ e, handleChange, currentValue: _value, callback: onKeyDown }) } {...chipProps} className={styles["chip"]} key={subject.id} value={subject.id}>{subject.name}</Chip>
            ));
            break;
        case 'Chapter':
            chips = (data as Chapter[]).map((chapter) => (
                <Chip onKeyDown={ (e) => interceptEnterKeyDown({ e, handleChange, currentValue: _value, callback: onKeyDown }) } {...chipProps} className={styles["chip"]} key={chapter.id} value={chapter.id}>{chapter.name}</Chip>
            ));
            break;
        default:
            chips = (data as label[]).map((label) => (
                <Chip onKeyDown={ (e) => interceptEnterKeyDown({ e, handleChange, currentValue: _value, callback: onKeyDown }) } {...chipProps} className={styles["chip"]} key={label.id ?? label.name} value={label.id ?? label.name}>{label.name}</Chip>
            ));

    }

    return (
        <Chip.Group multiple={allowMultiple} value={_value} onChange={handleChange}>
            {label && <InputLabel>{label}</InputLabel>}
            <Group className={styles['group']}>
                {
                    chips
                }
            </Group>
        </Chip.Group>);
}