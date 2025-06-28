"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { taskAPI } from "../../services/api";
import toast from "react-hot-toast";

const TaskForm = ({ task, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [storeOnChain, setStoreOnChain] = useState(false);
  const [assigneeInput, setAssigneeInput] = useState(task?.assignee || "");
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: task
      ? {
          title: task.title || "",
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
          priority: task.priority || "Auto",
        }
      : {
          title: "",
          dueDate: "",
          priority: "Auto",
        },
  });

  const createTaskMutation = useMutation({
    mutationFn: taskAPI.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task created successfully");
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create task");
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: (data) => taskAPI.updateTask(task._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", task._id] });
      toast.success("Task updated successfully");
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update task");
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const payload = {
        title: data.title,
        assignee: assigneeInput || "Unassigned",
        dueDate: new Date(data.dueDate).toISOString(),
        priority: data.priority,
        storeOnChain
      };

      if (task) {
        await updateTaskMutation.mutateAsync(payload);
      } else {
        await createTaskMutation.mutateAsync(payload);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to save task");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Task Title</label>
        <input
          {...register("title", { required: "Task title is required" })}
          type="text"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          placeholder="Enter task title"
        />
        {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
      </div>

      <div>
        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Due Date</label>
        <input
          {...register("dueDate", {
            required: "Due date is required",
            validate: (value) => {
              if (new Date(value) < new Date()) return "Due date cannot be in the past";
              return true;
            },
          })}
          type="date"
          min={new Date().toISOString().split("T")[0]}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
        />
        {errors.dueDate && <p className="text-sm text-red-600">{errors.dueDate.message}</p>}
      </div>

      <div>
        <label htmlFor="assignee" className="block text-sm font-medium text-gray-700">Assignee</label>
        <input
          type="text"
          value={assigneeInput}
          onChange={(e) => setAssigneeInput(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          placeholder="Enter assignee name (e.g. ali)"
        />
      </div>

      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
        <select
          {...register("priority")}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
        >
          <option value="Auto">Auto</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={storeOnChain}
            onChange={(e) => setStoreOnChain(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <span className="text-sm font-medium text-gray-700">Store on Blockchain</span>
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? "Saving..." : task ? "Update Task" : "Create Task"}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;