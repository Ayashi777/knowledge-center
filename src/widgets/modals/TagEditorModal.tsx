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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [nameError, setNameError] = useState('');
    const [colorError, setColorError] = useState('');
    const [submitError, setSubmitError] = useState('');

    const colorSwatches = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#ec4899', '#78716c'];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        const nextName = name.trim();
        const nextColor = color.trim();
        const nextNameError = nextName ? '' : 'Назва тегу є обовʼязковою.';
        const nextColorError = /^#([0-9a-fA-F]{6})$/.test(nextColor) ? '' : 'Колір має бути у HEX-форматі (#RRGGBB).';

        setNameError(nextNameError);
        setColorError(nextColorError);
        setSubmitError('');
        if (nextNameError || nextColorError) return;

        setIsSubmitting(true);
        Promise.resolve(onSave({ id: tag.id, name: nextName, color: nextColor }))
            .catch(() => {
                setSubmitError('Не вдалося зберегти тег. Спробуйте ще раз.');
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    return (
        <ModalOverlay className="z-50 bg-black/60" onClick={onClose}>
            <ModalPanel className="w-full max-w-md rounded-3xl border-border bg-surface p-8" onClick={e => e.stopPropagation()}>
                <h2 className="mb-6 text-2xl font-black text-fg">
                    {tag.id ? t('tagEditor.editTitle') : t('tagEditor.createTitle')}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="mb-1.5 block text-xs font-black uppercase tracking-widest text-muted-fg">{t('tagEditor.nameLabel')}</label>
                        <Input
                            type="text"
                            value={name}
                            onChange={e => {
                                setName(e.target.value);
                                if (nameError) setNameError('');
                            }}
                            className="h-12 rounded-2xl px-4 font-semibold"
                            required
                            autoFocus
                        />
                        {nameError && <p className="mt-2 text-[11px] font-bold text-danger">{nameError}</p>}
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-black uppercase tracking-widest text-muted-fg">{t('tagEditor.colorLabel')}</label>
                        <div className="mb-2">
                            <Input
                                type="text"
                                value={color}
                                onChange={e => {
                                    setColor(e.target.value);
                                    if (colorError) setColorError('');
                                }}
                                className="h-11 rounded-xl px-4 text-sm font-semibold"
                                placeholder="#3b82f6"
                            />
                        </div>
                        <div className="grid grid-cols-6 gap-2">
                            {colorSwatches.map(swatch => (
                                <Button key={swatch} type="button" onClick={() => setColor(swatch)} disabled={isSubmitting} variant="ghost" className={`h-8 rounded-lg border-2 p-0 ${color === swatch ? 'border-primary scale-110' : 'border-transparent'}`} style={{ backgroundColor: swatch }} />
                            ))}
                        </div>
                        {colorError && <p className="mt-2 text-[11px] font-bold text-danger">{colorError}</p>}
                    </div>

                    {submitError && (
                        <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3">
                            <p className="text-[11px] font-black uppercase tracking-wider text-danger">{submitError}</p>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-6">
                        <Button type="button" disabled={isSubmitting} variant="ghost" onClick={onClose} className="h-11 rounded-2xl px-8 font-bold text-muted-fg">{t('common.cancel')}</Button>
                        <Button type="submit" disabled={isSubmitting} className="h-11 rounded-2xl px-8 text-xs font-black uppercase tracking-widest">
                            {isSubmitting ? (t('common.loading') || 'Saving...') : t('common.save')}
                        </Button>
                    </div>
                </form>
            </ModalPanel>
        </ModalOverlay>
    );
};
