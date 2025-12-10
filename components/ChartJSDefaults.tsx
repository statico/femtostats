import { useColorMode } from "hooks/useColorMode";
import { Chart as ChartJS } from "chart.js";
import { useEffect, useState } from "react";

export const ChartJSDefaults = () => {
  const [mounted, setMounted] = useState(false);
  const { colorMode } = useColorMode();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only run on client side to avoid SSR issues
    if (!mounted || typeof window === "undefined") {
      return;
    }

    // Use direct color values based on color mode
    const text = colorMode === "dark" ? "#ffffff" : "#000000";
    const accent = colorMode === "dark" ? "#4FD1C7" : "#319795"; // teal.400 and teal.500
    const grid = colorMode === "dark" ? "#1A202C" : "#CBD5E0"; // gray.800 and gray.300

    try {
      ChartJS.defaults.responsive = true;
      ChartJS.defaults.color = text;
      ChartJS.defaults.plugins.legend.display = false;
      ChartJS.defaults.datasets.line.pointRadius = 0;
      ChartJS.defaults.datasets.line.borderColor = accent;
      ChartJS.defaults.scale.grid.color = grid;
      // @ts-ignore - duration attribute isn't in the types
      ChartJS.defaults.animation.duration = 300;
    } catch (err) {
      // There might not be any charts on the page, in which case ChartJS didn't
      // get initialized.
    }
  }, [colorMode, mounted]);

  return null;
};
