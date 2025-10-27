
'use client';

// This page is not currently used in the checkout flow,
// but it exists to prevent a build error.
// The checkout process now uses a mailto: link.
export default function OrderConfirmationPage() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-headline font-bold">Order Status</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        If you have been redirected here, please check your email or contact support.
      </p>
    </div>
  );
}
