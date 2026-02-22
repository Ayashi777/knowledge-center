import React, { useMemo, useState } from 'react';
import { UserProfile, UserRole } from '@shared/types';
import { Icon } from '@shared/ui/icons';
import { Button, Card, Input } from '@shared/ui/primitives';
import { StatePanel } from '@shared/ui/states';

interface UsersTabProps {
    users: UserProfile[];
    onEditUser: (user: UserProfile) => void;
    isProcessing?: boolean;
}

export const UsersTab: React.FC<UsersTabProps> = ({ users, onEditUser, isProcessing }) => {
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');

    const roles = useMemo(() => {
        const set = new Set<UserRole>();
        users.forEach(u => u.role && set.add(u.role));
        return Array.from(set.values());
    }, [users]);

    const filteredUsers = useMemo(() => {
        const q = search.trim().toLowerCase();
        return users.filter(u => {
            if (roleFilter !== 'all' && u.role !== roleFilter) return false;
            if (!q) return true;
            return (
                (u.displayName || '').toLowerCase().includes(q) ||
                (u.name || '').toLowerCase().includes(q) ||
                (u.email || '').toLowerCase().includes(q) ||
                (u.company || '').toLowerCase().includes(q)
            );
        });
    }, [users, search, roleFilter]);

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-fg">Користувачі</h3>
                    <p className="text-sm italic text-muted-fg">Керування правами та доступами</p>
                </div>
            </div>

            <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-[minmax(260px,1fr)_220px]">
                <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Пошук: ім'я, email, компанія"
                    className="h-11 rounded-xl px-4 text-sm font-semibold"
                />
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as 'all' | UserRole)}
                    className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-fg outline-none focus-visible:shadow-focus"
                >
                    <option value="all">Всі ролі</option>
                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>

            {filteredUsers.length === 0 ? (
                <StatePanel
                    variant="empty"
                    title="Користувачів не знайдено"
                    description="Змініть пошук або фільтр ролі."
                    className="py-16"
                />
            ) : (
            <Card className="overflow-x-auto rounded-2xl border-border bg-surface">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-muted/40">
                        <tr>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-fg">Користувач</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-fg">Email</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-fg">Роль</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-fg">Статус</th>
                            <th className="p-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filteredUsers.map((u) => (
                            <tr key={u.uid} className="transition-colors hover:bg-muted/25">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-xs font-bold text-primary">
                                            {(u.displayName || u.name)?.charAt(0) || u.email?.charAt(0)}
                                        </div>
                                        <span className="font-bold text-fg">{u.displayName || u.name || '---'}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-sm text-muted-fg">{u.email}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter ${
                                        u.role === 'admin' ? 'bg-accent/15 text-accent' :
                                        u.role === 'guest' ? 'bg-muted text-muted-fg' : 'bg-primary/15 text-primary'
                                    }`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className={`inline-block h-2 w-2 rounded-full ${u.role === 'guest' ? 'bg-warning' : 'bg-success'}`} />
                                </td>
                                <td className="p-4 text-right">
                                    <Button
                                        onClick={() => onEditUser(u)}
                                        variant="ghost"
                                        size="icon"
                                        disabled={isProcessing}
                                        className="text-muted-fg hover:text-primary"
                                    >
                                        <Icon name="pencil" className="w-4 h-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
            )}
        </div>
    );
};
