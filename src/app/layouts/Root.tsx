import { Outlet } from "react-router";
import { useLayoutEffect } from "react";
import { Navbar, Footer } from "../components/shared";
import { inter } from "../components/shared";

export default function Root() {
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
  }, []);

  return (
    <div className="min-h-screen bg-[#080C08] animate-page-fade" style={{ fontFamily: inter }}>
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
}
