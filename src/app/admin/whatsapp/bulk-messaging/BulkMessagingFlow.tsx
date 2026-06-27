'use client';

import React, { useState } from 'react';
import { FaWhatsapp, FaUsers, FaCalendarAlt, FaCheckCircle, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

// Import schemas
import { BULK_MESSAGING_STEPS, STEP_TITLES, BulkMessagingStep } from './schemas';

// Import step components
import BulkMessageComposer from './components/BulkMessageComposer';
import RecipientSelector from './components/RecipientSelector';
import MessagePreview from './components/MessagePreview';
import SendingProgress from './components/SendingProgress';
import DeliveryReport from './components/DeliveryReport';

// Step definitions with icons
const STEP_CONFIG = [
  { id: BULK_MESSAGING_STEPS.COMPOSE, title: STEP_TITLES[BULK_MESSAGING_STEPS.COMPOSE], icon: FaWhatsapp },
  { id: BULK_MESSAGING_STEPS.RECIPIENTS, title: STEP_TITLES[BULK_MESSAGING_STEPS.RECIPIENTS], icon: FaUsers },
  { id: BULK_MESSAGING_STEPS.SCHEDULE, title: STEP_TITLES[BULK_MESSAGING_STEPS.SCHEDULE], icon: FaCalendarAlt },
  { id: BULK_MESSAGING_STEPS.REVIEW, title: STEP_TITLES[BULK_MESSAGING_STEPS.REVIEW], icon: FaCheckCircle },
];

export default function BulkMessagingFlow() {
  const [currentStep, setCurrentStep] = useState<BulkMessagingStep>(BULK_MESSAGING_STEPS.COMPOSE);
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNextStep = () => {
    const stepOrder = [
      BULK_MESSAGING_STEPS.COMPOSE,
      BULK_MESSAGING_STEPS.RECIPIENTS,
      BULK_MESSAGING_STEPS.SCHEDULE,
      BULK_MESSAGING_STEPS.REVIEW,
    ];

    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const handlePreviousStep = () => {
    const stepOrder = [
      BULK_MESSAGING_STEPS.COMPOSE,
      BULK_MESSAGING_STEPS.RECIPIENTS,
      BULK_MESSAGING_STEPS.SCHEDULE,
      BULK_MESSAGING_STEPS.REVIEW,
    ];

    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const handleStepData = (stepData: any) => {
    setFormData(prev => ({ ...prev, ...stepData }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case BULK_MESSAGING_STEPS.COMPOSE:
        return (
          <BulkMessageComposer
            onNext={handleNextStep}
            onDataChange={handleStepData}
            initialData={formData}
          />
        );
      case BULK_MESSAGING_STEPS.RECIPIENTS:
        return (
          <RecipientSelector
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
            onDataChange={handleStepData}
            initialData={formData}
          />
        );
      case BULK_MESSAGING_STEPS.SCHEDULE:
        return (
          <div className="text-center py-12">
            <FaCalendarAlt className="mx-auto h-12 w-12 text-blue-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Schedule Messages (Optional)
            </h3>
            <p className="text-gray-600 mb-6">
              You can schedule messages to be sent at a specific time, or send them immediately.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handlePreviousStep}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={handleNextStep}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                Continue
              </button>
            </div>
          </div>
        );
      case BULK_MESSAGING_STEPS.REVIEW:
        return (
          <MessagePreview
            messageData={formData}
            onSend={() => {
              setIsSubmitting(true);
              // Simulate sending
              setTimeout(() => {
                setIsSubmitting(false);
                toast.success('Messages sent successfully!');
              }, 2000);
            }}
            onEdit={() => setCurrentStep(BULK_MESSAGING_STEPS.COMPOSE)}
            isLoading={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  const currentStepIndex = STEP_CONFIG.findIndex(step => step.id === currentStep);

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">WhatsApp Bulk Messaging</h2>
        <p className="text-sm text-gray-600 mt-1">
          Send WhatsApp messages to multiple recipients
        </p>
      </div>

      {/* Step Navigation */}
      <div className="px-6 py-4 border-b border-gray-200">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-between">
            {STEP_CONFIG.map((step, stepIdx) => {
              const isCurrent = currentStep === step.id;
              const isCompleted = stepIdx < currentStepIndex;
              const IconComponent = step.icon;

              return (
                <li key={step.id} className={`relative ${stepIdx !== STEP_CONFIG.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
                  <div className="flex items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${isCompleted
                          ? 'border-green-500 bg-green-500'
                          : isCurrent
                            ? 'border-blue-500 bg-white'
                            : 'border-gray-300 bg-white'
                        }`}
                    >
                      {isCompleted ? (
                        <FaCheckCircle className="h-5 w-5 text-white" />
                      ) : (
                        <IconComponent className={`h-5 w-5 ${isCurrent ? 'text-blue-500' : 'text-gray-400'
                          }`} />
                      )}
                    </div>

                    <div className="ml-4 min-w-0">
                      <p className={`text-sm font-medium ${isCurrent
                          ? 'text-blue-600'
                          : isCompleted
                            ? 'text-green-600'
                            : 'text-gray-500'
                        }`}>
                        {step.title}
                      </p>
                    </div>
                  </div>

                  {/* Connector Line */}
                  {stepIdx !== STEP_CONFIG.length - 1 && (
                    <div className="absolute top-5 left-10 -ml-px mt-0.5 h-full w-0.5 bg-gray-300" aria-hidden="true" />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      {/* Step Content */}
      <div className="p-6">
        {renderStepContent()}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Step {currentStepIndex + 1} of {STEP_CONFIG.length}: {STEP_CONFIG[currentStepIndex]?.title}
          </div>
          <div className="flex gap-3">
            {currentStep !== BULK_MESSAGING_STEPS.COMPOSE && (
              <button
                type="button"
                onClick={handlePreviousStep}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}