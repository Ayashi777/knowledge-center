import React, { useState } from 'react';
import { AccessRequest } from '@shared/api/firestore/users.api';
import { UserRole } from '@shared/types';
import { Icon } from '@shared/ui/icons';
import { useI18n } from '@app/providers/i18n/i18n';
import { ALL_ROLES } from '@shared/config/constants';

interface RequestsTabProps {
    requests: AccessRequest[];
    onApprove: (requestId: string, uid: string, role: UserRole) => void;
    onDeny: (requestId: string) => void;
}

export const RequestsTab: React.FC<RequestsTabProps> = ({ requests, onApprove, onDeny }) => {
    const { t } = useI18n();
    const [selectedRoles, setSelectedRoles] = useState<Record<string, UserRole>>({});
    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleRoleChange = (requestId: string, role: UserRole) => {
        setSelectedRoles(prev => ({ ...prev, [requestId]: role }));
    };

    const handleApprove = async (request: AccessRequest) => {
        const role = selectedRoles[request.id] || request.requestedRole || 'guest';
        setProcessingId(request.id);
        try {
            await onApprove(request.id, request.uid || '', role);
        } finally {
            setProcessingId(null);
        }
    };

    const handleDeny = async (requestId: string) => {
        setProcessingId(requestId);
        try {
            await onDeny(requestId);
        } finally {
            setProcessingId(null);
        }
    };

    if (requests.length === 0) {
        return (
            <div className="text-center py-20 animate-fade-in">
                <Icon name="info-circle" className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">{t('adminRequests.noRequests')}</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto animate-fade-in">
            <h2 className="text-xl font-black uppercase tracking-tight mb-6 dark:text-white">{t('adminRequests.title')}</h2>
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                        <th className="py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('adminRequests.tableUser')}</th>
                        <th className="py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('adminRequests.tableInfo')}</th>
                        <th className="py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('adminRequests.tableRequestedRole')}</th>
                        <th className="py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('adminRequests.tableStatus')}</th>
                        <th className="py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">{t('adminRequests.tableActions')}</th>
                    </tr>
                </thead>
                <tbody>
                    {requests.map((request) => {
                        const isProcessing = processingId === request.id;
                        
                        return (
                            <tr key={request.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                                <td className="py-4">
                                    <p className="font-bold text-gray-900 dark:text-white text-sm">{request.name}</p>
                                    <p className="text-xs text-gray-400">{request.email}</p>
                                </td>
                                <td className="py-4">
                                    <p className="text-sm dark:text-gray-300">{request.company}</p>
                                    <p className="text-xs text-gray-500">{request.phone}</p>
                                </td>
                                <td className="py-4">
                                    {request.status === 'pending' ? (
                                        <select 
                                            disabled={isProcessing}
                                            className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-[10px] font-black uppercase p-1 disabled:opacity-50"
                                            value={selectedRoles[request.id] || request.requestedRole || 'guest'}
                                            onChange={(e) => handleRoleChange(request.id, e.target.value as UserRole)}
                                        >
                                            {ALL_ROLES.map(r => (
                                                <option key={r} value={r}>{t(`roles.${r}`)}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase rounded-md">
                                            {t(`roles.${request.assignedRole || request.requestedRole || 'guest'}`)}
                                        </span>
                                    )}
                                </td>
                                <td className="py-4">
                                    <span className={`text-[10px] font-black uppercase ${
                                        request.status === 'pending' ? 'text-yellow-500' :
                                        request.status === 'approved' ? 'text-green-500' : 'text-red-500'
                                    }`}>
                                        {t(`adminRequests.${request.status}`)}
                                    </span>
                                </td>
                                <td className="py-4 text-right">
                                    {request.status === 'pending' && (
                                        <div className="flex justify-end gap-2">
                                            <button
                                                disabled={isProcessing}
                                                onClick={() => handleApprove(request)}
                                                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-colors disabled:opacity-30"
                                                title={t('common.approve')}
                                            >
                                                {isProcessing ? (
                                                    <Icon name="loading" className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Icon name="check" className="w-4 h-4" />
                                                )}
                                            </button>
                                            <button
                                                disabled={isProcessing}
                                                onClick={() => handleDeny(request.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors disabled:opacity-30"
                                                title={t('common.deny')}
                                            >
                                                <Icon name="x-mark" className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
