import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeading } from "../../components";
import { AdminNav } from "./AdminNav";

const KEY = "nha-hoa-admin-categories";
const defaults = ["Bó hoa", "Giỏ hoa", "Bình hoa", "Hoa cưới"];
const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || "null") || defaults; } catch { return defaults; } };

export default function AdminCategories() {
  const [categories, setCategories] = useState<string[]>(read);
  const [value, setValue] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const save = () => {
    const next = value.trim();
    if (next.length < 2) return;
    const list = editing ? categories.map((item) => item === editing ? next : item) : [...categories, next];
    const unique = [...new Set(list)];
    setCategories(unique); localStorage.setItem(KEY, JSON.stringify(unique)); setValue(""); setEditing(null);
  };
  const remove = (item: string) => { if (!window.confirm(`Xóa danh mục ${item}?`)) return; const next = categories.filter((x) => x !== item); setCategories(next); localStorage.setItem(KEY, JSON.stringify(next)); };
  return <><PageHeading eyebrow="QUẢN TRỊ NHÀ HOA" title="Danh mục sản phẩm" description="Tạo và sắp xếp các nhóm hoa trong cửa hàng." /><section className="admin-layout wrap section-bottom"><AdminNav /><div className="admin-content"><div className="section-heading"><h2>Danh mục ({categories.length})</h2><button className="button" onClick={() => { setEditing(null); setValue(""); }}><Plus size={16} /> Thêm danh mục</button></div><div className="help-panel category-editor"><label className="field">Tên danh mục<input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Ví dụ: Hoa sinh nhật" /></label><button className="button" onClick={save}>{editing ? "Lưu thay đổi" : "Thêm danh mục"}</button></div><div className="category-list">{categories.map((item) => <div className="category-row" key={item}><strong>{item}</strong><span><button className="icon-button admin-action-icon" aria-label={`Sửa ${item}`} onClick={() => { setEditing(item); setValue(item); }}><Pencil size={16} /></button><button className="icon-button admin-action-icon" aria-label={`Xóa ${item}`} onClick={() => remove(item)}><Trash2 size={16} /></button></span></div>)}</div></div></section></>;
}
