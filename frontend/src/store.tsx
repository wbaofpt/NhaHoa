import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";
import { api, type CartItem, type Product, type User } from "./types";
import { useLocation, useNavigate } from "react-router-dom";
function read<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}
type Store = {
  products: Product[];
  loading: boolean;
  error: string;
  reload: () => void;
  cart: CartItem[];
  add: (p: Product, n?: number) => void;
  quantity: (id: number, n: number) => void;
  clear: () => void;
  favorites: number[];
  favorite: (id: number) => void;
  user: User | null;
  setUser: (u: User | null) => void;
  authLoading: boolean;
  toast: (message: string) => void;
};
const Context = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cart, setCart] = useState<CartItem[]>(() => read("nh-cart", []));
  const [favorites, setFavorites] = useState<number[]>([]);
  const pendingFavorites = useRef(new Set<number>());
  const favoriteRevision = useRef(0);
  const currentUserId = useRef<number | undefined>(undefined);
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const reload = () => {
    setLoading(true);
    setError("");
    api<Product[]>("/products")
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(reload, []);
  useEffect(() => {
    api<User | null>("/auth/me")
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setAuthLoading(false));
  }, []);
  useEffect(() => {
    localStorage.setItem("nh-cart", JSON.stringify(cart));
  }, [cart]);
  useEffect(() => {
    currentUserId.current = user?.id;
    setFavorites([]);
    let cancelled = false;
    const revision = ++favoriteRevision.current;
    if (user)
      api<number[]>("/favorites")
        .then((ids) => {
          if (!cancelled && revision === favoriteRevision.current)
            setFavorites(ids);
        })
        .catch((e) => {
          if (!cancelled) setNotice(e.message);
        });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);
  useEffect(() => {
    const expire = () => {
      setUser(null);
      setNotice("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    };
    window.addEventListener("nh-session-expired", expire);
    return () => window.removeEventListener("nh-session-expired", expire);
  }, []);
  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => setNotice(""), 3500);
      return () => clearTimeout(timer);
    }
  }, [notice]);
  const add = (product: Product, count = 1) => {
    if (!product.stock) return;
    setCart((old) => {
      const item = old.find((i) => i.product.id === product.id);
      return item
        ? old.map((i) =>
            i.product.id === product.id
              ? {
                  product,
                  quantity: Math.min(20, product.stock, i.quantity + count),
                }
              : i,
          )
        : [...old, { product, quantity: Math.min(20, count, product.stock) }];
    });
    setNotice(`Đã thêm ${product.name} vào giỏ hoa`);
  };
  const quantity = (id: number, count: number) =>
    setCart((old) =>
      count < 1
        ? old.filter((i) => i.product.id !== id)
        : old.map((i) =>
            i.product.id === id
              ? { ...i, quantity: Math.min(20, i.product.stock, count) }
              : i,
          ),
    );
  const favorite = async (id: number) => {
    if (!user) {
      setNotice("Đăng nhập để lưu những bó hoa bạn thương.");
      navigate(
        "/dang-nhap?next=" +
          encodeURIComponent(location.pathname + location.search),
      );
      return;
    }
    if (pendingFavorites.current.has(id)) return;
    pendingFavorites.current.add(id);
    const owner = user.id;
    const removing = favorites.includes(id);
    try {
      await api("/favorites/" + id, {
        method: removing ? "DELETE" : "PUT",
        body: "{}",
      });
      if (currentUserId.current === owner) {
        favoriteRevision.current++;
        setFavorites((old) =>
          removing ? old.filter((i) => i !== id) : [...new Set([...old, id])],
        );
        setNotice(
          removing
            ? "Đã bỏ khỏi hoa yêu thích."
            : "Đã lưu vào góc hoa của bạn.",
        );
      }
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      pendingFavorites.current.delete(id);
    }
  };
  return (
    <Context.Provider
      value={{
        products,
        loading,
        error,
        reload,
        cart,
        add,
        quantity,
        clear: () => setCart([]),
        favorites,
        favorite,
        user,
        setUser,
        authLoading,
        toast: setNotice,
      }}
    >
      {children}
      <div className={`toast ${notice ? "visible" : ""}`} role="status">
        {notice}
      </div>
    </Context.Provider>
  );
}
export function useStore() {
  const store = useContext(Context);
  if (!store) throw new Error("Store missing");
  return store;
}
