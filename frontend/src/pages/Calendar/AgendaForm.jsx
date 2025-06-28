"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { calendarAPI } from "../../services/api"
import toast from "react-hot-toast"

const AgendaForm = ({ selectedDate, onClose, agendaData }) => {
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()
  const isEditMode = !!agendaData

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: agendaData || {
      date: selectedDate.toISOString().split("T")[0],
    },
  })

  const createAgendaMutation = useMutation({
    mutationFn: calendarAPI.createAgenda,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agendas"] })
      toast.success("Agenda item created successfully")
      onClose()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create agenda item")
    },
  })

  const updateAgendaMutation = useMutation({
    mutationFn: (data) => calendarAPI.updateAgenda(agendaData._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agendas"] })
      toast.success("Agenda item updated successfully")
      onClose()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update agenda item")
    },
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    
    try {
      const payload = {
        ...data,
        date: data.date,
        time: data.time || null
      }

      if (isEditMode) {
        await updateAgendaMutation.mutateAsync(payload)
      } else {
        await createAgendaMutation.mutateAsync(payload)
      }
    } catch (error) {
      console.error("Agenda submission error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title *
        </label>
        <input
          {...register("title", { 
            required: "Title is required",
            maxLength: {
              value: 100,
              message: "Title cannot exceed 100 characters"
            }
          })}
          type="text"
          className="input-field mt-1"
          placeholder="Enter agenda title"
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          {...register("description", {
            maxLength: {
              value: 500,
              message: "Description cannot exceed 500 characters"
            }
          })}
          rows={3}
          className="input-field mt-1"
          placeholder="Enter description (optional)"
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date *
          </label>
          <input 
            {...register("date", { required: "Date is required" })} 
            type="date" 
            className="input-field mt-1" 
          />
          {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>}
        </div>

        <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-700">
            Time
          </label>
          <input {...register("time")} type="time" className="input-field mt-1" />
        </div>
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
          Location
        </label>
        <input
          {...register("location")}
          type="text"
          className="input-field mt-1"
          placeholder="Enter location (optional)"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button 
          type="button" 
          onClick={onClose} 
          className="btn-secondary"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading 
            ? (isEditMode ? "Updating..." : "Creating...") 
            : (isEditMode ? "Update Agenda" : "Create Agenda")}
        </button>
      </div>
    </form>
  )
}

export default AgendaForm