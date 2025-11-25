import React from 'react';
import IconArrowBackward from './Icon/IconArrowBackward';
import IconArrowForward from './Icon/IconArrowForward';

interface PaginationProps {
    currentPage: number;
    totalRecords: number;
    recordsPerPage?: number;
    onPageChange: (page: number) => void;
    hasNext?: boolean;
    hasPrevious?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalRecords,
    recordsPerPage = 10,
    onPageChange,
    hasNext = true,
    hasPrevious = true,
}) => {
    const totalPages = Math.ceil(totalRecords / recordsPerPage);
    const getVisiblePages = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages);
        } else {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots.filter((item, index, arr) => arr.indexOf(item) === index);
    };

    const visiblePages = totalPages > 1 ? getVisiblePages() : [1];
    
    if (totalRecords === 0) {
        return null;
    }

    return (
        <div className="flex items-center justify-center gap-2 mt-4">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={!hasPrevious || currentPage === 1}
                className={`flex items-center justify-center w-10 h-10 rounded-lg border ${
                    !hasPrevious || currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                }`}
            >
                <IconArrowBackward className="w-4 h-4" />
            </button>

            {visiblePages.map((page, index) => (
                <button
                    key={index}
                    onClick={() => typeof page === 'number' && onPageChange(page)}
                    disabled={page === '...'}
                    className={`flex items-center justify-center w-10 h-10 rounded-lg border text-sm font-medium ${
                        page === currentPage
                            ? 'bg-blue-600 text-white border-blue-600'
                            : page === '...'
                            ? 'bg-white text-gray-400 cursor-default border-gray-300'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                    }`}
                >
                    {page}
                </button>
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={!hasNext || currentPage === totalPages}
                className={`flex items-center justify-center w-10 h-10 rounded-lg border ${
                    !hasNext || currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                }`}
            >
                <IconArrowForward className="w-4 h-4" />
            </button>
        </div>
    );
};

export default Pagination;