import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { IUser } from "@/types/auth";

// Helper className (có thể bỏ nếu không dùng tailwind merge)
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

function SimpleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
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
  const [states, setStates] = React.useState(users.map(u => u.active));

  return (
    <>
      {users.map((user, index) => (
        <tr key={user.id} className="border-b hover:bg-[#F9FAFB] transition-colors duration-150">
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
          <td className="px-5 py-4 text-right">
            <span className="text-xl font-semibold text-gray-500">...</span>
          </td>
        </tr>
      ))}
    </>
  );
}