// "use client"

// import { useState } from "react"
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
// import { useDropzone } from "react-dropzone"
// import { fileAPI } from "../../services/api"
// import { Upload, File, Download, Trash2, Search, Image, FileText, FileArchive } from "lucide-react"
// import LoadingSpinner from "../../components/UI/LoadingSpinner"
// import toast from "react-hot-toast"

// const Files = () => {
//   const [searchTerm, setSearchTerm] = useState("")
//   const [isUploading, setIsUploading] = useState(false)
//   const queryClient = useQueryClient()

//   // Fetch files with proper error handling
//   const { data: files, isLoading, error } = useQuery({
//     queryKey: ["files"],
//     queryFn: async () => {
//       const response = await fileAPI.getFiles()
//       return response.data // Ensure this matches your backend response
//     },
//     onError: (err) => {
//       toast.error(`Failed to load files: ${err.message}`)
//     }
//   })

//   // File upload mutation
//   const uploadFilesMutation = useMutation({
//     mutationFn: fileAPI.uploadFiles,
//     onSuccess: (response) => {
//       queryClient.invalidateQueries({ queryKey: ["files"] })
//       toast.success(`${response.data.files.length} file(s) uploaded successfully`)
//     },
//     onError: (error) => {
//       toast.error(`Upload failed: ${error.message}`)
//     },
//     onSettled: () => {
//       setIsUploading(false)
//     }
//   })

//   // File delete mutation
//   const deleteFileMutation = useMutation({
//     mutationFn: fileAPI.deleteFile,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["files"] })
//       toast.success("File deleted successfully")
//     },
//     onError: (error) => {
//       toast.error(`Delete failed: ${error.message}`)
//     }
//   })

//   const onDrop = (acceptedFiles) => {
//   if (acceptedFiles.length > 0) {
//     setIsUploading(true)
//     const formData = new FormData()
//     acceptedFiles.forEach((file) => {
//       formData.append("files", file)
//     })
//     uploadFilesMutation.mutate(formData)
//   }
// }


//   const { getRootProps, getInputProps, isDragActive } = useDropzone({
//     onDrop,
//     multiple: true,
//     maxSize: 100 * 1024 * 1024, // 100MB
//     accept: {
//       'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
//       'application/pdf': ['.pdf'],
//       'application/zip': ['.zip', '.rar'],
//       'text/plain': ['.txt'],
//       'application/msword': ['.doc'],
//       'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
//     }
//   })

//   const handleDelete = async (fileId, fileName) => {
//     if (window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
//       try {
//         await deleteFileMutation.mutateAsync(fileId)
//       } catch (error) {
//         console.error("Delete error:", error)
//       }
//     }
//   }

//   const handleDownload = async (fileId, fileName) => {
//     try {
//       const response = await fileAPI.downloadFile(fileId)
//       const url = window.URL.createObjectURL(new Blob([response.data]))
//       const link = document.createElement('a')
//       link.href = url
//       link.setAttribute('download', fileName)
//       document.body.appendChild(link)
//       link.click()
//       link.parentNode.removeChild(link)
//     } catch (error) {
//       toast.error(`Download failed: ${error.message}`)
//     }
//   }

//   const formatFileSize = (bytes) => {
//     if (bytes === 0) return "0 Bytes"
//     const k = 1024
//     const sizes = ["Bytes", "KB", "MB", "GB"]
//     const i = Math.floor(Math.log(bytes) / Math.log(k))
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
//   }

//   const getFileIcon = (fileName) => {
//     const extension = fileName.split('.').pop()?.toLowerCase()
    
//     switch(extension) {
//       case 'jpg':
//       case 'jpeg':
//       case 'png':
//       case 'gif':
//         return <Image className="h-8 w-8 text-blue-400" />
//       case 'pdf':
//         return <FileText className="h-8 w-8 text-red-400" />
//       case 'zip':
//       case 'rar':
//         return <FileArchive className="h-8 w-8 text-yellow-400" />
//       case 'doc':
//       case 'docx':
//         return <FileText className="h-8 w-8 text-blue-600" />
//       case 'txt':
//         return <FileText className="h-8 w-8 text-gray-400" />
//       default:
//         return <File className="h-8 w-8 text-gray-400" />
//     }
//   }

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <LoadingSpinner />
//       </div>
//     )
//   }

//   if (error) {
//     return (
//       <div className="text-center py-12">
//         <File className="h-12 w-12 text-red-400 mx-auto mb-4" />
//         <p className="text-red-500 mb-4">Failed to load files. Please try again.</p>
//       </div>
//     )
//   }

//   const fileData = files || []
//   const filteredFiles = fileData.filter((file) => 
//     file.name.toLowerCase().includes(searchTerm.toLowerCase())
//   )

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Files</h1>
//           <p className="text-gray-600">Upload and manage your files</p>
//         </div>
//       </div>

//       {/* Upload Area */}
//       <div className="card">
//         <div
//           {...getRootProps()}
//           className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
//             isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
//           }`}
//         >
//           <input {...getInputProps()} />
//           <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//           {isUploading ? (
//             <div>
//               <p className="text-lg font-medium text-gray-900 mb-2">Uploading...</p>
//               <div className="w-32 h-2 bg-gray-200 rounded-full mx-auto">
//                 <div className="h-2 bg-blue-500 rounded-full animate-pulse"></div>
//               </div>
//             </div>
//           ) : isDragActive ? (
//             <p className="text-lg font-medium text-blue-600">Drop the files here...</p>
//           ) : (
//             <div>
//               <p className="text-lg font-medium text-gray-900 mb-2">Drag & drop files here, or click to select</p>
//               <p className="text-gray-500">Supports images, PDFs, ZIPs, and documents (max 100MB)</p>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Search */}
//       <div className="card">
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//           <input
//             type="text"
//             placeholder="Search files..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="pl-10 input-field w-full"
//           />
//         </div>
//       </div>

//       {/* Files Grid */}
//       {filteredFiles.length > 0 ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//           {filteredFiles.map((file) => (
//             <div key={file._id} className="card hover:shadow-lg transition-shadow duration-200">
//               <div className="flex items-center justify-center mb-4">
//                 {getFileIcon(file.name)}
//               </div>

//               <div className="text-center mb-4">
//                 <h3 className="font-medium text-gray-900 truncate px-2" title={file.name}>
//                   {file.name}
//                 </h3>
//                 <p className="text-sm text-gray-500 mt-1">{formatFileSize(file.size)}</p>
//                 <p className="text-xs text-gray-400 mt-1">
//                   {new Date(file.uploadedAt).toLocaleDateString()}
//                 </p>
//               </div>

//               <div className="flex items-center justify-center space-x-2">
//                 <button
//                   onClick={() => handleDownload(file._id, file.name)}
//                   className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
//                   title="Download"
//                 >
//                   <Download className="h-4 w-4" />
//                 </button>
//                 <button
//                   onClick={() => handleDelete(file._id, file.name)}
//                   className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
//                   title="Delete"
//                 >
//                   <Trash2 className="h-4 w-4" />
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <div className="text-center py-12">
//           <File className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//           <p className="text-gray-500 mb-4">
//             {searchTerm ? "No files found matching your search" : "No files uploaded yet"}
//           </p>
//           {!searchTerm && (
//             <p className="text-gray-400">Upload your first file using the area above</p>
//           )}
//         </div>
//       )}
//     </div>
//   )
// }

// export default Files

"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useDropzone } from "react-dropzone"
import { fileAPI } from "../../services/api"
import { Upload, File, Download, Trash2, Search, Image, FileText, FileArchive } from "lucide-react"
import LoadingSpinner from "../../components/UI/LoadingSpinner"
import toast from "react-hot-toast"

const Files = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const queryClient = useQueryClient()

  const { data: files, isLoading, error } = useQuery({
    queryKey: ["files"],
    queryFn: async () => {
      const response = await fileAPI.getFiles()
      return response.data
    },
    onError: (err) => {
      toast.error(`Failed to load files: ${err.message}`)
    }
  })

  const uploadFilesMutation = useMutation({
    mutationFn: fileAPI.uploadFiles,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["files"] })
      const fileCount = response?.files?.length || 0
      toast.success(`${fileCount} file(s) uploaded successfully`)
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
      toast.error(`Upload failed: ${errorMessage}`)
    },
    onSettled: () => {
      setIsUploading(false)
    }
  })

  const deleteFileMutation = useMutation({
    mutationFn: fileAPI.deleteFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] })
      toast.success("File deleted successfully")
    },
    onError: (error) => {
      toast.error(`Delete failed: ${error.message}`)
    }
  })

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setIsUploading(true)
      const formData = new FormData()
      acceptedFiles.forEach((file) => {
        formData.append("files", file)
      })
      uploadFilesMutation.mutate(formData)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 100 * 1024 * 1024,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf'],
      'application/zip': ['.zip', '.rar'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    }
  })

  const handleDelete = async (fileId, fileName) => {
    if (window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      try {
        await deleteFileMutation.mutateAsync(fileId)
      } catch (error) {
        console.error("Delete error:", error)
      }
    }
  }

  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await fileAPI.downloadFile(fileId)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
    } catch (error) {
      toast.error(`Download failed: ${error.message}`)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch(extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className="h-8 w-8 text-blue-400" />
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-400" />
      case 'zip':
      case 'rar':
        return <FileArchive className="h-8 w-8 text-yellow-400" />
      case 'doc':
      case 'docx':
        return <FileText className="h-8 w-8 text-blue-600" />
      case 'txt':
        return <FileText className="h-8 w-8 text-gray-400" />
      default:
        return <File className="h-8 w-8 text-gray-400" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <File className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-500 mb-4">Failed to load files. Please try again.</p>
      </div>
    )
  }

  const fileData = files || []
  const filteredFiles = fileData.filter((file) => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Files</h1>
          <p className="text-gray-600">Upload and manage your files</p>
        </div>
      </div>

      <div className="card">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          {isUploading ? (
            <div>
              <p className="text-lg font-medium text-gray-900 mb-2">Uploading...</p>
              <div className="w-32 h-2 bg-gray-200 rounded-full mx-auto">
                <div className="h-2 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          ) : isDragActive ? (
            <p className="text-lg font-medium text-blue-600">Drop the files here...</p>
          ) : (
            <div>
              <p className="text-lg font-medium text-gray-900 mb-2">Drag & drop files here, or click to select</p>
              <p className="text-gray-500">Supports images, PDFs, ZIPs, and documents (max 100MB)</p>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 input-field w-full"
          />
        </div>
      </div>

      {filteredFiles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFiles.map((file) => (
            <div key={file._id} className="card hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-center mb-4">
                {getFileIcon(file.name)}
              </div>
              <div className="text-center mb-4">
                <h3 className="font-medium text-gray-900 truncate px-2" title={file.name}>
                  {file.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{formatFileSize(file.size)}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(file.uploadedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => handleDownload(file._id, file.name)}
                  className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(file._id, file.name)}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <File className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">
            {searchTerm ? "No files found matching your search" : "No files uploaded yet"}
          </p>
          {!searchTerm && (
            <p className="text-gray-400">Upload your first file using the area above</p>
          )}
        </div>
      )}
    </div>
  )
}

export default Files