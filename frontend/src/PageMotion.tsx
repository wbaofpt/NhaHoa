import { useLayoutEffect, useRef, type ReactNode } from "react";
import { useLocation } from "react-router-dom";

/** Animate the committed page without delaying navigation or remounting forms. */
export function PageMotion({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const main = useRef<HTMLElement>(null);
  const flourish = useRef<HTMLDivElement>(null);
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
            { opacity: 0, transform: "translateY(12px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          { duration: 420, easing: "cubic-bezier(.22,1,.36,1)" },
        ),
      );
      if (flourish.current)
        animations.push(
          flourish.current.animate(
            [
              { opacity: 0, transform: "scaleX(.04)" },
              { opacity: 0.8, transform: "scaleX(.55)", offset: 0.4 },
              { opacity: 0, transform: "scaleX(1)" },
            ],
            { duration: 650, easing: "ease-out" },
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
      <div ref={flourish} className="route-flourish" aria-hidden="true" />
      <main id="main" ref={main} tabIndex={-1} className="route-stage">
        {children}
      </main>
    </>
  );
}

export function BloomLoader({
  label = "Nhà đang chuẩn bị những điều đẹp đẽ…",
}: {
  label?: string;
}) {
  return (
    <div className="bloom-loader" role="status" aria-live="polite">
      <div className="bloom-loader-art" aria-hidden="true">
        <span className="bloom-orbit" />
        <span className="bloom-orbit bloom-orbit-inner" />
        <img src="/logo-mark.svg" width="52" height="52" alt="" />
        <span className="bloom-dot" />
      </div>
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
  );
}
