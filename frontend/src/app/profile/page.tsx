"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Project {
  id: string;
  title: string;
  description: string;
  github_url?: string;
  live_url?: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatar_url?: string;
  projects: Project[];
}

export default function ProfilePage() {
  const router = useRouter();
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch("http://localhost:8000/users/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token");
            router.push("/login");
            return;
          }
          throw new Error("Failed to fetch profile data");
        }

        const data = await response.json();
        setUser(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-lg font-medium text-gray-500">Loading your dashboard...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 flex-col gap-4">
        <p className="text-lg font-medium text-red-600">{error}</p>
        <button onClick={handleLogout} className="text-blue-600 hover:underline">
          Return to Login
        </button>
      </main>
    );
  }


  const handleDelete = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project? This cannot be undone.")) {
      return;
    }

    const token = localStorage.getItem("token");
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/projects/${projectId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      setUser((prevUser) => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          projects: prevUser.projects.filter((p) => p.id !== projectId)
        };
      });

    } catch (err: any) {
      alert(err.message);
    }
  };


  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      
      <div className="flex items-center justify-between border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-extrabold text-gray-900">Creator Dashboard</h1>
        <button
          onClick={handleLogout}
          className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          Sign out
        </button>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-medium leading-6 text-gray-900">Personal Information</h2>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-500">
            Edit Profile
          </button>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Full name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{user?.name}</dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Email address</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{user?.email}</dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Bio</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {user?.bio || <span className="text-gray-400 italic">No bio provided yet.</span>}
              </dd>
            </div>
          </dl>
        </div>
      </div>

    <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Projects</h2>
          <Link
            href="/projects/new"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            + New Project
          </Link>
        </div>
        
        {user?.projects && user.projects.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {user.projects.map((project) => (
              <div key={project.id} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{project.title}</h3>
                  <p className="mt-2 text-sm text-gray-500 line-clamp-3">{project.description}</p>
                </div>
                <div className="mt-4 flex gap-3">
                   <Link href={`/projects/${project.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                     View details
                   </Link>

                   <button 
                     onClick={() => handleDelete(project.id)}
                     className="text-sm font-medium text-red-600 hover:text-red-500 hover:underline"
                   >
                     Delete
                   </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <p className="text-sm text-gray-500">You haven't uploaded any projects yet.</p>
          </div>
        )}
      </div>

    </main>
  );
}