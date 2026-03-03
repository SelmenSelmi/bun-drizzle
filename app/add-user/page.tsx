"use client";

import { useState } from "react";

export default function AddUserPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setStatus("error");
        setMessage(data?.error || "Request failed");
        return;
      }

      setStatus("success");
      setMessage("User added");
      setName("");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(String(err));
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <h2 className="text-2xl font-semibold">Add User</h2>

        <label className="block">
          <span className="text-sm">Name</span>
          <input
            className="mt-1 block w-full rounded border px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm">Email</span>
          <input
            className="mt-1 block w-full rounded border px-3 py-2"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Adding..." : "Add User"}
          </button>
          {status === "success" && <span className="text-green-600">{message}</span>}
          {status === "error" && <span className="text-red-600">{message}</span>}
        </div>
      </form>
    </div>
  );
}
