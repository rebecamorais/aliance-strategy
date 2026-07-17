export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-page text-body p-8 max-w-3xl mx-auto font-sans leading-relaxed">
      <h1 className="text-3xl font-medium text-body mb-6">Privacy Policy</h1>
      <p className="text-sm text-muted mb-8">Last updated: July 2026</p>

      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-medium text-brand-light mb-2">1. Information We Collect</h2>
          <p>When you authenticate on our platform through Discord OAuth, we collect only the basic data provided by the public Discord API necessary for the operation of the system:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Unique Discord ID</li>
            <li>Username</li>
            <li>Linked email address</li>
            <li>Public avatar</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-medium text-brand-light mb-2">2. Data Use</h2>
          <p>The collected data is used strictly to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Authenticate and identify you in the system.</li>
            <li>Link your profile to internal alliances and groups created within the platform.</li>
            <li>Ensure the security and integrity of the database through our backend.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-medium text-brand-light mb-2">3. Storage and Protection</h2>
          <p>Your profile data is stored privately in a secure database. We do not share, sell, or distribute your information to third parties. No Discord credentials (such as passwords or private tokens) are saved or exposed on the client side.</p>
        </div>

        <div>
          <h2 className="text-xl font-medium text-brand-light mb-2">4. Your Rights</h2>
          <p>You can, at any time, revoke our application&apos;s access directly through your Discord settings, or request the permanent deletion of your profile from our database.</p>
        </div>
      </section>
    </main>
  )
}
