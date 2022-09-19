import { useColorModeValue } from "@chakra-ui/react";
import { Chart as ChartJS } from "chart.js";
import { theme } from "lib/theme";

export const ChartJSDefaults = () => {
  const c = theme.colors;
  const colors = {
    text: useColorModeValue(c.black, c.white),
    accent: useColorModeValue(c.teal[900], c.teal[400]),
    grid: useColorModeValue(c.gray[300], c.gray[800]),
  };

  try {
    ChartJS.defaults.responsive = true;
    ChartJS.defaults.color = colors.text;
    ChartJS.defaults.plugins.legend.display = false;
    ChartJS.defaults.datasets.line.pointRadius = 0;
    ChartJS.defaults.datasets.line.borderColor = colors.accent;
    ChartJS.defaults.scale.grid.color = colors.grid;
  } catch (err) {
    // There might not be any charts on the page, in which case ChartJS didn't
    // get initialized.
  }

  // @ts-ignore - duration attribute isn't in the types
  ChartJS.defaults.animation.duration = 300;

  return null;
};
