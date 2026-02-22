import React from 'react';
import { UserProfile } from '@shared/types';
import { Icon } from '@shared/ui/icons';
import { Button, Card } from '@shared/ui/primitives';

interface UsersTabProps {
    users: UserProfile[];
    onEditUser: (user: UserProfile) => void;
}

export const UsersTab: React.FC<UsersTabProps> = ({ users, onEditUser }) => {
    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-fg">Користувачі</h3>
                    <p className="text-sm italic text-muted-fg">Керування правами та доступами</p>
                </div>
            </div>
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
                        {users.map((u) => (
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
                                    <Button onClick={() => onEditUser(u)} variant="ghost" size="icon" className="text-muted-fg hover:text-primary">
                                        <Icon name="pencil" className="w-4 h-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};
