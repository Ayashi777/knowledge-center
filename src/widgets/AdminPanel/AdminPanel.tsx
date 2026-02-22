import React, { useState, useEffect } from 'react';
import { Category, Document, Tag, UserProfile, UserRole } from '@shared/types';
import { UsersApi, AccessRequest } from '@shared/api/firestore/users.api';
import { TagsApi } from '@shared/api/firestore/tags.api';
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

type TabId = 'content' | 'users' | 'tags' | 'requests';

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
    return ['content', 'users', 'tags', 'requests'].includes(hash) ? hash : 'content';
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

  // 🔥 Fix: Safe access with optional chaining and fallback
  const pendingRequestsCount = (requests || []).filter(r => r.status === 'pending').length;

  return (
    <div className="animate-slide-up overflow-hidden rounded-3xl border border-border bg-surface shadow-soft">
      <AdminHeader onClose={onClose} />
      <AdminTabs 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        pendingRequestsCount={pendingRequestsCount}
      />

      <div className="p-8 min-h-[500px]">
        {notice && (
          <Card className={`mb-6 rounded-2xl border px-4 py-3 shadow-none ${
            notice.type === 'success'
              ? 'border-success/30 bg-success/10 text-success'
              : 'border-danger/30 bg-danger/10 text-danger'
          }`}>
            <p className="text-xs font-black uppercase tracking-wider">{notice.text}</p>
          </Card>
        )}

        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Card className="rounded-2xl border-border bg-muted/20 p-4 shadow-none">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-fg">Документи</p>
            <p className="mt-1 text-2xl font-black text-fg">{documents.length}</p>
          </Card>
          <Card className="rounded-2xl border-border bg-muted/20 p-4 shadow-none">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-fg">Категорії</p>
            <p className="mt-1 text-2xl font-black text-fg">{categories.length}</p>
          </Card>
          <Card className="rounded-2xl border-border bg-muted/20 p-4 shadow-none">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-fg">Теги</p>
            <p className="mt-1 text-2xl font-black text-fg">{allTags.length}</p>
          </Card>
          <Card className="rounded-2xl border-border bg-muted/20 p-4 shadow-none">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-fg">Pending заявок</p>
            <p className="mt-1 text-2xl font-black text-fg">{pendingRequestsCount}</p>
          </Card>
        </div>

        {activeTab === 'content' && (
          <ContentTab 
            categories={categories}
            documents={documents}
            onAddCategory={onAddCategory}
            onUpdateCategory={onUpdateCategory}
            onDeleteCategory={onDeleteCategory}
            onAddDocument={onAddDocument}
            onEditDocument={onEditDocument}
            onDeleteDocument={onDeleteDocument}
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
