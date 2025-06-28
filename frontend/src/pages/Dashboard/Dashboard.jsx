import { useQuery } from "@tanstack/react-query"
import { taskAPI, analyticsAPI } from "../../services/api"
import { CheckSquare, AlertCircle } from "lucide-react"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import LoadingSpinner from "../../components/UI/LoadingSpinner"
import NLPTaskCreator from "./NLPTaskCreator"

const Dashboard = () => {
  const { data: tasks, isLoading: tasksLoading, error: tasksError } = useQuery({
    queryKey: ["tasks"],
    queryFn: taskAPI.getAllTasks,
  });

  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useQuery({
    queryKey: ["analytics"],
    queryFn: analyticsAPI.getAnalyticsData,
  });

  if (tasksLoading || analyticsLoading) {
    return <LoadingSpinner />
  }

  if (tasksError || analyticsError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading dashboard data: {tasksError?.message || analyticsError?.message}</p>
      </div>
    );
  }

  const taskData = tasks?.data || [];
  console.log("Loaded tasks:", taskData);  // ✅ Added this line
  const analyticsData = analytics?.data || {};

  const priorityData = [
    { name: "High", value: analyticsData.priorityCounts?.["High"] || 0, color: "#EF4444" },
    { name: "Medium", value: analyticsData.priorityCounts?.["Medium"] || 0, color: "#F59E0B" },
    { name: "Low", value: analyticsData.priorityCounts?.["Low"] || 0, color: "#10B981" },
  ];

  const statusData = [
    { priority: "High", "To Do": 0, "In Progress": 0, "Completed": 0 },
    { priority: "Medium", "To Do": 0, "In Progress": 0, "Completed": 0 },
    { priority: "Low", "To Do": 0, "In Progress": 0, "Completed": 0 },
  ];

  taskData.forEach((task) => {
    const priorityIndex = statusData.findIndex((item) => item.priority === task.priority);
    if (priorityIndex !== -1 && task.status) {
      statusData[priorityIndex][task.status] = (statusData[priorityIndex][task.status] || 0) + 1;
    }
  });

  const totalTasks = taskData.length;
  const completedTasks = taskData.filter(task => task.status === "Completed").length;
  const highPriorityTasks = taskData.filter(task => task.priority === "High").length;

  const stats = [
    {
      name: "Total Tasks",
      value: totalTasks,
      icon: CheckSquare,
      color: "bg-blue-500",
    },
    {
      name: "Completed",
      value: completedTasks,
      icon: CheckSquare,
      color: "bg-green-500",
    },
    {
      name: "High Priority",
      value: highPriorityTasks,
      icon: AlertCircle,
      color: "bg-red-500",
    },
  ];

  const recentTasks = [
    ...taskData.filter(task => task.priority === "High" || task.status === "Completed")
  ]
    .reduce((unique, task) => {
      return unique.some(t => t._id === task._id) ? unique : [...unique, task];
    }, [])
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your tasks.</p>
      </div>

      <div className="card p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Task Creation</h2>
        <NLPTaskCreator />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Priority Distribution</h2>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Status Distribution by Priority</h2>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="priority" label={{ value: "Priority", position: "insideBottom", offset: -5 }} />
              <YAxis label={{ value: "Number of Tasks", angle: -90, position: "insideLeft", offset: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="To Do" stroke="#6B7280" strokeWidth={2} />
              <Line type="monotone" dataKey="In Progress" stroke="#F59E0B" strokeWidth={2} />
              <Line type="monotone" dataKey="Completed" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent High Priority & Completed Tasks</h2>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View all</button>
        </div>

        {recentTasks.length > 0 ? (
          <div className="space-y-3">
            {recentTasks.map((task) => (
              <div key={task._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      task.priority === "High" ? "bg-red-500" : "bg-green-500"
                    }`}
                  ></div>
                  <div>
                    <p className="font-medium text-gray-900">{task.title}</p>
                    <p className="text-sm text-gray-500">
                      {task.dueDate ? `Due: ${new Date(task.dueDate).toLocaleDateString()}` : 'No due date'}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    task.status === "Completed"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {task.priority === "High" ? "High Priority" : "Completed"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No high priority or completed tasks found.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
