import { Center, HStack, Text } from "@chakra-ui/react";
import countries from "i18n-iso-countries";
import Flag from "react-world-flags";

countries.registerLocale(require("i18n-iso-countries/langs/en.json"));

export const Country = ({ code }: { code: string | null }) => {
  const name =
    countries.getName(code || "", "en", { select: "alias" }) ||
    code ||
    "(unknown)";
  return (
    <HStack>
      <Flag
        code={code ?? ""}
        height="20px"
        width="20px"
        fallback={
          <Center h="16px" w="20px" bg="black" color="white">
            ?
          </Center>
        }
      />
      <Text>{name}</Text>
    </HStack>
  );
};
