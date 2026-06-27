'use client';

import { useState } from 'react';
import { FaUsers, FaUpload, FaSearch, FaPlus, FaTrash, FaCheck } from 'react-icons/fa';

interface RecipientSelectorProps {
  onRecipientsSelected: (recipients: any[]) => void;
  initialData?: any[];
}

export default function RecipientSelector({ onRecipientsSelected, initialData = [] }: RecipientSelectorProps) {
  const [recipients, setRecipients] = useState<any[]>(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRecipient, setNewRecipient] = useState({
    phone: '',
    name: '',
    email: ''
  });

  const handleAddRecipient = () => {
    if (newRecipient.phone.trim()) {
      const recipient = {
        id: Date.now(),
        phone: newRecipient.phone.trim(),
        name: newRecipient.name.trim() || '',
        email: newRecipient.email.trim() || '',
        status: 'pending'
      };

      setRecipients(prev => [...prev, recipient]);
      setNewRecipient({ phone: '', name: '', email: '' });
      setShowAddForm(false);
    }
  };

  const handleRemoveRecipient = (id: number) => {
    setRecipients(prev => prev.filter(r => r.id !== id));
  };

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csv = e.target?.result as string;
        const lines = csv.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

        const phoneIndex = headers.findIndex(h => h.includes('phone'));
        const nameIndex = headers.findIndex(h => h.includes('name'));
        const emailIndex = headers.findIndex(h => h.includes('email'));

        if (phoneIndex !== -1) {
          const newRecipients = lines.slice(1).map((line, index) => {
            const values = line.split(',').map(v => v.trim());
            return {
              id: Date.now() + index,
              phone: values[phoneIndex] || '',
              name: values[nameIndex] || '',
              email: values[emailIndex] || '',
              status: 'pending'
            };
          }).filter(r => r.phone.trim());

          setRecipients(prev => [...prev, ...newRecipients]);
        }
      };
      reader.readAsText(file);
    }
  };

  const filteredRecipients = recipients.filter(recipient =>
    recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipient.phone.includes(searchTerm) ||
    recipient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleContinue = () => {
    if (recipients.length > 0) {
      onRecipientsSelected(recipients);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Select Recipients</h3>
        <p className="text-sm text-gray-600">
          Choose who will receive your WhatsApp message
        </p>
      </div>

      {/* Add Recipients Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-gray-900">Add Recipients</h4>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 flex items-center gap-1"
            >
              <FaPlus className="h-3 w-3" />
              Add Individual
            </button>
            <label className="px-3 py-1 text-sm font-medium text-green-600 bg-green-100 rounded-md hover:bg-green-200 cursor-pointer flex items-center gap-1">
              <FaUpload className="h-3 w-3" />
              Upload CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Add Individual Form */}
        {showAddForm && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={newRecipient.phone}
                  onChange={(e) => setNewRecipient(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1234567890"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  value={newRecipient.name}
                  onChange={(e) => setNewRecipient(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="John Doe"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={newRecipient.email}
                  onChange={(e) => setNewRecipient(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="john@example.com"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRecipient}
                disabled={!newRecipient.phone.trim()}
                className="px-3 py-1 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add Recipient
              </button>
            </div>
          </div>
        )}

        {/* CSV Upload Instructions */}
        <div className="mt-3 text-xs text-gray-600">
          <p>CSV format: phone,name,email (phone is required)</p>
          <p>Example: +1234567890,John Doe,john@example.com</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search recipients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <div className="text-sm text-gray-600">
          {filteredRecipients.length} of {recipients.length} recipients
        </div>
      </div>

      {/* Recipients List */}
      <div className="bg-white border border-gray-200 rounded-lg">
        {filteredRecipients.length === 0 ? (
          <div className="text-center py-8">
            <FaUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {recipients.length === 0 ? 'No recipients added' : 'No recipients match your search'}
            </h3>
            <p className="text-gray-600 mb-6">
              {recipients.length === 0
                ? 'Add recipients manually or upload a CSV file to get started.'
                : 'Try adjusting your search terms.'
              }
            </p>
            {recipients.length === 0 && (
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md font-medium"
              >
                Add Your First Recipient
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {filteredRecipients.map((recipient) => (
              <div key={recipient.id} className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 h-8 w-8">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <FaUsers className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {recipient.name || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {recipient.phone}
                      {recipient.email && ` • ${recipient.email}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveRecipient(recipient.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <FaTrash className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {recipients.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <FaCheck className="text-blue-500 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-blue-800">Ready to Send</h4>
              <p className="text-sm text-blue-700 mt-1">
                Your message will be sent to {recipients.length} recipients.
                {recipients.length > 100 && (
                  <span className="block mt-1 text-yellow-700">
                    Large campaigns may take time to process.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => setRecipients([])}
          disabled={recipients.length === 0}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          Clear All
        </button>
        <button
          onClick={handleContinue}
          disabled={recipients.length === 0}
          className={`px-6 py-2 text-sm font-medium rounded-md ${recipients.length > 0
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
        >
          Continue to Preview
        </button>
      </div>
    </div>
  );
}
















