'use client';

import React, { useCallback, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { OfficialDocumentCategoryDTO } from '@/types';
import type { OfficialDocumentCategoriesPageResult } from '../official-documents/ApiServerActions';
import {
  createOfficialDocumentCategoryServer,
  deleteOfficialDocumentCategoryServer,
  fetchOfficialDocumentCategoriesPagedServer,
  patchOfficialDocumentCategoryServer,
} from '../official-documents/ApiServerActions';
import Modal from '@/components/ui/Modal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type Props =
  | {
      mode: 'api';
      initialData: OfficialDocumentCategoriesPageResult;
      listPageSize: number;
      tenantLabel: string;
    }
  | {
      mode: 'fallback';
      categories: OfficialDocumentCategoryDTO[];
      message?: string;
      source: 'api' | 'fallback';
      /** Shown when paginated API failed (e.g. 500) in addition to `message`. */
      apiError?: string;
      tenantLabel: string;
    };

const emptyForm = () => ({
  slug: '',
  displayName: '',
  description: '',
  sortOrder: 0,
  isActive: true,
});

export default function OfficialDocumentCategoriesClient(props: Props) {
  const router = useRouter();
  const [listLoading, setListLoading] = useState(false);
  const [opError, setOpError] = useState<string | null>(null);

  const [content, setContent] = useState<OfficialDocumentCategoryDTO[]>(
    props.mode === 'api' ? props.initialData.content : props.categories
  );
  const [totalElements, setTotalElements] = useState(
    props.mode === 'api' ? props.initialData.totalElements : props.categories.length
  );
  const [totalPages, setTotalPages] = useState(
    props.mode === 'api' ? props.initialData.totalPages : 1
  );
  const [currentPage, setCurrentPage] = useState(props.mode === 'api' ? props.initialData.page : 0);
  const pageSize = props.mode === 'api' ? props.listPageSize : 20;

  const reloadList = useCallback(async () => {
    if (props.mode !== 'api') return;
    setListLoading(true);
    setOpError(null);
    try {
      const res = await fetchOfficialDocumentCategoriesPagedServer({
        page: currentPage,
        size: pageSize,
        activeOnly: false,
      });
      if (!res.ok) {
        setOpError(res.reason === 'not_found' ? 'Categories API is not available.' : res.message || 'Failed to load.');
        return;
      }
      setContent(res.data.content);
      setTotalElements(res.data.totalElements);
      setTotalPages(res.data.totalPages);
      setCurrentPage(res.data.page);
    } finally {
      setListLoading(false);
    }
  }, [props.mode, currentPage, pageSize]);

  const goToPage = async (page: number) => {
    if (props.mode !== 'api') return;
    setListLoading(true);
    setOpError(null);
    try {
      const res = await fetchOfficialDocumentCategoriesPagedServer({
        page,
        size: pageSize,
        activeOnly: false,
      });
      if (!res.ok) {
        setOpError(res.reason === 'not_found' ? 'Categories API is not available.' : res.message || 'Failed to load.');
        return;
      }
      setContent(res.data.content);
      setTotalElements(res.data.totalElements);
      setTotalPages(res.data.totalPages);
      setCurrentPage(res.data.page);
    } finally {
      setListLoading(false);
    }
  };

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<OfficialDocumentCategoryDTO | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saveBusy, setSaveBusy] = useState(false);

  const [deleting, setDeleting] = useState<OfficialDocumentCategoryDTO | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const openAdd = () => {
    setOpError(null);
    setForm(emptyForm());
    setAddOpen(true);
  };

  const openEdit = (c: OfficialDocumentCategoryDTO) => {
    if (c.id == null) {
      setOpError('This row has no id — it cannot be edited (fallback data).');
      return;
    }
    setOpError(null);
    setEditing(c);
    setForm({
      slug: c.slug,
      displayName: c.displayName,
      description: c.description ?? '',
      sortOrder: c.sortOrder ?? 0,
      isActive: c.isActive !== false,
    });
    setEditOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.slug.trim() || !form.displayName.trim()) {
      setOpError('Slug and display name are required.');
      return;
    }
    setSaveBusy(true);
    setOpError(null);
    try {
      const res = await createOfficialDocumentCategoryServer({
        slug: form.slug,
        displayName: form.displayName,
        description: form.description,
        sortOrder: Number(form.sortOrder) || 0,
        isActive: form.isActive,
      });
      if (!res.ok) {
        setOpError(res.message);
        return;
      }
      setAddOpen(false);
      setForm(emptyForm());
      await goToPage(0);
    } finally {
      setSaveBusy(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing?.id) return;
    if (!form.slug.trim() || !form.displayName.trim()) {
      setOpError('Slug and display name are required.');
      return;
    }
    setSaveBusy(true);
    setOpError(null);
    try {
      const res = await patchOfficialDocumentCategoryServer(editing.id, {
        slug: form.slug,
        displayName: form.displayName,
        description: form.description,
        sortOrder: Number(form.sortOrder) || 0,
        isActive: form.isActive,
      });
      if (!res.ok) {
        setOpError(res.message);
        return;
      }
      setEditOpen(false);
      setEditing(null);
      await reloadList();
      router.refresh();
    } finally {
      setSaveBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting?.id) return;
    const prevLen = content.length;
    const prevPage = currentPage;
    setDeleteBusy(true);
    setOpError(null);
    try {
      const res = await deleteOfficialDocumentCategoryServer(deleting.id);
      if (!res.ok) {
        setOpError(res.message);
        return;
      }
      setDeleting(null);
      const onlyRowOnPage = prevLen === 1;
      const targetPage = onlyRowOnPage && prevPage > 0 ? prevPage - 1 : prevPage;
      await goToPage(targetPage);
      router.refresh();
    } finally {
      setDeleteBusy(false);
    }
  };

  const displayPage = currentPage + 1;
  const tp = Math.max(totalPages, 1);
  const isPrevDisabled = currentPage <= 0 || listLoading;
  const isNextDisabled = currentPage >= tp - 1 || listLoading;
  const startItem = totalElements > 0 ? currentPage * pageSize + 1 : 0;
  const endItem =
    totalElements > 0 ? Math.min(currentPage * pageSize + content.length, totalElements) : 0;

  const isApi = props.mode === 'api';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="mb-8 flex flex-wrap items-center gap-4 text-sm">
        <Link href="/admin" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Admin Dashboard
        </Link>
        <span className="text-gray-300">|</span>
        <Link href="/admin/official-documents" className="text-blue-600 hover:text-blue-800 font-medium">
          Official documents (upload)
        </Link>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Official document categories</h1>
          <p className="text-gray-600 text-sm">
            Manage category slugs used for bulk upload and year bundles. Tenant-scoped via the API.
          </p>
        </div>
        {isApi && (
          <button
            type="button"
            onClick={openAdd}
            disabled={listLoading}
            className="flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6 disabled:opacity-50"
            title="Add category"
            aria-label="Add category"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="font-semibold text-blue-700">Add category</span>
          </button>
        )}
      </div>

      {props.mode === 'fallback' && props.message && (
        <div
          className={`mb-6 rounded-lg border p-4 text-sm ${
            props.source === 'fallback'
              ? 'border-amber-300 bg-amber-50 text-amber-950'
              : 'border-blue-200 bg-blue-50 text-blue-900'
          }`}
          role="status"
        >
          {props.source === 'fallback' && <strong className="block mb-1">Fallback list</strong>}
          {props.message}
        </div>
      )}
      {props.mode === 'fallback' && props.apiError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900" role="alert">
          {props.apiError}
        </div>
      )}

      <p className="text-gray-600 text-sm mb-4">
        Rows in <code className="text-sm bg-gray-100 px-1 rounded">official_document_category</code> for tenant{' '}
        <code className="text-sm bg-gray-100 px-1 rounded">{props.tenantLabel}</code>. Slugs must match bulk upload.
      </p>

      {opError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
          {opError}
        </div>
      )}

      <p className="text-sm text-gray-500 mb-6">
        {isApi
          ? 'Create, edit, or delete categories. Slugs should stay stable once documents reference them.'
          : 'CRUD is disabled until GET /api/official-document-categories returns data from your backend.'}
      </p>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium text-gray-700">
            {totalElements} categor{totalElements === 1 ? 'y' : 'ies'}
            {props.mode === 'fallback' && (
              <span className="ml-2 text-xs text-amber-800">({props.source === 'fallback' ? 'fallback' : 'read-only'})</span>
            )}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {isApi && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                    Actions
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sort</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Display name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {content.length === 0 ? (
                <tr>
                  <td
                    colSpan={isApi ? 6 : 5}
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    No categories{isApi ? ' on this page.' : '.'}
                  </td>
                </tr>
              ) : (
                content.map((c) => (
                  <tr key={c.id ?? c.slug}>
                    {isApi && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(c)}
                            disabled={listLoading || c.id == null}
                            className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-40 disabled:hover:scale-100"
                            title="Edit"
                            aria-label="Edit category"
                          >
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOpError(null);
                              setDeleting(c);
                            }}
                            disabled={listLoading || c.id == null}
                            className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-40 disabled:hover:scale-100"
                            title="Delete"
                            aria-label="Delete category"
                          >
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    )}
                    <td className="px-4 py-3 text-sm text-gray-700">{c.sortOrder ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{c.isActive === false ? 'No' : 'Yes'}</td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-900">{c.slug}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{c.displayName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xl">{c.description ?? '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {isApi && (
          <div className="mt-8 px-4 pb-6">
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={isPrevDisabled}
                className="px-5 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg shadow-sm border-2 border-blue-400 hover:border-blue-500 disabled:bg-blue-100 disabled:border-blue-300 disabled:text-blue-500 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-md"
                title="Previous Page"
                aria-label="Previous Page"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Previous</span>
              </button>
              <div className="px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
                <span className="text-sm font-bold text-blue-700">
                  Page <span className="text-blue-600">{displayPage}</span> of{' '}
                  <span className="text-blue-600">{tp}</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                disabled={isNextDisabled}
                className="px-5 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg shadow-sm border-2 border-blue-400 hover:border-blue-500 disabled:bg-blue-100 disabled:border-blue-300 disabled:text-blue-500 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-md"
                title="Next Page"
                aria-label="Next Page"
              >
                <span>Next</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="text-center mt-3">
              {totalElements > 0 ? (
                <div className="inline-flex items-center px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
                  <span className="text-sm text-gray-700">
                    Showing <span className="font-bold text-blue-600">{startItem}</span> to{' '}
                    <span className="font-bold text-blue-600">{endItem}</span> of{' '}
                    <span className="font-bold text-blue-600">{totalElements}</span> categories
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border-2 border-orange-300 rounded-lg shadow-sm">
                  <span className="text-sm font-medium text-orange-700">No categories</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Modal open={addOpen} onClose={() => !saveBusy && setAddOpen(false)} title="Add category">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Slug *</label>
            <input
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="e.g. parish-council"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Display name *</label>
            <input
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
              value={form.displayName}
              onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Sort order</label>
            <input
              type="number"
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
              value={form.sortOrder}
              onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
            />
            Active
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="px-4 py-2 rounded-lg border border-gray-300"
              onClick={() => setAddOpen(false)}
              disabled={saveBusy}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              disabled={saveBusy}
            >
              {saveBusy ? 'Saving…' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={editOpen} onClose={() => !saveBusy && setEditOpen(false)} title="Edit category">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Slug *</label>
            <input
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Display name *</label>
            <input
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
              value={form.displayName}
              onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Sort order</label>
            <input
              type="number"
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
              value={form.sortOrder}
              onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
            />
            Active
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="px-4 py-2 rounded-lg border border-gray-300"
              onClick={() => setEditOpen(false)}
              disabled={saveBusy}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              disabled={saveBusy}
            >
              {saveBusy ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && !deleteBusy && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting
                ? `This will remove “${deleting.displayName}” (${deleting.slug}). Documents referencing this category may be affected.`
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row gap-3 sm:gap-4">
            <AlertDialogCancel
              className="flex-1 flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105"
              disabled={deleteBusy}
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <span className="font-semibold text-blue-700">Cancel</span>
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void confirmDelete();
              }}
              className="flex-1 flex-shrink-0 h-14 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 disabled:opacity-50"
              disabled={deleteBusy}
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-200 flex items-center justify-center">
                {deleteBusy ? (
                  <svg className="animate-spin w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                )}
              </div>
              <span className="font-semibold text-red-700">{deleteBusy ? 'Deleting…' : 'Delete'}</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
