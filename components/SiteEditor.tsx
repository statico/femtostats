import {
  Button,
  Code,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  Field,
  Flex,
  Input,
  Stack,
  Textarea,
  createToaster,
  useClipboard,
} from "@chakra-ui/react";
import { post } from "lib/misc";
import { useCurrentSiteStore, useShowSiteEditorStore } from "lib/stores";
import { useEffect, useState } from "react";
import { MdAdd, MdFileCopy } from "react-icons/md";
import useSWR from "swr";

const toaster = createToaster({
  placement: "top",
  pauseOnPageIdle: true,
});

const SiteEditorModal = () => {
  const { showEditor, setShowEditor } = useShowSiteEditorStore();

  return (
    <DialogRoot
      open={showEditor}
      onOpenChange={(e: { open: boolean }) => {
        setShowEditor(e.open);
      }}
    >
      <DialogBackdrop />
      {/* @ts-ignore - DialogContent should accept children but types are incorrect */}
      <DialogContent maxW="2xl">
        <DialogHeader>Sites</DialogHeader>
        <DialogCloseTrigger />
        <DialogBody>
          <Flex gap={6}>
            <Stack w="250px">
              <SiteList />
            </Stack>
            <Stack gap={6}>
              <SiteEditor />
            </Stack>
          </Flex>
        </DialogBody>
        <DialogFooter></DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

const SiteList = () => {
  const current = useCurrentSiteStore((state) => ({
    id: state.id,
    name: state.name,
    hostnames: state.hostnames,
    token: state.token,
  }));
  const setCurrent = useCurrentSiteStore((state) => state.setCurrent);
  const resetCurrent = useCurrentSiteStore((state) => state.resetCurrent);
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
            setCurrent(site as any);
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
        onClick={resetCurrent}
      >
        <MdAdd />
        New Site
      </Button>
    </>
  );
};

const SiteEditor = () => {
  const site = useCurrentSiteStore((state) => ({
    id: state.id,
    name: state.name,
    hostnames: state.hostnames,
    token: state.token,
  }));
  const setCurrent = useCurrentSiteStore((state) => state.setCurrent);
  const resetCurrent = useCurrentSiteStore((state) => state.resetCurrent);
  const { data, mutate } = useSWR("/api/stats/sites/list");

  const [reallyDelete, setReallyDelete] = useState(false);
  useEffect(() => {
    setReallyDelete(false);
  }, [site.id]);

  const [tag, setTag] = useState("");
  useEffect(() => {
    if (typeof location !== "undefined") {
      setTag(
        `<script src="${location.origin}/data.js" data-token="${site.token}" defer></script>`,
      );
    }
  });
  const { onCopy, hasCopied } = useClipboard(tag);

  const handleCreate = async () => {
    try {
      const result = await post("/api/stats/sites/create", site);
      mutate();
      toaster.create({ title: `${site.name} created`, type: "success" });
      setCurrent(result);
    } catch (err) {
      toaster.create({ title: String(err), type: "error" });
    }
  };

  const handleUpdate = async () => {
    try {
      const result = await post("/api/stats/sites/update", site);
      mutate();
      toaster.create({ title: `${site.name} updated`, type: "success" });
      setCurrent(result);
    } catch (err) {
      toaster.create({ title: String(err), type: "error" });
    }
  };

  const handleDelete = async () => {
    try {
      await post("/api/stats/sites/delete", site);
      mutate();
      toaster.create({ title: `${site.name} deleted`, type: "success" });
      if (data?.sites?.length > 1) {
        // Can't wait for mutate
        setCurrent(data.sites.find((s: any) => s.id !== site.id));
      } else {
        resetCurrent();
      }
    } catch (err) {
      toaster.create({ title: String(err), type: "error" });
    }
  };

  return (
    <>
      <Field.Root invalid={site.name.trim() === ""}>
        {/* @ts-ignore - Field.Label should accept children but types are incorrect */}
        <Field.Label>Name</Field.Label>
        <Input
          placeholder="My Awesome Site"
          value={site.name}
          onChange={(e) => {
            setCurrent({
              ...site,
              name: e.target.value,
            });
          }}
        />
      </Field.Root>

      <Field.Root invalid={site.hostnames.trim() === ""}>
        {/* @ts-ignore - Field.Label should accept children but types are incorrect */}
        <Field.Label>Hostname(s)</Field.Label>
        <Textarea
          placeholder="example1.com,*.example2.com"
          value={site.hostnames}
          size="md"
          onChange={(e) => {
            setCurrent({
              ...site,
              hostnames: e.target.value,
            });
          }}
        />
        {/* @ts-ignore - Field.HelperText should accept children but types are incorrect */}
        <Field.HelperText>
          Comma-separate list of valid hostnames for this site. Use an asterix (
          <Code>*</Code>) to match any number of characters.
        </Field.HelperText>
      </Field.Root>

      {site.token && (
        <Field.Root>
          {/* @ts-ignore - Field.Label should accept children but types are incorrect */}
          <Field.Label>
            Add the tag
            <Button variant="ghost" size="xs" onClick={onCopy} ml={4}>
              <MdFileCopy />
              {hasCopied ? "Copied!" : "Copy"}
            </Button>
          </Field.Label>
          <Textarea
            fontFamily="monospace"
            size="sm"
            readOnly
            value={tag}
            onClick={(e: any) => {
              e.target.select();
            }}
          />
          {/* @ts-ignore - Field.HelperText should accept children but types are incorrect */}
          <Field.HelperText>
            Copy this tag anywhere into the HTML of your site.
          </Field.HelperText>
        </Field.Root>
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
                variant="ghost"
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
              variant="ghost"
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
  const { setShowEditor } = useShowSiteEditorStore();
  const { data } = useSWR("/api/stats/sites/list");
  const current = useCurrentSiteStore((state) => ({
    id: state.id,
    name: state.name,
    hostnames: state.hostnames,
    token: state.token,
  }));
  const setCurrent = useCurrentSiteStore((state) => state.setCurrent);

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
