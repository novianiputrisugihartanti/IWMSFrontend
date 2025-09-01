import { useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Cookies from "js-cookie";
import { decryptId } from "./component/util/Encryptor";
import { ROOT_LINK } from "./component/util/Constants";
import CreateMenu from "./component/util/CreateMenu";
import CreateRoute from "./component/util/CreateRoute.jsx";

import Container from "./component/backbone/Container";
import Header from "./component/backbone/Header";
import SideBar from "./component/backbone/SideBar";

import Login from "./component/page/login/Index";
import Logout from "./component/page/logout/Index";
import NotFound from "./component/page/not-found/Index";
import LandingPage from "./component/page/landing-page/Root.jsx";
import '@fortawesome/fontawesome-free/css/all.min.css';

export default function App() {
  const [listMenu, setListMenu] = useState([]);
  const [listRoute, setListRoute] = useState([]);
  const isLoginPage = window.location.pathname === "/login";
  const isLogoutPage = window.location.pathname === "/logout";
  const isLandingPage = window.location.pathname === "/";
  const cookie = Cookies.get("activeUser");

  const [isHideSidebar, setIsHideSidebar] = useState(false);
  const handleToggleMenu = () => {
    const sidebar = document.getElementById("sidebar");
    const container = document.getElementsByClassName("responsiveContainer")[0];
    sidebar.classList.toggle("hide");
    container.style.marginLeft = isHideSidebar ? "13vw" : "20px";

    setIsHideSidebar(!isHideSidebar);
  };

  if (isLoginPage) return <Login />;
  else if (isLogoutPage) return <Logout />;
  else if (!cookie) return <LandingPage isLandingPage={isLandingPage} />;
  else {
    const userInfo = JSON.parse(decryptId(cookie));
    useEffect(() => {
      const getMenu = async () => {
        const menu = await CreateMenu(userInfo.role);
        const route = CreateRoute.filter((routeItem) => {
          const pathExistsInMenu = menu.some((menuItem) => {
            if (menuItem.link.replace(ROOT_LINK, "") === routeItem.path) {
              return true;
            }
            if (menuItem.sub && menuItem.sub.length > 0) {
              return menuItem.sub.some(
                (subItem) =>
                  subItem.link.replace(ROOT_LINK, "") === routeItem.path
              );
            }
            return false;
          });

          return pathExistsInMenu;
        });

        route.push({
          path: "/*",
          element: <NotFound />,
        });

        setListMenu(menu.filter((item) => item.headkey !== "landing_page"));
        setListRoute(route);
      };

      getMenu();
    }, []);
    return (
      <>
        {listRoute.length > 0 ? isLandingPage ? (
          <>
            <LandingPage userInfo={userInfo} isLandingPage={isLandingPage} />
          </>
        ) : (
          <>
            <Header userInfo={userInfo} isLandingPage={isLandingPage} handleToggleMenu={handleToggleMenu} isHideSidebar={isHideSidebar} />
            <div style={{ marginTop: "70px" }}></div>
            <div className="d-flex flex-row position-relative">
              <SideBar listMenu={listMenu} />
              <Container>
                <RouterProvider router={createBrowserRouter(listRoute)} />
              </Container>
            </div>
          </>
        ) : null}
      </>
    );
  }
}
