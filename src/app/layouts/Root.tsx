import { Outlet } from "react-router";
import { Navbar, Footer } from "../components/shared";
import { inter } from "../components/shared";

export default function Root() {
  return (
    <div className="min-h-screen bg-[#080C08] animate-page-fade" style={{ fontFamily: inter }}>
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
}
