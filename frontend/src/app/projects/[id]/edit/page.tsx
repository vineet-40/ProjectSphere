"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`http://localhost:8000/projects/${projectId}`);
        if (!res.ok) throw new Error("Failed to load project data");
        const data = await res.json();
        
        setTitle(data.title);
        setDescription(data.description);
        setGithubUrl(data.github_url || "");
        setLiveUrl(data.live_url || "");
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsFetching(false);
      }
    };
    fetchProject();
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("You must be logged in.");

      const payload: any = { title, description };
      if (githubUrl) payload.github_url = githubUrl;
      if (liveUrl) payload.live_url = liveUrl;

      const response = await fetch(`http://localhost:8000/projects/${projectId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errMsg = Array.isArray(errorData.detail) ? errorData.detail[0].msg : errorData.detail;
        throw new Error(errMsg || "Failed to update project");
      }

      router.push("/profile");
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <div className="text-center py-20 text-gray-500">Loading project...</div>;

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link href="/profile" className="text-sm font-medium text-blue-600 hover:text-blue-500">
          &larr; Back to Dashboard
        </Link>
        <h1 className="mt-4 text-3xl font-extrabold text-gray-900">Edit Project</h1>
      </div>

      <div className="bg-white px-4 py-8 shadow-sm ring-1 ring-gray-200 sm:rounded-lg sm:px-10">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-900">Project Title *</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="mt-2 block w-full rounded-md border-0 py-1.5 px-3 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Description *</label>
            <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-2 block w-full rounded-md border-0 py-1.5 px-3 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">GitHub URL</label>
            <input type="url" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} className="mt-2 block w-full rounded-md border-0 py-1.5 px-3 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Live Demo URL</label>
            <input type="url" value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} className="mt-2 block w-full rounded-md border-0 py-1.5 px-3 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm" />
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">{error}</div>}

          <button type="submit" disabled={isLoading} className="w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:bg-blue-400">
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </main>
  );
}