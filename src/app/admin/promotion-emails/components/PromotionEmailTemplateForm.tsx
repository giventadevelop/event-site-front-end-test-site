'use client';

import React, { useState, useEffect } from 'react';
import type {
  PromotionEmailTemplateDTO,
  PromotionEmailTemplateFormDTO,
  EventDetailsDTO,
  DiscountCodeDTO,
} from '@/types';
import { FaSave, FaBan } from 'react-icons/fa';
import ImageUpload from './ImageUpload';
import {
  createPromotionEmailTemplateServer,
  updatePromotionEmailTemplateServer,
} from '../ApiServerActions';
import { fetchEventsFilteredServer } from '@/app/admin/ApiServerActions';
import { fetchDiscountCodesForEvent } from '@/app/admin/events/[id]/discount-codes/list/ApiServerActions';

interface PromotionEmailTemplateFormProps {
  template?: PromotionEmailTemplateDTO | null;
  onSave: () => void;
  onCancel: () => void;
  events: EventDetailsDTO[];
}

export default function PromotionEmailTemplateForm({
  template,
  onSave,
  onCancel,
  events: initialEvents,
}: PromotionEmailTemplateFormProps) {
  const [formData, setFormData] = useState<PromotionEmailTemplateFormDTO>({
    eventId: 0,
    templateName: '',
    subject: '',
    bodyHtml: '',
    headerImageUrl: '',
    footerImageUrl: '',
    discountCodeId: undefined,
    isActive: true,
  });

  const [events, setEvents] = useState<EventDetailsDTO[]>(initialEvents);
  const [discountCodes, setDiscountCodes] = useState<DiscountCodeDTO[]>([]);
  const [loadingDiscountCodes, setLoadingDiscountCodes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load events if not provided
    if (initialEvents.length === 0) {
      loadEvents();
    }
  }, []);

  useEffect(() => {
    // Populate form when template changes
    if (template) {
      setFormData({
        eventId: template.eventId,
        templateName: template.templateName,
        subject: template.subject,
        bodyHtml: template.bodyHtml,
        headerImageUrl: template.headerImageUrl || '',
        footerImageUrl: template.footerImageUrl || '',
        discountCodeId: template.discountCodeId,
        isActive: template.isActive !== undefined ? template.isActive : true,
      });
      // Load discount codes for the template's event
      if (template.eventId) {
        loadDiscountCodes(template.eventId.toString());
      }
    }
  }, [template]);

  useEffect(() => {
    // Load discount codes when event changes
    if (formData.eventId) {
      loadDiscountCodes(formData.eventId.toString());
    } else {
      setDiscountCodes([]);
    }
  }, [formData.eventId]);

  const loadEvents = async () => {
    try {
      const result = await fetchEventsFilteredServer({
        pageNum: 0,
        pageSize: 100,
        sort: 'startDate,desc',
      });
      setEvents(result.events);
    } catch (err: any) {
      console.error('Failed to load events:', err);
    }
  };

  const loadDiscountCodes = async (eventId: string) => {
    setLoadingDiscountCodes(true);
    try {
      const codes = await fetchDiscountCodesForEvent(eventId);
      setDiscountCodes(codes);
    } catch (err: any) {
      console.error('Failed to load discount codes:', err);
      setDiscountCodes([]);
    } finally {
      setLoadingDiscountCodes(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    let processedValue: any = value;

    if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    } else if (name === 'eventId' || name === 'discountCodeId') {
      processedValue = value ? Number(value) : undefined;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    // Clear discount code when event changes
    if (name === 'eventId') {
      setFormData((prev) => ({
        ...prev,
        discountCodeId: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      if (template?.id) {
        await updatePromotionEmailTemplateServer(template.id, formData);
      } else {
        await createPromotionEmailTemplateServer(formData);
      }
      onSave();
    } catch (err: any) {
      setError(err.message || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        {template ? 'Edit Template' : 'Create New Template'}
      </h2>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Event Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Event <span className="text-red-500">*</span>
          </label>
          <select
            name="eventId"
            value={formData.eventId || ''}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-2 text-base"
          >
            <option value="">Select an event...</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title} ({event.startDate})
              </option>
            ))}
          </select>
        </div>

        {/* Template Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Template Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="templateName"
            value={formData.templateName}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-2 text-base"
            placeholder="e.g., Summer Sale 2024"
          />
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Subject <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-2 text-base"
            placeholder="e.g., Special Offer Just for You!"
          />
        </div>

        {/* Discount Code Selection */}
        {formData.eventId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Code (Optional)
            </label>
            {loadingDiscountCodes ? (
              <div className="text-sm text-gray-500">Loading discount codes...</div>
            ) : (
              <select
                name="discountCodeId"
                value={formData.discountCodeId || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-2 text-base"
              >
                <option value="">None</option>
                {discountCodes.map((code) => (
                  <option key={code.id} value={code.id}>
                    {code.code} ({code.discountType} - {code.discountValue}
                    {code.discountType === 'PERCENTAGE' ? '%' : '$'})
                  </option>
                ))}
              </select>
            )}
            {discountCodes.length === 0 && !loadingDiscountCodes && (
              <p className="mt-1 text-sm text-gray-500">
                No discount codes available for this event. Create one in the event's discount codes section.
              </p>
            )}
          </div>
        )}

        {/* Header Image */}
        <div>
          <ImageUpload
            label="Header Image (Optional)"
            value={formData.headerImageUrl}
            onChange={(url) => setFormData((prev) => ({ ...prev, headerImageUrl: url }))}
          />
        </div>

        {/* Footer Image */}
        <div>
          <ImageUpload
            label="Footer Image (Optional)"
            value={formData.footerImageUrl}
            onChange={(url) => setFormData((prev) => ({ ...prev, footerImageUrl: url }))}
          />
        </div>

        {/* Body HTML */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Body HTML <span className="text-red-500">*</span>
          </label>
          <textarea
            name="bodyHtml"
            value={formData.bodyHtml}
            onChange={handleChange}
            required
            rows={15}
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-2 text-base font-mono text-sm"
            placeholder="Enter HTML content for the email body..."
          />
          <p className="mt-1 text-xs text-gray-500">
            Paste only the inner HTML (no &lt;body&gt; tags). Use HTML to format your email content.
          </p>
        </div>

        {/* Active Status */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            id="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
            Template is active
          </label>
        </div>

        {/* Form Actions */}
        <div className="flex flex-row gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            title={saving ? 'Saving...' : template ? 'Update Template' : 'Create Template'}
            aria-label={saving ? 'Saving...' : template ? 'Update Template' : 'Create Template'}
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
              <FaSave className="w-6 h-6 text-blue-600" />
            </div>
            <span className="font-semibold text-blue-700">{saving ? 'Saving...' : template ? 'Update Template' : 'Create Template'}</span>
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 flex-shrink-0 h-14 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105"
            title="Cancel"
            aria-label="Cancel"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-200 flex items-center justify-center">
              <FaBan className="w-6 h-6 text-red-600" />
            </div>
            <span className="font-semibold text-red-700">Cancel</span>
          </button>
        </div>
      </form>
    </div>
  );
}







