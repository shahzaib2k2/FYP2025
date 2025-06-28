"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import toast from "react-hot-toast";

const Transactions = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: transactions, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["blockchain-transactions"],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/api/blockchain-transactions', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch blockchain transactions');
      }
      return response.json();
    },
  });

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refetch();
      toast.success("Transactions refreshed");
    } catch (err) {
      toast.error("Failed to refresh transactions");
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16 mx-auto mb-4 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Failed to load transactions</h3>
        <p className="text-lg text-gray-500 mb-6">{error.message}</p>
        <button
          onClick={handleRefresh}
          className={`btn-primary bg-blue-600 text-white px-6 py-3 rounded-xl shadow-md hover:bg-blue-700 transition-all duration-200 text-base font-semibold ${
            isRefreshing ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isRefreshing}
          aria-label="Retry loading transactions"
        >
          <RefreshCw className={`h-5 w-5 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Retrying..." : "Retry"}
        </button>
      </div>
    );
  }

  const transactionData = (transactions?.data || []).filter(task => task.txHash !== null);

  return (
    <div className="space-y-10 p-10 bg-gradient-to-br from-gray-50 to-gray-200 min-h-screen">
      <div className="animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link
              to="/tasks"
              className="btn-secondary flex items-center space-x-2 bg-gray-100 text-gray-900 px-6 py-3 rounded-xl shadow-md hover:bg-gray-200 transition-all duration-200"
              aria-label="Back to Tasks"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Tasks</span>
            </Link>
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Blockchain Transaction Dashboard</h1>
              <p className="mt-3 text-xl text-gray-600">View all on-chain task transactions</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className={`btn-primary flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl shadow-md hover:bg-blue-700 transition-all duration-200 ${
              isRefreshing ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isRefreshing}
            aria-label={isRefreshing ? "Refreshing transactions" : "Refresh transactions"}
          >
            <RefreshCw className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      <div className="card bg-white shadow-lg rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">On-Chain Task Transactions</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200" aria-label="On-chain transaction history">
            <thead className="bg-blue-600">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                  Task Title
                </th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                  Action
                </th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                  Tx Hash
                </th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                  Block #
                </th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                  Timestamp
                </th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactionData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-16 w-16 mx-auto mb-4 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">No on-chain transactions found</h3>
                      <p className="text-lg text-gray-500">Create a task with blockchain storage to see transaction records</p>
                    </div>
                  </td>
                </tr>
              ) : (
                transactionData.map((task) => (
                  <tr key={`${task._id}-${task.txHash}`} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-base font-semibold text-gray-900">
                      {task.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-4 py-1.5 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 shadow-sm">
                        {task.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
                      {task.status}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500 font-mono truncate max-w-xs">
                      <a
                        href={`http://127.0.0.1:8545/tx/${task.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {task.txHash.slice(0, 6)}...{task.txHash.slice(-4)}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
                      {task.blockNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
                      {new Date(task.blockTimestamp).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/transactions/${task.txHash}`}
                        className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transactions;