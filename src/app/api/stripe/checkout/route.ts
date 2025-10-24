import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createStripeCustomer, createCheckoutSession, createCheckoutSessionWithDiscount } from '@/lib/stripe';
import { getUserByGoogleId, updateUserSubscription, validateDiscountCode, getDiscountCodeByCode } from '@/lib/database';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { plan, discountCode } = await request.json();

    if (plan !== 'pro') {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await getUserByGoogleId(session.user.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Convert user ID to number for database functions
    const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;

    // Check if user already has pro subscription
    if (user.subscription_status === 'pro') {
      return NextResponse.json(
        { error: 'User already has Pro subscription' },
        { status: 400 }
      );
    }

    let customerId = user.stripe_customer_id;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await createStripeCustomer(user.email, user.name || undefined);
      customerId = customer.id;

      // Update user with Stripe customer ID
      await updateUserSubscription(userId, {
        subscription_status: user.subscription_status,
        stripe_customer_id: customerId,
      });
    }

    // Handle discount code if provided
    let stripeCouponId = undefined;
    if (discountCode) {
      // Validate discount code
      const validation = await validateDiscountCode(discountCode.toUpperCase());

      if (!validation.is_valid) {
        return NextResponse.json(
          { error: validation.error_message || 'Invalid discount code' },
          { status: 400 }
        );
      }

      // Get the full discount code details to get Stripe coupon ID
      const discountDetails = await getDiscountCodeByCode(discountCode.toUpperCase());
      if (discountDetails?.stripe_coupon_id) {
        stripeCouponId = discountDetails.stripe_coupon_id;
      }
    }

    // Create checkout session with or without discount
    const checkoutSession = stripeCouponId
      ? await createCheckoutSessionWithDiscount(
          customerId,
          userId,
          user.email,
          `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/billing?success=true`,
          `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/billing?canceled=true`,
          stripeCouponId
        )
      : await createCheckoutSession(
          customerId,
          userId,
          user.email,
          `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/billing?success=true`,
          `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/billing?canceled=true`
        );

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });

  } catch (error) {
    console.error('Checkout API error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
