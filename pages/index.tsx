import { Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import db from "lib/db";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async ({}) => {
  const data = await db
    .select()
    .from("events")
    .limit(1000)
    .orderBy("timestamp", "desc");
  return { props: { data } };
};

export default function Page(props: any) {
  if (!props.data?.[0]) return "No data";
  const columns = Object.keys(props.data[0]);

  return (
    <Table size="sm">
      <Thead>
        <Tr>
          {columns.map((c) => (
            <Th key={c}>{c}</Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {props.data.map((row: any, index: number) => (
          <Tr key={index}>
            {columns.map((c) => (
              <Td key={c}>{row[c]}</Td>
            ))}
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}
