import Link from "next/link";

interface Project {
  id: string;
  title: string;
  description: string;
}

async function getProjects() {
  const res = await fetch("http://127.0.0.1:8000/projects/", {
    cache: "no-store", 
  });
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}

export default async function ExploreProjectsPage() {
  const projects: Project[] = await getProjects();
  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
          Explore Projects
        </h1>
        <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
          Discover what the developer community is building.
        </p>
      </div>
        

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div key={project.id} className="flex flex-col overflow-hidden rounded-xl shadow-sm border border-gray-200 bg-white hover:shadow-md transition-shadow duration-200">
              <div className="flex flex-1 flex-col justify-between p-6 sm:p-8">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{project.title}</h3>
                  <p className="mt-3 text-base text-gray-600 line-clamp-3">{project.description}</p>
                </div>
                <div className="mt-8 flex items-center">
                  <Link href={`/projects/${project.id}`} className="text-sm font-semibold text-blue-600 hover:text-blue-500">
                    View Details &rarr;
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-300">
          <h3 className="text-lg font-medium text-gray-900">No projects found</h3>
        </div>
      )}
    </main>
  );
}