import { create } from "zustand";
import { DateTime } from "luxon";

export type ViewState = {
  siteId?: number;
  start?: number;
  end?: number;
};

type SiteState = {
  id?: number;
  name: string;
  hostnames: string;
  token?: string;
};

// View state store with URL sync capability
export const useViewStore = create<
  ViewState & { setView: (view: Partial<ViewState>) => void }
>((set) => ({
  siteId: undefined,
  start: Math.floor(DateTime.now().minus({ days: 31 }).toSeconds()),
  end: Math.floor(DateTime.now().toSeconds()),
  setView: (view) => set((state) => ({ ...state, ...view })),
}));

// Current site state store
export const useCurrentSiteStore = create<
  SiteState & {
    setCurrent: (site: Partial<SiteState>) => void;
    resetCurrent: () => void;
  }
>((set) => ({
  id: undefined,
  name: "",
  hostnames: "",
  token: undefined,
  setCurrent: (site) => set((state) => ({ ...state, ...site })),
  resetCurrent: () =>
    set({
      id: undefined,
      name: "",
      hostnames: "",
      token: undefined,
    }),
}));

// Show site editor state store
export const useShowSiteEditorStore = create<{
  showEditor: boolean;
  setShowEditor: (show: boolean) => void;
}>((set) => ({
  showEditor: false,
  setShowEditor: (show) => set({ showEditor: show }),
}));
