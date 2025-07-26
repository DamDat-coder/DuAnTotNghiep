import { createContext, useContext, useState } from "react";

const tabMap: Record<string, string> = {
  profile: "Hồ sơ",
  address: "Địa chỉ",
  favorite: "Yêu thích",
  order: "Đơn hàng",
  detail: "Chi tiết đơn hàng",
};

const ActiveTabContext = createContext<{
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}>({
  activeTab: "Hồ sơ",
  setActiveTab: () => {},
});

export const ActiveTabProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const [activeTab, setActiveTab] = useState<string>("Hồ sơ");
  return (
    <ActiveTabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </ActiveTabContext.Provider>
  );
};

export const useActiveTab = () => useContext(ActiveTabContext);
