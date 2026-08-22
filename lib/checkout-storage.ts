const CONTACT_STORAGE_KEY = "sandweeji_checkout_info";
const DESTINATION_STORAGE_KEY = "sandweeji_checkout_destination_id";
const SUB_DESTINATION_STORAGE_KEY = "sandweeji_checkout_sub_destination_id";

export type ContactInfo = {
  name: string;
  phone: string;
  address: string;
};

export function loadSavedContact(): Partial<ContactInfo> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(CONTACT_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return {
      name: typeof parsed.name === "string" ? parsed.name : "",
      phone: typeof parsed.phone === "string" ? parsed.phone : "",
      address: typeof parsed.address === "string" ? parsed.address : "",
    };
  } catch {
    return {};
  }
}

export function saveContact(info: ContactInfo) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(info));
  } catch {
    // Storage unavailable (private mode, quota, etc). Non-fatal.
  }
}

function loadId(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function saveId(key: string, id: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (id) window.localStorage.setItem(key, id);
    else window.localStorage.removeItem(key);
  } catch {
    // Storage unavailable. Non-fatal.
  }
}

export const loadSavedDestinationId = () => loadId(DESTINATION_STORAGE_KEY);
export const saveDestinationId = (id: string | null) =>
  saveId(DESTINATION_STORAGE_KEY, id);

export const loadSavedSubDestinationId = () =>
  loadId(SUB_DESTINATION_STORAGE_KEY);
export const saveSubDestinationId = (id: string | null) =>
  saveId(SUB_DESTINATION_STORAGE_KEY, id);
