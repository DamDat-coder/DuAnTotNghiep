// "use client";

// import { useState } from "react";

// export default function ProfilePage() {
//   const [activeTab, setActiveTab] = useState("Hồ sơ");
//   const [showAccountMenu, setShowAccountMenu] = useState(true);

//   const accountTabs = ["Hồ sơ", "Địa chỉ", "Yêu thích", "Xóa tài khoản"];
//   const tabTitles: Record<string, string> = {
//     "Hồ sơ": "HỒ SƠ CÁ NHÂN",
//     "Yêu thích": "SẢN PHẨM YÊU THÍCH",
//     "Địa chỉ": "ĐỊA CHỈ GIAO HÀNG",
//     "Xóa tài khoản": "XÓA TÀI KHOẢN",
//   };

//   return (
//     <div className="min-h-screen">
//       <div className="desktop:max-w-7xl mx-auto px-4 py-8">
//         <div className="grid grid-cols-12 gap-6">
//           {/* Sidebar */}
//           <div className="col-span-3">
//             <div>
//               <div className="mb-6">
//                 <h2 className="text-2xl font-bold mb-6">Cài đặt</h2>

//                 {/* Tài khoản */}
//                 <div
//                   className="font-bold mb-4 flex justify-between items-center w-full cursor-pointer"
//                   onClick={() => setShowAccountMenu(!showAccountMenu)}
//                 >
//                   <span>Tài khoản</span>
//                   <span>
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       viewBox="0 0 20 20"
//                       fill="currentColor"
//                       className="size-5"
//                     >
//                       <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
//                     </svg>
//                   </span>
//                 </div>

//                 {/* Menu con */}
//                 {showAccountMenu && (
//                   <ul className="space-y-2 ml-4">
//                     {accountTabs.map((item) => (
//                       <li
//                         key={item}
//                         className="py-2 border-b border-gray-200 last:border-0"
//                       >
//                         <button
//                           onClick={() => setActiveTab(item)}
//                           className={`relative text-left ${
//                             activeTab === item ? "text-black" : "text-gray-400"
//                           } hover:text-black
//                           after:content-['']
//                           after:absolute
//                           after:bottom-0
//                           after:left-0
//                           after:w-full
//                           after:h-[2px]
//                           after:bg-black
//                           after:transform
//                           after:origin-left
//                           after:transition-transform
//                           after:duration-500
//                           ${
//                             activeTab === item
//                               ? "after:scale-x-100"
//                               : "after:scale-x-0 hover:after:scale-x-100"
//                           }`}
//                         >
//                           {item}
//                         </button>
//                       </li>
//                     ))}
//                   </ul>
//                 )}
//               </div>

//               {/* Đơn hàng */}
//               <div className="font-bold mb-4 flex justify-between items-center w-full">
//                 <span>Đơn hàng</span>
//                 <span>
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     strokeWidth="1.5"
//                     stroke="currentColor"
//                     className="size-5"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
//                     />
//                   </svg>
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* Main Content */}
//           <div className="col-span-9">
//             <div>
//               <div className="mb-6">
//                 <h2 className="text-2xl font-bold uppercase">
//                   {tabTitles[activeTab]}
//                 </h2>
//                 <div className="mt-1 h-[3px] w-[80px] bg-gray-500"></div>
//               </div>

//               {/* Nội dung tương ứng tab */}
//               <div className="space-y-6">
//                 {activeTab === "Hồ sơ" && (
//                   <div>
//                     <p className="text-gray-500">
//                       <div className="col-span-9">
//                         <div className="space-y-6">
//                           {/* Họ và tên */}
//                           <div>
//                             <label className="block font-medium mb-2">
//                               Họ và tên
//                             </label>
//                             <input
//                               type="text"
//                               className="w-full p-2 border rounded text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                               placeholder="Nhập họ tên"
//                             />
//                           </div>

//                           {/* Email */}
//                           <div>
//                             <label className="block font-medium mb-2">
//                               Email
//                             </label>
//                             <input
//                               type="text"
//                               className="w-full p-2 border rounded text-gray-300
//              focus:outline-none focus:ring-2 focus:ring-blue-500
//              disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500
//              placeholder:text-gray-400"
//                               disabled
//                               placeholder="910.hanhuttan.pch@gmail.com"
//                             />
//                           </div>

//                           {/* Password */}
//                           <div>
//                             <label className="block font-medium mb-2">
//                               Password
//                             </label>
//                             <div className="flex justify-between gap-2">
//                               <span className="text-gray-400">••••••••</span>
//                               <button className="text-black underline hover:text-gray-700 text-sm">
//                                 Edit
//                               </button>
//                             </div>
//                           </div>

//                           {/* Số điện thoại */}
//                           <div>
//                             <label className="block font-medium mb-2">
//                               Số điện thoại
//                             </label>
//                             <div className="flex justify-between gap-2">
//                               <span className="text-gray-600">
//                                 0707 654 435
//                               </span>
//                               <button className="text-black underline hover:text-gray-700 text-sm">
//                                 Edit
//                               </button>
//                             </div>
//                           </div>

//                           {/* Địa chỉ */}
//                           <div>
//                             <label className="block font-medium mb-4">
//                               Địa chỉ
//                             </label>
//                             {/* Địa chỉ Section */}
//                             <div className="space-y-4">
//                               {/* Tỉnh/Thành */}
//                               <div className="space-y-1">
//                                 <div className="text-sm text-gray-300 font-medium">
//                                   Tỉnh / Thành
//                                 </div>
//                                 <select
//                                   defaultValue=""
//                                   className="w-full p-2 border rounded text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                   id="province"
//                                 >
//                                   <option disabled value="">
//                                     Chọn tỉnh / thành
//                                   </option>
//                                 </select>
//                               </div>

//                               {/* Quận/Huyện */}
//                               <div className="space-y-1">
//                                 <div className="text-sm text-gray-400 font-medium">
//                                   Quận / Huyện
//                                 </div>
//                                 <select
//                                   defaultValue=""
//                                   className="w-full p-2 border rounded text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                   id="district"
//                                 >
//                                   <option disabled value="">
//                                     Chọn quận / huyện
//                                   </option>
//                                 </select>
//                               </div>

//                               {/* Phường/Xã */}
//                               <div className="space-y-1">
//                                 <div className="text-sm text-gray-400 font-medium">
//                                   Phường / Xã
//                                 </div>
//                                 <select
//                                   defaultValue=""
//                                   className="w-full p-2 border rounded text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                   id="ward"
//                                 >
//                                   <option disabled value="">
//                                     Chọn phường / xã
//                                   </option>
//                                 </select>
//                               </div>

//                               {/* Địa chỉ chi tiết */}
//                               <div className="space-y-1">
//                                 <div className="text-sm text-gray-400 font-medium">
//                                   Địa chỉ
//                                 </div>
//                                 <input
//                                   type="text"
//                                   className="w-full p-2 border rounded text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                   placeholder="Nhập địa chỉ"
//                                 />
//                               </div>
//                             </div>
//                           </div>

//                           <div className="text-right">
//                             <button className="mt-6 bg-black text-white px-6 py-2 rounded hover:bg-gray-600 transition-colors">
//                               Lưu thay đổi
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     </p>
//                   </div>
//                 )}
//                 {activeTab === "Yêu thích" && (
//                   <div>
//                     <div className="space-y-6">
//                       {[...Array(4)].map((_, i) => (
//                         <div
//                           key={i}
//                           className="flex items-center gap-4 border-b pb-4"
//                         >
//                           {/* Hình ảnh */}
//                           <img
//                             src="/images/sample-product.jpg"
//                             alt="Áo khoác"
//                             className="w-24 h-24 object-cover"
//                           />

//                           {/* Thông tin */}
//                           <div className="flex-1">
//                             <h3 className="font-semibold">
//                               MLB – Áo khoác phối mũ unisex Gopcore Basic
//                             </h3>
//                             <p className="text-gray-500 text-sm">Men's Shoes</p>
//                             <button className="mt-1">
//                               <span role="img" aria-label="heart">
//                                 ❤️
//                               </span>
//                             </button>
//                           </div>

//                           {/* Giá */}
//                           <div className="text-right">
//                             <div className="text-sm text-gray-400 line-through">
//                               5,589,000₫
//                             </div>
//                             <div className="text-red-600 font-semibold">
//                               1,790,000₫
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//                 {activeTab === "Địa chỉ" && (
//
//                 )}
//                 {activeTab === "Xóa tài khoản" && (
//
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import useIsMobile from "@/hooks/useIsMobile";
import SettingsContent from "@/components/Profile/SettingContent";
import ProfileTab from "@/components/Profile/tabs/ProfileTab";
import AddressTab from "@/components/Profile/tabs/AddressTab";
import FavoriteTab from "@/components/Profile/tabs/FavoriteTab";
import DeleteTab from "@/components/Profile/tabs/DeleteTab";
import OrderTab from "@/components/Profile/tabs/OrderTab";
import Image from "next/image";

export default function ProfilePage() {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("Hồ sơ");

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
        return <OrderTab />;
      default:
        return null;
    }
  };

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
          <span>
            <Image
              src="/profile/Vector (Stroke).png"
              alt="Vector icon"
              width={7}
              height={7}
            />
          </span>
          Quay lại
        </button>
        {renderTabContent()}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen px-0 laptop:px-[278px] laptop:pt-[80px]">
      <div className="w-1/4 border-r">
        <SettingsContent activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      <div className="w-3/4 p-6">{renderTabContent()}</div>
    </div>
  );
}
