import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            ProjectSphere
          </Link>
        </div>

        <div className="flex gap-4">
          <Link href="/projects" className="text-sm font-medium text-gray-700 hover:text-blue-600">
            Explore
          </Link>
          <Link href="/login" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Sign In
          </Link>
        </div>

      </div>
    </nav>
  );
}