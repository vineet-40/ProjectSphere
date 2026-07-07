import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center px-6 py-24 text-center sm:py-32">
      <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight sm:text-6xl">
        Showcase Your <span className="text-blue-600">Innovation</span>
      </h1>
      
      <p className="mt-6 max-w-2xl text-lg text-gray-600">
        ProjectSphere is the definitive platform for students to share their technical projects, discover collaborators, and build a lasting public portfolio.
      </p>
      
      <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/projects" className="rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-500">
          Explore Projects
        </Link>
        <Link href="/login" className="rounded-md bg-white px-6 py-3 text-base font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
          Share Your Work
        </Link>
      </div>
    </main>
  );
}