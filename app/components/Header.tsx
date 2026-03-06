import Link from "next/link";
import { Images } from "lucide-react";

export default function Header() {
  return (
    <header className="absolute top-0 right-0 left-0 px-8 py-6 flex justify-end items-center z-10 pointer-events-none">
      <div className="flex gap-4 pointer-events-auto">
        <Link
          href="/gallery"
          className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <Images className="w-5 h-5 text-gray-600" />
        </Link>
      </div>
    </header>
  );
}
