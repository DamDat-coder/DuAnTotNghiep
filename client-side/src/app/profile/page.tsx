"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import useIsMobile from "@/hooks/useIsMobile";
import Image from "next/image";

import SettingsContent from "@/components/Profile/SettingContent";

import { OrderDetail as OrderDetailType } from "@/types/order"; // import đúng interface
import ProfileTab from "@/components/Profile/tabs/ProfileTab";
import AddressTab from "@/components/Profile/tabs/AddressTab";
import FavoriteTab from "@/components/Profile/tabs/FavoriteTab";
import DeleteTab from "@/components/Profile/tabs/DeleteTab";
import OrderTab from "@/components/Profile/tabs/OrderTab";
import OrderDetail from "@/components/Profile/tabs/OrderDetail";

const tabMap: Record<string, string> = {
  profile: "Hồ sơ",
  address: "Địa chỉ",
  favorite: "Yêu thích",
  delete: "Xóa tài khoản",
  order: "Đơn hàng",
  detail: "Chi tiết đơn hàng",
};

export default function ProfilePage() {
  const isMobile = useIsMobile();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("Hồ sơ");
  const [selectedOrder, setSelectedOrder] = useState<OrderDetailType | null>(
    null
  );

  // Lấy tab từ URL
  useEffect(() => {
    const tabFromURL = searchParams.get("tab");
    if (tabFromURL && tabMap[tabFromURL]) {
      setActiveTab(tabMap[tabFromURL]);
    }
  }, [searchParams]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "Hồ sơ":
        return <ProfileTab />;
      case "Địa chỉ":
        return <AddressTab />;
      case "Yêu thích":
        return <FavoriteTab />;
      case "Xóa tài khoản":
        return <DeleteTab />;
      case "Đơn hàng":
        return (
          <OrderTab
            setActiveTab={setActiveTab}
            setSelectedOrder={setSelectedOrder}
          />
        );
      case "Chi tiết đơn hàng":
        return selectedOrder ? (
          <OrderDetail order={selectedOrder} setActiveTab={setActiveTab} />
        ) : null;
      default:
        return null;
    }
  };

  // Mobile layout
  if (isMobile) {
    if (activeTab === "main") {
      return (
        <div className="px-4 py-4">
          <SettingsContent activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      );
    }

    return (
      <div className="px-4 py-4">
        <button
          onClick={() => setActiveTab("main")}
          className="text-sm text-gray-500 mb-4 flex items-center gap-2"
        >
          <Image
            src="/profile/Vector (Stroke).png"
            alt="Vector icon"
            width={7}
            height={7}
          />
          Quay lại
        </button>
        {renderTabContent()}
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="flex min-h-screen px-0 laptop:px-[278px] laptop:pt-[80px]">
      <div className="w-1/4 border-r">
        <SettingsContent activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      <div className="w-3/4 p-6">{renderTabContent()}</div>
    </div>
  );
}
