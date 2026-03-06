import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="bg-background-light text-neutral-dark min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/gallery" className="text-sm font-semibold hover:text-primary transition-colors">
          Back to Gallery
        </Link>
        <h1 className="text-4xl font-bold mt-6 mb-4">Privacy Policy</h1>
        <p className="text-neutral-dark/70 leading-relaxed">
          PhotoVibes stores your captured photos locally in your browser storage. We do not upload
          your images to a remote server in this version.
        </p>
      </div>
    </main>
  );
}
