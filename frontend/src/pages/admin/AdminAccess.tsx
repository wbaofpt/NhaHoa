import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useStore } from "../../store";
import { BloomLoader } from "../../PageMotion";
export default function AdminAccess({ children }: { children: ReactNode }) {
  const { user, authLoading } = useStore();
  const location = useLocation();
  if (authLoading) return <BloomLoader label="Đang kiểm tra quyền quản trị…" />;
  if (!user)
    return (
      <Navigate
        to={`/dang-nhap?next=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}
