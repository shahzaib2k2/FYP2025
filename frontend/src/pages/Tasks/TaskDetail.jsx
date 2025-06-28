"use client"

import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { taskAPI, teamAPI } from "../../services/api"
import { ArrowLeft, Edit, Trash2, Calendar, Flag, CheckCircle, User } from "lucide-react"
import Modal from "../../components/UI/Modal"
import TaskForm from "./TaskForm"
import LoadingSpinner from "../../components/UI/LoadingSpinner"
import toast from "react-hot-toast"

const TaskDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const queryClient = useQueryClient()

  // Fetch task details
  const { data: task, isLoading } = useQuery({
    queryKey: ["task", id],
    queryFn: () => taskAPI.getTask(id),
  })

  // Fetch assignee details only if task has an assignee
  const { data: assignee, isLoading: isAssigneeLoading } = useQuery({
    queryKey: ["assignee", task?.data?.assignee],
    queryFn: () => teamAPI.getTeamMember(task.data.assignee),
    enabled: !!task?.data?.assignee
  })

  const deleteTaskMutation = useMutation({
    mutationFn: taskAPI.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      toast.success("Task deleted successfully")
      navigate("/tasks")
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete task")
    },
  })

  const handleDeleteTask = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate(id)
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!task?.data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Task not found</p>
        <button 
          onClick={() => navigate("/tasks")} 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-4"
        >
          Back to Tasks
        </button>
      </div>
    )
  }

  const taskData = task.data
  const hasAssignee = !!taskData.assignee
  const assigneeDisplay = hasAssignee 
    ? (isAssigneeLoading 
        ? "Loading..." 
        : assignee?.data?.name || "Team Member")
    : "Unassigned"
  const assigneeEmail = hasAssignee ? assignee?.data?.email : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate("/tasks")} 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Back to tasks"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{taskData.title}</h1>
            <p className="text-gray-600">Task Details</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsEditModalOpen(true)} 
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </button>
          <button
            onClick={handleDeleteTask}
            disabled={deleteTaskMutation.isPending}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg leading-6 font-medium text-gray-900">Task Information</h2>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
              <dl className="sm:divide-y sm:divide-gray-200">
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Title</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {taskData.title}
                  </dd>
                </div>
                {taskData.description && (
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {taskData.description}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {taskData.txHash && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg leading-6 font-medium text-gray-900">Blockchain Information</h2>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                <dl className="sm:divide-y sm:divide-gray-200">
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Transaction Hash</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-mono break-all sm:mt-0 sm:col-span-2">
                      {taskData.txHash}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Task Details</h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
              <dl className="sm:divide-y sm:divide-gray-200">
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="flex items-center text-sm font-medium text-gray-500">
                    <User className="h-4 w-4 mr-2 text-gray-400" />
                    Assignee
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div className="font-medium">{assigneeDisplay}</div>
                    {assigneeEmail && (
                      <div className="text-gray-500 text-xs mt-1">{assigneeEmail}</div>
                    )}
                  </dd>
                </div>

                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="flex items-center text-sm font-medium text-gray-500">
                    <CheckCircle className="h-4 w-4 mr-2 text-gray-400" />
                    Status
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      taskData.status === "Completed"
                        ? "bg-green-100 text-green-800"
                        : taskData.status === "In Progress"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                    }`}>
                      {taskData.status}
                    </span>
                  </dd>
                </div>

                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="flex items-center text-sm font-medium text-gray-500">
                    <Flag className="h-4 w-4 mr-2 text-gray-400" />
                    Priority
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      taskData.priority === "High"
                        ? "bg-red-100 text-red-800"
                        : taskData.priority === "Medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                    }`}>
                      {taskData.priority}
                    </span>
                  </dd>
                </div>

                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="flex items-center text-sm font-medium text-gray-500">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    Due Date
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {new Date(taskData.dueDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </dd>
                </div>

                {taskData.createdAt && (
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {new Date(taskData.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Task Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Task" size="large">
        <TaskForm task={taskData} onClose={() => setIsEditModalOpen(false)} />
      </Modal>
    </div>
  )
}

export default TaskDetail