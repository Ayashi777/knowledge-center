import React, { useState } from 'react';
import { Tag } from '../../../types';
import { useI18n } from '../../../i18n';

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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl w-full max-w-md p-8 border border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">
                    {tag.id ? t('tagEditor.editTitle') : t('tagEditor.createTitle')}
                </h2>
                <form onSubmit={(e) => { e.preventDefault(); onSave({ id: tag.id, name, color }); }} className="space-y-5">
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">{t('tagEditor.nameLabel')}</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-semibold" required autoFocus />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">{t('tagEditor.colorLabel')}</label>
                        <div className="grid grid-cols-6 gap-2">
                            {colorSwatches.map(swatch => (
                                <button key={swatch} type="button" onClick={() => setColor(swatch)} className={`h-8 rounded-lg border-2 ${color === swatch ? 'border-blue-500 scale-110' : 'border-transparent'}`} style={{ backgroundColor: swatch }} />
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-6">
                        <button type="button" onClick={onClose} className="px-8 py-3 rounded-2xl text-gray-500 font-bold hover:bg-gray-100">{t('common.cancel')}</button>
                        <button type="submit" className="px-8 py-3 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 uppercase tracking-widest text-xs">{t('common.save')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
