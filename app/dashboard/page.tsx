"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [name, setName] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("userName") || "";
      setName(stored);
    } catch (e) {
      setName("");
    }
  }, []);

  function handleLogout() {
    try {
      localStorage.removeItem("userName");
    } catch (e) {
      // ignore
    }
    setName("");
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-3xl font-bold">Welcome{ name ? `: ${name}` : "" }</h1>


        <QuestionBox onLogout={handleLogout} />
      </div>
    </div>
  );
}

function QuestionBox({ onLogout }: { onLogout: () => void }) {
  const [text, setText] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "added">("idle");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/questions");
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        // data is an array of { id, author_name, content }
        if (Array.isArray(data)) setQuestions(data.map((d: any) => d.content));
      } catch (e) {
        setQuestions([]);
      }
    }
    load();
  }, []);

  async function addQuestion() {
    if (!text.trim()) return;
    try {
      const author = (() => {
        try {
          return localStorage.getItem("userName") || null;
        } catch (e) {
          return null;
        }
      })();

      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text.trim(), author }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error(err);
        return;
      }

      // Prepend locally for immediate UX
      setQuestions((prev) => [text.trim(), ...prev]);
      setText("");
      setStatus("added");
      setTimeout(() => setStatus("idle"), 1500);
    } catch (e) {
      console.error(e);
    }
  }

  async function clearQuestions() {
    try {
      // no server-side delete implemented; clear local view only
      setQuestions([]);
    } catch (e) {}
  }

  return (
    <div className="mt-6 text-left">
      <label className="block">
        <span className="text-sm">Your question</span>
        <textarea
          className="mt-1 block w-full rounded border px-3 py-2"
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your question here..."
        />
      </label>

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={addQuestion}
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
          disabled={!text.trim()}
        >
          Add Question
        </button>
        <button
          type="button"
          onClick={clearQuestions}
          className="rounded bg-gray-500 px-3 py-2 text-white"
        >
          Clear All
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="ml-auto rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
        >
          Logout
        </button>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold">Questions</h2>
        {questions.length === 0 ? (
          <p className="text-sm text-gray-500 mt-2">No questions yet.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {questions.map((q, i) => (
              <li key={i} className="border rounded p-3 bg-white">
                {q}
              </li>
            ))}
          </ul>
        )}
        {status === "added" && <div className="text-green-600 mt-2">Question added</div>}
      </div>
    </div>
  );
}
