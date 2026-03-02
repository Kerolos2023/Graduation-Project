import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
    label: string;
    value: string;
}

interface MultiSelectProps {
    options: Option[];
    selectedValues: string[];
    onChange: (values: string[]) => void;
    placeholder?: string;
    className?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
    options,
    selectedValues,
    onChange,
    placeholder = "Select...",
    className,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    const filteredOptions = useMemo(() => {
        return options.filter(opt => (opt.label || '').toLowerCase().includes(search.toLowerCase()));
    }, [options, search]);

    const toggleOption = (value: string) => {
        if (selectedValues.includes(value)) {
            onChange(selectedValues.filter(v => v !== value));
        } else {
            onChange([...selectedValues, value]);
        }
    };

    const selectedLabels = useMemo(() => {
        return selectedValues
            .map(val => options.find(opt => opt.value === val)?.label)
            .filter(Boolean) as string[];
    }, [selectedValues, options]);

    return (
        <div className={cn("relative w-full", className)} ref={containerRef}>
            <div
                className="flex min-h-[42px] w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition-colors hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex flex-wrap gap-1 items-center">
                    {selectedLabels.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                            {selectedLabels.slice(0, 2).map((label, idx) => (
                                <span key={idx} className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                                    {label}
                                </span>
                            ))}
                            {selectedLabels.length > 2 && (
                                <span className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                                    +{selectedLabels.length - 2} more
                                </span>
                            )}
                        </div>
                    ) : (
                        <span className="text-gray-400">{placeholder}</span>
                    )}
                </div>
                <ChevronDown className="h-4 w-4 opacity-50" />
            </div>

            {isOpen && (
                <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-100 bg-white p-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {/* Search Bar inside Select */}
                    <div className="sticky top-0 bg-white px-2 py-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                className="w-full rounded-md border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>

                    {/* Options */}
                    <div className="pt-1">
                        {filteredOptions.length === 0 ? (
                            <div className="px-4 py-2 text-sm text-gray-500 text-center">No results found.</div>
                        ) : (
                            filteredOptions.map((option) => {
                                const isSelected = selectedValues.includes(option.value);
                                return (
                                    <div
                                        key={option.value}
                                        className={cn(
                                            "relative flex cursor-pointer select-none items-center rounded-sm py-2 px-3 text-sm hover:bg-gray-50",
                                            isSelected ? "text-gray-900 bg-gray-50/50" : "text-gray-700"
                                        )}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleOption(option.value);
                                        }}
                                    >
                                        <div className="flex items-center w-full">
                                            <div className={cn(
                                                "mr-3 flex h-4 w-4 items-center justify-center rounded border",
                                                isSelected ? "border-black bg-white" : "border-gray-300"
                                            )}>
                                                {isSelected && <Check className="h-3 w-3 text-black stroke-[3]" />}
                                            </div>
                                            <span className="block truncate">{option.label}</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
