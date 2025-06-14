import { Switch } from "@/components/ui/switch";
import { IUser } from "@/types/auth";

export default function UserTableBody({ users }: { users: IUser[] }) {
  return (
    <>
      {users.map((user, index) => (
        <tr
          key={user.id}
          className="border-b hover:bg-[#F9FAFB] transition-colors duration-150"
        >
          <td className="px-5 py-4">{index + 1}</td>
          <td className="px-5 py-4">{user.name}</td>
          <td className="px-5 py-4">{user.email}</td>
          <td className="px-5 py-4">{user.phone}</td>
          <td className="px-5 py-4 capitalize">{user.role}</td>
          <td className="px-5 py-4">
            <Switch
              checked={user.active}
              onCheckedChange={(value) => console.log("Trạng thái:", value)}
              className="relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full transition-colors data-[state=checked]:bg-[#2563EB] bg-gray-300"
            >
              <span className="pointer-events-none absolute left-1 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-300 translate-x-0 data-[state=checked]:translate-x-6" />
            </Switch>
          </td>

          <td className="px-5 py-4 text-right">
            <span className="text-xl font-semibold text-gray-500">...</span>
          </td>
        </tr>
      ))}
    </>
  );
}
