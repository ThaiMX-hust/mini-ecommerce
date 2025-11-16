import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";

const Layout = () => {
  return (
    <>
      <Header />
      <main>
        {/* Outlet sẽ render component tương ứng với route hiện tại */}
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default Layout;
