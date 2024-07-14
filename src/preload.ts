// See the Electron documentation for details on how to use preload scripts:

import { contextBridge, ipcRenderer } from "electron";
import { EventNames } from "./types";

// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

contextBridge.exposeInMainWorld("csvReaderAPI", {
  readSelectedFile: (filePath: string) =>
    ipcRenderer.invoke(EventNames.ReadSelectedFile, filePath),
  writeFileToPath: (args: { filePath: string; data: string }) =>
    ipcRenderer.invoke(EventNames.WriteSelectedFile, args),
} as Window["csvReaderAPI"]);
