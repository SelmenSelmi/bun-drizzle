"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("userName") || "";
      const storedRole = localStorage.getItem("userRole") || "";
      setName(stored);
      setRole(storedRole);
    } catch (e) {
      setName("");
    }
  }, []);

  function handleLogout() {
    try {
      localStorage.removeItem("userName");
      localStorage.removeItem("userRole");
    } catch (e) {
      // ignore
    }
    setName("");
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-3xl font-bold">
          Welcome{ name ? `: ${name}` : "" }{role ? ` · ${role}` : ""}
        </h1>

        {role === "admin" && <TopicManager />}

        <QuestionBox onLogout={handleLogout} role={role} />
      </div>
    </div>
  );
}

function TopicManager() {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "added" | "error">("idle");

  async function addTopic() {
    if (!name.trim()) return;
    try {
      const role = (() => {
        try {
          return localStorage.getItem("userRole") || null;
        } catch (e) {
          return null;
        }
      })();

      const res = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), role }),
      });

      if (!res.ok) {
        setStatus("error");
        return;
      }

      setName("");
      setStatus("added");
      // notify other components to refresh topics
      window.dispatchEvent(new CustomEvent("topics-updated"));
      setTimeout(() => setStatus("idle"), 1500);
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  }

  return (
    <div className="mt-6 text-left mb-6">
      <h2 className="text-lg font-semibold">Manage Topics</h2>
      <div className="mt-2 flex gap-2">
        <input className="flex-1 rounded border px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} placeholder="New topic name" />
        <button className="rounded bg-green-600 px-4 py-2 text-white" onClick={addTopic} disabled={!name.trim()}>Add</button>
      </div>
      {status === "added" && <div className="text-green-600 mt-2">Topic added</div>}
      {status === "error" && <div className="text-red-600 mt-2">Failed to add topic</div>}
    </div>
  );
}

function QuestionBox({ onLogout, role }: { onLogout: () => void; role?: string }) {
  const [text, setText] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [topics, setTopics] = useState<Array<{ id: number; name: string }>>([]);
  const [selectedTopic, setSelectedTopic] = useState<number>(0);
  const [status, setStatus] = useState<"idle" | "added">("idle");

  useEffect(() => {
    // fetch questions for the currently selected topic (or all when selectedTopic is 0)
    async function fetchQuestions(topicId: number) {
      try {
        const url = topicId && topicId > 0 ? `/api/questions?topicId=${topicId}` : "/api/questions";
        const res = await fetch(url);
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        if (Array.isArray(data)) setQuestions(data.map((d: any) => d.content));
        else setQuestions([]);
      } catch (e) {
        setQuestions([]);
      }
    }

    fetchQuestions(selectedTopic);

    // load topics
    async function loadTopicsOnce() {
      try {
        const r = await fetch("/api/topics");
        if (!r.ok) return;
        const t = await r.json();
        if (Array.isArray(t)) setTopics(t);
      } catch (e) {}
    }
    loadTopicsOnce();

    function onTopicsUpdated() {
      loadTopicsOnce();
      fetchQuestions(selectedTopic);
    }
    window.addEventListener("topics-updated", onTopicsUpdated);
    return () => window.removeEventListener("topics-updated", onTopicsUpdated);
  }, [selectedTopic]);

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
        body: JSON.stringify({ content: text.trim(), author, topicId: selectedTopic }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error(err);
        return;
      }

      // Refresh questions for the selected topic to reflect server state
      setText("");
      setStatus("added");
      setTimeout(() => setStatus("idle"), 1500);
      // re-fetch questions for current topic
      try {
        const url = selectedTopic && selectedTopic > 0 ? `/api/questions?topicId=${selectedTopic}` : "/api/questions";
        const r2 = await fetch(url);
        if (r2.ok) {
          const d2 = await r2.json();
          if (Array.isArray(d2)) setQuestions(d2.map((x: any) => x.content));
        }
      } catch (e) {}
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
      <div className="mb-4">
        <label className="block">
          <span className="text-sm">Topic</span>
          <select className="mt-1 block w-full rounded border px-3 py-2" value={selectedTopic} onChange={(e) => setSelectedTopic(Number(e.target.value))}>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </label>
      </div>
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
