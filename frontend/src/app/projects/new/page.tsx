"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewProjectPage() {
  const router = useRouter();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title || !description) {
      setError("Title and Description are required.");
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("You must be logged in to create a project.");
      }

      const payload: any = { title, description };
      if (githubUrl) payload.github_url = githubUrl;
      if (liveUrl) payload.live_url = liveUrl;

      const response = await fetch("http://localhost:8000/projects/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errMsg = Array.isArray(errorData.detail) 
            ? errorData.detail[0].msg 
            : (errorData.detail || "Failed to create project");
        throw new Error(errMsg);
      }

      router.push("/profile");
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link href="/profile" className="text-sm font-medium text-blue-600 hover:text-blue-500">
          &larr; Back to Dashboard
        </Link>
        <h1 className="mt-4 text-3xl font-extrabold text-gray-900">Create a New Project</h1>
        <p className="mt-2 text-sm text-gray-500">Showcase your latest innovation to the world.</p>
      </div>

      <div className="bg-white px-4 py-8 shadow-sm ring-1 ring-gray-200 sm:rounded-lg sm:px-10">
        <form className="space-y-6" onSubmit={handleSubmit}>
          

          <div>
            <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900">
              Project Title <span className="text-red-500">*</span>
            </label>
            <div className="mt-2">
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

   
          <div>
            <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
              Description <span className="text-red-500">*</span>
            </label>
            <div className="mt-2">
              <textarea
                id="description"
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <label htmlFor="githubUrl" className="block text-sm font-medium leading-6 text-gray-900">
              GitHub URL (Optional)
            </label>
            <div className="mt-2">
              <input
                id="githubUrl"
                type="url"
                placeholder="https://github.com/..."
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <label htmlFor="liveUrl" className="block text-sm font-medium leading-6 text-gray-900">
              Live Demo URL (Optional)
            </label>
            <div className="mt-2">
              <input
                id="liveUrl"
                type="url"
                placeholder="https://..."
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
              {error}
            </div>
          )}


          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 disabled:bg-blue-400"
            >
              {isLoading ? "Saving..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}