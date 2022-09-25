import {
  Button,
  Code,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Textarea,
  useClipboard,
  useToast,
} from "@chakra-ui/react";
import { post } from "lib/misc";
import { useEffect, useState } from "react";
import { MdAdd, MdFileCopy } from "react-icons/md";
import { atom, useRecoilState, useResetRecoilState } from "recoil";
import useSWR from "swr";

type SiteState = {
  id?: number;
  name: string;
  hostnames: string;
  token?: string;
};

const currentSiteState = atom<SiteState>({
  key: "currentSite",
  default: {
    id: undefined,
    name: "",
    hostnames: "",
    token: undefined,
  },
});

const showSiteEditorState = atom<boolean>({
  key: "showSiteEditor",
  default: false,
});

const SiteEditorModal = () => {
  const [showEditor, setShowEditor] = useRecoilState(showSiteEditorState);

  return (
    <Modal
      size="2xl"
      isOpen={showEditor}
      onClose={() => {
        setShowEditor(false);
      }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Sites</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex gap={6}>
            <Stack w="250px">
              <SiteList />
            </Stack>
            <Stack spacing={6}>
              <SiteEditor />
            </Stack>
          </Flex>
        </ModalBody>
        <ModalFooter></ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const SiteList = () => {
  const [current, setCurrent] = useRecoilState(currentSiteState);
  const resetCurrent = useResetRecoilState(currentSiteState);
  const { data } = useSWR("/api/stats/sites/list");

  return (
    <>
      {data?.sites?.map((site: any) => (
        <Button
          key={site.id}
          variant={current?.id === site.id ? "solid" : "ghost"}
          size="sm"
          w="full"
          justifyContent="flex-start"
          onClick={() => {
            setCurrent(site);
          }}
        >
          {site.name}
        </Button>
      ))}
      <Button
        variant={!current?.id ? "solid" : "ghost"}
        size="sm"
        w="full"
        justifyContent="flex-start"
        leftIcon={<MdAdd />}
        onClick={resetCurrent}
      >
        New Site
      </Button>
    </>
  );
};

const SiteEditor = () => {
  const [site, setSite] = useRecoilState(currentSiteState);
  const resetCurrent = useResetRecoilState(currentSiteState);
  const { data, mutate } = useSWR("/api/stats/sites/list");
  const toast = useToast();

  const [reallyDelete, setReallyDelete] = useState(false);
  useEffect(() => {
    setReallyDelete(false);
  }, [site]);

  const [tag, setTag] = useState("");
  useEffect(() => {
    if (typeof location !== "undefined") {
      setTag(
        `<script src="${location.origin}/fs.js" data-token="${site.token}" defer></script>`
      );
    }
  });
  const { onCopy, hasCopied } = useClipboard(tag);

  const handleCreate = async () => {
    try {
      const result = await post("/api/stats/sites/create", site);
      mutate();
      toast({ status: "success", title: `${site.name} created` });
      setSite(result);
    } catch (err) {
      toast({ status: "error", title: String(err) });
    }
  };

  const handleUpdate = async () => {
    try {
      const result = await post("/api/stats/sites/update", site);
      mutate();
      toast({ status: "success", title: `${site.name} updated` });
      setSite(result);
    } catch (err) {
      toast({ status: "error", title: String(err) });
    }
  };

  const handleDelete = async () => {
    try {
      await post("/api/stats/sites/delete", site);
      mutate();
      toast({ status: "success", title: `${site.name} deleted` });
      if (data?.sites?.length > 1) {
        // Can't wait for mutate
        setSite(data.sites.find((s: any) => s.id !== site.id));
      } else {
        resetCurrent();
      }
    } catch (err) {
      toast({ status: "error", title: String(err) });
    }
  };

  return (
    <>
      <FormControl isInvalid={site.name.trim() === ""}>
        <FormLabel>Name</FormLabel>
        <Input
          placeholder="My Awesome Site"
          value={site.name}
          onChange={(e) => {
            setSite({
              ...site,
              name: e.target.value,
            });
          }}
        />
      </FormControl>

      <FormControl isInvalid={site.hostnames.trim() === ""}>
        <FormLabel>Hostname(s)</FormLabel>
        <Textarea
          placeholder="example1.com,*.example2.com"
          value={site.hostnames}
          size="md"
          onChange={(e) => {
            setSite({
              ...site,
              hostnames: e.target.value,
            });
          }}
        />
        <FormHelperText>
          Comma-separate list of valid hostnames for this site. Use an asterix (
          <Code>*</Code>) to match any number of characters.
        </FormHelperText>
      </FormControl>

      {site.token && (
        <FormControl>
          <FormLabel>
            Add the tag
            <Button
              variant="ghost"
              leftIcon={<MdFileCopy />}
              size="xs"
              onClick={onCopy}
              ml={4}
            >
              {hasCopied ? "Copied!" : "Copy"}
            </Button>
          </FormLabel>
          <Textarea
            fontFamily="monospace"
            size="sm"
            readOnly
            value={tag}
            onClick={(e: any) => {
              e.target.select();
            }}
          />
          <FormHelperText>
            Copy this tag anywhere into the HTML of your site.
          </FormHelperText>
        </FormControl>
      )}

      {site.id ? (
        <>
          <Button colorScheme="blue" onClick={handleUpdate}>
            Save
          </Button>
          {reallyDelete ? (
            <>
              <Button colorScheme="red" onClick={handleDelete}>
                Really Delete {site.name} and All Data?
              </Button>
              <Button
                size="sm"
                variant="link"
                onClick={() => {
                  setReallyDelete(false);
                }}
              >
                No, no, I was kidding, go back
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="link"
              onClick={() => {
                setReallyDelete(true);
              }}
            >
              Delete Site and All Data
            </Button>
          )}
        </>
      ) : (
        <Button colorScheme="blue" onClick={handleCreate}>
          Create
        </Button>
      )}
    </>
  );
};

export const useSiteEditor = () => {
  const [showEditor, setShowEditor] = useRecoilState(showSiteEditorState);
  const { data } = useSWR("/api/stats/sites/list");
  const [current, setCurrent] = useRecoilState(currentSiteState);

  return {
    Component: SiteEditorModal,
    show: () => {
      setShowEditor(true);
      if (data?.sites?.length && !current?.id) {
        setCurrent(data.sites[0]);
      }
    },
    hide: () => {
      setShowEditor(false);
    },
  };
};
