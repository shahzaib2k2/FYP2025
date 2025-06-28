import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

const NLPTaskCreator = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleCreate = async () => {
    if (!input.trim()) {
      toast.error("Please enter a task description");
      return;
    }

    setLoading(true);
    try {
      // 1️⃣ Send to Flask API to parse the task
      const parseRes = await axios.post("http://localhost:8001/parse-task", {
        text: input,
      });

      if (!parseRes.data.success) {
        toast.error("NLP parsing failed");
        setLoading(false);
        return;
      }

      const parsed = parseRes.data.data;
      console.log("✅ Parsed result:", parsed);

      // 2️⃣ Send parsed task to Node backend to save
      const taskRes = await axios.post("http://localhost:3000/tasks/nlp-create", parsed);

      if (taskRes.data.success) {
        toast.success(`Task "${taskRes.data.data.title}" created successfully!`);
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        setInput("");
      } else {
        toast.error("Task saving failed");
      }

    } catch (err) {
      console.error("❌ NLP task creation error:", err);
      toast.error("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2 p-4 border rounded shadow-sm">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Describe your task (e.g. Finish report by Monday)"
        className="w-full border rounded-md px-3 py-2"
      />
      <button
        onClick={handleCreate}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Creating…" : "Create Task (NLP)"}
      </button>
    </div>
  );
};

export default NLPTaskCreator;
