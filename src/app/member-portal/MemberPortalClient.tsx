'use client';

import { useEffect, useRef, useState } from 'react';
import { HomeSectionTitle } from '@/components/HomeSectionTitle';
import subpageStyles from '@/components/SubpageHomeDesign.module.css';

const publicKey = process.env.NEXT_PUBLIC_MEMBERSTACK_PUBLIC_KEY?.trim() || '';
const freePlanId = process.env.NEXT_PUBLIC_MEMBERSTACK_FREE_PLAN_ID?.trim() || '';
const bronzePriceId = process.env.NEXT_PUBLIC_MEMBERSTACK_BRONZE_PRICE_ID?.trim() || '';

type PlanConnection = {
  payment?: { priceId?: string } | null;
};

type MemberstackMember = {
  id?: string;
  email?: string;
  planConnections?: PlanConnection[];
};

type MemberstackInstance = {
  openModal: (type: string, options?: Record<string, unknown>) => Promise<{ data?: unknown; type?: string }>;
  hideModal?: () => void;
  getCurrentMember?: () => Promise<{ data?: MemberstackMember | null }>;
  purchasePlansWithCheckout?: (params: { priceId: string; successUrl?: string; cancelUrl?: string }) => Promise<unknown>;
};

export default function MemberPortalClient({ homepageDesign = false }: { homepageDesign?: boolean }) {
  const [memberstackReady, setMemberstackReady] = useState(false);
  const [currentMember, setCurrentMember] = useState<MemberstackMember | null | undefined>(undefined);
  const [initError, setInitError] = useState<string | null>(null);
  const memberstackRef = useRef<MemberstackInstance | null>(null);

  const refreshMember = async (ms: MemberstackInstance) => {
    if (typeof ms.getCurrentMember !== 'function') return;
    try {
      const { data } = await ms.getCurrentMember();
      setCurrentMember(data ?? null);
    } catch {
      setCurrentMember(null);
    }
  };

  useEffect(() => {
    if (!publicKey) {
      setInitError('Memberstack is not configured. Add NEXT_PUBLIC_MEMBERSTACK_PUBLIC_KEY to .env.local');
      return;
    }

    let mounted = true;

    (async () => {
      try {
        const memberstackDOM = (await import('@memberstack/dom')).default;
        const ms = memberstackDOM.init({
          publicKey,
          useCookies: true,
        }) as MemberstackInstance;
        if (!mounted) return;
        memberstackRef.current = ms;
        setMemberstackReady(true);
        await refreshMember(ms);
      } catch (err) {
        if (mounted) {
          setInitError(err instanceof Error ? err.message : 'Failed to load Memberstack');
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const openLogin = () => {
    const ms = memberstackRef.current;
    if (!ms) return;
    ms.openModal('LOGIN').then(() => refreshMember(ms));
  };

  const openSignup = () => {
    const ms = memberstackRef.current;
    if (!ms) return;
    const options = freePlanId ? { signup: { plans: [freePlanId] } } : undefined;
    ms.openModal('SIGNUP', options).then(() => refreshMember(ms));
  };

  const openBronzeCheckout = () => {
    const ms = memberstackRef.current;
    if (!ms?.purchasePlansWithCheckout || !bronzePriceId) return;
    const url = typeof window !== 'undefined' ? window.location.href : '';
    ms.purchasePlansWithCheckout({ priceId: bronzePriceId, successUrl: url, cancelUrl: url }).then(() => refreshMember(ms));
  };

  const openProfile = () => {
    const ms = memberstackRef.current;
    if (!ms) return;
    ms.openModal('PROFILE').then(() => refreshMember(ms));
  };

  const pageTitle = homepageDesign ? (
    <div className="text-center mb-6">
      <HomeSectionTitle className="mb-4">Members</HomeSectionTitle>
    </div>
  ) : (
    <h1 className="font-heading font-semibold text-2xl text-foreground mb-4">Members</h1>
  );

  if (initError) {
    return (
      <>
        {pageTitle}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h2 className="font-heading font-semibold text-lg text-amber-800 mb-2">Members portal</h2>
          <p className="text-amber-700 text-sm">{initError}</p>
        </div>
      </>
    );
  }

  return (
    <div>
      {pageTitle}
      <div className={homepageDesign ? '' : 'bg-card rounded-lg sacred-shadow p-6'}>
        {!memberstackReady ? (
          <p className={homepageDesign ? subpageStyles.loadingText : 'text-muted-foreground'}>
            Loading member portal…
          </p>
        ) : (
          <>
            <p className="font-body text-muted-foreground mb-4">
              {currentMember
                ? 'You’re signed in to the member portal. Open your profile to manage your account, subscription, or billing.'
                : 'Sign in or sign up with Memberstack to access member-only content. You only need to do this once to create or link your Memberstack membership.'}
            </p>

            {!currentMember && (
              <div className="font-body text-sm text-muted-foreground mb-6 p-4 bg-muted/50 rounded-lg border border-border/50">
                <p className="font-semibold text-foreground mb-2">Already signed in with Clerk?</p>
                <p className="mb-2">
                  Yes — you still click <strong>Sign in</strong> here. That opens Memberstack’s login. If Clerk is set up as SSO in Memberstack, choose <strong>“Sign in with Clerk”</strong> (or the SSO option). Your Clerk session is used automatically; you don’t type credentials again or create a separate account. Memberstack will create or link your member record.
                </p>
                <p>
                  If you don’t see a Clerk/SSO option, use email/password or a social login shown in the modal, or ask your admin to enable Clerk SSO in the Memberstack dashboard.
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {!currentMember ? (
                <>
                  <button
                    type="button"
                    onClick={openLogin}
                    className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg shadow-sm border-2 border-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-300"
                    title="Sign in"
                    aria-label="Sign in"
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    onClick={openSignup}
                    className="px-5 py-2.5 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold rounded-lg shadow-sm border-2 border-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-300"
                    title={freePlanId ? 'Sign up (Free plan)' : 'Sign up'}
                    aria-label={freePlanId ? 'Sign up with free plan' : 'Sign up'}
                  >
                    {freePlanId ? 'Sign up (Free)' : 'Sign up'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={openProfile}
                    className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg shadow-sm border-2 border-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-300"
                    title="Member profile"
                    aria-label="Member profile"
                  >
                    Member profile
                  </button>
                  {bronzePriceId &&
                    !(currentMember?.planConnections?.some((pc) => pc.payment?.priceId === bronzePriceId) ?? false) && (
                    <button
                      type="button"
                      onClick={openBronzeCheckout}
                      className="px-5 py-2.5 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-lg shadow-sm border-2 border-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-300"
                      title="Upgrade to Bronze"
                      aria-label="Upgrade to Bronze"
                    >
                      Upgrade to Bronze
                    </button>
                  )}
                  <p className="font-body text-sm text-muted-foreground mt-4 w-full">
                    The <strong>Plans</strong> tab in Member profile only appears if you have at least one plan. Use <strong>Sign up (Free)</strong> to get the free plan, or <strong>Upgrade to Bronze</strong> for the paid plan. Plan and billing options appear in the profile modal sidebar once plans are enabled in the Memberstack dashboard.
                  </p>
                  <p className="font-body text-sm text-muted-foreground mt-3 w-full p-3 bg-muted/50 rounded-lg border border-border/50">
                    <strong>Cancelling in Stripe?</strong> When you cancel via &quot;Manage Subscriptions&quot; in the Plans tab, Stripe usually <strong>schedules cancellation at the end of your current billing period</strong>. Your plan will still show as active here and in Member profile until that date (e.g. &quot;Cancels Mar 22&quot;). After the period ends, Memberstack updates and the plan will no longer appear. To cancel immediately, use the option in Stripe if available, or contact support.
                  </p>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
