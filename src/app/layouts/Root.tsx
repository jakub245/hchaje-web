import { Outlet, useLocation, useNavigationType } from "react-router";
import { useEffect, useLayoutEffect } from "react";
import { Navbar, Footer } from "../components/shared";
import { inter } from "../components/shared";

export default function Root() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const scrollKey = `${location.pathname}${location.search}${location.hash}`;

  useEffect(() => {
    const saveScrollPosition = () => {
      sessionStorage.setItem(
        `scroll:${scrollKey}`,
        JSON.stringify({ x: window.scrollX, y: window.scrollY }),
      );
    };

    window.addEventListener("pagehide", saveScrollPosition);

    return () => {
      saveScrollPosition();
      window.removeEventListener("pagehide", saveScrollPosition);
    };
  }, [scrollKey]);

  useLayoutEffect(() => {
    if (navigationType === "POP") {
      const savedPosition = sessionStorage.getItem(`scroll:${scrollKey}`);

      if (savedPosition) {
        const { x, y } = JSON.parse(savedPosition) as { x: number; y: number };
        window.scrollTo(x, y);
        return;
      }
    }

    if (location.hash) {
      const target = document.getElementById(location.hash.replace("#", ""));
      if (target) {
        target.scrollIntoView();
        return;
      }
    }

    window.scrollTo(0, 0);
  }, [location.key, location.hash, navigationType, scrollKey]);

  useLayoutEffect(() => {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.02,
        rootMargin: "0px 0px -100px 0px",
      }
    );

    const sections = Array.from(document.querySelectorAll<HTMLElement>(".reveal-on-scroll"));
    sections.forEach((section) => observer.observe(section));

    const fallback = window.setTimeout(() => {
      sections.forEach((section) => {
        if (!section.classList.contains("reveal-visible") && section.getBoundingClientRect().top < window.innerHeight) {
          section.classList.add("reveal-visible");
          observer.unobserve(section);
        }
      });
    }, 120);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#080C08] animate-page-fade" style={{ fontFamily: inter }}>
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
}
