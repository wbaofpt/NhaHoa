import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, KeyRound, LogOut, Check } from "lucide-react";
import { PageHeading } from "../components";
import { useStore } from "../store";
import { api, post } from "../types";
export default function Security() {
  const { setUser, toast } = useStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirm: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.newPassword !== form.confirm) {
      setError("Hai lần nhập mật khẩu mới chưa khớp.");
      return;
    }
    if (new TextEncoder().encode(form.newPassword).length > 72) {
      setError(
        "Mật khẩu tối đa 72 byte UTF-8. Hãy rút ngắn một chút nếu dùng ký tự có dấu.",
      );
      return;
    }
    setBusy(true);
    try {
      await api(
        "/auth/password",
        post({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      );
      setUser(null);
      toast("Đã đổi mật khẩu và đăng xuất mọi thiết bị.");
      navigate("/dang-nhap?next=/tai-khoan");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const logoutAll = async () => {
    setBusy(true);
    setError("");
    try {
      await api("/auth/logout-all", post({}));
      setUser(null);
      toast("Đã đăng xuất khỏi tất cả thiết bị.");
      navigate("/dang-nhap");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const longEnough = form.newPassword.length >= 15;
  const withinLimit = new TextEncoder().encode(form.newPassword).length <= 72;
  return (
    <>
      <PageHeading
        eyebrow="BẢO MẬT TÀI KHOẢN"
        title="Giữ góc riêng của bạn an toàn."
        description="Đổi mật khẩu hoặc kết thúc các phiên đăng nhập khi cần."
      />
      <section className="security-layout wrap section-bottom">
        <form className="security-panel" onSubmit={submit}>
          <KeyRound size={28} strokeWidth={1.3} />
          <h2>Đổi mật khẩu</h2>
          {[
            { key: "currentPassword", label: "Mật khẩu hiện tại", min: 8 },
            { key: "newPassword", label: "Mật khẩu mới", min: 15 },
            { key: "confirm", label: "Nhập lại mật khẩu mới", min: 15 },
          ].map((f) => (
            <label className="field" key={f.key}>
              {f.label}
              <input
                type="password"
                required
                minLength={f.min}
                maxLength={72}
                autoComplete={
                  f.key === "currentPassword"
                    ? "current-password"
                    : "new-password"
                }
                value={form[f.key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                aria-describedby={
                  f.key === "currentPassword" ? undefined : "password-help"
                }
              />
            </label>
          ))}
          <p id="password-help" className="password-help">
            <Check size={15} className={longEnough ? "met" : ""} />
            Ít nhất 15 ký tự; tối đa 72 byte UTF-8. Bạn có thể dùng một cụm từ
            dễ nhớ.
          </p>
          {form.newPassword && !withinLimit && (
            <p className="form-error">Mật khẩu vượt giới hạn 72 byte.</p>
          )}
          <p className="muted">
            Sau khi đổi, tất cả thiết bị sẽ đăng xuất. Hãy đăng nhập lại bằng
            mật khẩu mới.
          </p>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="button" disabled={busy}>
            {busy ? "Đang xử lý…" : "Cập nhật mật khẩu"}
            <ShieldCheck size={17} />
          </button>
        </form>
        <aside className="security-panel secondary">
          <ShieldCheck size={32} strokeWidth={1.2} />
          <h2>Thiết bị & phiên đăng nhập</h2>
          <p>
            Nếu bạn đã đăng nhập trên máy dùng chung, hãy kết thúc tất cả phiên.
            Thao tác này bao gồm cả thiết bị hiện tại.
          </p>
          <button
            className="button outline"
            disabled={busy}
            onClick={logoutAll}
          >
            <LogOut size={17} />
            Đăng xuất mọi thiết bị
          </button>
          <div className="security-note">
            <h3>Một vài thói quen nhỏ</h3>
            <ul>
              <li>Dùng mật khẩu riêng cho Nhà Hoa.</li>
              <li>Không chia sẻ mật khẩu với người khác.</li>
              <li>Đăng xuất sau khi dùng máy công cộng.</li>
            </ul>
          </div>
        </aside>
      </section>
    </>
  );
}
