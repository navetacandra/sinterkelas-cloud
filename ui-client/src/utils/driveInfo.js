import { currentItems } from "../states/driveInfo";
import { request } from "./request";

export async function getDriveInfo(id, initCb, fileCb, errorCb, finalCb) {
  if (initCb && typeof initCb === "function") initCb();
  try {
    const response = await request(`/api/drive/${id}`, {
      method: "POST",
    });
    const json = await response.json();
    const { current: c } = json.data;
    if (c.type === "file") {
      if (fileCb && typeof fileCb === "function") return fileCb(c);
    }
    currentItems.set(json.data);
  } catch (err) {
    if (errorCb && typeof errorCb === "function") errorCb(err);
  } finally {
    if (finalCb && typeof finalCb === "function") finalCb();
  }
}
