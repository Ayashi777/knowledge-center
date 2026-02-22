import React, { useState } from 'react';
import { UserRole, UserProfile } from '@shared/types';
import { useI18n } from '@app/providers/i18n/i18n';
import { ALL_ROLES } from '@shared/config/constants';
import { Button, Input, ModalOverlay, ModalPanel } from '@shared/ui/primitives';

export const UserEditorModal: React.FC<{ user: UserProfile, onSave: (user: Partial<UserProfile>) => void, onClose: () => void }> = ({ user, onSave, onClose }) => {
    const { t } = useI18n();
    const [name, setName] = useState(user.name || '');
    const [company, setCompany] = useState(user.company || '');
    const [phone, setPhone] = useState(user.phone || '');
    const [email, setEmail] = useState(user.email || '');
    const [role, setRole] = useState(user.role);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [submitError, setSubmitError] = useState('');

    const roles: UserRole[] = ALL_ROLES;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        const nextName = name.trim();
        const nextEmail = email.trim().toLowerCase();
        const nextNameError = nextName ? '' : 'Імʼя користувача є обовʼязковим.';
        const nextEmailError = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail) ? '' : 'Вкажіть коректний email.';

        setNameError(nextNameError);
        setEmailError(nextEmailError);
        setSubmitError('');
        if (nextNameError || nextEmailError) return;

        setIsSubmitting(true);
        Promise.resolve(onSave({ uid: user.uid, name: nextName, company: company.trim(), phone: phone.trim(), role, email: nextEmail }))
            .catch(() => {
                setSubmitError('Не вдалося оновити користувача. Спробуйте ще раз.');
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    return (
        <ModalOverlay className="z-50 bg-black/60" onClick={onClose}>
            <ModalPanel className="max-w-lg rounded-3xl border-border bg-surface p-8" onClick={e => e.stopPropagation()}>
                <h2 className="mb-6 text-2xl font-black text-fg">{t('userEditorModal.title')}</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="mb-1.5 block text-xs font-black uppercase tracking-widest text-muted-fg">{t('userEditorModal.labelName')}</label>
                        <Input type="text" value={name} onChange={e => { setName(e.target.value); if (nameError) setNameError(''); }} className="h-12 rounded-2xl px-4 font-semibold" required />
                        {nameError && <p className="mt-2 text-[11px] font-bold text-danger">{nameError}</p>}
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
                            onChange={e => { setEmail(e.target.value); if (emailError) setEmailError(''); }}
                            className="h-12 rounded-2xl px-4 font-semibold"
                            required
                        />
                        {emailError && <p className="mt-2 text-[11px] font-bold text-danger">{emailError}</p>}
                        <p className="mt-1 text-[10px] font-bold uppercase text-warning">
                            * Зміна пошти також оновить логін користувача в системі.
                        </p>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-black uppercase tracking-widest text-muted-fg">{t('userEditorModal.labelRole')}</label>
                        <select value={role} onChange={e => setRole(e.target.value as UserRole)} disabled={isSubmitting} className="h-12 w-full rounded-2xl border border-border bg-surface px-4 text-sm font-semibold text-fg outline-none focus-visible:shadow-focus disabled:opacity-60">
                            {roles.map(r => <option key={r} value={r}>{t(`roles.${r}`)}</option>)}
                        </select>
                    </div>

                    {submitError && (
                        <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3">
                            <p className="text-[11px] font-black uppercase tracking-wider text-danger">{submitError}</p>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-6">
                        <Button type="button" disabled={isSubmitting} variant="ghost" onClick={onClose} className="h-11 rounded-2xl px-8 text-muted-fg">{t('common.cancel')}</Button>
                        <Button type="submit" disabled={isSubmitting} className="h-11 rounded-2xl px-8 text-xs font-black uppercase tracking-widest">
                            {isSubmitting ? (t('common.loading') || 'Saving...') : t('common.save')}
                        </Button>
                    </div>
                </form>
            </ModalPanel>
        </ModalOverlay>
    );
};
