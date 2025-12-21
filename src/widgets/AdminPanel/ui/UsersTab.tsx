import React from 'react';
import { UserData } from '../../../../shared/types';
import { Icon } from '../../../../shared/ui/icons';

interface UsersTabProps {
    users: UserData[];
    onEditUser: (user: UserData) => void;
}

export const UsersTab: React.FC<UsersTabProps> = ({ users, onEditUser }) => {
    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Користувачі</h3>
                    <p className="text-sm text-gray-500 italic">Керування правами та доступами</p>
                </div>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-gray-700">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Користувач</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Email</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Роль</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Статус</th>
                            <th className="p-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {users.map((u) => (
                            <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-xs">
                                            {u.displayName?.charAt(0) || u.email?.charAt(0)}
                                        </div>
                                        <span className="font-bold text-gray-900 dark:text-white">{u.displayName || '---'}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-sm text-gray-500">{u.email}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter ${
                                        u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                        u.role === 'guest' ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className={`w-2 h-2 rounded-full inline-block ${u.role === 'guest' ? 'bg-yellow-400' : 'bg-green-500'}`} />
                                </td>
                                <td className="p-4 text-right">
                                    <button onClick={() => onEditUser(u)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                        <Icon name="pencil" className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
