import React, { useState } from 'react';
import { Tag } from '@shared/types';
import { useI18n } from '@app/providers/i18n/i18n';
import { Button, Input, ModalOverlay, ModalPanel } from '@shared/ui/primitives';

export const TagEditorModal: React.FC<{
    tag: Partial<Tag>,
    onSave: (tag: Partial<Tag>) => void,
    onClose: () => void
}> = ({ tag, onSave, onClose }) => {
    const { t } = useI18n();
    const [name, setName] = useState(tag.name || '');
    const [color, setColor] = useState(tag.color || '#3b82f6');

    const colorSwatches = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#ec4899', '#78716c'];

    return (
        <ModalOverlay className="z-50 bg-black/60" onClick={onClose}>
            <ModalPanel className="w-full max-w-md rounded-3xl border-border bg-surface p-8" onClick={e => e.stopPropagation()}>
                <h2 className="mb-6 text-2xl font-black text-fg">
                    {tag.id ? t('tagEditor.editTitle') : t('tagEditor.createTitle')}
                </h2>
                <form onSubmit={(e) => { e.preventDefault(); onSave({ id: tag.id, name, color }); }} className="space-y-5">
                    <div>
                        <label className="mb-1.5 block text-xs font-black uppercase tracking-widest text-muted-fg">{t('tagEditor.nameLabel')}</label>
                        <Input type="text" value={name} onChange={e => setName(e.target.value)} className="h-12 rounded-2xl px-4 font-semibold" required autoFocus />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-black uppercase tracking-widest text-muted-fg">{t('tagEditor.colorLabel')}</label>
                        <div className="grid grid-cols-6 gap-2">
                            {colorSwatches.map(swatch => (
                                <Button key={swatch} type="button" onClick={() => setColor(swatch)} variant="ghost" className={`h-8 rounded-lg border-2 p-0 ${color === swatch ? 'border-primary scale-110' : 'border-transparent'}`} style={{ backgroundColor: swatch }} />
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-6">
                        <Button type="button" variant="ghost" onClick={onClose} className="h-11 rounded-2xl px-8 font-bold text-muted-fg">{t('common.cancel')}</Button>
                        <Button type="submit" className="h-11 rounded-2xl px-8 text-xs font-black uppercase tracking-widest">{t('common.save')}</Button>
                    </div>
                </form>
            </ModalPanel>
        </ModalOverlay>
    );
};
