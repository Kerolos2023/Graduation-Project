import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}

const generatePaginationRange = (currentPage: number, totalPages: number) => {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Current page is near the start
    if (currentPage <= 3) {
        return [1, 2, 3, '...', totalPages - 2, totalPages - 1, totalPages];
    }

    // Current page is near the end
    if (currentPage >= totalPages - 2) {
        return [1, 2, 3, '...', totalPages - 2, totalPages - 1, totalPages];
    }

    // Current page is somewhere in the middle
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
};

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    className
}) => {
    const pages = useMemo(
        () => generatePaginationRange(currentPage, totalPages),
        [currentPage, totalPages]
    );

    // Format numbering to 2-digits exactly like the image '01'
    const formatPageNumber = (pageNumber: number) => {
        return pageNumber < 10 ? `0${pageNumber}` : `${pageNumber}`;
    };

    return (
        <div className={cn("inline-flex w-full md:w-auto items-center justify-between gap-4 py-3 px-6 rounded-2xl border border-gray-100 bg-white", className)}>
            <button
                type="button"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-blue-600 border border-blue-600 font-medium bg-blue-50/40 hover:bg-blue-100/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
                <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                Previous
            </button>

            <div className="flex items-center justify-center gap-1.5 md:gap-3">
                {pages.map((page, index) => {
                    if (page === '...') {
                        return (
                            <span key={`ellipsis-${index}`} className="text-gray-700 px-1 font-medium">
                                ...
                            </span>
                        );
                    }

                    const pageNum = page as number;
                    const isActive = pageNum === currentPage;
                    return (
                        <button
                            key={pageNum}
                            type="button"
                            onClick={() => onPageChange(pageNum)}
                            className={cn(
                                "px-3.5 py-1.5 text-[15px] font-medium transition-all rounded-[10px]",
                                isActive
                                    ? "bg-white border border-gray-300 shadow-sm text-gray-900"
                                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                            )}
                        >
                            {formatPageNumber(pageNum)}
                        </button>
                    );
                })}
            </div>

            <button
                type="button"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-blue-600 border border-blue-600 font-medium bg-blue-50/40 hover:bg-blue-100/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
                Next
                <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </button>
        </div>
    );
};



