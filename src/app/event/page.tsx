'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

interface TicketType {
  id: number;
  name: string;
  price: number;
  description: string;
  available: number;
}

const EventPage = () => {
  const router = useRouter();
  const { userId } = useAuth();
  const [selectedTickets, setSelectedTickets] = useState<{ [key: number]: number }>({});
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [emailError, setEmailError] = useState(false);

  const ticketTypes: TicketType[] = [
    {
      id: 1,
      name: 'Regular Ticket',
      price: 40,
      description: 'Early Bird tickets',
      available: 100
    },
    {
      id: 2,
      name: 'Regular Kids',
      price: 25,
      description: 'Early Bird Ticket for kids between 5-15 years. Kids Under 5 – FREE Admission!',
      available: 50
    },
    {
      id: 3,
      name: 'Preferred Tickets',
      price: 60,
      description: 'Early Bird tickets',
      available: 50
    },
    {
      id: 4,
      name: 'Preferred Kids',
      price: 45,
      description: 'Early Bird tickets for kids between 5-15 years',
      available: 30
    },
    {
      id: 5,
      name: 'VIP',
      price: 125,
      description: 'VIP access with exclusive perks',
      available: 20
    },
    {
      id: 6,
      name: 'VVIP',
      price: 250,
      description: 'Very VIP access with premium exclusive perks',
      available: 10
    },
    {
      id: 7,
      name: 'Test Ticket',
      price: 0.60,
      description: 'Test ticket for production validation',
      available: 5
    },
    {
      id: 8,
      name: 'Test Ticket 2',
      price: 0.70,
      description: 'Test ticket for production validation',
      available: 5
    }
  ];

  const handleTicketChange = (ticketId: number, quantity: number) => {
    if (quantity >= 0) {
      setSelectedTickets(prev => ({
        ...prev,
        [ticketId]: quantity
      }));
    }
  };

  const calculateTotal = () => {
    return Object.entries(selectedTickets).reduce((total, [ticketId, quantity]) => {
      const ticket = ticketTypes.find(t => t.id === parseInt(ticketId));
      return total + (ticket?.price || 0) * quantity;
    }, 0);
  };

  const handlePurchase = async () => {
    if (!email.trim()) {
      setEmailError(true);
      return;
    }

    const ticketsToCheckout = Object.entries(selectedTickets)
      .filter(([_, quantity]) => quantity > 0)
      .map(([ticketId, quantity]) => {
        const ticket = ticketTypes.find(t => t.id === parseInt(ticketId));
        return {
          type: ticket?.name || '',
          quantity: quantity,
          price: ticket?.price || 0
        };
      });

    if (ticketsToCheckout.length === 0) {
      alert("Please select at least one ticket");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch("/api/stripe/event-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tickets: ticketsToCheckout,
          eventId: "kanj-cine-star-2025",
          email: email.trim(),
          userId: userId || null,
        }),
      });

      const data = await response.json();

      // If we have a URL, redirect to Stripe checkout
      if (data?.url) {
        window.location.href = data.url;
        return;
      }

      // If no URL, show generic error
      alert("Failed to create checkout session. Please try again.");
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to create checkout session. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="relative h-[400px]">
            <Image
              src="/kanj_cine_star_nite_2025.webp"
              alt="Kanj Cine Star Nite 2025"
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>

          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Kanj Cine Star 2025</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ticketTypes.map((ticket) => (
                <div key={ticket.id} className="border rounded-lg p-6 bg-gray-50">
                  <h3 className="text-xl font-semibold text-gray-900">{ticket.name}</h3>
                  <p className="text-gray-600 mt-2">{ticket.description}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-4">${ticket.price.toFixed(2)}</p>
                  <div className="mt-4 flex items-center">
                    <button
                      onClick={() => handleTicketChange(ticket.id, (selectedTickets[ticket.id] || 0) - 1)}
                      className="bg-gray-200 text-gray-600 px-3 py-1 rounded-l hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="px-4 py-1 bg-white border-t border-b">
                      {selectedTickets[ticket.id] || 0}
                    </span>
                    <button
                      onClick={() => handleTicketChange(ticket.id, (selectedTickets[ticket.id] || 0) + 1)}
                      className="bg-gray-200 text-gray-600 px-3 py-1 rounded-r hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 border-t pt-8">
              <div className="max-w-md mx-auto">
                <div className="mb-6">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    Email Address
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError(false);
                    }}
                    className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${emailError ? 'border-red-500' : ''
                      }`}
                    placeholder="Enter your email"
                    required
                  />
                  {emailError && (
                    <p className="mt-1 text-sm text-red-500">
                      Please enter your email address
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold">
                    Total: ${calculateTotal().toFixed(2)}
                  </div>
                  <button
                    onClick={handlePurchase}
                    disabled={isProcessing}
                    className={`px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                  >
                    {isProcessing ? 'Processing...' : 'Purchase Tickets'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventPage;
