"use client";

const THEME_INIT_SCRIPT = `(function(){try{if(localStorage.getItem("katenda.theme")==="dark")document.documentElement.classList.add("dark")}catch(e){}})();`;

export function ThemeInit() {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
    />
  );
}
