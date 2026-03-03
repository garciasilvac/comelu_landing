const REVEAL_SELECTOR = "[data-reveal]";

const revealElement = (element: Element) => {
  if (!(element instanceof HTMLElement)) return;

  const delay = Number(element.dataset.delay);
  element.style.transitionDelay = Number.isFinite(delay) && delay > 0 ? `${delay}ms` : "0ms";
  element.classList.add("is-visible");
};

export const initScrollReveal = () => {
  const revealElements = Array.from(document.querySelectorAll(REVEAL_SELECTOR));
  if (!revealElements.length) return () => {};

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach(revealElement);
    return () => {};
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        revealElement(entry.target);
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -8% 0px",
    },
  );

  revealElements.forEach((element) => observer.observe(element));
  return () => observer.disconnect();
};
