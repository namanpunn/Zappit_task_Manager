import React, { ReactNode } from "react";

type LayoutProps = {
  children: ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return <div className="container mx-auto mt-5 px-4">{children}</div>;
};

export default Layout;
