import { useToken } from "@chakra-ui/react";
import { useColorModeValue } from "hooks/useColorModeValue";
import { Chart as ChartJS } from "chart.js";
import { useEffect, useState } from "react";

export const ChartJSDefaults = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only run on client side to avoid SSR issues
  if (!mounted || typeof window === "undefined") {
    return null;
  }

  const [black, white, darkTeal, lightTeal, darkGray, lightGray] = useToken(
    "colors",
    ["black", "white", "teal.500", "teal.400", "gray.800", "gray.300"],
  );

  const text = useColorModeValue(black, white);
  const accent = useColorModeValue(darkTeal, lightTeal);
  const grid = useColorModeValue(lightGray, darkGray);

  useEffect(() => {
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
  }, [text, accent, grid]);

  return null;
};
