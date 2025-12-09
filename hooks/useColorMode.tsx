import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type ColorMode = "light" | "dark";

interface ColorModeContextValue {
  colorMode: ColorMode;
  toggleColorMode: () => void;
  setColorMode: (mode: ColorMode) => void;
}

const ColorModeContext = createContext<ColorModeContextValue | undefined>(
  undefined,
);

export function ColorModeProvider({ children }: { children: ReactNode }) {
  const [colorMode, setColorModeState] = useState<ColorMode>(() => {
    if (typeof window === "undefined") return "dark";
    const stored = localStorage.getItem("chakra-ui-color-mode");
    if (stored === "light" || stored === "dark") return stored;
    // Check system preference
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  });

  useEffect(() => {
    // Update document class for theme
    if (typeof window !== "undefined") {
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(colorMode);
      localStorage.setItem("chakra-ui-color-mode", colorMode);
    }
  }, [colorMode]);

  const setColorMode = (mode: ColorMode) => {
    setColorModeState(mode);
  };

  const toggleColorMode = () => {
    setColorModeState((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ColorModeContext.Provider
      value={{ colorMode, toggleColorMode, setColorMode }}
    >
      {children}
    </ColorModeContext.Provider>
  );
}

export function useColorMode(): ColorModeContextValue {
  const context = useContext(ColorModeContext);
  if (!context) {
    throw new Error("useColorMode must be used within ColorModeProvider");
  }
  return context;
}
