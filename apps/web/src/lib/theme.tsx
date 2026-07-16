import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "dark" | "light";

const Ctx = createContext<{ theme: Theme; setTheme: (t: Theme) => void; toggle: () => void }>({
  theme: "dark",
  setTheme: () => {},
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  useEffect(() => {
    const stored = localStorage.getItem("katenda.theme") as Theme | null;
    const initial: Theme = stored === "light" || stored === "dark" ? stored : "dark";
    setThemeState(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);
  const setTheme = (t: Theme) => {
    setThemeState(t);
    document.documentElement.classList.toggle("dark", t === "dark");
    localStorage.setItem("katenda.theme", t);
  };
  return (
    <Ctx.Provider value={{ theme, setTheme, toggle: () => setTheme(theme === "dark" ? "light" : "dark") }}>
      {children}
    </Ctx.Provider>
  );
}

export const useTheme = () => useContext(Ctx);
