import React, { useState } from 'react';
import { UserRole, UserProfile } from '@shared/types';
import { useI18n } from '@app/providers/i18n/i18n';
import { Button, Input, ModalOverlay, ModalPanel } from '@shared/ui/primitives';

export const UserEditorModal: React.FC<{ user: UserProfile, onSave: (user: Partial<UserProfile>) => void, onClose: () => void }> = ({ user, onSave, onClose }) => {
    const { t } = useI18n();
    const [name, setName] = useState(user.name || '');
    const [company, setCompany] = useState(user.company || '');
    const [phone, setPhone] = useState(user.phone || '');
    const [email, setEmail] = useState(user.email || '');
    const [role, setRole] = useState(user.role);

    const roles: UserRole[] = ['guest', 'foreman', 'engineer', 'architect', 'admin'];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ uid: user.uid, name, company, phone, role, email });
    };

    return (
        <ModalOverlay className="z-50 bg-black/60" onClick={onClose}>
            <ModalPanel className="max-w-lg rounded-3xl border-border bg-surface p-8" onClick={e => e.stopPropagation()}>
                <h2 className="mb-6 text-2xl font-black text-fg">{t('userEditorModal.title')}</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="mb-1.5 block text-xs font-black uppercase tracking-widest text-muted-fg">{t('userEditorModal.labelName')}</label>
                        <Input type="text" value={name} onChange={e => setName(e.target.value)} className="h-12 rounded-2xl px-4 font-semibold" required />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-black uppercase tracking-widest text-muted-fg">{t('userEditorModal.labelCompany')}</label>
                        <Input type="text" value={company} onChange={e => setCompany(e.target.value)} className="h-12 rounded-2xl px-4 font-semibold" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-black uppercase tracking-widest text-muted-fg">{t('userEditorModal.labelPhone')}</label>
                        <Input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="h-12 rounded-2xl px-4 font-semibold" />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-black uppercase tracking-widest text-muted-fg">
                            {t('loginModal.emailLabel')}
                        </label>
                        <Input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="h-12 rounded-2xl px-4 font-semibold"
                            required
                        />
                        <p className="mt-1 text-[10px] font-bold uppercase text-warning">
                            * Зміна пошти також оновить логін користувача в системі.
                        </p>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-black uppercase tracking-widest text-muted-fg">{t('userEditorModal.labelRole')}</label>
                        <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="h-12 w-full rounded-2xl border border-border bg-surface px-4 text-sm font-semibold text-fg outline-none focus-visible:shadow-focus">
                            {roles.map(r => <option key={r} value={r}>{t(`roles.${r}`)}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-6">
                        <Button type="button" variant="ghost" onClick={onClose} className="h-11 rounded-2xl px-8 text-muted-fg">{t('common.cancel')}</Button>
                        <Button type="submit" className="h-11 rounded-2xl px-8 text-xs font-black uppercase tracking-widest">{t('common.save')}</Button>
                    </div>
                </form>
            </ModalPanel>
        </ModalOverlay>
    );
};
