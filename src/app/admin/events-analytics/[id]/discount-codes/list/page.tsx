import { safeAuth } from '@/lib/safe-auth';
import { fetchEventDetailsServer } from "@/app/admin/ApiServerActions";
import DiscountCodeListClient from "./DiscountCodeListClient";
import { fetchDiscountCodesForEvent } from "./ApiServerActions";

export default async function DiscountCodeListPage(props: { params: Promise<{ id: string }> | { id: string } }) {
  const { params } = props;

  // Fix for Next.js 15+: await auth() before using
  const { userId } = await safeAuth();

  if (!userId) {
    return <div>You must be logged in to view this page.</div>;
  }

  // Handle params for Next.js 15+ compatibility
  let eventId: string;
  if (typeof params.then === 'function') {
    const resolvedParams = await params;
    eventId = resolvedParams.id;
  } else {
    eventId = params.id;
  }

  // fetchEventDetailsServer expects a number, fetchDiscountCodesForEvent expects a string
  const eventDetails = await fetchEventDetailsServer(Number(eventId));
  const discountCodes = await fetchDiscountCodesForEvent(eventId);

  return (
    <DiscountCodeListClient
      eventId={eventId}
      initialDiscountCodes={discountCodes}
      eventDetails={eventDetails}
    />
  );
}