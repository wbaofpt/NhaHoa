import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useStore } from "./store";
import { Flower2 } from "lucide-react";
export function AuthGate({ children }: { children: ReactNode }) {
  const { user, authLoading } = useStore();
  const location = useLocation();
  if (authLoading)
    return (
      <div className="auth-loading wrap" role="status">
        <Flower2 className="loading-flower" aria-hidden="true" />
        Đang mở góc riêng của bạn…
      </div>
    );
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
