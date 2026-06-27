"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function ResubscribeEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams?.get("email") || "";
  const token = searchParams?.get("token") || "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!email || !token) {
      setStatus("error");
      setMessage("Missing email or token.");
      return;
    }
    const fetchResubscribe = async () => {
      try {
        const res = await fetch(`/api/proxy/user-profiles/resubscribe-email?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setStatus("error");
          setMessage(data?.error || "Failed to resubscribe. Please try again later.");
        } else {
          const data = await res.json();
          setStatus("success");
          setMessage(data || "You have been resubscribed to emails.");
        }
      } catch (e) {
        setStatus("error");
        setMessage("Network error. Please try again later.");
      }
    };
    fetchResubscribe();
  }, [email, token]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md border border-gray-200">
        <h1 className="text-2xl font-bold mb-4 text-center">Resubscribe to Emails</h1>
        {status === "loading" && (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500 mb-4" />
            <p className="text-gray-600">Processing your request...</p>
          </div>
        )}
        {status !== "loading" && (
          <div className="flex flex-col items-center">
            <p className={`mb-4 text-center ${status === "success" ? "text-green-600" : "text-red-600"}`}>{message}</p>
            {status === "success" && (
              <button
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                onClick={() => router.push(`/unsubscribe-email?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`)}
              >
                Unsubscribe
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}