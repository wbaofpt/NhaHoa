import {
  useEffect,
  useState,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { useStore } from "./store";

/** Only the first document entry in this tab can show the home welcome. */
export function HomeWelcome() {
  const { pathname } = useLocation();
  const { loading } = useStore();
  const [eligible] = useState(() => {
    try {
      return (
        pathname === "/" && sessionStorage.getItem("nh-welcome-seen") !== "1"
      );
    } catch {
      return pathname === "/";
    }
  });
  const [finished, setFinished] = useState(false);
  const [minimumDone, setMinimumDone] = useState(false);
  useEffect(() => {
    try {
      sessionStorage.setItem("nh-welcome-seen", "1");
    } catch {
      /* Storage may be disabled. */
    }
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => setMinimumDone(true), 1100);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if ((!loading && minimumDone) || pathname !== "/") setFinished(true);
  }, [loading, minimumDone, pathname]);
  return eligible && !finished && pathname === "/" ? (
    <BloomLoader fullscreen label="Chào bạn đến với Nhà Hoa…" />
  ) : null;
}

/** Animate the committed page without delaying navigation or remounting forms. */
export function PageMotion({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const main = useRef<HTMLElement>(null);

  const previousPath = useRef(pathname);
  useLayoutEffect(() => {
    const element = main.current;
    if (!element) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const animations: Animation[] = [];
    const stop = () => animations.forEach((animation) => animation.cancel());
    if (!media.matches && typeof element.animate === "function") {
      animations.push(
        element.animate(
          [
            { opacity: 0, transform: "translateY(18px)" },
            { opacity: 0.2, transform: "translateY(12px)", offset: 0.25 },
            { opacity: 1, transform: "translateY(0)" },
          ],
          { duration: 950, easing: "cubic-bezier(.22,1,.36,1)" },
        ),
      );
    }
    // Keep autofocus inside the new page; otherwise give keyboard users a fresh starting point.
    if (
      previousPath.current !== pathname &&
      !element.contains(document.activeElement)
    ) {
      element.focus({ preventScroll: true });
    }
    previousPath.current = pathname;
    media.addEventListener("change", stop);
    return () => {
      stop();
      media.removeEventListener("change", stop);
    };
  }, [pathname]);
  return (
    <>
      <main id="main" ref={main} tabIndex={-1} className="route-stage">
        {children}
      </main>
    </>
  );
}

function BloomArtwork() {
  return (
    <div className="bloom-loader-art" aria-hidden="true">
      <span className="bloom-orbit" />
      <span className="bloom-orbit bloom-orbit-inner" />
      <img src="/logo-mark.svg" width="52" height="52" alt="" />
      <span className="bloom-dot" />
    </div>
  );
}

let pendingLoaders = 0;
let previousInert = false;
let previousOverflow = "";
export function BloomLoader({
  label = "Nhà đang chuẩn bị những điều đẹp đẽ…",
  fullscreen = false,
}: {
  label?: string;
  fullscreen?: boolean;
}) {
  useLayoutEffect(() => {
    if (!fullscreen) return;
    const root = document.getElementById("root");
    if (pendingLoaders++ === 0) {
      previousInert = root?.inert || false;
      previousOverflow = document.body.style.overflow;
      if (root) root.inert = true;
      document.body.style.overflow = "hidden";
    }
    return () => {
      if (--pendingLoaders === 0) {
        if (root) root.inert = previousInert;
        document.body.style.overflow = previousOverflow;
      }
    };
  }, [fullscreen]);
  if (!fullscreen)
    return (
      <p className="loading-message" role="status">
        {label}
      </p>
    );
  return createPortal(
    <div className="bloom-screen">
      <div className="bloom-loader" role="status" aria-live="polite">
        <BloomArtwork />
        <span className="bloom-loader-name" aria-hidden="true">
          nhà hoa
        </span>
        <p>{label}</p>
        <span className="bloom-loader-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </div>
    </div>,
    document.body,
  );
}
