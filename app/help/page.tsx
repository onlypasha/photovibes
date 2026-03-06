import Link from "next/link";

export default function HelpPage() {
  return (
    <main className="bg-background-light text-neutral-dark min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/gallery" className="text-sm font-semibold hover:text-primary transition-colors">
          Back to Gallery
        </Link>
        <h1 className="text-4xl font-bold mt-6 mb-4">Help</h1>
        <p className="text-neutral-dark/70 leading-relaxed">
          If the camera does not start, check browser permissions and make sure no other app is
          using the camera. If gallery storage is full, delete older photos from the gallery.
        </p>
      </div>
    </main>
  );
}
