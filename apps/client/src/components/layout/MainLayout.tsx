import type { ReactNode } from "react";

import MainFooter from "./MainFooter";
import MainHeader from "../navigation/MainHeader";

type MainLayoutProps = {
  children: ReactNode;
};

function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="main-layout">
      <MainHeader />

      <main className="main-layout__content">{children}</main>

      <MainFooter />
    </div>
  );
}

export default MainLayout;
