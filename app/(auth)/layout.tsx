import React, { ReactNode } from "react";

type LayoutProps = {
  children: ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex justify-center pt-20 pb-5">
      {children}
    </div>
  );
};

export default Layout;
