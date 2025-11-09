export const runtime = 'edge';

export default function RefundPolicyPage() {
  const updated = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <div className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Refund Policy</h1>
          <p className="text-muted-foreground">Our commitment to your satisfaction</p>
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Our Commitment to You</h2>
          <p>
            We want you to be completely satisfied with RepurposeAI. That's why we offer a straightforward, no-hassle refund policy.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">14-Day Money-Back Guarantee</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Time Window:</strong> 14 days from date of purchase</li>
            <li><strong>Coverage:</strong> Full refund of purchase price</li>
            <li>
              <strong>Process:</strong> Email 
              {' '}<a href="mailto:zulaihaaliyu440@gmail.com" className="text-primary underline">zulaihaaliyu440@gmail.com</a>{' '} 
              with your order details
            </li>
            <li><strong>Turnaround:</strong> Refunds processed within 3-5 business days</li>
            <li><strong>No Questions Asked:</strong> We respect your decision</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">How to Request a Refund</h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>Email: <a href="mailto:zulaihaaliyu440@gmail.com" className="text-primary underline">zulaihaaliyu440@gmail.com</a></li>
            <li>Subject: "Refund Request - [Your Email]"</li>
            <li>Include: Order number or email used for purchase</li>
            <li>We'll process it immediately</li>
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">What Happens After Refund</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Your lifetime access will be deactivated</li>
            <li>Any generated content will be deleted after 30 days</li>
            <li>Full refund returned via original payment method</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Terms</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Refunds apply to the original purchase price</li>
            <li>Offer valid for 14 days from purchase date</li>
            <li>Valid for first-time purchases only (no multiple refund requests)</li>
            <li>We reserve the right to refuse refunds for abuse/fraudulent activity</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Why We're So Confident</h2>
          <p>
            We've built RepurposeAI to genuinely save you 10+ hours per week. We're confident that once you experience the value, you won't want a refund.
          </p>
          <p>
            If we're wrong? We'd rather refund you than have an unhappy customer.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Questions?</h2>
          <p>
            Email: {' '}<a href="mailto:zulaihaaliyu440@gmail.com" className="text-primary underline">zulaihaaliyu440@gmail.com</a><br />
            We typically respond within 24 hours.
          </p>
        </section>

        <footer className="pt-4 text-sm text-muted-foreground">
          <p>Last updated: {updated}</p>
        </footer>
      </div>
    </div>
  );
}
