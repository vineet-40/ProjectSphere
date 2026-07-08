"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
    >
      &larr; Go Back
    </button>
  );
}