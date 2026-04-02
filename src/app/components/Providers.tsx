"use client";

import { useState } from "react";
import { Provider } from "react-redux";
import store from "@/redux/store";
import { Initialload } from "@/app/components/layouts/contextapi";


export function Providers({ children }: { children: React.ReactNode }) {
  const [pageloading, setpageloading] = useState(false);

  return (
    <Provider store={store}>
      <Initialload.Provider value={{ pageloading, setpageloading }}>
        {children}
      </Initialload.Provider>
    </Provider>
  );
}