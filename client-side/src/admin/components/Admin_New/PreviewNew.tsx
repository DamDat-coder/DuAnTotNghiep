"use client";
import React from "react";
import Image from "next/image";

interface PreviewNewProps {
  title: string;
  content: string;
  category?: string;
  tags: string[];
  image?: string | null;
  onClose: () => void;
}

export default function PreviewNew({
  title,
  content,
  category,
  tags,
  image,
  onClose,
}: PreviewNewProps) {
  // Giả lập meta
  const now = new Date();
  const dateStr = now.toLocaleDateString("vi-VN");
  const timeStr = now.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const author = "Admin";

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full relative">
        <div className="max-h-[80vh] overflow-y-auto p-8 scroll-hidden">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-black"
          >
            Đóng
          </button>
          <main>
            {/* Title */}
            <h1 className="text-2xl laptop:text-3xl font-bold mb-3 leading-tight">
              {title}
            </h1>
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-4">
              <span>🕓 {timeStr}</span>
              <span>📅 {dateStr}</span>
              <span>👤 {author}</span>
              {category && <span>📂 {category}</span>}
            </div>
            {/* Article image */}
            {image && (
              <figure className="my-5 flex flex-col items-center">
                <img
                  src={image}
                  alt="Ảnh bài viết"
                  className="rounded-lg object-cover max-h-[380px] w-full"
                />
              </figure>
            )}
            {/* Article content */}
            <article
              className="prose max-w-none text-base"
              dangerouslySetInnerHTML={{ __html: content }}
            />
            {/* Tags */}
            <div className="mt-8 flex flex-wrap gap-2">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-gray-100 rounded text-xs cursor-pointer hover:bg-black hover:text-white transition"
                >
                  #{tag}
                </span>
              ))}
            </div>
            {/* Share post */}
            <div className="mt-8 flex gap-2 items-center">
              <span className="text-sm font-medium">Share this post</span>
              {/* Có thể thêm icon share ở đây */}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
