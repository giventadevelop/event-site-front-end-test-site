'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatInTimeZone } from 'date-fns-tz';

interface BillingEvent {
  id: string;
  date: string;
  amount: number;
  currency: string;
  description: string;
  status: 'paid' | 'pending' | 'failed';
  invoiceUrl?: string;
}

interface BillingHistoryProps {
  events: BillingEvent[];
}

export function BillingHistory({ events }: BillingHistoryProps) {
  const formatDate = (dateString: string) => {
    try {
      return formatInTimeZone(
        new Date(dateString),
        Intl.DateTimeFormat().resolvedOptions().timeZone,
        'MMMM d, yyyy'
      );
    } catch {
      return dateString;
    }
  };

  const formatPrice = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl text-foreground">Billing History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-body text-muted-foreground">No billing history available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl text-foreground">Billing History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-heading font-semibold text-foreground">Date</th>
                <th className="text-left py-3 px-4 font-heading font-semibold text-foreground">Description</th>
                <th className="text-right py-3 px-4 font-heading font-semibold text-foreground">Amount</th>
                <th className="text-left py-3 px-4 font-heading font-semibold text-foreground">Status</th>
                <th className="text-left py-3 px-4 font-heading font-semibold text-foreground">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-b">
                  <td className="py-3 px-4 font-body text-sm text-foreground">{formatDate(event.date)}</td>
                  <td className="py-3 px-4 font-body text-sm text-foreground">{event.description}</td>
                  <td className="py-3 px-4 font-body text-sm text-right text-foreground">
                    {formatPrice(event.amount, event.currency)}
                  </td>
                  <td className="py-3 px-4 font-body text-sm">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        event.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : event.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-body text-sm">
                    {event.invoiceUrl ? (
                      <a
                        href={event.invoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Download
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}



