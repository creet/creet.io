import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession, PlanType } from '@/lib/payments/dodo';
import { getUser } from '@/lib/auth/server-auth';

/**
 * POST /api/payments/checkout-session
 * Creates a DoDoPayments checkout session for Pro or Lifetime plan upgrade
 */
export async function POST(request: NextRequest) {
    try {
        // Get authenticated user
        const user = await getUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Parse request body to get plan type
        let planType: PlanType = 'pro';
        try {
            const body = await request.json();
            if (body.plan === 'lifetime') {
                planType = 'lifetime';
            }
        } catch {
            // No body or invalid JSON, default to 'pro'
        }

        // Create checkout session
        const result = await createCheckoutSession(
            user.id,
            user.email || '',
            user.user_metadata?.full_name,
            planType
        );

        if ('error' in result) {
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            checkoutUrl: result.checkoutUrl,
        });
    } catch (error) {
        console.error('Checkout session error:', error);
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}

