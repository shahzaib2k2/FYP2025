"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { taskAPI } from "../../services/api"
import { Plus, Search, MoreVertical, Trash2, ArrowRight } from "lucide-react"
import Modal from "../../components/UI/Modal"
import TaskForm from "./TaskForm"
import LoadingSpinner from "../../components/UI/LoadingSpinner"
import toast from "react-hot-toast"

const Tasks = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  const queryClient = useQueryClient()
  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: taskAPI.getAllTasks,
  })

  const deleteTaskMutation = useMutation({
    mutationFn: taskAPI.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      toast.success("Task deleted successfully")
    },
    onError: () => {
      toast.error("Failed to delete task")
    },
  })

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate(taskId)
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  const taskData = tasks?.data || []

  // Filter tasks
  const filteredTasks = taskData.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  return (
    <div className="space-y-10 p-10 bg-gradient-to-br from-gray-50 to-gray-200 min-h-screen">
      {/* Header */}
      <div className="animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Tasks</h1>
            <p className="mt-3 text-xl text-gray-600">Manage your tasks and track progress</p>
          </div>
          <div className="flex space-x-4">
            <Link
              to="/transactions"
              className="btn-secondary flex items-center space-x-2 bg-gray-100 text-gray-900 px-6 py-3 rounded-xl shadow-md hover:bg-gray-200 transition-all duration-200"
              aria-label="View Transactions"
            >
              <ArrowRight className="h-5 w-5" />
              <span>View Transactions</span>
            </Link>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn-primary flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl shadow-md hover:bg-blue-700 transition-all duration-200"
              aria-label="Create New Task"
            >
              <Plus className="h-5 w-5" />
              <span>Create Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card bg-white shadow-lg rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 animate-fade-in">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900 placeholder-gray-500 transition-all duration-200"
                aria-label="Search tasks"
              />
            </div>
          </div>
          <div className="flex gap-6">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900 w-40 transition-all duration-200"
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900 w-40 transition-all duration-200"
              aria-label="Filter by priority"
            >
              <option value="all">All Priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
        {filteredTasks.map((task) => (
          <div
            key={task._id}
            className="card bg-white shadow-lg rounded-2xl p-6 border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-5 h-5 rounded-full ${
                  task.priority === "High"
                    ? "bg-red-500"
                    : task.priority === "Medium"
                      ? "bg-yellow-500"
                      : "bg-green-500"
                } shadow-sm`}
              ></div>
              <div className="relative">
                <button
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  aria-label="More options"
                >
                  <MoreVertical className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <Link to={`/tasks/${task._id}`} className="block">
              <h3 className="font-bold text-gray-900 text-lg mb-3 hover:text-blue-600 transition-colors duration-200">
                {task.title}
              </h3>
            </Link>

            <div className="space-y-3 mb-5">
              <div className="flex items-center justify-between text-base">
                <span className="text-gray-500 font-medium">Status:</span>
                <span
                  className={`px-4 py-1.5 text-sm font-semibold rounded-full ${
                    task.status === "Completed"
                      ? "bg-green-100 text-green-800"
                      : task.status === "In Progress"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                  } shadow-sm`}
                >
                  {task.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-base">
                <span className="text-gray-500 font-medium">Priority:</span>
                <span
                  className={`px-4 py-1.5 text-sm font-semibold rounded-full ${
                    task.priority === "High"
                      ? "bg-red-100 text-red-800"
                      : task.priority === "Medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                  } shadow-sm`}
                >
                  {task.priority}
                </span>
              </div>
              <div className="flex items-center justify-between text-base">
                <span className="text-gray-500 font-medium">Due Date:</span>
                <span className="text-gray-900 font-medium">
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : 'No due date'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <Link
                to={`/tasks/${task._id}`}
                className="text-blue-600 hover:text-blue-800 text-base font-semibold transition-colors duration-200"
                aria-label={`View details for ${task.title}`}
              >
                View Details
              </Link>
              <button
                onClick={() => handleDeleteTask(task._id)}
                className={`p-2 rounded-full transition-colors duration-200 ${
                  deleteTaskMutation.isPending
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-red-600 hover:bg-red-100"
                }`}
                disabled={deleteTaskMutation.isPending}
                aria-label={`Delete ${task.title}`}
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12 animate-fade-in">
          <p className="text-gray-500 text-lg font-medium mb-6">No tasks found</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary bg-blue-600 text-white px-8 py-4 rounded-xl shadow-md hover:bg-blue-700 transition-all duration-200 text-base font-semibold"
            aria-label="Create your first task"
          >
            Create your first task
          </button>
        </div>
      )}

      {/* Create Task Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Task"
        size="large"
      >
        <TaskForm onClose={() => setIsCreateModalOpen(false)} />
      </Modal>
    </div>
  )
}

export default Tasks