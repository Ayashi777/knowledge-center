import { useState, useEffect } from 'react';
import { Category } from '@shared/types';
import { CategoriesApi } from '@shared/api/firestore/categories.api';

export const useCategories = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsub = CategoriesApi.subscribeAll((data) => {
            setCategories(data);
            setIsLoading(false);
        });
        return unsub;
    }, []);

    return { categories, isLoading };
};
