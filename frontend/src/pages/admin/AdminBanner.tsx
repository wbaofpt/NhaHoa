import { useState, type ChangeEvent, type FormEvent } from "react";
import { ImagePlus } from "lucide-react";
import { PageHeading } from "../../components";
import { AdminNav } from "./AdminNav";

const fields = [
  ["kicker", "Nh\u1eadn nh\u1ecf"], ["title", "Ti\u00eau \u0111\u1ec1"], ["titleAccent", "D\u00f2ng nh\u1ea5n"],
  ["description", "M\u00f4 t\u1ea3"], ["primaryLabel", "N\u00fat ch\u00ednh"], ["primaryLink", "Li\u00ean k\u1ebft n\u00fat ch\u00ednh"],
  ["secondaryLabel", "N\u00fat ph\u1ee5"], ["noteLabel", "Nh\u00e3n tr\u00ean \u1ea3nh"], ["noteTitle", "Ti\u00eau \u0111\u1ec1 tr\u00ean \u1ea3nh"],
  ["noteAccent", "D\u00f2ng nh\u1ea5n tr\u00ean \u1ea3nh"], ["imageCredit", "Ghi c\u00f4ng \u1ea3nh"], ["noteLink", "Li\u00ean k\u1ebft \u1ea3nh"],
] as const;
const readImage = (file: File) => new Promise<string>((resolve, reject) => {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return reject(new Error("Ch\u1ec9 nh\u1eadn JPEG, PNG ho\u1eb7c WebP."));
  if (file.size > 2500000) return reject(new Error("\u1ea2nh t\u1ed1i \u0111a 2,5MB."));
  const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error("Kh\u00f4ng th\u1ec3 \u0111\u1ecdc \u1ea3nh.")); reader.readAsDataURL(file);
});
export default function AdminBanner() {
  const [values, setValues] = useState<Record<string, string>>(() => { try { return JSON.parse(localStorage.getItem("nha-hoa-home-banner") || "{}"); } catch { return {}; } });
  const [saved, setSaved] = useState(false); const [error, setError] = useState("");
  const upload = (e: ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (!file) return; void readImage(file).then((image) => { setValues((v) => ({ ...v, image })); setError(""); }).catch((e) => setError(e.message)); };
  const save = (e: FormEvent) => { e.preventDefault(); localStorage.setItem("nha-hoa-home-banner", JSON.stringify(values)); setSaved(true); window.setTimeout(() => setSaved(false), 1800); };
  return <>
    <PageHeading eyebrow="QU&#x1EA2N TR&#x1ECA; NH&#xC0; HOA" title="Banner trang ch&#x1EE7;" description="T&#x1EE5;y ch&#x1EC9;nh n&#x1ED9;i dung n&#x1ED5;i b&#x1EAD;t hi&#x1EC3;n th&#x1ECB; &#x1EDF; &#x0111;&#x1EA7;u trang." />
    <section className="admin-layout wrap section-bottom"><AdminNav /><div className="admin-content">
      <form className="help-panel admin-settings-form" onSubmit={save}>
        <h2><ImagePlus /> N&#x1ED9;i dung banner</h2>
        <label className="field">&#x1EA2;nh banner<input type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} /></label>
        {values.image && <img className="admin-banner-preview" src={values.image} alt="Xem tr&#x01B0;&#x1EDB;c banner" />}
        {fields.map(([field, label]) => <label className="field" key={field}>{label}<input value={values[field] || ""} onChange={(e) => setValues({ ...values, [field]: e.target.value })} /></label>)}
        <button className="button" type="submit">L&#x01B0;u banner</button>
        {error && <p className="form-error" role="alert">{error}</p>}
        {saved && <span className="form-success" role="status">&#x0110;&#x00E3; l&#x01B0;u banner</span>}
      </form>
    </div></section>
  </>;}
