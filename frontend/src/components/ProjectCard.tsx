import Link from "next/link";

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  tags: string[];
}

export default function ProjectCard({ id, title, description, tags }: ProjectCardProps) {
  return (
    <div className="group flex h-full flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-blue-500 hover:shadow-md">
      
      <div>
        <h3 className="text-xl font-bold text-gray-900 transition-colors group-hover:text-blue-600">
          {title}
        </h3>
        
        <p className="mt-3 text-sm text-gray-600 line-clamp-3">
          {description}
        </p>
        
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <Link
          href={`/projects/${id}`}
          className="text-sm font-semibold text-blue-600 hover:text-blue-500"
        >
          View Details &rarr;
        </Link>
      </div>
      
    </div>
  );
}