import React, { useMemo, useState } from 'react';
import { Category, Document, DocumentStatus, Tag, UserRole } from '@shared/types';
import { getCategoryName } from '@shared/lib/utils/format';
import { Button, Card } from '@shared/ui/primitives';
import { StatePanel } from '@shared/ui/states';
import { ALL_ROLES } from '@shared/config/constants';

interface HealthTabProps {
  documents: Document[];
  categories: Category[];
  tags: Tag[];
  onBulkPatchDocuments: (updates: Array<{ id: string; patch: Partial<Document> }>) => Promise<void>;
  isProcessing?: boolean;
}

export const HealthTab: React.FC<HealthTabProps> = ({
  documents,
  categories,
  tags,
  onBulkPatchDocuments,
  isProcessing,
}) => {
  const [fixCategory, setFixCategory] = useState('none');
  const [fixStatus, setFixStatus] = useState<DocumentStatus>('published');
  const [fixRole, setFixRole] = useState<UserRole>('guest');

  const validCategoryKeys = useMemo(() => new Set(categories.map(c => c.nameKey)), [categories]);
  const validTagIds = useMemo(() => new Set(tags.map(t => t.id)), [tags]);

  const health = useMemo(() => {
    const noCategory = documents.filter(doc => !doc.categoryKey || !validCategoryKeys.has(doc.categoryKey));
    const noTags = documents.filter(doc => !doc.tagIds || doc.tagIds.length === 0);
    const brokenTags = documents.filter(doc => (doc.tagIds || []).some(tagId => !validTagIds.has(tagId)));
    const noViewPermissions = documents.filter(doc => !doc.viewPermissions || doc.viewPermissions.length === 0);
    const noDownloadPermissions = documents.filter(doc => !doc.downloadPermissions || doc.downloadPermissions.length === 0);
    const noStatus = documents.filter(doc => !doc.status);
    const archivedWithoutReason = documents.filter(doc => doc.status === 'archived' && !doc.description);

    return {
      noCategory,
      noTags,
      brokenTags,
      noViewPermissions,
      noDownloadPermissions,
      noStatus,
      archivedWithoutReason,
      totalIssues:
        noCategory.length +
        noTags.length +
        brokenTags.length +
        noViewPermissions.length +
        noDownloadPermissions.length +
        noStatus.length +
        archivedWithoutReason.length,
    };
  }, [documents, validCategoryKeys, validTagIds]);

  const applyFixCategory = async () => {
    if (fixCategory === 'none' || health.noCategory.length === 0) return;
    await onBulkPatchDocuments(health.noCategory.map(doc => ({ id: doc.id, patch: { categoryKey: fixCategory } })));
  };

  const applyFixStatus = async () => {
    if (health.noStatus.length === 0) return;
    await onBulkPatchDocuments(health.noStatus.map(doc => ({ id: doc.id, patch: { status: fixStatus } })));
  };

  const applyFixViewRole = async () => {
    if (health.noViewPermissions.length === 0) return;
    await onBulkPatchDocuments(
      health.noViewPermissions.map(doc => ({
        id: doc.id,
        patch: { viewPermissions: [fixRole] },
      }))
    );
  };

  const applyFixDownloadRole = async () => {
    if (health.noDownloadPermissions.length === 0) return;
    await onBulkPatchDocuments(
      health.noDownloadPermissions.map(doc => ({
        id: doc.id,
        patch: { downloadPermissions: [fixRole] },
      }))
    );
  };

  const IssueCard = ({
    title,
    count,
    description,
    children,
  }: {
    title: string;
    count: number;
    description: string;
    children?: React.ReactNode;
  }) => (
    <Card className="rounded-xl border-border bg-surface p-4 shadow-none">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-black uppercase tracking-widest text-fg">{title}</h4>
        <span className={`rounded px-2 py-1 text-[10px] font-black uppercase ${count > 0 ? 'bg-danger/15 text-danger' : 'bg-success/15 text-success'}`}>
          {count}
        </span>
      </div>
      <p className="mb-3 text-xs font-semibold text-muted-fg">{description}</p>
      {children}
    </Card>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="rounded-xl border-border bg-muted/20 p-4 shadow-none">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-fg">Data Health</p>
            <h3 className="text-xl font-black tracking-tight text-fg">Контроль якості контенту</h3>
          </div>
          <div className="rounded-xl bg-surface px-3 py-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-fg">Загалом проблем</p>
            <p className="text-2xl font-black text-fg">{health.totalIssues}</p>
          </div>
        </div>
      </Card>

      {documents.length === 0 ? (
        <StatePanel variant="empty" title="Документи відсутні" description="Після створення документів тут з'явиться аналіз якості даних." />
      ) : (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          <IssueCard title="Без категорії" count={health.noCategory.length} description="Документи без валідної категорії неструктуровані в базі.">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_90px]">
              <select value={fixCategory} onChange={(e) => setFixCategory(e.target.value)} className="h-10 min-w-0 rounded-lg border border-border bg-surface px-3 text-xs font-bold text-fg">
                <option value="none">Оберіть категорію</option>
                {categories.map(cat => <option key={cat.id} value={cat.nameKey}>{getCategoryName(cat.nameKey, (k: string) => k)}</option>)}
              </select>
              <Button onClick={applyFixCategory} disabled={isProcessing || health.noCategory.length === 0 || fixCategory === 'none'} className="h-10 w-full rounded-lg px-2 text-[10px] font-black uppercase tracking-widest">Fix</Button>
            </div>
          </IssueCard>

          <IssueCard title="Без статусу" count={health.noStatus.length} description="Рекомендовано мати статус кожного документа.">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_90px]">
              <select value={fixStatus} onChange={(e) => setFixStatus(e.target.value as DocumentStatus)} className="h-10 min-w-0 rounded-lg border border-border bg-surface px-3 text-xs font-bold text-fg">
                <option value="draft">draft</option>
                <option value="published">published</option>
                <option value="archived">archived</option>
              </select>
              <Button onClick={applyFixStatus} disabled={isProcessing || health.noStatus.length === 0} className="h-10 w-full rounded-lg px-2 text-[10px] font-black uppercase tracking-widest">Fix</Button>
            </div>
          </IssueCard>

          <IssueCard title="Без view доступу" count={health.noViewPermissions.length} description="Документи без viewPermissions вважаються публічними.">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_90px]">
              <select value={fixRole} onChange={(e) => setFixRole(e.target.value as UserRole)} className="h-10 min-w-0 rounded-lg border border-border bg-surface px-3 text-xs font-bold text-fg">
                {ALL_ROLES.filter(role => role !== 'admin').map(role => <option key={role} value={role}>{role}</option>)}
              </select>
              <Button onClick={applyFixViewRole} disabled={isProcessing || health.noViewPermissions.length === 0} className="h-10 w-full rounded-lg px-2 text-[10px] font-black uppercase tracking-widest">Fix</Button>
            </div>
          </IssueCard>

          <IssueCard title="Без download доступу" count={health.noDownloadPermissions.length} description="Якщо пусто — download успадковується від view.">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_90px]">
              <select value={fixRole} onChange={(e) => setFixRole(e.target.value as UserRole)} className="h-10 min-w-0 rounded-lg border border-border bg-surface px-3 text-xs font-bold text-fg">
                {ALL_ROLES.filter(role => role !== 'admin').map(role => <option key={role} value={role}>{role}</option>)}
              </select>
              <Button onClick={applyFixDownloadRole} disabled={isProcessing || health.noDownloadPermissions.length === 0} className="h-10 w-full rounded-lg px-2 text-[10px] font-black uppercase tracking-widest">Fix</Button>
            </div>
          </IssueCard>

          <IssueCard title="Без тегів" count={health.noTags.length} description="Документи без тегів важче фільтрувати та підтримувати." />
          <IssueCard title="Биті теги" count={health.brokenTags.length} description="Документи містять посилання на теги, яких більше не існує." />
          <IssueCard title="Архів без опису" count={health.archivedWithoutReason.length} description="Архівні документи без пояснення ускладнюють подальшу підтримку." />
        </div>
      )}
    </div>
  );
};
