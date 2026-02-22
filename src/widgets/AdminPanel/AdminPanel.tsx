import React, { useState, useEffect } from 'react';
import { Category, Document, Tag, UserProfile, UserRole } from '@shared/types';
import { UsersApi, AccessRequest } from '@shared/api/firestore/users.api';
import { TagsApi } from '@shared/api/firestore/tags.api';
import { DocumentsApi } from '@shared/api/firestore/documents.api';
import { TagEditorModal } from '@widgets/modals/TagEditorModal';
import { UserEditorModal } from '@widgets/modals/UserEditorModal';
import { useI18n } from '@app/providers/i18n/i18n';

// Sub-components
import { AdminHeader } from './ui/AdminHeader';
import { AdminTabs } from './ui/AdminTabs';
import { ContentTab } from './ui/ContentTab';
import { TagsTab } from './ui/TagsTab';
import { UsersTab } from './ui/UsersTab';
import { RequestsTab } from './ui/RequestsTab';
import { HealthTab } from './ui/HealthTab';
import { StatePanel } from '@shared/ui/states';
import { Card } from '@shared/ui/primitives';

interface AdminPanelProps {
  categories: Category[];
  documents: Document[];
  allTags: Tag[];
  onUpdateCategory: (cat: Category) => void;
  onDeleteCategory: (id: string) => void;
  onAddCategory: () => void;
  onDeleteDocument: (id: string) => void;
  onEditDocument: (doc: Document) => void;
  onAddDocument: () => void;
  onClose: () => void;
}

type TabId = 'content' | 'users' | 'tags' | 'requests' | 'health';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  categories = [],
  documents = [],
  allTags = [],
  onUpdateCategory,
  onDeleteCategory,
  onAddCategory,
  onDeleteDocument,
  onEditDocument,
  onAddDocument,
  onClose,
}) => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    const hash = window.location.hash.replace('#', '') as TabId;
    return ['content', 'users', 'tags', 'requests', 'health'].includes(hash) ? hash : 'content';
  });
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    window.location.hash = activeTab;
  }, [activeTab]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (activeTab === 'users') {
      setIsLoading(true);
      const unsub = UsersApi.subscribeUsers((updatedUsers) => {
        setUsers(updatedUsers || []);
        setIsLoading(false);
      });
      return () => unsub();
    }
    if (activeTab === 'requests') {
        setIsLoading(true);
        const unsub = UsersApi.subscribeRequests((updatedRequests) => {
            setRequests(updatedRequests || []);
            setIsLoading(false);
        });
        return () => unsub();
    }
  }, [activeTab]);

  const handleApproveRequest = async (requestId: string, uid: string, role: UserRole) => {
      try {
          setIsSaving(true);
          await UsersApi.updateRequestStatus(requestId, 'approved', role);
          if (uid) {
              await UsersApi.updateUser(uid, { role });
          }
          setNotice({ type: 'success', text: 'Заявку схвалено та роль оновлено.' });
      } catch (error) {
          console.error('Failed to approve request:', error);
          setNotice({ type: 'error', text: 'Не вдалося схвалити заявку.' });
      } finally {
          setIsSaving(false);
      }
  };

  const handleDenyRequest = async (requestId: string) => {
      try {
          setIsSaving(true);
          await UsersApi.updateRequestStatus(requestId, 'denied');
          setNotice({ type: 'success', text: 'Заявку відхилено.' });
      } catch (error) {
          console.error('Failed to deny request:', error);
          setNotice({ type: 'error', text: 'Не вдалося відхилити заявку.' });
      } finally {
          setIsSaving(false);
      }
  };

  const handleSaveTag = async (tagData: Partial<Tag>) => {
    try {
      setIsSaving(true);
      if (tagData.id) {
        await TagsApi.update(tagData.id, tagData);
      } else {
        await TagsApi.create(tagData as Omit<Tag, 'id'>);
      }
      setNotice({ type: 'success', text: 'Тег збережено.' });
      setEditingTag(null);
    } catch (error) {
      console.error('Failed to save tag:', error);
      setNotice({ type: 'error', text: 'Не вдалося зберегти тег.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTag = async (id: string) => {
    if (window.confirm('Ви впевнені, що хочете видалити цей тег?')) {
      try {
        setIsSaving(true);
        const affected = documents.filter(doc => (doc.tagIds || []).includes(id));

        if (affected.length > 0) {
          const candidates = allTags.filter(tag => tag.id !== id);
          const options = candidates.map(tag => `${tag.id} (${tag.name})`).join(', ');
          const replacementId = window.prompt(
            `Тег використовується у ${affected.length} документ(ах).\n` +
            `Вкажіть ID тегу для міграції або залиште порожнім, щоб просто прибрати тег.\n` +
            `Доступні теги: ${options}`
          )?.trim();

          if (replacementId && !candidates.some(tag => tag.id === replacementId)) {
            setNotice({ type: 'error', text: 'Невірний ID тегу для міграції. Видалення скасовано.' });
            setIsSaving(false);
            return;
          }

          const updates = affected.map(doc => {
            const nextTagIds = (doc.tagIds || []).filter(tagId => tagId !== id);
            if (replacementId && !nextTagIds.includes(replacementId)) nextTagIds.push(replacementId);
            return {
              id: doc.id,
              patch: { tagIds: nextTagIds },
            };
          });

          await Promise.all(updates.map(({ id: docId, patch }) => DocumentsApi.saveMetadata(docId, patch)));
        }

        await TagsApi.delete(id);
        setNotice({ type: 'success', text: 'Тег видалено.' });
      } catch (error) {
        console.error('Failed to delete tag:', error);
        setNotice({ type: 'error', text: 'Не вдалося видалити тег.' });
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleDeleteCategorySafely = async (category: Category) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цю категорію?')) return;

    try {
      setIsSaving(true);
      const affected = documents.filter(doc => doc.categoryKey === category.nameKey);

      if (affected.length > 0) {
        const candidates = categories.filter(cat => cat.id !== category.id);
        if (candidates.length === 0) {
          setNotice({ type: 'error', text: 'Немає категорії для міграції. Спочатку створіть іншу категорію.' });
          setIsSaving(false);
          return;
        }

        const options = candidates.map(cat => cat.nameKey).join(', ');
        const replacementKey = window.prompt(
          `Категорія використовується у ${affected.length} документ(ах).\n` +
          `Вкажіть nameKey категорії для міграції.\n` +
          `Доступні: ${options}`
        )?.trim();

        if (!replacementKey || !candidates.some(cat => cat.nameKey === replacementKey)) {
          setNotice({ type: 'error', text: 'Невірна категорія для міграції. Видалення скасовано.' });
          setIsSaving(false);
          return;
        }

        const updates = affected.map(doc => ({
          id: doc.id,
          patch: { categoryKey: replacementKey },
        }));

        await Promise.all(updates.map(({ id: docId, patch }) => DocumentsApi.saveMetadata(docId, patch)));
      }

      await onDeleteCategory(category.id);
      setNotice({ type: 'success', text: 'Категорію видалено без втрати зв’язків документів.' });
    } catch (error) {
      console.error('Failed to safely delete category:', error);
      setNotice({ type: 'error', text: 'Не вдалося видалити категорію.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveUser = async (userData: Partial<UserProfile>) => {
    try {
      setIsSaving(true);
      if (userData.uid) {
        const existingUser = users.find(u => u.uid === userData.uid);
        const { uid, ...data } = userData;

        if (data.email && data.email !== (existingUser?.email || '')) {
          await UsersApi.updateUserEmailAsAdmin(uid, data.email);
        }

        const { email, ...profileData } = data;
        await UsersApi.updateUser(uid, profileData);
      }
      setNotice({ type: 'success', text: 'Профіль користувача оновлено.' });
      setEditingUser(null);
    } catch (error) {
      console.error('Failed to save user:', error);
      setNotice({ type: 'error', text: 'Не вдалося зберегти користувача.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBulkPatchDocuments = async (updates: Array<{ id: string; patch: Partial<Document> }>) => {
    if (updates.length === 0) return;
    try {
      setIsSaving(true);
      await Promise.all(updates.map(({ id, patch }) => DocumentsApi.saveMetadata(id, patch)));
      setNotice({ type: 'success', text: `Оновлено документів: ${updates.length}.` });
    } catch (error) {
      console.error('Failed to bulk update documents:', error);
      setNotice({ type: 'error', text: 'Не вдалося виконати масове оновлення документів.' });
    } finally {
      setIsSaving(false);
    }
  };

  const healthIssuesCount = documents.filter(doc =>
    !doc.categoryKey ||
    !doc.tagIds || doc.tagIds.length === 0 ||
    !doc.viewPermissions || doc.viewPermissions.length === 0 ||
    !doc.status
  ).length;

  const pendingRequestsCount = (requests || []).filter(r => r.status === 'pending').length;

  return (
    <div className="animate-slide-up w-full overflow-hidden border-y border-border bg-bg shadow-soft md:border md:rounded-xl">
      <AdminHeader onClose={onClose} />
      <div className="grid min-h-[72vh] md:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="border-b border-border bg-surface/60 md:sticky md:top-28 md:h-[calc(100vh-7rem)] md:self-start md:overflow-y-auto md:border-b-0 md:border-r">
          <AdminTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            pendingRequestsCount={pendingRequestsCount}
            healthIssuesCount={healthIssuesCount}
          />
        </aside>

        <div className="min-w-0 p-4 md:p-8">
          {notice && (
            <Card className={`mb-6 rounded-xl border px-4 py-3 shadow-none ${
              notice.type === 'success'
                ? 'border-success/30 bg-success/10 text-success'
                : 'border-danger/30 bg-danger/10 text-danger'
            }`}>
              <p className="text-xs font-semibold tracking-wide">{notice.text}</p>
            </Card>
          )}

          <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Card className="rounded-xl border-border bg-muted/20 p-4 shadow-none">
              <p className="text-[11px] font-semibold tracking-wide text-muted-fg">Документи</p>
              <p className="mt-1 text-2xl font-black text-fg">{documents.length}</p>
            </Card>
            <Card className="rounded-xl border-border bg-muted/20 p-4 shadow-none">
              <p className="text-[11px] font-semibold tracking-wide text-muted-fg">Категорії</p>
              <p className="mt-1 text-2xl font-black text-fg">{categories.length}</p>
            </Card>
            <Card className="rounded-xl border-border bg-muted/20 p-4 shadow-none">
              <p className="text-[11px] font-semibold tracking-wide text-muted-fg">Теги</p>
              <p className="mt-1 text-2xl font-black text-fg">{allTags.length}</p>
            </Card>
            <Card className="rounded-xl border-border bg-muted/20 p-4 shadow-none">
              <p className="text-[11px] font-semibold tracking-wide text-muted-fg">Pending заявок</p>
              <p className="mt-1 text-2xl font-black text-fg">{pendingRequestsCount}</p>
            </Card>
          </div>

          {activeTab === 'content' && (
            <ContentTab
              categories={categories}
              documents={documents}
              availableTags={allTags}
              onAddCategory={onAddCategory}
              onUpdateCategory={onUpdateCategory}
              onDeleteCategory={handleDeleteCategorySafely}
              onAddDocument={onAddDocument}
              onEditDocument={onEditDocument}
              onDeleteDocument={onDeleteDocument}
              onBulkPatchDocuments={handleBulkPatchDocuments}
              isProcessing={isSaving}
            />
          )}

          {activeTab === 'tags' && (
            <TagsTab
              allTags={allTags}
              onAddTag={() => setEditingTag({ id: '', name: '', color: '#3b82f6' })}
              onEditTag={setEditingTag}
              onDeleteTag={handleDeleteTag}
              isProcessing={isSaving}
            />
          )}

          {activeTab === 'health' && (
            <HealthTab
              documents={documents}
              categories={categories}
              tags={allTags}
              onBulkPatchDocuments={handleBulkPatchDocuments}
              isProcessing={isSaving}
            />
          )}

          {(activeTab === 'users' || activeTab === 'requests') && isLoading ? (
              <div className="flex items-center justify-center py-20">
                  <StatePanel variant="loading" title={t('common.loading')} className="min-w-[280px]" />
              </div>
          ) : (
              <>
                  {activeTab === 'users' && (
                      <UsersTab
                          users={users || []}
                          onEditUser={setEditingUser}
                          isProcessing={isSaving}
                      />
                  )}

                  {activeTab === 'requests' && (
                      <RequestsTab
                          requests={requests || []}
                          onApprove={handleApproveRequest}
                          onDeny={handleDenyRequest}
                          isProcessing={isSaving}
                      />
                  )}
              </>
          )}
        </div>
      </div>

      {editingTag && (
        <TagEditorModal
          tag={editingTag}
          onClose={() => setEditingTag(null)}
          onSave={handleSaveTag}
        />
      )}
      {editingUser && (
        <UserEditorModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleSaveUser}
        />
      )}
    </div>
  );
};
