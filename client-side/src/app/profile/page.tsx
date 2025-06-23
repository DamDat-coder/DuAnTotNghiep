"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import useIsMobile from "@/hooks/useIsMobile";
import Image from "next/image";

import SettingsContent from "@/components/Profile/SettingContent";
import { OrderDetail as OrderDetailType } from "@/types/order";

import ProfileTab from "@/components/Profile/tabs/ProfileTab";
import AddressTab from "@/components/Profile/tabs/AddressTab";
import FavoriteTab from "@/components/Profile/tabs/FavoriteTab";
import OrderTab from "@/components/Profile/tabs/OrderTab";
import OrderDetail from "@/components/Profile/tabs/OrderDetail";

const tabMap: Record<string, string> = {
  profile: "Hồ sơ",
  address: "Địa chỉ",
  favorite: "Yêu thích",
  order: "Đơn hàng",
  detail: "Chi tiết đơn hàng",
};

export default function ProfilePage() {
  const isMobile = useIsMobile();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState("main");
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

  useEffect(() => {
    // Nếu đang ở desktop và tab là "main" => chuyển sang tab "Hồ sơ"
    if (!isMobile && activeTab === "main") {
      setActiveTab("Hồ sơ");
    }
  }, [isMobile, activeTab]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "Hồ sơ":
        return <ProfileTab />;
      case "Địa chỉ":
        return <AddressTab />;
      case "Yêu thích":
        return <FavoriteTab />;
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

  // ✅ Desktop, tablet, laptop layout (>=768px)
  if (!isMobile) {
    return (
      <div className="flex w-full min-h-screen px-4 tablet:px-[16px] laptop:px-[80px] desktop:px-[278px]">
        <div className="w-1/4 border-r pr-4">
          <SettingsContent activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        <div className="w-3/4 pl-4">{renderTabContent()}</div>
      </div>
    );
  }

  // ✅ Mobile layout (<=767px)
  return (
    <div className="px-4 py-4">
      {activeTab === "main" ? (
        <SettingsContent activeTab={activeTab} setActiveTab={setActiveTab} />
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
