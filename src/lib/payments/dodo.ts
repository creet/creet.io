/**
 * DoDoPayments Integration Utilities
 * 
 * Handles checkout session creation and webhook verification
 */

// Determine API Base URL
// 1. Use manual override if set (DODO_API_URL)
// 2. Use Live URL if in production
// 3. Default to Test URL for development
const DODO_API_BASE = process.env.DODO_API_URL || (
    process.env.NODE_ENV === 'production'
        ? 'https://live.dodopayments.com'
        : 'https://test.dodopayments.com'
);

// Plan types supported
export type PlanType = 'pro' | 'lifetime';

interface CheckoutSessionResponse {
    payment_link: string;
    checkout_url: string;
}

interface CheckoutSessionRequest {
    product_cart: Array<{
        product_id: string;
        quantity: number;
    }>;
    billing: {
        city: string;
        country: string;
        state: string;
        street: string;
        zipcode: string;
    };
    customer: {
        email: string;
        name: string;
    };
    return_url: string;
    metadata?: Record<string, string>;
}

/**
 * Gets the product ID for a given plan type
 */
export function getProductIdForPlan(planType: PlanType): string | null {
    switch (planType) {
        case 'pro':
            return process.env.DODO_PRO_PRODUCT_ID?.trim() || null;
        case 'lifetime':
            return process.env.DODO_LIFETIME_PRODUCT_ID?.trim() || null;
        default:
            return null;
    }
}

/**
 * Gets the plan type from a product ID
 */
export function getPlanTypeFromProductId(productId: string): PlanType | null {
    const proProductId = process.env.DODO_PRO_PRODUCT_ID?.trim();
    const lifetimeProductId = process.env.DODO_LIFETIME_PRODUCT_ID?.trim();

    if (productId === lifetimeProductId) {
        return 'lifetime';
    }
    if (productId === proProductId) {
        return 'pro';
    }
    return null;
}

/**
 * Creates a DoDoPayments checkout session for the specified plan
 */
export async function createCheckoutSession(
    userId: string,
    email: string,
    name?: string,
    planType: PlanType = 'pro'
): Promise<{ checkoutUrl: string } | { error: string }> {
    const apiKey = process.env.DODO_API_KEY?.trim();
    const productId = getProductIdForPlan(planType);
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').trim();

    if (!apiKey) {
        console.error('DODO_API_KEY is not configured');
        return { error: 'Payment system not configured' };
    }

    if (!productId) {
        console.error(`DODO_${planType.toUpperCase()}_PRODUCT_ID is not configured`);
        return { error: 'Product not configured' };
    }

    // Simplified request body matching documentation
    const requestBody: CheckoutSessionRequest = {
        product_cart: [
            {
                product_id: productId,
                quantity: 1,
            },
        ],
        billing: {
            city: '',
            country: 'US',
            state: '',
            street: '',
            zipcode: '',
        },
        customer: {
            email: email,
            name: name || email.split('@')[0],
        },
        return_url: `${appUrl}/pricing/success?user_id=${userId}&plan=${planType}`,
        metadata: {
            user_id: userId,
            plan_type: planType,
        },
    };

    try {
        // Use /checkouts endpoint instead of /payments
        const response = await fetch(`${DODO_API_BASE}/checkouts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('DoDoPayments API error:', response.status, errorText);
            return { error: 'Failed to create checkout session' };
        }

        const data = await response.json();
        const checkoutUrl = data.checkout_url || data.payment_link;
        return { checkoutUrl };
    } catch (error) {
        console.error('DoDoPayments request failed:', error);
        return { error: 'Payment service unavailable' };
    }
}

/**
 * Verifies the webhook signature from DoDoPayments
 * Uses HMAC SHA256 as per Standard Webhooks specification
 */
export async function verifyWebhookSignature(
    payload: string,
    signature: string,
    webhookId: string,
    timestamp: string
): Promise<boolean> {
    const secret = process.env.DODO_WEBHOOK_SECRET;

    if (!secret) {
        console.error('DODO_WEBHOOK_SECRET is not configured');
        return false;
    }

    try {
        // Standard Webhooks format: msg_id.timestamp.payload
        const signedPayload = `${webhookId}.${timestamp}.${payload}`;

        // Decode base64 secret (Standard Webhooks uses base64-encoded secrets)
        const secretBytes = Uint8Array.from(atob(secret.replace('whsec_', '')), c => c.charCodeAt(0));

        // Create HMAC SHA256
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
            'raw',
            secretBytes,
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        );

        const signatureBuffer = await crypto.subtle.sign(
            'HMAC',
            key,
            encoder.encode(signedPayload)
        );

        // Convert to base64
        const expectedSignature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));

        // Check against provided signatures (may have multiple versions)
        const providedSignatures = signature.split(',').map(s => s.trim());
        for (const sig of providedSignatures) {
            // Format: v1,signature_value
            const parts = sig.split(',');
            const sigValue = parts.length > 1 ? parts[1] : parts[0];
            if (sigValue === expectedSignature) {
                return true;
            }
        }

        return false;
    } catch (error) {
        console.error('Webhook verification failed:', error);
        return false;
    }
}

/**
 * DoDoPayments webhook event types we care about
 */
export type DodoWebhookEvent = {
    type: 'subscription.active' | 'subscription.cancelled' | 'subscription.renewed' | 'payment.succeeded' | 'payment.failed';
    data: {
        payment_id?: string;
        subscription_id?: string;
        customer?: {
            email: string;
            customer_id?: string;
        };
        metadata?: Record<string, string>;
        product_id?: string;
        status?: string;
    };
};

/**
 * Parses and validates a webhook event payload
 */
export function parseWebhookEvent(payload: string): DodoWebhookEvent | null {
    try {
        const event = JSON.parse(payload);
        if (!event.type || !event.data) {
            return null;
        }
        return event as DodoWebhookEvent;
    } catch {
        return null;
    }
}
