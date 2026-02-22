import React, { useState } from 'react';
import { AccessRequest } from '@shared/api/firestore/users.api';
import { UserRole } from '@shared/types';
import { Icon } from '@shared/ui/icons';
import { useI18n } from '@app/providers/i18n/i18n';
import { ALL_ROLES } from '@shared/config/constants';
import { Button, Card } from '@shared/ui/primitives';
import { StatePanel } from '@shared/ui/states';

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
            <StatePanel
                variant="empty"
                title={t('adminRequests.noRequests')}
                className="animate-fade-in py-20"
            />
        );
    }

    return (
        <Card className="animate-fade-in overflow-x-auto border-border bg-surface p-5 shadow-none">
            <h2 className="mb-6 text-xl font-black uppercase tracking-tight text-fg">{t('adminRequests.title')}</h2>
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-border">
                        <th className="py-4 text-[10px] font-black uppercase tracking-widest text-muted-fg">{t('adminRequests.tableUser')}</th>
                        <th className="py-4 text-[10px] font-black uppercase tracking-widest text-muted-fg">{t('adminRequests.tableInfo')}</th>
                        <th className="py-4 text-[10px] font-black uppercase tracking-widest text-muted-fg">{t('adminRequests.tableRequestedRole')}</th>
                        <th className="py-4 text-[10px] font-black uppercase tracking-widest text-muted-fg">{t('adminRequests.tableStatus')}</th>
                        <th className="py-4 text-right text-[10px] font-black uppercase tracking-widest text-muted-fg">{t('adminRequests.tableActions')}</th>
                    </tr>
                </thead>
                <tbody>
                    {requests.map((request) => {
                        const isProcessing = processingId === request.id;
                        
                        return (
                            <tr key={request.id} className="border-b border-border/40 transition-colors hover:bg-muted/30">
                                <td className="py-4">
                                    <p className="text-sm font-bold text-fg">{request.name}</p>
                                    <p className="text-xs text-muted-fg">{request.email}</p>
                                </td>
                                <td className="py-4">
                                    <p className="text-sm text-fg">{request.company}</p>
                                    <p className="text-xs text-muted-fg">{request.phone}</p>
                                </td>
                                <td className="py-4">
                                    {request.status === 'pending' ? (
                                        <select 
                                            disabled={isProcessing}
                                            className="rounded-lg border border-border bg-surface p-1 text-[10px] font-black uppercase text-fg disabled:opacity-50"
                                            value={selectedRoles[request.id] || request.requestedRole || 'guest'}
                                            onChange={(e) => handleRoleChange(request.id, e.target.value as UserRole)}
                                        >
                                            {ALL_ROLES.map(r => (
                                                <option key={r} value={r}>{t(`roles.${r}`)}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span className="rounded-md bg-primary/15 px-2 py-1 text-[10px] font-black uppercase text-primary">
                                            {t(`roles.${request.assignedRole || request.requestedRole || 'guest'}`)}
                                        </span>
                                    )}
                                </td>
                                <td className="py-4">
                                    <span className={`text-[10px] font-black uppercase ${
                                        request.status === 'pending' ? 'text-warning' :
                                        request.status === 'approved' ? 'text-success' : 'text-danger'
                                    }`}>
                                        {t(`adminRequests.${request.status}`)}
                                    </span>
                                </td>
                                <td className="py-4 text-right">
                                    {request.status === 'pending' && (
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                disabled={isProcessing}
                                                onClick={() => handleApprove(request)}
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-success hover:bg-success/15 disabled:opacity-30"
                                                title={t('common.approve')}
                                            >
                                                {isProcessing ? (
                                                    <Icon name="loading" className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Icon name="check" className="w-4 h-4" />
                                                )}
                                            </Button>
                                            <Button
                                                disabled={isProcessing}
                                                onClick={() => handleDeny(request.id)}
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-danger hover:bg-danger/15 disabled:opacity-30"
                                                title={t('common.deny')}
                                            >
                                                <Icon name="x-mark" className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </Card>
    );
};
