import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
      <p className="text-muted-foreground mb-6">The page you are looking for does not exist.</p>
      <Link href="/" className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity">
        Go Home
      </Link>
    </div>
  );
}
