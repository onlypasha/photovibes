import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="bg-background-light text-neutral-dark min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/gallery" className="text-sm font-semibold hover:text-primary transition-colors">
          Back to Gallery
        </Link>
        <h1 className="text-4xl font-bold mt-6 mb-4">Terms of Use</h1>
        <p className="text-neutral-dark/70 leading-relaxed">
          By using PhotoVibes, you are responsible for the photos you capture and store. Please use
          the app lawfully and respect consent when taking pictures.
        </p>
      </div>
    </main>
  );
}
