import { useColorMode } from "./useColorMode";

/**
 * Replacement for useColorModeValue from Chakra UI v2
 * In Chakra UI v3, useColorModeValue was removed.
 * This hook provides the same API for backward compatibility.
 */
export function useColorModeValue<T>(lightValue: T, darkValue: T): T {
  const { colorMode } = useColorMode();
  return colorMode === "dark" ? darkValue : lightValue;
}
