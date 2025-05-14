// src/components/Container.tsx
import clsx from "clsx";
import { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode; // Nội dung bên trong Container
  className?: string;  // Cho phép thêm class tùy chỉnh nếu cần
}

export default function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={clsx(
        "max-w-xs mx-auto tablet:max-w-2xl laptop:max-w-[80%] desktop:max-w-[80%]",
        className
      )}
    >
      {children}
    </div>
  );
}