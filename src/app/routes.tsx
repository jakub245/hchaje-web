import { createBrowserRouter } from "react-router";
import Root from "./layouts/Root";
import Home from "./pages/Home";
import AktualityPage from "./pages/Aktuality";
import AktualitaDetailPage from "./pages/AktualitaDetail";
import DruzstvaPage from "./pages/Druzstva";
import DruzstvoDetail from "./pages/DruzstvoDetail";
import AkcePage from "./pages/Akce";
import TreninkyPage from "./pages/Treninky";
import OKlubuPage from "./pages/OKlubu";
import KontaktyPage from "./pages/Kontakty";
import ChciSePridatPage from "./pages/ChciSePridat";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "aktuality", Component: AktualityPage },
      { path: "aktuality/:articleSlug", Component: AktualitaDetailPage },
      { path: "druzstva", Component: DruzstvaPage },
      { path: "druzstva/:slug", Component: DruzstvoDetail },
      { path: "akce", Component: AkcePage },
      { path: "treninky", Component: TreninkyPage },
      { path: "o-klubu", Component: OKlubuPage },
      { path: "kontakty", Component: KontaktyPage },
      { path: "nabor", Component: ChciSePridatPage },
      { path: "chci-se-pridat", Component: ChciSePridatPage },
    ],
  },
]);
