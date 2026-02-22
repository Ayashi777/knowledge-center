import React, { useEffect, useMemo, useState } from 'react';
import { Category, Document, DocumentStatus, Tag, UserRole } from '@shared/types';
import { Icon } from '@shared/ui/icons';
import { useI18n } from '@app/providers/i18n/i18n';
import { getCategoryName } from '@shared/lib/utils/format';
import { AdminTable, AdminTableBody, AdminTableCell, AdminTableHead, AdminTableHeaderCell, AdminTableRow, Button, Card, Input } from '@shared/ui/primitives';
import { StatePanel } from '@shared/ui/states';
import { ALL_ROLES } from '@shared/config/constants';

interface ContentTabProps {
    categories: Category[];
    documents: Document[];
    availableTags: Tag[];
    onAddCategory: () => void;
    onUpdateCategory: (cat: Category) => void;
    onDeleteCategory: (cat: Category) => void;
    onAddDocument: () => void;
    onEditDocument: (doc: Document) => void;
    onDeleteDocument: (id: string) => void;
    onBulkPatchDocuments: (updates: Array<{ id: string; patch: Partial<Document> }>) => Promise<void>;
    isProcessing?: boolean;
}

interface ContentFiltersState {
    documentSearch: string;
    categoryFilter: string;
    tagFilter: string;
    roleFilter: 'all' | UserRole;
    statusFilter: 'all' | DocumentStatus;
}

interface SavedContentView {
    id: string;
    name: string;
    filters: ContentFiltersState;
}

const STORAGE_KEY_VIEWS = 'admin.content.savedViews.v1';
const STORAGE_KEY_LAST = 'admin.content.lastFilters.v1';

export const ContentTab: React.FC<ContentTabProps> = ({
    categories,
    documents,
    availableTags,
    onAddCategory,
    onUpdateCategory,
    onDeleteCategory,
    onAddDocument,
    onEditDocument,
    onDeleteDocument,
    onBulkPatchDocuments,
    isProcessing,
}) => {
    const { t } = useI18n();
    const [categorySearch, setCategorySearch] = useState('');
    const [documentSearch, setDocumentSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [tagFilter, setTagFilter] = useState('all');
    const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | DocumentStatus>('all');
    const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());
    const [bulkCategory, setBulkCategory] = useState('none');
    const [bulkTagId, setBulkTagId] = useState('none');
    const [bulkTagAction, setBulkTagAction] = useState<'add' | 'remove'>('add');
    const [bulkRole, setBulkRole] = useState<UserRole>('guest');
    const [bulkRoleAction, setBulkRoleAction] = useState<'add' | 'remove'>('add');
    const [bulkDownloadRole, setBulkDownloadRole] = useState<UserRole>('guest');
    const [bulkDownloadRoleAction, setBulkDownloadRoleAction] = useState<'add' | 'remove'>('add');
    const [bulkStatus, setBulkStatus] = useState<DocumentStatus>('published');
    const [savedViews, setSavedViews] = useState<SavedContentView[]>([]);
    const [selectedViewId, setSelectedViewId] = useState('none');

    const readFiltersFromUrl = (): Partial<ContentFiltersState> => {
        const params = new URLSearchParams(window.location.search);
        const documentSearchValue = params.get('dq') || undefined;
        const categoryFilterValue = params.get('dc') || undefined;
        const tagFilterValue = params.get('dt') || undefined;
        const roleFilterValue = params.get('dr') as 'all' | UserRole | null;
        const statusFilterValue = params.get('ds') as 'all' | DocumentStatus | null;

        return {
            documentSearch: documentSearchValue,
            categoryFilter: categoryFilterValue,
            tagFilter: tagFilterValue,
            roleFilter: roleFilterValue || undefined,
            statusFilter: statusFilterValue || undefined,
        };
    };

    const currentFilters: ContentFiltersState = useMemo(() => ({
        documentSearch,
        categoryFilter,
        tagFilter,
        roleFilter,
        statusFilter,
    }), [documentSearch, categoryFilter, tagFilter, roleFilter, statusFilter]);

    useEffect(() => {
        try {
            const rawViews = localStorage.getItem(STORAGE_KEY_VIEWS);
            if (rawViews) {
                const parsed = JSON.parse(rawViews) as SavedContentView[];
                setSavedViews(Array.isArray(parsed) ? parsed : []);
            }
        } catch {
            setSavedViews([]);
        }

        const urlFilters = readFiltersFromUrl();
        if (Object.keys(urlFilters).length > 0) {
            if (urlFilters.documentSearch !== undefined) setDocumentSearch(urlFilters.documentSearch);
            if (urlFilters.categoryFilter !== undefined) setCategoryFilter(urlFilters.categoryFilter);
            if (urlFilters.tagFilter !== undefined) setTagFilter(urlFilters.tagFilter);
            if (urlFilters.roleFilter !== undefined) setRoleFilter(urlFilters.roleFilter);
            if (urlFilters.statusFilter !== undefined) setStatusFilter(urlFilters.statusFilter);
            return;
        }

        try {
            const rawLast = localStorage.getItem(STORAGE_KEY_LAST);
            if (!rawLast) return;
            const parsed = JSON.parse(rawLast) as Partial<ContentFiltersState>;
            if (parsed.documentSearch !== undefined) setDocumentSearch(parsed.documentSearch);
            if (parsed.categoryFilter !== undefined) setCategoryFilter(parsed.categoryFilter);
            if (parsed.tagFilter !== undefined) setTagFilter(parsed.tagFilter);
            if (parsed.roleFilter !== undefined) setRoleFilter(parsed.roleFilter);
            if (parsed.statusFilter !== undefined) setStatusFilter(parsed.statusFilter);
        } catch {
            // Ignore invalid localStorage payload
        }
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const setOrDelete = (key: string, value: string, emptyValue: string) => {
            if (!value || value === emptyValue) params.delete(key);
            else params.set(key, value);
        };

        setOrDelete('dq', documentSearch, '');
        setOrDelete('dc', categoryFilter, 'all');
        setOrDelete('dt', tagFilter, 'all');
        setOrDelete('dr', roleFilter, 'all');
        setOrDelete('ds', statusFilter, 'all');

        const nextSearch = params.toString();
        const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash}`;
        window.history.replaceState(null, '', nextUrl);

        localStorage.setItem(STORAGE_KEY_LAST, JSON.stringify(currentFilters));
    }, [documentSearch, categoryFilter, tagFilter, roleFilter, statusFilter, currentFilters]);

    const filteredCategories = useMemo(() => {
        const q = categorySearch.trim().toLowerCase();
        if (!q) return categories;
        return categories.filter(cat =>
            getCategoryName(cat.nameKey, t).toLowerCase().includes(q) ||
            (cat.nameKey || '').toLowerCase().includes(q)
        );
    }, [categories, categorySearch, t]);

    const filteredDocuments = useMemo(() => {
        const q = documentSearch.trim().toLowerCase();
        return documents.filter(doc => {
            if (categoryFilter !== 'all' && doc.categoryKey !== categoryFilter) return false;
            if (tagFilter !== 'all' && !(doc.tagIds || []).includes(tagFilter)) return false;
            if (roleFilter !== 'all' && !(doc.viewPermissions || []).includes(roleFilter)) return false;
            if (statusFilter !== 'all' && (doc.status || 'published') !== statusFilter) return false;
            if (!q) return true;
            return (
                (doc.titleKey ? t(doc.titleKey) : doc.title || '').toLowerCase().includes(q) ||
                (doc.internalId || '').toLowerCase().includes(q) ||
                getCategoryName(doc.categoryKey, t).toLowerCase().includes(q)
            );
        });
    }, [documents, documentSearch, t, categoryFilter, tagFilter, roleFilter, statusFilter]);

    const tagMap = useMemo(() => {
        const map = new Map<string, Tag>();
        availableTags.forEach(tag => map.set(tag.id, tag));
        return map;
    }, [availableTags]);

    const allFilteredSelected = filteredDocuments.length > 0 && filteredDocuments.every(doc => selectedDocIds.has(doc.id));
    const selectedCount = selectedDocIds.size;

    const toggleDocSelection = (docId: string) => {
        setSelectedDocIds(prev => {
            const next = new Set(prev);
            if (next.has(docId)) next.delete(docId);
            else next.add(docId);
            return next;
        });
    };

    const toggleSelectAllFiltered = () => {
        setSelectedDocIds(prev => {
            const next = new Set(prev);
            if (allFilteredSelected) {
                filteredDocuments.forEach(doc => next.delete(doc.id));
            } else {
                filteredDocuments.forEach(doc => next.add(doc.id));
            }
            return next;
        });
    };

    const selectedDocuments = useMemo(
        () => documents.filter(doc => selectedDocIds.has(doc.id)),
        [documents, selectedDocIds]
    );

    const clearSelection = () => setSelectedDocIds(new Set());

    const applyBulkCategory = async () => {
        if (bulkCategory === 'none' || selectedDocuments.length === 0) return;
        const updates = selectedDocuments.map(doc => ({ id: doc.id, patch: { categoryKey: bulkCategory } }));
        await onBulkPatchDocuments(updates);
        clearSelection();
    };

    const applyBulkTag = async () => {
        if (bulkTagId === 'none' || selectedDocuments.length === 0) return;
        const updates = selectedDocuments.map(doc => {
            const current = new Set(doc.tagIds || []);
            if (bulkTagAction === 'add') current.add(bulkTagId);
            else current.delete(bulkTagId);
            return { id: doc.id, patch: { tagIds: Array.from(current) } };
        });
        await onBulkPatchDocuments(updates);
        clearSelection();
    };

    const applyBulkRole = async () => {
        if (selectedDocuments.length === 0) return;
        const updates = selectedDocuments.map(doc => {
            const current = new Set(doc.viewPermissions || []);
            if (bulkRoleAction === 'add') current.add(bulkRole);
            else current.delete(bulkRole);
            return { id: doc.id, patch: { viewPermissions: Array.from(current) } };
        });
        await onBulkPatchDocuments(updates);
        clearSelection();
    };

    const applyBulkDownloadRole = async () => {
        if (selectedDocuments.length === 0) return;
        const updates = selectedDocuments.map(doc => {
            const current = new Set(doc.downloadPermissions || []);
            if (bulkDownloadRoleAction === 'add') current.add(bulkDownloadRole);
            else current.delete(bulkDownloadRole);
            return { id: doc.id, patch: { downloadPermissions: Array.from(current) } };
        });
        await onBulkPatchDocuments(updates);
        clearSelection();
    };

    const applyBulkStatus = async () => {
        if (selectedDocuments.length === 0) return;
        const updates = selectedDocuments.map(doc => ({ id: doc.id, patch: { status: bulkStatus } }));
        await onBulkPatchDocuments(updates);
        clearSelection();
    };

    const formatUpdated = (doc: Document) => {
        try {
            const date = doc.updatedAt?.toDate?.();
            if (!date) return '—';
            return date.toLocaleDateString();
        } catch {
            return '—';
        }
    };

    const applyFilters = (filters: ContentFiltersState) => {
        setDocumentSearch(filters.documentSearch);
        setCategoryFilter(filters.categoryFilter);
        setTagFilter(filters.tagFilter);
        setRoleFilter(filters.roleFilter);
        setStatusFilter(filters.statusFilter);
    };

    const saveCurrentView = () => {
        const name = window.prompt('Назва збереженого фільтра:')?.trim();
        if (!name) return;

        const entry: SavedContentView = {
            id: `view_${Date.now()}`,
            name,
            filters: currentFilters,
        };
        const next = [...savedViews, entry];
        setSavedViews(next);
        setSelectedViewId(entry.id);
        localStorage.setItem(STORAGE_KEY_VIEWS, JSON.stringify(next));
    };

    const deleteSelectedView = () => {
        if (selectedViewId === 'none') return;
        const next = savedViews.filter(view => view.id !== selectedViewId);
        setSavedViews(next);
        setSelectedViewId('none');
        localStorage.setItem(STORAGE_KEY_VIEWS, JSON.stringify(next));
    };

    const applySelectedView = () => {
        if (selectedViewId === 'none') return;
        const view = savedViews.find(v => v.id === selectedViewId);
        if (!view) return;
        applyFilters(view.filters);
    };

    const applyQuickView = (preset: 'public' | 'untagged' | 'archived') => {
        if (preset === 'public') {
            applyFilters({
                ...currentFilters,
                roleFilter: 'all',
                statusFilter: 'published',
            });
            return;
        }
        if (preset === 'untagged') {
            applyFilters({
                ...currentFilters,
                tagFilter: 'all',
                statusFilter: 'all',
            });
            setDocumentSearch('');
            return;
        }
        if (preset === 'archived') {
            applyFilters({
                ...currentFilters,
                statusFilter: 'archived',
            });
        }
    };

    return (
        <div className="min-w-0 space-y-8">
            <section>
                <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="text-base font-black tracking-tight text-fg">Категорії ({filteredCategories.length}/{categories.length})</h3>
                    <Button onClick={onAddCategory} disabled={isProcessing} size="icon" className="h-9 w-9 rounded-lg">
                        <Icon name="plus" className="h-4 w-4" />
                    </Button>
                </div>
                <div className="mb-4 max-w-sm">
                    <Input value={categorySearch} onChange={(e) => setCategorySearch(e.target.value)} placeholder="Пошук категорій" className="h-10 rounded-xl px-4 text-sm font-semibold" />
                </div>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
                    {filteredCategories.map((cat) => (
                        <Card key={cat.id} className="group flex items-center justify-between rounded-xl border border-transparent bg-muted/35 p-4 shadow-none transition-all hover:border-primary/40">
                            <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface text-muted-fg shadow-sm">
                                    <Icon name={(cat.iconName as any) || 'folder'} className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-fg">{getCategoryName(cat.nameKey, t)}</p>
                                    <p className="text-[10px] font-black uppercase tracking-tighter text-muted-fg">{cat.viewPermissions?.join(', ')}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button onClick={() => onUpdateCategory(cat)} disabled={isProcessing} variant="ghost" size="icon" className="h-8 w-8 text-muted-fg hover:text-primary"><Icon name="pencil" className="w-4 h-4" /></Button>
                                <Button onClick={() => onDeleteCategory(cat)} disabled={isProcessing} variant="ghost" size="icon" className="h-8 w-8 text-muted-fg hover:text-danger"><Icon name="trash" className="w-4 h-4" /></Button>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>

            <section>
                <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="text-base font-black tracking-tight text-fg">Документи ({filteredDocuments.length}/{documents.length})</h3>
                    <Button onClick={onAddDocument} disabled={isProcessing} size="icon" className="h-9 w-9 rounded-lg">
                        <Icon name="plus" className="h-4 w-4" />
                    </Button>
                </div>

                <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-5">
                    <Input value={documentSearch} onChange={(e) => setDocumentSearch(e.target.value)} placeholder="Пошук: назва, ID, категорія" className="h-11 rounded-xl px-4 text-sm font-semibold" />
                    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="h-11 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-fg outline-none focus-visible:shadow-focus">
                        <option value="all">Всі категорії</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.nameKey}>{getCategoryName(cat.nameKey, t)}</option>
                        ))}
                    </select>
                    <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} className="h-11 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-fg outline-none focus-visible:shadow-focus">
                        <option value="all">Всі теги</option>
                        {availableTags.map(tag => (
                            <option key={tag.id} value={tag.id}>{tag.name}</option>
                        ))}
                    </select>
                    <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as 'all' | UserRole)} className="h-11 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-fg outline-none focus-visible:shadow-focus">
                        <option value="all">Всі ролі доступу</option>
                        {ALL_ROLES.filter(role => role !== 'admin').map(role => (
                            <option key={role} value={role}>{t(`roles.${role}`)}</option>
                        ))}
                    </select>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | DocumentStatus)} className="h-11 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-fg outline-none focus-visible:shadow-focus">
                        <option value="all">Всі статуси</option>
                        <option value="draft">draft</option>
                        <option value="published">published</option>
                        <option value="archived">archived</option>
                    </select>
                </div>

                <Card className="mb-4 rounded-xl border-border bg-muted/20 p-4 shadow-none">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_110px_110px] xl:min-w-[560px]">
                            <select value={selectedViewId} onChange={(e) => setSelectedViewId(e.target.value)} className="h-10 min-w-0 rounded-lg border border-border bg-surface px-3 text-xs font-bold text-fg">
                                <option value="none">Збережені фільтри</option>
                                {savedViews.map(view => <option key={view.id} value={view.id}>{view.name}</option>)}
                            </select>
                            <Button onClick={applySelectedView} disabled={selectedViewId === 'none'} variant="outline" className="h-10 rounded-lg px-3 text-[10px] font-black uppercase tracking-widest">Apply</Button>
                            <Button onClick={deleteSelectedView} disabled={selectedViewId === 'none'} variant="ghost" className="h-10 rounded-lg px-3 text-[10px] font-black uppercase tracking-widest text-danger">Delete</Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button onClick={saveCurrentView} variant="outline" className="h-10 rounded-lg px-3 text-[10px] font-black uppercase tracking-widest">Save Current</Button>
                            <Button onClick={() => applyQuickView('public')} variant="ghost" className="h-10 rounded-lg px-3 text-[10px] font-black uppercase tracking-widest">Published</Button>
                            <Button onClick={() => applyQuickView('archived')} variant="ghost" className="h-10 rounded-lg px-3 text-[10px] font-black uppercase tracking-widest">Archived</Button>
                        </div>
                    </div>
                </Card>

                <Card className="mb-4 rounded-xl border-border bg-muted/20 p-4 shadow-none">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                        <Button onClick={toggleSelectAllFiltered} variant="outline" disabled={isProcessing || filteredDocuments.length === 0} className="h-9 rounded-xl px-4 text-xs font-black uppercase tracking-widest">
                            {allFilteredSelected ? 'Зняти вибір' : 'Вибрати всі у фільтрі'}
                        </Button>
                        <Button onClick={clearSelection} variant="ghost" disabled={isProcessing || selectedCount === 0} className="h-9 rounded-xl px-4 text-xs font-black uppercase tracking-widest text-muted-fg">
                            Очистити вибір
                        </Button>
                        <span className="text-[11px] font-black uppercase tracking-wider text-muted-fg">Вибрано: {selectedCount}</span>
                    </div>

                    <div className="grid grid-cols-1 gap-2 xl:grid-cols-2 2xl:grid-cols-3">
                        <div className="rounded-xl border border-border bg-surface p-3">
                            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-muted-fg">Категорія</p>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_90px]">
                                <select value={bulkCategory} onChange={(e) => setBulkCategory(e.target.value)} className="h-10 w-full min-w-0 rounded-lg border border-border bg-surface px-3 text-xs font-bold text-fg">
                                    <option value="none">Оберіть категорію</option>
                                    {categories.map(cat => <option key={cat.id} value={cat.nameKey}>{getCategoryName(cat.nameKey, t)}</option>)}
                                </select>
                                <Button onClick={applyBulkCategory} disabled={isProcessing || selectedCount === 0 || bulkCategory === 'none'} className="h-10 w-full rounded-lg px-3 text-[10px] font-black uppercase tracking-widest">Apply</Button>
                            </div>
                        </div>

                        <div className="rounded-xl border border-border bg-surface p-3">
                            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-muted-fg">Теги</p>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[110px_minmax(0,1fr)_90px]">
                                <select value={bulkTagAction} onChange={(e) => setBulkTagAction(e.target.value as 'add' | 'remove')} className="h-10 min-w-0 rounded-lg border border-border bg-surface px-2 text-xs font-bold text-fg">
                                    <option value="add">Додати</option>
                                    <option value="remove">Прибрати</option>
                                </select>
                                <select value={bulkTagId} onChange={(e) => setBulkTagId(e.target.value)} className="h-10 min-w-0 rounded-lg border border-border bg-surface px-2 text-xs font-bold text-fg">
                                    <option value="none">Оберіть тег</option>
                                    {availableTags.map(tag => <option key={tag.id} value={tag.id}>{tag.name}</option>)}
                                </select>
                                <Button onClick={applyBulkTag} disabled={isProcessing || selectedCount === 0 || bulkTagId === 'none'} className="h-10 w-full rounded-lg px-2 text-[10px] font-black uppercase tracking-widest">Apply</Button>
                            </div>
                        </div>

                        <div className="rounded-xl border border-border bg-surface p-3">
                            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-muted-fg">View Access</p>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[110px_minmax(0,1fr)_90px]">
                                <select value={bulkRoleAction} onChange={(e) => setBulkRoleAction(e.target.value as 'add' | 'remove')} className="h-10 min-w-0 rounded-lg border border-border bg-surface px-2 text-xs font-bold text-fg">
                                    <option value="add">Додати</option>
                                    <option value="remove">Прибрати</option>
                                </select>
                                <select value={bulkRole} onChange={(e) => setBulkRole(e.target.value as UserRole)} className="h-10 min-w-0 rounded-lg border border-border bg-surface px-2 text-xs font-bold text-fg">
                                    {ALL_ROLES.filter(role => role !== 'admin').map(role => <option key={role} value={role}>{t(`roles.${role}`)}</option>)}
                                </select>
                                <Button onClick={applyBulkRole} disabled={isProcessing || selectedCount === 0} className="h-10 w-full rounded-lg px-2 text-[10px] font-black uppercase tracking-widest">Apply</Button>
                            </div>
                        </div>

                        <div className="rounded-xl border border-border bg-surface p-3">
                            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-muted-fg">Download Access</p>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[110px_minmax(0,1fr)_90px]">
                                <select value={bulkDownloadRoleAction} onChange={(e) => setBulkDownloadRoleAction(e.target.value as 'add' | 'remove')} className="h-10 min-w-0 rounded-lg border border-border bg-surface px-2 text-xs font-bold text-fg">
                                    <option value="add">Додати</option>
                                    <option value="remove">Прибрати</option>
                                </select>
                                <select value={bulkDownloadRole} onChange={(e) => setBulkDownloadRole(e.target.value as UserRole)} className="h-10 min-w-0 rounded-lg border border-border bg-surface px-2 text-xs font-bold text-fg">
                                    {ALL_ROLES.filter(role => role !== 'admin').map(role => <option key={role} value={role}>{t(`roles.${role}`)}</option>)}
                                </select>
                                <Button onClick={applyBulkDownloadRole} disabled={isProcessing || selectedCount === 0} className="h-10 w-full rounded-lg px-2 text-[10px] font-black uppercase tracking-widest">Apply</Button>
                            </div>
                        </div>

                        <div className="rounded-xl border border-border bg-surface p-3">
                            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-muted-fg">Статус</p>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_90px]">
                                <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value as DocumentStatus)} className="h-10 min-w-0 rounded-lg border border-border bg-surface px-2 text-xs font-bold text-fg">
                                    <option value="draft">draft</option>
                                    <option value="published">published</option>
                                    <option value="archived">archived</option>
                                </select>
                                <Button onClick={applyBulkStatus} disabled={isProcessing || selectedCount === 0} className="h-10 w-full rounded-lg px-2 text-[10px] font-black uppercase tracking-widest">Apply</Button>
                            </div>
                        </div>
                    </div>
                </Card>

                {filteredDocuments.length === 0 ? (
                    <StatePanel variant="empty" title="Документи не знайдено" description="Змініть фільтр або додайте документ." className="py-14" />
                ) : (
                    <Card className="rounded-xl border-border bg-surface shadow-none">
                        <AdminTable minWidthClassName="min-w-[1200px]">
                            <AdminTableHead>
                                <tr>
                                    <AdminTableHeaderCell><input type="checkbox" checked={allFilteredSelected} onChange={toggleSelectAllFiltered} /></AdminTableHeaderCell>
                                    <AdminTableHeaderCell>Документ</AdminTableHeaderCell>
                                    <AdminTableHeaderCell>Категорія</AdminTableHeaderCell>
                                    <AdminTableHeaderCell>Теги</AdminTableHeaderCell>
                                    <AdminTableHeaderCell>View access</AdminTableHeaderCell>
                                    <AdminTableHeaderCell>Download</AdminTableHeaderCell>
                                    <AdminTableHeaderCell>Status</AdminTableHeaderCell>
                                    <AdminTableHeaderCell>Оновлено</AdminTableHeaderCell>
                                    <AdminTableHeaderCell />
                                </tr>
                            </AdminTableHead>
                            <AdminTableBody>
                                {filteredDocuments.map(doc => (
                                    <AdminTableRow key={doc.id}>
                                        <AdminTableCell>
                                            <input type="checkbox" checked={selectedDocIds.has(doc.id)} onChange={() => toggleDocSelection(doc.id)} />
                                        </AdminTableCell>
                                        <AdminTableCell>
                                            <p className="max-w-[300px] truncate text-sm font-bold text-fg">{doc.titleKey ? t(doc.titleKey) : doc.title || doc.id}</p>
                                            <p className="text-[10px] font-black uppercase tracking-wider text-muted-fg">{doc.internalId || doc.id}</p>
                                        </AdminTableCell>
                                        <AdminTableCell className="text-xs font-bold text-fg">{getCategoryName(doc.categoryKey, t)}</AdminTableCell>
                                        <AdminTableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {(doc.tagIds || []).slice(0, 3).map(tagId => (
                                                    <span key={tagId} className="rounded-md bg-primary/10 px-2 py-1 text-[10px] font-black uppercase text-primary">
                                                        {tagMap.get(tagId)?.name || tagId}
                                                    </span>
                                                ))}
                                                {(doc.tagIds || []).length > 3 && (
                                                    <span className="rounded-md bg-muted px-2 py-1 text-[10px] font-black uppercase text-muted-fg">
                                                        +{(doc.tagIds || []).length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        </AdminTableCell>
                                        <AdminTableCell>
                                            <p className="text-xs font-bold text-fg">{(doc.viewPermissions || []).slice(0, 3).join(', ') || 'public'}</p>
                                        </AdminTableCell>
                                        <AdminTableCell>
                                            <p className="text-xs font-bold text-fg">{(doc.downloadPermissions || []).slice(0, 3).join(', ') || 'inherit'}</p>
                                        </AdminTableCell>
                                        <AdminTableCell>
                                            <span className={`rounded px-2 py-1 text-[10px] font-black uppercase ${
                                                (doc.status || 'published') === 'published'
                                                    ? 'bg-success/15 text-success'
                                                    : (doc.status || 'published') === 'draft'
                                                        ? 'bg-warning/20 text-warning'
                                                        : 'bg-muted text-muted-fg'
                                            }`}>
                                                {doc.status || 'published'}
                                            </span>
                                        </AdminTableCell>
                                        <AdminTableCell className="text-xs font-bold text-muted-fg">{formatUpdated(doc)}</AdminTableCell>
                                        <AdminTableCell>
                                            <div className="flex justify-end gap-1">
                                                <Button onClick={() => onEditDocument(doc)} disabled={isProcessing} variant="ghost" size="icon" className="h-8 w-8 text-muted-fg hover:text-primary"><Icon name="pencil" className="h-4 w-4" /></Button>
                                                <Button onClick={() => onDeleteDocument(doc.id)} disabled={isProcessing} variant="ghost" size="icon" className="h-8 w-8 text-muted-fg hover:text-danger"><Icon name="trash" className="h-4 w-4" /></Button>
                                            </div>
                                        </AdminTableCell>
                                    </AdminTableRow>
                                ))}
                            </AdminTableBody>
                        </AdminTable>
                    </Card>
                )}
            </section>
        </div>
    );
};
