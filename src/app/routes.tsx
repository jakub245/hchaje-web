import { createBrowserRouter } from "react-router";
import Root from "./layouts/Root";
import Home from "./pages/Home";
import AktualityPage from "./pages/Aktuality";
import DruzstvaPage from "./pages/Druzstva";
import DruzstvoDetail from "./pages/DruzstvoDetail";
import TreninkyPage from "./pages/Treninky";
import OKlubuPage from "./pages/OKlubu";
import KontaktyPage from "./pages/Kontakty";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "aktuality", Component: AktualityPage },
      { path: "druzstva", Component: DruzstvaPage },
      { path: "druzstva/:slug", Component: DruzstvoDetail },
      { path: "treninky", Component: TreninkyPage },
      { path: "o-klubu", Component: OKlubuPage },
      { path: "kontakty", Component: KontaktyPage },
    ],
  },
]);
