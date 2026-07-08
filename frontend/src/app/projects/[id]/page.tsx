import Link from "next/link";
import { notFound } from "next/navigation";
import BackButton from "../../../components/BackButton";

async function getProject(id: string) {
  const res = await fetch(`http://127.0.0.1:8000/projects/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 404) {
      return null;
    }
    throw new Error("Failed to fetch project");
  }

  return res.json();
}


export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const project = await getProject(resolvedParams.id);

  if (!project) {
    notFound(); 
  }

return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      
      <div className="mb-8">
        <BackButton />
      </div>

      <div className="border-b border-gray-200 pb-8">
        <h1 className="text-4xl font-extrabold text-gray-900">{project.title}</h1>
        
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <span>Published on ProjectSphere</span>
        </div>
      </div>

      <div className="my-8 flex gap-4">
        {project.github_url && (
          <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="inline-flex justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800">
            View Source (GitHub)
          </a>
        )}
        {project.live_url && (
          <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="inline-flex justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
            Visit Live Site
          </a>
        )}
      </div>

      <div className="prose prose-blue max-w-none text-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">About the Project</h2>
        <p className="whitespace-pre-wrap leading-relaxed">{project.description}</p>
      </div>

    </main>
  );
}