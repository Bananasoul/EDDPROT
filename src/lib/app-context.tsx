"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { dict, type Lang, type Dict } from "./i18n";

type Role = "physio" | "kine" | "ergo" | "secretary" | "patient" | null;

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  role: Role;
  setRole: (r: Role) => void;
  t: Dict;
};

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("fr");
  const [role, setRole] = useState<Role>(null);

  useEffect(() => {
    const savedLang = (typeof window !== "undefined" && localStorage.getItem("edd.lang")) as Lang | null;
    const savedRole = (typeof window !== "undefined" && localStorage.getItem("edd.role")) as Role;
    if (savedLang === "fr" || savedLang === "de") setLang(savedLang);
    if (savedRole) setRole(savedRole);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("edd.lang", lang);
  }, [lang]);

  useEffect(() => {
    if (typeof window !== "undefined" && role) localStorage.setItem("edd.role", role);
  }, [role]);

  return (
    <AppCtx.Provider value={{ lang, setLang, role, setRole, t: dict[lang] }}>
      {children}
    </AppCtx.Provider>
  );
}

export const useApp = () => {
  const c = useContext(AppCtx);
  if (!c) throw new Error("useApp must be used within AppProvider");
  return c;
};
