import { useColorModeValue, useToken } from "@chakra-ui/react";
import { Chart as ChartJS } from "chart.js";

export const ChartJSDefaults = () => {
  const [black, white, darkTeal, lightTeal, darkGray, lightGray] = useToken(
    "colors",
    ["black", "white", "teal.500", "teal.400", "gray.800", "gray.300"]
  );

  const text = useColorModeValue(black, white);
  const accent = useColorModeValue(darkTeal, lightTeal);
  const grid = useColorModeValue(lightGray, darkGray);

  try {
    ChartJS.defaults.responsive = true;
    ChartJS.defaults.color = text;
    ChartJS.defaults.plugins.legend.display = false;
    ChartJS.defaults.datasets.line.pointRadius = 0;
    ChartJS.defaults.datasets.line.borderColor = accent;
    ChartJS.defaults.scale.grid.color = grid;
  } catch (err) {
    // There might not be any charts on the page, in which case ChartJS didn't
    // get initialized.
  }

  // @ts-ignore - duration attribute isn't in the types
  ChartJS.defaults.animation.duration = 300;

  return null;
};
