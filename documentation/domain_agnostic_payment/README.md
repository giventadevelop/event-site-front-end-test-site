# Domain-Agnostic Payment System Documentation

**Project:** MCEFEE Multi-Tenant Event Management Platform
**Version:** 1.0
**Date:** October 20, 2025
**Status:** Ready for Implementation

---

## Overview

This directory contains comprehensive documentation for transforming the MCEFEE event management platform from a single-domain, Stripe-centric payment implementation to a **domain-agnostic, multi-provider payment architecture**.

## Problem Statement

**Current State:**
- Each client domain requires separate Stripe account setup
- Payment logic tightly coupled to frontend (client-side Stripe.js)
- Limited flexibility for alternative payment providers
- Manual configuration for each new tenant
- Inconsistent flows for different payment types (tickets, donations, offerings)

**Desired State:**
- Single backend orchestrates all payment processing
- Multiple payment providers supported (Stripe, PayPal, future: ACP, AP2)
- Zero frontend changes when adding new domains
- Consistent, user-friendly checkout experience
- Easy addition of new payment providers

---

## Documentation Structure

### 📋 [PRD.md](./PRD.md) - Product Requirements Document
**Comprehensive specification covering:**
- Business goals and objectives
- Current system analysis
- Proposed architecture (diagrams, flow charts)
- Payment provider research (ACP, AP2)
- Payment flow scenarios (tickets, donations, offerings)
- Security & compliance (PCI DSS, encryption)
- Migration strategy (4-phase rollout)
- Success metrics and timeline

**Key Sections:**
1. Background & Context
2. Goals & Objectives
3. Current System Analysis
4. Proposed Architecture
5. Technology Stack & Standards (ACP, AP2)
6. Payment Flow Scenarios
7. Database Schema Changes
8. Backend Implementation Requirements
9. Frontend Implementation Requirements
10. Security & Compliance
11. Migration Strategy
12. Success Metrics
13. Timeline & Phases
14. Appendix (references, samples)

### 🔧 [BACKEND_REFACTORING.md](./BACKEND_REFACTORING.md) - Backend Implementation Guide
**Spring Boot backend refactoring details:**
- New package structure (`payment/` package)
- Core interfaces (`PaymentAdapter`, `WebhookHandler`)
- Adapter implementations (Stripe, PayPal)
- REST API endpoints (`/api/payments/*`)
- Webhook handling and verification
- Configuration management (encrypted credentials)
- Testing strategy

**Key Components:**
- `PaymentService` interface for provider abstraction
- `StripePaymentAdapter` implementation with code examples
- `PaymentOrchestrationService` for routing logic
- `PaymentProviderConfigService` for credential management
- Complete Java code samples

### 🎨 [FRONTEND_REFACTORING.md](./FRONTEND_REFACTORING.md) - Frontend Implementation Guide
**Next.js frontend refactoring details:**
- New component architecture
- `UniversalPaymentCheckout` wrapper component
- Provider-specific UI components (Stripe, PayPal)
- State management with React hooks
- API integration via proxy routes
- Migration plan from old components
- Testing approach

**Key Components:**
- `UniversalPaymentCheckout.tsx` - Main orchestrator
- `StripePaymentUI.tsx` - Refactored Stripe component
- `PayPalPaymentUI.tsx` - New PayPal component
- `usePaymentSession` hook for API calls
- `providerRegistry` for dynamic component loading

### 🗄️ [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Database Schema & Migration
**Complete SQL schema and migration scripts:**
- New tables design and rationale
- Full CREATE TABLE statements
- Indexes and performance optimization
- Liquibase migration changesets
- Data migration scripts (existing → new)
- Rollback procedures

**New Tables:**
1. `payment_provider_config` - Provider credentials per tenant
2. `payment_transaction` - Unified transaction table
3. `payment_transaction_item` - Line items for transactions
4. `payment_webhook_log` - Audit log for webhooks

---

## Quick Start Guide

### For Project Managers

1. **Review:** Read [PRD.md](./PRD.md) Executive Summary and Timeline sections
2. **Approve:** Sign off on proposed architecture and budget
3. **Plan:** Create project tasks using timeline in PRD Section 13
4. **Monitor:** Track progress using success metrics in PRD Section 12

### For Backend Developers

1. **Read:** [BACKEND_REFACTORING.md](./BACKEND_REFACTORING.md) sections 1-4
2. **Setup:** Review [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for schema understanding
3. **Implement:**
   - Start with `PaymentService` interface
   - Implement `StripePaymentAdapter` (refactor existing Stripe code)
   - Build REST endpoints (`/api/payments/initialize`, etc.)
   - Add webhook handling
4. **Test:** Write unit tests for adapters, integration tests for flows

### For Frontend Developers

1. **Read:** [FRONTEND_REFACTORING.md](./FRONTEND_REFACTORING.md) sections 1-5
2. **Implement:**
   - Create `UniversalPaymentCheckout` component
   - Refactor existing Stripe components
   - Build provider-specific UI components
   - Create API proxy routes
3. **Test:** Unit tests for components, browser testing for payment flows

### For Database Administrators

1. **Read:** [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) in full
2. **Review:** Analyze impact on existing data
3. **Execute:**
   - Run Liquibase migrations in staging
   - Execute data migration scripts
   - Verify data integrity
   - Monitor performance
4. **Backup:** Create full backup before production migration

---

## Implementation Timeline

### Phase 1: Foundation (Weeks 1-4)
- **Backend:** New tables, `PaymentService` interface, Stripe adapter
- **Frontend:** `UniversalPaymentCheckout`, refactored Stripe UI
- **Database:** Schema migration, data migration
- **Testing:** Unit tests, integration tests

### Phase 2: Multi-Provider Support (Weeks 5-8)
- **Backend:** PayPal adapter, provider fallback logic
- **Frontend:** PayPal UI component, provider selection
- **Testing:** Cross-provider testing, edge cases

### Phase 3: Full Rollout (Weeks 9-12)
- **Deployment:** Pilot with select tenants, full production rollout
- **Documentation:** Admin guides, API documentation
- **Monitoring:** Dashboards, alerts, weekly reviews

### Phase 4: Future Enhancements (Post-Launch)
- **ACP Integration:** OpenAI Agentic Commerce Protocol
- **AP2 Research:** Google Agent Payments Protocol
- **Advanced Features:** Recurring payments, multi-currency, installments

---

## Key Decisions & Rationale

### Why Backend-Centric?
- **Security:** Payment provider credentials stay in backend
- **Flexibility:** Easy to add providers without frontend changes
- **Control:** Centralized business logic and validation
- **Compliance:** Better audit trail and PCI compliance

### Why Adapter Pattern?
- **Extensibility:** New providers require only new adapter class
- **Testability:** Each adapter can be tested independently
- **Maintainability:** Provider-specific code isolated
- **Consistency:** All providers conform to same interface

### Why Unified Transaction Table?
- **Reporting:** Single source of truth for all payments
- **Analytics:** Cross-provider comparisons and insights
- **Reconciliation:** Easier to match payments across systems
- **Scalability:** One table to optimize, index, and partition

---

## Technical Stack

### Backend (Spring Boot)
- **Language:** Java 17+
- **Framework:** Spring Boot 3.x
- **Database:** PostgreSQL 16+ with JSONB support
- **Payment SDKs:** Stripe Java SDK, PayPal REST SDK
- **Security:** AES-256-GCM encryption for credentials

### Frontend (Next.js)
- **Framework:** Next.js 15+ with App Router
- **Language:** TypeScript 5.3.3
- **Payment UI:** Stripe.js, PayPal JavaScript SDK
- **State:** React hooks, TanStack Query
- **Styling:** Tailwind CSS

### Payment Providers
- **Current:** Stripe (refactor existing)
- **Phase 2:** PayPal
- **Future:** ACP (OpenAI + Stripe), AP2 (Google)

---

## Key Contacts & Resources

### External Resources
- **Stripe Docs:** https://stripe.com/docs/api
- **PayPal Docs:** https://developer.paypal.com/api/rest/
- **ACP Spec:** https://github.com/agentic-commerce-protocol/agentic-commerce-protocol
- **AP2 Blog:** https://cloud.google.com/blog/products/ai-machine-learning/announcing-agents-to-payments-ap2-protocol

### Related Documentation
- **Main Project README:** `../../README.md`
- **CLAUDE.md:** `../../CLAUDE.md` (Claude Code instructions)
- **API Swagger:** `../Swagger_API_Docs/api-docs.json`
- **Current SQL Schema:** `../../code_html_template/SQLS/Latest_Schema_Post__Blob_Claude_11.sql`

---

## Success Criteria

✅ **Business Goals:**
- Time to onboard new domain: <1 hour (from several days)
- Support 2+ payment providers by end of Phase 2
- Maintain or improve payment conversion rate
- 99.9% payment system uptime

✅ **Technical Goals:**
- 100% test coverage for payment adapters
- <5 second average payment processing time
- Zero provider-specific code in frontend after migration
- Comprehensive audit logging for compliance

✅ **User Experience:**
- Consistent checkout flow across all providers
- One-click payments via wallets (Apple Pay, Google Pay, Link)
- Clear error messages and recovery paths
- Mobile-optimized payment UI

---

## Risk Mitigation

### Technical Risks
- **Data Migration Failure:** Extensive testing, batched migration, rollback plan
- **Provider API Changes:** Adapter pattern isolates changes, version pinning
- **Performance Degradation:** Load testing, caching, database optimization

### Business Risks
- **Payment Downtime:** Phased rollout, feature flags, instant rollback
- **Conversion Rate Drop:** A/B testing, pilot users, monitoring
- **Compliance Issues:** PCI DSS audit, legal review, encrypted storage

---

## Next Steps

1. ✅ **Review Documentation** - All stakeholders read relevant sections
2. ⏳ **Approve PRD** - Project manager signs off
3. ⏳ **Break Down Tasks** - Use Claude Task Master to generate tasks from PRD
4. ⏳ **Assign Resources** - Allocate backend/frontend/database developers
5. ⏳ **Setup Environment** - Staging environment with test payment accounts
6. ⏳ **Begin Phase 1** - Start backend foundation (Week 1)

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-20 | Development Team | Initial comprehensive documentation |

---

## Feedback & Questions

For questions or feedback about this documentation:
1. Review relevant section in detail
2. Check external resources (Stripe/PayPal docs, ACP/AP2 specs)
3. Contact development team via project management system

---

**Status:** 📘 Documentation Complete - Ready for Implementation

This documentation provides everything needed to implement a production-ready, domain-agnostic payment system with support for multiple payment providers and future-ready architecture for emerging standards like ACP and AP2.
