// src/components/Container.tsx
import clsx from "clsx";
import { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode; // Nội dung bên trong Container
  className?: string; // Cho phép thêm class tùy chỉnh nếu cần
}

export default function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={clsx(
        "max-w-full px-4 mx-auto tablet:w-full laptop:w-full desktop:w-full laptop:px-20 desktop:px-20",
        className
      )}
    >
      {children}
    </div>
  );
}
