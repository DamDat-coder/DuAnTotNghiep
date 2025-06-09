import { CheckCircle, XCircle, Clock } from "lucide-react";

const transactions = [
  { id: "#0199", date: "Dec 23, 04:00 PM", amount: "1.399.000đ", status: "success" },
  { id: "#0199", date: "Dec 23, 04:00 PM", amount: "1.399.000đ", status: "pending" },
  { id: "#0199", date: "Dec 23, 04:00 PM", amount: "1.399.000đ", status: "failed" },
];

export default function TransactionHistory() {
  return (
    <div className="bg-white w-[359px] rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="font-bold text-lg">Lịch sử giao dịch</div>
        <button className="text-gray-400 px-2 py-1 rounded-full hover:bg-gray-100">...</button>
      </div>
      <div className="flex flex-col gap-4">
        {transactions.map((t, i) => (
          <div key={i} className="flex justify-between items-center border-b last:border-b-0 pb-2">
            <div className="flex items-center gap-2">
              {t.status === "success" && <CheckCircle className="text-green-500 w-5 h-5" />}
              {t.status === "pending" && <Clock className="text-yellow-400 w-5 h-5" />}
              {t.status === "failed" && <XCircle className="text-red-500 w-5 h-5" />}
              <div>
                <div className="font-semibold">Payment from <span className="text-blue-600">{t.id}</span></div>
                <div className="text-xs text-gray-400">{t.date}</div>
              </div>
            </div>
            <div className="font-bold">{t.amount}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
