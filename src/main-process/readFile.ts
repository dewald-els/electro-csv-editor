import { BrowserWindow, ipcMain } from "electron";
import fs from "fs/promises";
import { EventNames, FileReadResult } from "../types";

export function createReadFileFromPath(mainWindow?: BrowserWindow) {
  ipcMain.handle(
    EventNames.ReadSelectedFile,
    async (event, args): Promise<FileReadResult> => {
      if (!args && typeof args !== "string") {
        throw new Error("Did not receive file path");
      }

      const filePath = args;

      try {
        const result = await fs.readFile(filePath, {
          encoding: "utf-8",
        });

        if (mainWindow) {
          mainWindow.setTitle("CSV Editor - " + filePath.split("/")?.pop());
        }

        const headersRows = separateHeaderFromRows(result);

        if (headersRows.length < 2) {
          throw new Error(
            "File does not contain headers. Refusing to continue"
          );
        }

        const [headersString, ...rows] = headersRows;

        const headers = headersString.split(",");

        const data = rows.reduce((rowAcc, row) => {
          const cols = row.split(",").reduce((colAcc, col, idx) => {
            return {
              ...colAcc,
              [headers[idx]]: col,
            };
          }, {});
          rowAcc.push(cols);
          return rowAcc;
        }, []);

        return {
          headers,
          data,
        };
      } catch (error) {
        return {
          error: error.message ?? "Could not read the file",
        };
      }
    }
  );
}

const separateHeaderFromRows = (rawText: string) => {
  if (rawText.indexOf("\n") >= 0) {
    return rawText.split("\n");
  } else if (rawText.indexOf("\r") >= 0) {
    return rawText.split("\r");
  } else {
    throw new Error("No headers or invalid new line character");
  }
};
