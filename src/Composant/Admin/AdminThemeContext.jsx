import { createContext, useContext } from "react";

export const AdminThemeContext = createContext(false);

export function useAdminTheme() {
  return useContext(AdminThemeContext);
}
