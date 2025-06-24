import * as React from "react";
import { IUser } from "@/types/auth";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
// Helper className (có thể bỏ nếu không dùng tailwind merge)
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

function SimpleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      tabIndex={0}
      className={`w-10 h-6 rounded-full transition relative focus:outline-none ${
        checked ? "bg-[#2563EB]" : "bg-gray-300"
      }`}
      onClick={() => onChange(!checked)}
    >
      <span
        className={`absolute left-0 top-0 transition-all duration-200 w-6 h-6 bg-white rounded-full shadow ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function UserTableBody({ users }: { users: IUser[] }) {
  const [states, setStates] = useState(users.map((u) => u.active));
  const [actionDropdownId, setActionDropdownId] = useState<string | null>(null);

  const popupRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setActionDropdownId(null);
      }
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      {users.map((user, index) => (
        <tr
          key={user.id}
          className="border-b text-[#0F172A] font-[500] text-[16px] hover:bg-[#F9FAFB] transition-colors duration-150"
        >
          <td className="px-5 py-4">{index + 1}</td>
          <td className="px-5 py-4">{user.name}</td>
          <td className="px-5 py-4">{user.email}</td>
          <td className="px-5 py-4">{user.phone}</td>
          <td className="px-5 py-4 capitalize">{user.role}</td>
          <td className="px-5 py-4">
            <SimpleSwitch
              checked={states[index]}
              onChange={(value) => {
                const next = [...states];
                next[index] = value;
                setStates(next);
                console.log("Trạng thái:", value);
              }}
            />
          </td>
          <th className="w-[64px] px-4 py-0 rounded-tr-[12px] rounded-br-[12px] align-middle relative">
            <div className="flex items-center justify-end h-[64px]">
              <button
                className="focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation();
                  setActionDropdownId(
                    actionDropdownId === user.id ? null : user.id
                  );
                }}
              >
                <Image
                  src="/admin_user/dots.svg"
                  width={24}
                  height={24}
                  alt="three_dot"
                />
              </button>
              {/* Dropdown */}
              {actionDropdownId === user.id && (
                <div
                  ref={popupRef}
                  className="absolute right-2 top-14 z-50 min-w-[110px] rounded-lg bg-white shadow border border-gray-100 animate-fadeIn"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-[#2998FF] rounded-t-lg"
                    onClick={() => {
                      setActionDropdownId(null);
                    }}
                  >
                    Sửa
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-[#F75555] rounded-b-lg"
                    onClick={() => {
                      setActionDropdownId(null);
                    }}
                  >
                    Xoá
                  </button>
                </div>
              )}
            </div>
          </th>
        </tr>
      ))}
    </>
  );
}
