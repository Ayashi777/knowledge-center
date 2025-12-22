import { useState, useEffect } from 'react';
import { Tag } from '@shared/types';
import { TagsApi } from '@shared/api/firestore/tags.api';

export const useTags = () => {
    const [tags, setTags] = useState<Tag[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsub = TagsApi.subscribeAll((data) => {
            setTags(data);
            setIsLoading(false);
        });
        return unsub;
    }, []);

    return { tags, isLoading };
};
