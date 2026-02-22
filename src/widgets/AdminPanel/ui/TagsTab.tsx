import React from 'react';
import { Tag } from '@shared/types';
import { Icon } from '@shared/ui/icons';
import { Button, Card } from '@shared/ui/primitives';

interface TagsTabProps {
    allTags: Tag[];
    onAddTag: () => void;
    onEditTag: (tag: Tag) => void;
    onDeleteTag: (id: string) => void;
}

export const TagsTab: React.FC<TagsTabProps> = ({ allTags, onAddTag, onEditTag, onDeleteTag }) => {
    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-fg">Керування тегами</h3>
                    <p className="text-sm italic text-muted-fg">Створення та редагування міток для документів</p>
                </div>
                <Button
                    onClick={onAddTag}
                    className="h-11 rounded-xl px-6 text-xs font-black uppercase tracking-widest"
                >
                    <Icon name="plus" className="w-4 h-4" />
                    Додати тег
                </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {allTags.map((tag) => (
                    <Card
                        key={tag.id}
                        className="group relative rounded-2xl border border-transparent bg-muted/35 p-4 text-center shadow-none transition-all hover:border-primary/30"
                    >
                        <Button
                            onClick={() => onEditTag(tag)}
                            variant="ghost"
                            className="h-full w-full p-0 hover:bg-transparent"
                        >
                            <div className="w-3 h-3 rounded-full mx-auto mb-3 shadow-sm" style={{ backgroundColor: tag.color || '#cbd5e1' }} />
                            <p className="truncate text-sm font-bold text-fg">{tag.name || tag.id}</p>
                        </Button>
                        
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                onClick={(e) => { e.stopPropagation(); onEditTag(tag); }}
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 hover:bg-primary/15"
                            >
                                <Icon name="pencil" className="w-3 h-3 text-primary" />
                            </Button>
                            <Button
                                onClick={(e) => { e.stopPropagation(); onDeleteTag(tag.id); }}
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 hover:bg-danger/15"
                            >
                                <Icon name="trash" className="w-3 h-3 text-danger" />
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};
