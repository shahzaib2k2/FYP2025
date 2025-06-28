"use client";
import { ethers } from "ethers";
import contractABI from "../../contract/TaskManager.json";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { taskAPI, teamAPI } from "../../services/api";
import toast from "react-hot-toast";
import axios from "axios";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your deployed contract address

const TaskForm = ({ task, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showCustomAssignee, setShowCustomAssignee] = useState(false);
  const [customAssignee, setCustomAssignee] = useState("");
  const [nlpDescription, setNlpDescription] = useState("");
  const [nlpLoading, setNlpLoading] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: task
      ? {
          title: task.title || "",
          dueDate: task.dueDate
            ? new Date(task.dueDate).toISOString().split("T")[0]
            : "",
          assignee: task.assignee || "",
          priority: task.priority || "Auto",
        }
      : {
          title: "",
          dueDate: "",
          assignee: "",
          priority: "Auto",
        },
  });

  const assigneeWatch = watch("assignee");

  useEffect(() => {
    setShowCustomAssignee(assigneeWatch === "Other");
  }, [assigneeWatch]);

  const { data: teamMembers } = useQuery({
    queryKey: ["team-members"],
    queryFn: teamAPI.getTeamMembers,
  });

  const createTaskMutation = useMutation({
    mutationFn: taskAPI.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: () => {
      toast.error("Failed to create task");
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: (data) => taskAPI.updateTask(task._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", task._id] });
    },
    onError: () => {
      toast.error("Failed to update task");
    },
  });

  const handleNlpGenerate = async () => {
    if (!nlpDescription.trim()) {
      toast.error("Please enter a task description");
      return;
    }
    setNlpLoading(true);
    try {
      const res = await axios.post("http://localhost:8001/parse-task", {
        description: nlpDescription,
      });

      const data = res.data.data;
      if (data) {
        setValue("title", data.title || "");
        setValue(
          "dueDate",
          data.due_date
            ? new Date(data.due_date).toISOString().split("T")[0]
            : ""
        );
        setValue("assignee", data.assignee || "");
        toast.success("Task generated from NLP");
      } else {
        toast.error("AI did not return any task data");
      }
    } catch (err) {
      console.error("NLP API error:", err);
      toast.error("Failed to generate task from NLP");
    } finally {
      setNlpLoading(false);
    }
  };

  const onSubmit = async (data) => {
  setIsLoading(true);
  try {
    const payload = {
      title: data.title,
      assignee: data.assignee === "Other" ? customAssignee : data.assignee,
      dueDate: new Date(data.dueDate).toISOString(),
      priority: data.priority,
    };

    console.log("Submitting task:", payload);  // ✅ Add this for debugging

    let response;
    if (task) {
      response = await updateTaskMutation.mutateAsync(payload);
    } else {
      response = await createTaskMutation.mutateAsync(payload);
    }

    if (data.priority === "Auto" && response?.data?.data?.priority) {
      toast.success(`AI assigned priority: ${response.data.data.priority}`);
    } else {
      toast.success(`Task ${task ? "updated" : "created"} successfully`);
    }

    onClose();
  } catch (err) {
    console.error("Error:", err);
    toast.error(err.message || "Something went wrong");
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="space-y-4">
      {/* NLP Input */}
      <div className="space-y-2">
        <textarea
          value={nlpDescription}
          onChange={(e) => setNlpDescription(e.target.value)}
          placeholder="Type task in natural language (e.g. Finish report by tomorrow assigned to Alice)"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          rows={3}
        />
        <button
          type="button"
          onClick={handleNlpGenerate}
          disabled={nlpLoading}
          className="px-3 py-2 rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
        >
          {nlpLoading ? "Generating..." : "Generate Task from Description"}
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Task Title
          </label>
          <input
            {...register("title", { required: "Task title is required" })}
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
            placeholder="Enter task title"
          />
          {errors.title && (
            <p className="text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Due Date
          </label>
          <input
            {...register("dueDate", {
              required: "Due date is required",
              validate: (value) =>
                new Date(value) >= new Date() ||
                "Due date cannot be in the past",
            })}
            type="date"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
          {errors.dueDate && (
            <p className="text-sm text-red-600">{errors.dueDate.message}</p>
          )}
        </div>

        {/* Assignee */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Assignee
          </label>
          <select
            {...register("assignee", { required: "Assignee is required" })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          >
            <option value="">Select an assignee</option>
            {(teamMembers?.data || []).map((member) => (
              <option key={member._id} value={member.name}>
                {member.name}
              </option>
            ))}
            <option value="Other">Other</option>
          </select>
          {showCustomAssignee && (
            <input
              type="text"
              value={customAssignee}
              onChange={(e) => setCustomAssignee(e.target.value)}
              placeholder="Enter custom assignee"
              className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          )}
          {errors.assignee && (
            <p className="text-sm text-red-600">{errors.assignee.message}</p>
          )}
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Priority
          </label>
          <select
            {...register("priority")}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          >
            <option value="Auto">Auto (Let AI decide)</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading
              ? "Saving..."
              : task
              ? "Update Task"
              : "Create Task"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
