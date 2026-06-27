'use client';

import { Modal } from '../Modal';

interface SuccessDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText?: string;
}

export function SuccessDialog({
  open,
  onClose,
  title,
  message,
  buttonText = 'OK',
}: SuccessDialogProps) {
  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title={undefined}>
      <div className="relative overflow-hidden rounded-xl border-2 border-green-300 bg-gradient-to-br from-green-50 via-white to-green-50">
        <div className="h-1.5 bg-gradient-to-r from-green-400 via-green-500 to-emerald-500" />

        <div className="px-2 py-4 text-center sm:px-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 ring-4 ring-green-200/60">
            <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h3 className="font-heading mb-2 text-xl font-semibold text-green-800">{title}</h3>

          <div className="mb-5 rounded-xl border-2 border-green-200 bg-green-100/80 px-4 py-3">
            <p className="font-body text-green-800">{message}</p>
          </div>

          <button
            onClick={onClose}
            className="flex h-14 w-full flex-shrink-0 items-center justify-center gap-3 rounded-xl bg-green-100 px-6 transition-all duration-300 hover:scale-105 hover:bg-green-200"
            title={buttonText}
            aria-label={buttonText}
            type="button"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-green-200">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="font-semibold text-green-700">{buttonText}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
