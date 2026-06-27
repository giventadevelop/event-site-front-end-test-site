# Customer Name and Phone Capture Fix

## 🚨 Problem

Even after backend fix to extract `customerName` and `customerPhone` from Payment Intent metadata, the database shows NULL values for `first_name`, `last_name`, and `phone` fields.

## 🔍 Root Cause

The frontend form fields (`firstName`, `lastName`, `phone`) were **optional** (not required). If users didn't fill them in:
- `customerName` would be `undefined` (if both firstName and lastName were empty)
- `customerPhone` would be `undefined` (if phone was empty)
- These `undefined` values were not sent to the backend

### Frontend Code (Before Fix)

**CheckoutClient.tsx:**
```typescript
// Form fields were optional (no 'required' attribute)
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const [phone, setPhone] = useState('');

// customerName construction
customerName: firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || undefined,
customerPhone: phone || undefined,

// Validation only checked email, not names
const canCheckout = hasTicketsSelected && emailIsValid && !hasUnavailableTickets;
```

**Result:** Users could checkout without filling in firstName/lastName, resulting in NULL values in database.

---

## ✅ Solution Implemented

### Changes Made

1. **Made First Name and Last Name Required Fields**
   - Added `required` attribute to both input fields
   - Added red asterisk (*) to labels to indicate required fields
   - Added validation to prevent checkout if names are not provided

2. **Added Name Validation**
   - Created `nameIsValid` check: `firstName.trim().length > 0 && lastName.trim().length > 0`
   - Updated `canCheckout` to include name validation
   - Updated `handleInvalidClick` to alert users if names are missing

3. **Added Debug Logging**
   - Added console logging in `UniversalPaymentCheckout.tsx` to log what's being sent
   - Logs show: `customerEmail`, `customerName`, `customerPhone`, `items`, etc.

### Code Changes

**CheckoutClient.tsx:**

```typescript
// Added validation
const nameIsValid = firstName.trim().length > 0 && lastName.trim().length > 0;
const canCheckout = hasTicketsSelected && emailIsValid && nameIsValid && !hasUnavailableTickets;

// Updated invalid click handler
const handleInvalidClick = useCallback(() => {
  if (!emailIsValid) setEmailError(true);
  if (!hasTicketsSelected) alert('Please select at least one ticket.');
  if (!nameIsValid) alert('Please enter your first name and last name.');
  if (hasUnavailableTickets) alert('Some selected tickets are sold out. Please adjust your selection.');
}, [emailIsValid, hasTicketsSelected, nameIsValid, hasUnavailableTickets]);

// Updated form fields
<label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
  First Name <span className="text-red-500">*</span>
</label>
<input
  type="text"
  id="firstName"
  value={firstName}
  onChange={(e) => setFirstName(e.target.value)}
  required  // ← Added
  placeholder="John"
/>
```

**UniversalPaymentCheckout.tsx:**

```typescript
// Added debug logging
console.log('[UniversalPaymentCheckout] Payment initialization request:', {
  customerEmail: request.customerEmail,
  customerName: request.customerName || 'NOT_PROVIDED',
  customerPhone: request.customerPhone || 'NOT_PROVIDED',
  eventId: request.eventId,
  itemsCount: request.items.length,
  items: request.items.map(item => ({
    itemType: item.itemType,
    itemId: item.itemId,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
  })),
});
```

---

## 📋 Testing Checklist

After fix:

- [ ] First Name and Last Name fields show red asterisk (*) indicating required
- [ ] Form validation prevents checkout if firstName or lastName is empty
- [ ] Browser console shows `customerName` and `customerPhone` in payment request log
- [ ] Backend receives `customerName` and `customerPhone` in Payment Intent metadata
- [ ] Database shows correct `first_name`, `last_name` values (not NULL)
- [ ] Phone field remains optional (can be NULL)
- [ ] Payment flow works correctly with all fields filled
- [ ] Payment flow works correctly with phone field empty (should still work)

---

## 🔍 Debugging Steps

### 1. Check Browser Console

When payment is initialized, look for:
```
[UniversalPaymentCheckout] Payment initialization request: {
  customerEmail: "user@example.com",
  customerName: "John Doe" or "NOT_PROVIDED",
  customerPhone: "+1234567890" or "NOT_PROVIDED",
  ...
}
```

**If `customerName` shows "NOT_PROVIDED":**
- User didn't fill in firstName/lastName fields
- Form validation should prevent this, but check if validation is working

**If `customerName` shows a value but database is NULL:**
- Frontend is sending correctly
- Check backend logs to see if Payment Intent metadata includes `customerName`
- Check backend `TicketGenerationService` extraction logic

### 2. Check Backend Logs

Look for Payment Intent metadata in backend logs:
```
Payment Intent metadata: {
  "customerEmail": "user@example.com",
  "customerName": "John Doe",
  "customerPhone": "+1234567890",
  "eventId": "2",
  ...
}
```

**If metadata doesn't include `customerName`:**
- Backend payment API (`StripePaymentAdapter`) is not adding it to metadata
- Check backend code that creates Payment Intent

**If metadata includes `customerName` but database is NULL:**
- Backend extraction logic (`TicketGenerationService`) is not reading it correctly
- Check `extractFirstNameFromPayment()` and `extractLastNameFromPayment()` methods

### 3. Check Database

Query the transaction:
```sql
SELECT
  id,
  email,
  first_name,
  last_name,
  phone,
  stripe_payment_intent_id
FROM event_ticket_transaction
WHERE stripe_payment_intent_id = 'pi_XXX';
```

**If fields are NULL:**
- Check Payment Intent metadata (via Stripe dashboard or API)
- Verify backend extraction logic is working
- Check backend logs for extraction errors

---

## 📝 Notes

- **Phone field remains optional** - users can checkout without providing phone number
- **First Name and Last Name are now required** - users must fill these in to checkout
- **Backend must extract from Payment Intent metadata** - backend fix is still required to read these fields
- **Frontend now ensures data is sent** - validation prevents empty values from being sent

---

## 🔗 Related Files

**Frontend:**
- `src/app/events/[id]/checkout/CheckoutClient.tsx` - Form validation and data collection
- `src/components/UniversalPaymentCheckout.tsx` - Payment request construction and logging

**Backend (in `malayalees-us-site-boot` workspace):**
- `StripePaymentAdapter.java` - Should add customerName/customerPhone to Payment Intent metadata
- `TicketGenerationService.java` - Should extract customerName/customerPhone from Payment Intent metadata

**Documentation:**
- `FRONTEND_CART_METADATA_ISSUE.md` - Related cart metadata issue
- `BACKEND_TRANSACTION_ITEMS_FIX.md` - Backend transaction items fix





