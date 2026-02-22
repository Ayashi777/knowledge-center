import React from 'react';
import { useI18n } from '@app/providers/i18n/i18n';
import { Button } from './primitives';

export const Pagination: React.FC<{
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
    const { t } = useI18n();
    if (totalPages <= 1) return null;

    const handlePrev = () => onPageChange(Math.max(1, currentPage - 1));
    const handleNext = () => onPageChange(Math.min(totalPages, currentPage + 1));
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <nav className="flex items-center justify-center gap-2 sm:gap-4 mt-8" aria-label="Pagination">
            <Button
                onClick={handlePrev}
                disabled={currentPage === 1}
                variant="outline"
                className="h-10 rounded-md px-3 text-sm font-medium text-fg sm:px-4"
            >
                {t('pagination.prev')}
            </Button>

            <div className="hidden sm:flex items-center gap-2">
                {pageNumbers.map((number) => (
                    <Button
                        key={number}
                        onClick={() => onPageChange(number)}
                        aria-current={currentPage === number ? 'page' : undefined}
                        variant={currentPage === number ? 'primary' : 'outline'}
                        className={`h-10 rounded-md px-4 text-sm font-medium ${
                            currentPage === number ? '' : 'text-fg'
                        }`}
                    >
                        {number}
                    </Button>
                ))}
            </div>

            <span className="sm:hidden text-sm text-muted-fg">
                {currentPage} / {totalPages}
            </span>

            <Button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                variant="outline"
                className="h-10 rounded-md px-3 text-sm font-medium text-fg sm:px-4"
            >
                {t('pagination.next')}
            </Button>
        </nav>
    );
};
