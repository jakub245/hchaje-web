import { Outlet } from "react-router";
import { useEffect } from "react";
import { Navbar, Footer } from "../components/shared";
import { inter } from "../components/shared";

export default function Root() {
  useEffect(() => {
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
        threshold: 0.12,
      }
    );

    document.querySelectorAll<HTMLElement>(".reveal-on-scroll").forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#080C08] animate-page-fade" style={{ fontFamily: inter }}>
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
}
