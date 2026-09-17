import { createContext, useContext, useState } from "react";

const UIContext = createContext(null);
export const useUI = () => useContext(UIContext);

export function UIProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen((v) => !v);
  const closeSidebar = () => setSidebarOpen(false);
  return <UIContext.Provider value={{ sidebarOpen, toggleSidebar, closeSidebar }}>{children}</UIContext.Provider>;
}
