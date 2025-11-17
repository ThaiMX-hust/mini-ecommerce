import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import CartPanel from "../CartPanel/CartPanel";

const Layout = () => {
  return (
    <>
      <Header />
      <CartPanel />
      <main>
        {/* Outlet sẽ render component tương ứng với route hiện tại */}
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default Layout;
