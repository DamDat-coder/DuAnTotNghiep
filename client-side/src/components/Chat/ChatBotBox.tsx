"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";
import ProductCardList, { ProductItem } from "./ProductCardList";

interface Message {
  sender: "user" | "bot" | "typing";
  text?: string;
  custom?: {
    type: "product_list";
    items: ProductItem[];
  };
}

export default function ChatBotBox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessageToRasa = async (message: string) => {
    const res = await fetch(
      "https://ebab48fb16ea.ngrok-free.app/webhooks/rest/webhook",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: "user123", message }),
      }
    );

    return res.json();
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage, { sender: "typing" }]);
    setInput("");

    try {
      const responses = await sendMessageToRasa(input);

      // Xoá "typing"
      setMessages((prev) => prev.slice(0, -1));

      if (responses.length === 0) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "🤖 Xin lỗi, mình chưa hiểu rõ yêu cầu của bạn.",
          },
        ]);
      }

      responses.forEach((res: any) => {
        if (res.text) {
          setMessages((prev) => [...prev, { sender: "bot", text: res.text }]);
        }
        if (res.custom?.type === "product_list") {
          setMessages((prev) => [
            ...prev,
            { sender: "bot", custom: res.custom },
          ]);
        }
      });
    } catch {
      setMessages((prev) => [
        ...prev.slice(0, -1), // Xoá "typing"
        { sender: "bot", text: "❌ Lỗi kết nối chatbot." },
      ]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-[24rem] h-[30rem] bg-white border border-gray-300 rounded-xl flex flex-col justify-between overflow-hidden gap-3 shadow-2xl"
          >
            <div className="p-3 border-b font-semibold text-lg text-white bg-black flex justify-between items-center">
              ChatBot Tư vấn
              <button
                onClick={() => setIsOpen(false)}
className="hover:text-red-500 text-sm text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 max-h-[90%] overflow-y-auto p-3 space-y-4 text-sm">
              {messages.map((msg, idx) => (
                <div key={idx}>
                  {msg.text && (
                    <div
                      className={`${
                        msg.sender === "user"
                          ? "text-right text-white"
                          : "text-left text-gray-700"
                      }`}
                    >
                      <span
                        className={`${
                          msg.sender === "user"
                            ? "bg-gray-500 inline-block px-3 py-1 rounded"
                            : "bg-gray-100 inline-block px-3 py-1 rounded"
                        }`}
                      >
                        {msg.text}
                      </span>
                    </div>
                  )}

                  {msg.sender === "typing" && (
                    <div className="text-left text-gray-400 italic px-3 animate-pulse">
                      Đang trả lời...
                    </div>
                  )}

                  {msg.custom?.type === "product_list" && (
                    <ProductCardList items={msg.custom.items} />
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex items-center border-t p-2">
              <input
                type="text"
                placeholder="Nhập tin nhắn..."
                className="flex-1 px-3 py-2 border rounded mr-2 text-sm"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button
                onClick={handleSend}
                className="bg-black text-white px-4 py-2 rounded text-sm"
              >
                Gửi
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-white hover:bg-gray-200 text-black rounded-full p-3 shadow-lg flex items-center space-x-2"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium hidden md:inline">Chat</span>
        </button>
      )}
    </div>
  );
}