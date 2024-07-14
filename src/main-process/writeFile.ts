import { ipcMain } from "electron";
import fs from "fs/promises";
import { EventNames } from "../types";

export function createWriteFileToPath() {
  ipcMain.handle(
    EventNames.WriteSelectedFile,
    async (event, args): Promise<boolean> => {
      if (!args && typeof args !== "string") {
        throw new Error("Did not receive file path");
      }

      const { filePath, data } = args;

      console.log(filePath, data);

      try {
        await fs.writeFile(filePath, data);

        return true;
      } catch (error) {
        return false;
      }
    }
  );
}
