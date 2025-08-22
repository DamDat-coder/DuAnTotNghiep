"use client";

import { useSearchParams, useRouter } from "next/navigation";
import useIsMobile from "@/hooks/useIsMobile";
import Image from "next/image";
import SettingsContent from "@/components/Profile/SettingContent";
import { OrderDetail } from "@/types/order";
import ProfileTab from "@/components/Profile/tabs/ProfileTab";
import AddressTab from "@/components/Profile/tabs/AddressTab";
import FavoriteTab from "@/components/Profile/tabs/FavoriteTab";
import OrderTab from "@/components/Profile/tabs/OrderTab";
import OrderDetailTab from "@/components/Profile/tabs/OrderDetail";
import { useEffect, useState } from "react";
import { useActiveTab } from "@/contexts/ActiveTabContext";
import { fetchOrderByIdForUser } from "@/services/orderApi";
import toast from "react-hot-toast";

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
  const router = useRouter();
  const { activeTab, setActiveTab } = useActiveTab();
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);

  // Parse tab and orderId from URL
  useEffect(() => {
    const tabFromURL = searchParams.get("tab");
    if (tabFromURL) {
      if (tabFromURL.startsWith("order/")) {
        const orderId = tabFromURL.split("/")[1];
        if (orderId) {
          setActiveTab("Chi tiết đơn hàng");
          setIsLoadingOrder(true);
          fetchOrderByIdForUser(orderId)
            .then((order) => {
              setSelectedOrder(order);
            })
            .catch((error) => {
              console.error("Error fetching order:", error);
              toast.error("Không thể tải chi tiết đơn hàng!");
              setSelectedOrder(null);
              // Không chuyển tab về order ở đây!
            })
            .finally(() => {
              setIsLoadingOrder(false);
            });
        }
      } else if (tabMap[tabFromURL]) {
        setActiveTab(tabMap[tabFromURL]);
      }
      // Không else về profile!
    }
  }, [searchParams, setActiveTab]);

  useEffect(() => {
    if (!isMobile && activeTab === "main") {
      setActiveTab("Hồ sơ");
      router.push("/profile?tab=profile");
    }
  }, [isMobile, activeTab, router, setActiveTab]);

  const handleTabChange = (tab: string) => {
    let urlTab = "";
    if (tab === "Hồ sơ") urlTab = "profile";
    else if (tab === "Địa chỉ") urlTab = "address";
    else if (tab === "Yêu thích") urlTab = "favorite";
    else if (tab === "Đơn hàng") urlTab = "order";
    else if (tab === "Chi tiết đơn hàng")
      urlTab = `order/${selectedOrder?._id || ""}`;
    else urlTab = "profile";
    router.push(`/profile?tab=${urlTab}`);
    setActiveTab(tab);
  };

  const renderTabContent = () => {
    if (isLoadingOrder && activeTab === "Chi tiết đơn hàng") {
      return (
        <div className="text-center py-10 text-gray-500 font-medium">
          Đang tải chi tiết đơn hàng...
        </div>
      );
    }

    switch (activeTab) {
      case "Hồ sơ":
        return <ProfileTab />;
      case "Địa chỉ":
        return (
          <AddressTab
            selectedAddress={null}
            onSelect={() => {}}
            onClose={() => {}}
          />
        );
      case "Yêu thích":
        return <FavoriteTab />;
      case "Đơn hàng":
        return (
          <OrderTab
            setActiveTab={setActiveTab}
            setSelectedOrder={(order) => setSelectedOrder(order as OrderDetail)}
          />
        );
      case "Chi tiết đơn hàng":
        return selectedOrder ? (
          <OrderDetailTab order={selectedOrder} setActiveTab={setActiveTab} />
        ) : (
          <div className="text-center py-10 text-gray-500 font-medium">
            Không tìm thấy đơn hàng!
          </div>
        );
      default:
        return null;
    }
  };

  if (!isMobile) {
    return (
      <div className="flex w-full min-h-screen px-4 tablet:px-[16px] laptop:px-[80px] desktop:px-[278px]">
        <div className="w-1/4 border-r pr-4">
          <SettingsContent
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>
        <div className="w-3/4 pl-4 p-4">{renderTabContent()}</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      {activeTab === "main" ? (
        <SettingsContent activeTab={activeTab} onTabChange={handleTabChange} />
      ) : (
        <>
          <button
            onClick={() => {
              setActiveTab("main");
              router.push("/profile");
            }}
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
