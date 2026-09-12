import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useStore } from "./store";
import { BloomLoader } from "./PageMotion";
export function AuthGate({ children }: { children: ReactNode }) {
  const { user, authLoading } = useStore();
  const location = useLocation();
  if (authLoading) return <BloomLoader label="Đang mở góc riêng của bạn…" />;
  if (!user)
    return (
      <Navigate
        to={
          "/dang-nhap?next=" +
          encodeURIComponent(location.pathname + location.search)
        }
        replace
      />
    );
  return children;
}
