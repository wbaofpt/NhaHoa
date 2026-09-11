import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useStore } from "./store";
export function MotionEffects() {
  const { pathname, search } = useLocation();
  const { products } = useStore();
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".section-heading,.occasion-card,.product-card,.story-image,.story-copy,.journal-card,.custom-banner,.collection-card,.values>div",
      ),
    );
    let observer: IntersectionObserver | undefined;
    const clear = () => {
      observer?.disconnect();
      nodes.forEach((node) =>
        node.classList.remove("reveal-ready", "reveal-visible"),
      );
    };
    const run = () => {
      clear();
      if (media.matches || !("IntersectionObserver" in window)) return;
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries)
            if (entry.isIntersecting) {
              entry.target.classList.add("reveal-visible");
              observer?.unobserve(entry.target);
            }
        },
        { threshold: 0.08 },
      );
      for (const node of nodes) {
        node.classList.add("reveal-ready");
        observer.observe(node);
      }
    };
    run();
    media.addEventListener("change", run);
    return () => {
      clear();
      media.removeEventListener("change", run);
    };
  }, [pathname, search, products]);
  return null;
}
