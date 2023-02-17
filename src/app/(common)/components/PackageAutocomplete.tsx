'use client';
import clsx from 'clsx';
import { useCombobox } from 'downshift';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useDebounce } from 'use-debounce';
import http from '../utils/http';

type PackageAutocompleteProps = {
  placeholder?: string;
};

export const PackageAutocomplete = ({
  placeholder = 'find a package',
}: PackageAutocompleteProps) => {
  const router = useRouter();
  const [inputValue, setInputValue] = React.useState('');
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [hasNoResult, setHasNoResult] = React.useState(false);

  const onInputValueChange = (value: string) => {
    setInputValue(value);
    setHasNoResult(false);
    if (!value) {
      setSuggestions([]);
    }
  };

  const { isOpen, getMenuProps, getInputProps, highlightedIndex, getItemProps } = useCombobox({
    onInputValueChange({ inputValue }) {
      onInputValueChange(inputValue || '');
    },
    items: suggestions,
    itemToString(suggestion) {
      return suggestion ? suggestion.package.name : '';
    },
    onSelectedItemChange({ selectedItem }) {
      if (selectedItem) {
        router.push(`/package/${selectedItem.package.name}`);
      }
    },
  });

  const [debouncedValue] = useDebounce(inputValue, 300);

  // fetch the suggestions when the user has stopped typing her input
  React.useEffect(() => {
    let active = true;
    async function call() {
      setIsSearching(true);
      const suggestions = await getPackagesSuggestions(debouncedValue);
      if (active) {
        setHasNoResult(suggestions.length === 0);
        setSuggestions(suggestions);
        setIsSearching(false);
      }
    }
    if (debouncedValue) {
      call();
    }
    return () => {
      active = false;
    };
  }, [debouncedValue]);

  const showNoResult = hasNoResult && debouncedValue && !isSearching;

  return (
    <div className="relative w-full max-w-lg">
      <input
        placeholder={placeholder}
        className="w-full rounded bg-gray-800 px-6 py-3"
        {...getInputProps()}
      />
      <ul
        className={clsx(
          'absolute left-0 right-0 mt-1 max-h-80 overflow-auto rounded-b bg-gray-700 p-0 shadow-md',
          !isOpen && 'hidden'
        )}
        {...getMenuProps()}>
        {isOpen && (
          <>
            {showNoResult && (
              <li className="p-4 text-center">
                No package found. Click{' '}
                <a
                  className="text-yellow-500"
                  href="https://github.com/new"
                  target="_blank"
                  rel="noopener noreferrer">
                  here
                </a>{' '}
                to create it 🙂
              </li>
            )}
            {suggestions.map((suggestion, index) => (
              <li
                key={suggestion.package.name}
                className={clsx(
                  'flex cursor-pointer flex-col py-2 px-3 shadow-sm',
                  highlightedIndex === index && 'bg-yellow-500/20'
                )}
                {...getItemProps({ item: suggestion, index })}>
                <span>{suggestion.package.name}</span>
                <span className="text-sm text-gray-400">{suggestion.package.description}</span>
              </li>
            ))}
          </>
        )}
      </ul>
    </div>
  );
};

type Suggestion = {
  package: {
    name: string;
    scope: string;
    version: string;
    description: string;
    keywords: string[];
    date: string;
  };
  score: {
    final: number;
    detail: {
      quality: number;
      popularity: number;
      maintenance: number;
    };
  };
  searchScore: number;
  highlight: string;
};

const getPackagesSuggestions = async (query: string) => {
  const suggestionSort = (packageA: Suggestion, packageB: Suggestion) => {
    // Rank closely matching packages followed by most popular ones
    // taken from bundlephobia source
    if (Math.abs(Math.log(packageB.searchScore) - Math.log(packageA.searchScore)) > 1) {
      return packageB.searchScore - packageA.searchScore;
    } else {
      return packageB.score.detail.popularity - packageA.score.detail.popularity;
    }
  };
  try {
    const { data: suggestions } = await http.get<Suggestion[]>(
      `https://api.npms.io/v2/search/suggestions?q=${query}`
    );
    return suggestions.sort(suggestionSort);
  } catch (e) {
    return [];
  }
};
