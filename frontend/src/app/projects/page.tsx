import ProjectCard from "@/components/ProjectCard";

const mockProjects = [
  {
    id: "1",
    title: "EcoTrack API",
    description: "A REST API built with FastAPI and PostgreSQL that allows users to log and track their daily carbon footprint. Includes data visualization endpoints.",
    tags: ["Python", "FastAPI", "PostgreSQL"],
  },
  {
    id: "2",
    title: "Neuro-Net Visualizer",
    description: "An interactive web application that visualizes how neural networks process information in real-time. Built for educational purposes.",
    tags: ["React", "TypeScript", "Tailwind CSS"],
  },
  {
    id: "3",
    title: "Campus Marketplace",
    description: "A secure, student-only marketplace for buying and selling textbooks and dorm furniture. Uses JWT authentication and role-based access.",
    tags: ["Next.js", "Node.js", "MongoDB"],
  },
  {
    id: "4",
    title: "Rust CLI File Manager",
    description: "A lightning-fast command-line interface for managing files, with built-in batch renaming and regex search capabilities.",
    tags: ["Rust", "CLI", "Systems"],
  }
];

export default function ProjectsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      

      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Explore Projects</h1>
          <p className="mt-2 text-sm text-gray-600">
            Discover the latest innovations from the student community.
          </p>
        </div>
        

        <div className="w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search projects..."
            className="block w-full rounded-md border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>


      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {mockProjects.map((project) => (
          <ProjectCard
            key={project.id}
            id={project.id}
            title={project.title}
            description={project.description}
            tags={project.tags}
          />
        ))}
      </div>
      
    </main>
  );
}