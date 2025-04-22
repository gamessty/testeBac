"use client";
import { CheckIcon, Combobox, Group, Loader, TextInput, TextInputProps, useCombobox } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

interface LanguageData {
  language: string;
  aliases: string[];
}

interface SelectCombinedProps extends Omit<TextInputProps, 'onChange'> {
  defaultOption?: string;
  onChange?: (value: LanguageData) => void;
  loadAsync?: boolean; // when false, data is loaded immediately on mount
  label?: string;
}

// Helper function to filter options by both language and aliases with a limit
function getFilteredOptions(
  data: LanguageData[],
  searchQuery: string,
  limit: number
) {
  const result: LanguageData[] = [];
  const query = searchQuery.trim().toLowerCase();
  for (const element of data) {
    if (result.length === limit) break;
    const languageMatch = element.language.toLowerCase().includes(query);
    const aliasMatch =
      element.aliases &&
      element.aliases.some((alias) => alias.toLowerCase().includes(query));
    if (languageMatch || aliasMatch) {
      result.push(element);
    }
  }
  return result;
}

export function CodingLanguageSelect({
  defaultOption,
  onChange,
  loadAsync = true,
  label,
  ...props
}: Readonly<SelectCombinedProps>) {
  const t = useTranslations('General');
  const [value, setValue] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [data, setData] = useState<LanguageData[]>([]);
  const [loading, setLoading] = useState(false);

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: (eventSource) => {
      // Active option logic
      if (eventSource === 'keyboard') {
        combobox.selectActiveOption();
      } else {
        combobox.updateSelectedOptionIndex('active');
      }
      // If async loading is enabled, load data on dropdown open.
      if (loadAsync && data.length === 0 && !loading) {
        setLoading(true);
        fetch('/coding_languages.json')
          .then((res) => res.json())
          .then((jsonData: LanguageData[]) => {
            setData(jsonData);
            setLoading(false);
            combobox.resetSelectedOption();
          })
          .catch((err) => {
            console.error(err);
            setLoading(false);
          });
      }
    },
  });

  // If loadAsync is disabled, fetch data immediately on mount
  useEffect(() => {
    if (!loadAsync && data.length === 0) {
      setLoading(true);
      fetch('/coding_languages.json')
        .then((res) => res.json())
        .then((jsonData: LanguageData[]) => {
          setData(jsonData);
          setLoading(false);
          combobox.resetSelectedOption();
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [loadAsync, data.length, combobox]);

  // When data loads, try to resolve the default option if provided.
  // We don't call onChange here; we only update the state.
  useEffect(() => {
    if (defaultOption && data.length > 0) {
      const lowerDefault = defaultOption.trim().toLowerCase();
      // Try to find a direct match in language names
      let found = data.find(
        (item) => item.language.trim().toLowerCase() === lowerDefault
      );
      // If not, try to find a match in aliases
      if (!found) {
        found = data.find(
          (item) =>
            item.aliases &&
            item.aliases.some(
              (alias) => alias.trim().toLowerCase() === lowerDefault
            )
        );
      }
      if (found) {
        setValue(found.language);
        setSearch(found.language);
      } else {
        setValue(null);
        setSearch('');
      }
    }
  }, [defaultOption, data]);

  // Filter options with a limit of 7 using both language names and aliases
  const filteredOptions = getFilteredOptions(data, search, 7);

  const options = filteredOptions.map((item) => (
    <Combobox.Option
      value={item.language}
      key={item.language}
      active={item.language === value}
    >
      <Group gap="xs">
        {item.language === value && <CheckIcon size={12} />}
        <span>{item.language}</span>
      </Group>
    </Combobox.Option>
  ));

  return (
    <Combobox
      store={combobox}
      resetSelectionOnOptionHover
      withinPortal={false}
      transitionProps={{ duration: 200, transition: 'pop' }}
      onOptionSubmit={(val) => {
        const selected = data.find((item) => item.language === val);
        if (selected) {
          // Only trigger onChange if the user selects a language different from the current value.
          if (selected.language !== value && onChange) {
            onChange(selected);
          }
          setValue(selected.language);
          setSearch(selected.language);
        } else {
          setValue(null);
          setSearch('');
        }
        combobox.updateSelectedOptionIndex('active');
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target>
        <TextInput
          label={label}
          disabled={loading} // Disable input while loading data
          rightSection={
            loading ? <Loader size={18} /> : <Combobox.Chevron />
          }
          value={search}
          onChange={(event) => {
            combobox.openDropdown();
            combobox.updateSelectedOptionIndex();
            setSearch(event.currentTarget.value);
          }}
          onClick={() => combobox.openDropdown()}
          onFocus={() => combobox.openDropdown()}
          onBlur={() => {
            combobox.closeDropdown();
            setSearch(value || '');
          }}
          placeholder={t('search')}
          rightSectionPointerEvents="none"
          {...props}
        />
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>
          {loading ? (
            <Combobox.Empty>{t('loading')}</Combobox.Empty>
          ) : options.length > 0 ? (
            options
          ) : (
            <Combobox.Empty>{t('noResults')}</Combobox.Empty>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
