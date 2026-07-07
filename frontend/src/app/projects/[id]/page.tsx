import Link from "next/link";

async function getMockProject(id: string) {
  return {
    id: id,
    title: "EcoTrack API",
    description: "A REST API built with FastAPI and PostgreSQL that allows users to log and track their daily carbon footprint. Includes data visualization endpoints.\n\nThis project aims to solve global tracking inaccuracies by providing a unified schema for carbon footprint calculation. The architecture heavily relies on asynchronous database queries for maximum performance.",
    tags: ["Python", "FastAPI", "PostgreSQL"],
    github_url: "https://github.com",
    live_url: "https://example.com",
    creator_name: "Student Developer",
    created_at: "July 7, 2026",
  };
}


export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const project = await getMockProject(resolvedParams.id);

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      

      <div className="mb-8">
        <Link href="/projects" className="text-sm font-medium text-blue-600 hover:text-blue-500">
          &larr; Back to all projects
        </Link>
      </div>


      <div className="border-b border-gray-200 pb-8">
        <h1 className="text-4xl font-extrabold text-gray-900">{project.title}</h1>
        
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <span>By {project.creator_name}</span>
          <span>&bull;</span>
          <span>Published on {project.created_at}</span>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span key={tag} className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-sm font-medium text-gray-800">
              {tag}
            </span>
          ))}
        </div>
      </div>


      <div className="my-8 flex gap-4">
        <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="inline-flex justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800">
          View Source (GitHub)
        </a>
        <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="inline-flex justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
          Visit Live Site
        </a>
      </div>


      <div className="prose prose-blue max-w-none text-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">About the Project</h2>

        <p className="whitespace-pre-wrap leading-relaxed">{project.description}</p>
      </div>

    </main>
  );
}