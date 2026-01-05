import { NextRequest, NextResponse } from 'next/server';
import { parseWebhookEvent, verifyWebhookSignature } from '@/lib/payments/dodo';
import { createClient } from '@supabase/supabase-js';

// Create admin client with service role key - bypasses RLS for webhook operations
const createAdminClient = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
};

// Vercel runtime configuration - Pro plan allows up to 60s
export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * GET /api/payments/webhook
 * Health check endpoint to verify webhook is reachable
 */
export async function GET() {
    return NextResponse.json({
        status: 'ok',
        message: 'DoDoPayments webhook endpoint is active',
        timestamp: new Date().toISOString(),
    });
}

/**
 * POST /api/payments/webhook
 * Handles DoDoPayments webhook events
 */
export async function POST(request: NextRequest) {
    console.log('🔔 Webhook received at:', new Date().toISOString());

    try {
        const payload = await request.text();
        console.log('📦 Payload:', payload);

        // Get webhook headers (Standard Webhooks format)
        const signature = request.headers.get('webhook-signature') || '';
        const webhookId = request.headers.get('webhook-id') || '';
        const timestamp = request.headers.get('webhook-timestamp') || '';

        console.log('🔑 Headers:', { webhookId, timestamp, hasSignature: !!signature });

        // Verify webhook signature
        const isValid = await verifyWebhookSignature(payload, signature, webhookId, timestamp);
        console.log('✅ Signature valid:', isValid);

        if (!isValid) {
            console.error('❌ Invalid webhook signature');
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 401 }
            );
        }

        // Parse the event
        const event = parseWebhookEvent(payload);
        console.log('📋 Event type:', event?.type);
        console.log('📋 Event data:', JSON.stringify(event?.data, null, 2));

        if (!event) {
            console.error('❌ Failed to parse event');
            return NextResponse.json(
                { error: 'Invalid payload' },
                { status: 400 }
            );
        }

        // Handle the event
        switch (event.type) {
            case 'subscription.active':
                await handleSubscriptionActive(event.data);
                break;
            case 'subscription.cancelled':
                await handleSubscriptionCancelled(event.data);
                break;
            case 'subscription.renewed':
                console.log('🔄 Subscription renewed');
                break;
            case 'payment.succeeded':
                // Handle one-time payments (like lifetime purchases)
                await handlePaymentSucceeded(event.data);
                break;
            case 'payment.failed':
                console.log('❌ Payment failed');
                break;
            default:
                console.log('❓ Unhandled event type:', event.type);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('🚨 Webhook error:', error);
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 }
        );
    }
}

/**
 * Handle subscription.active event - Update user plan to 'pro' or 'lifetime'
 */
async function handleSubscriptionActive(data: any) {
    console.log('🎉 Processing subscription.active...');
    console.log('📦 Full data:', JSON.stringify(data, null, 2));

    // DoDoPayments sends: { subscription: { metadata: { user_id: "...", plan_type: "..." }, customer: { email: "..." } } }
    // OR directly: { metadata: { user_id: "...", plan_type: "..." }, customer: { email: "..." } }
    const subscription = data.subscription || data;
    const userId = subscription.metadata?.user_id || data.metadata?.user_id;
    const email = subscription.customer?.email || data.customer?.email;

    // Get plan type from metadata or product ID
    let planType: 'pro' | 'lifetime' = 'pro'; // default to pro

    // Check metadata first (most reliable)
    const metadataPlanType = subscription.metadata?.plan_type || data.metadata?.plan_type;
    if (metadataPlanType === 'lifetime') {
        planType = 'lifetime';
    } else {
        // Fall back to checking product_id
        const productId = subscription.product_id || data.product_id;
        if (productId) {
            const lifetimeProductId = process.env.DODO_LIFETIME_PRODUCT_ID?.trim();
            if (productId === lifetimeProductId) {
                planType = 'lifetime';
            }
        }
    }

    console.log('👤 User ID from metadata:', userId);
    console.log('📧 Email from customer:', email);
    console.log('📋 Plan type:', planType);

    if (!userId && !email) {
        console.error('❌ No user identifier found in event');
        return;
    }

    const supabase = createAdminClient();

    // Try to find user by ID first, then by email
    if (userId) {
        console.log(`🔄 Updating plan to '${planType}' by user ID:`, userId);
        const { data, error, count } = await supabase
            .from('profiles')
            .update({ plan: planType })
            .eq('id', userId)
            .select();

        if (error) {
            console.error('❌ Failed to update by ID:', error);
        } else {
            console.log(`✅ Plan updated to '${planType}' for user ID:`, userId, 'Updated data:', data);
        }
    } else if (email) {
        console.log(`🔄 Updating plan to '${planType}' by email:`, email);
        const { error, count } = await supabase
            .from('profiles')
            .update({ plan: planType })
            .eq('email', email);

        if (error) {
            console.error('❌ Failed to update by email:', error);
        } else {
            console.log(`✅ Plan updated to '${planType}' for email:`, email, 'Rows affected:', count);
        }
    }
}

/**
 * Handle subscription.cancelled event - Downgrade user plan to 'hacker'
 */
async function handleSubscriptionCancelled(data: any) {
    console.log('😢 Processing subscription.cancelled...');

    const subscription = data.subscription || data;
    const userId = subscription.metadata?.user_id || data.metadata?.user_id;
    const email = subscription.customer?.email || data.customer?.email;

    console.log('👤 User ID:', userId);
    console.log('📧 Email:', email);

    if (!userId && !email) {
        console.error('❌ No user identifier in subscription.cancelled event');
        return;
    }

    const supabase = createAdminClient();

    if (userId) {
        const { error } = await supabase
            .from('profiles')
            .update({ plan: 'hacker' })
            .eq('id', userId);

        if (error) {
            console.error('❌ Failed to downgrade by ID:', error);
        } else {
            console.log('✅ Plan downgraded to hacker for user ID:', userId);
        }
    } else if (email) {
        const { error } = await supabase
            .from('profiles')
            .update({ plan: 'hacker' })
            .eq('email', email);

        if (error) {
            console.error('❌ Failed to downgrade by email:', error);
        } else {
            console.log('✅ Plan downgraded to hacker for email:', email);
        }
    }
}

/**
 * Handle payment.succeeded event - For one-time payments like lifetime
 */
async function handlePaymentSucceeded(data: any) {
    console.log('💰 Processing payment.succeeded...');
    console.log('📦 Full data:', JSON.stringify(data, null, 2));

    // Check if this is a lifetime payment
    const payment = data.payment || data;
    const userId = payment.metadata?.user_id || data.metadata?.user_id;
    const email = payment.customer?.email || data.customer?.email;
    const planType = payment.metadata?.plan_type || data.metadata?.plan_type;

    // Only process if this is marked as a lifetime purchase
    if (planType !== 'lifetime') {
        // Check product_id as fallback
        const productId = payment.product_id || data.product_id;
        const lifetimeProductId = process.env.DODO_LIFETIME_PRODUCT_ID?.trim();

        if (productId !== lifetimeProductId) {
            console.log('ℹ️ Payment is not for lifetime plan, skipping...');
            return;
        }
    }

    console.log('👤 User ID from metadata:', userId);
    console.log('📧 Email from customer:', email);
    console.log('🎫 Processing lifetime payment');

    if (!userId && !email) {
        console.error('❌ No user identifier found in payment event');
        return;
    }

    const supabase = createAdminClient();

    // Update user plan to lifetime
    if (userId) {
        console.log(`🔄 Updating plan to 'lifetime' by user ID:`, userId);
        const { data: updatedData, error } = await supabase
            .from('profiles')
            .update({ plan: 'lifetime' })
            .eq('id', userId)
            .select();

        if (error) {
            console.error('❌ Failed to update by ID:', error);
        } else {
            console.log(`✅ Plan updated to 'lifetime' for user ID:`, userId, 'Updated data:', updatedData);
        }
    } else if (email) {
        console.log(`🔄 Updating plan to 'lifetime' by email:`, email);
        const { error, count } = await supabase
            .from('profiles')
            .update({ plan: 'lifetime' })
            .eq('email', email);

        if (error) {
            console.error('❌ Failed to update by email:', error);
        } else {
            console.log(`✅ Plan updated to 'lifetime' for email:`, email, 'Rows affected:', count);
        }
    }
}
