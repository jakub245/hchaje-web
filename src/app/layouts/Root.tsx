import { Outlet } from "react-router";
import { Navbar, Footer } from "../components/shared";
import { inter } from "../components/shared";

export default function Root() {
  return (
    <div className="min-h-screen pt-16 bg-[#080C08]" style={{ fontFamily: inter }}>
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
}
