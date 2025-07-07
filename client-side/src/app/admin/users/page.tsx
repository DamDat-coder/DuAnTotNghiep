"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/admin/layouts/AdminLayout";
import { fetchAllUsersAdmin } from "@/services/userApi";
import TableWrapper from "@/admin/components/Admin_User/TableWrapper";
import { IUser } from "@/types/auth";
import { Pagination } from "@/admin/components/ui/Panigation";
import { Dispatch, SetStateAction } from "react";

type Props = {
  users: IUser[];
  filter: string;
  search: string;
  setFilter: Dispatch<SetStateAction<string>>;
  setSearch: Dispatch<SetStateAction<string>>;
  onUpdate: Dispatch<SetStateAction<IUser[]>>;
};

export default function UsersPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const pageSize = 10;

  // Hàm tải dữ liệu người dùng từ API
  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchAllUsersAdmin(
        search,
        currentPage,
        pageSize,
        filter === "all" ? undefined : filter
      );
      setUsers(data.users ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 0);
      setCurrentPage(data.currentPage ?? 1);
    } catch (error) {
      console.error("Lỗi khi tải danh sách người dùng:", error);
      setUsers([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi search, filter hoặc currentPage thay đổi
  useEffect(() => {
    loadUsers();
  }, [search, filter, currentPage]);

  // Reset về trang 1 khi filter hoặc search thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, search]);

  return (
    <AdminLayout
      pageTitle="Người dùng"
      pageSubtitle="Quản lý người dùng của bạn"
    >
      {/* Thanh tìm kiếm và lọc */}
      <TableWrapper
        users={users}
        filter={filter}
        search={search}
        setFilter={setFilter}
        setSearch={setSearch}
        onUpdate={setUsers}
      />

      {/* Hiển thị trạng thái tải */}
      {loading && (
        <p className="text-center text-gray-500 mt-4">Đang tải dữ liệu...</p>
      )}

      {/* Hiển thị thông báo khi không có người dùng */}
      {!loading && users.length === 0 && (
        <div className="text-center mt-6">
          <p className="text-gray-500 text-lg">Không tìm thấy người dùng</p>
          {search && (
            <p className="text-sm text-gray-400 mt-2">
              Không có người dùng nào khớp với từ khóa "{search}".
            </p>
          )}
        </div>
      )}

      {/* Phân trang */}
      {!loading && users.length > 0 && totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPage={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}

      {/* Tổng số người dùng */}
      {!loading && (
        <p className="text-center mt-4 text-gray-600">
          Tổng số người dùng: {total}
        </p>
      )}
    </AdminLayout>
  );
}
