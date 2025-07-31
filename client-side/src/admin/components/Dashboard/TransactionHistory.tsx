"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  PackageCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { fetchTransactionHistory } from "@/services/dashboardApi";

const PAGE_SIZE = 5;

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    fetchTransactionHistory()
      .then((data) => {
        const sorted = [...data].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setTransactions(sorted);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.ceil(transactions.length / PAGE_SIZE);
  const paginatedData = transactions.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const renderIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="text-yellow-400 w-4 h-4" />;
      case "confirmed":
        return <PackageCheck className="text-blue-500 w-4 h-4" />;
      case "shipping":
        return <Truck className="text-indigo-500 w-4 h-4" />;
      case "delivered":
        return <CheckCircle className="text-green-500 w-4 h-4" />;
      case "cancelled":
        return <XCircle className="text-red-500 w-4 h-4" />;
      default:
        return <Clock className="text-gray-400 w-4 h-4" />;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return (
      date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }) +
      " " +
      date.toLocaleDateString("vi-VN")
    );
  };

  // const shortId = (id: string) => id.slice(-6);

  return (
    <div className="bg-white w-full h-[360px] rounded-xl p-6 flex flex-col justify-between">
      <div>
        {/* Header + Pagination buttons */}
        <div className="flex justify-between items-center mb-3">
          <div className="font-bold text-base">Lịch sử giao dịch</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`p-1 rounded hover:bg-gray-100 ${
                currentPage === 1
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-700"
              }`}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`p-1 rounded hover:bg-gray-100 ${
                currentPage === totalPages
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-700"
              }`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex flex-col gap-4">
          {loading ? (
            <div className="text-gray-400 text-sm">Đang tải...</div>
          ) : paginatedData.length === 0 ? (
            <div className="text-gray-400 text-sm">Không có giao dịch nào</div>
          ) : (
            paginatedData.map((t, i) => (
              <div
                key={i}
                className="flex justify-between items-start border-b last:border-b-0 pb-2"
              >
                <div className="flex items-start gap-2 text-sm">
                  <div className="mt-1">{renderIcon(t.status)}</div>
                  <div className="flex flex-col">
                    <div>
                      Payment from{" "}
                      <span
                        className="text-blue-600 font-medium cursor-pointer hover:underline"
                        onClick={() => router.push(`/admin/order?edit=${t.id}`)}
                      >
                        {/* #{shortId(t.id)} */}#{t.id}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatDate(t.date)}
                    </div>
                  </div>
                </div>
                <div className="text-sm font-semibold whitespace-nowrap">
                  {t.amount.toLocaleString("vi-VN")}₫
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
