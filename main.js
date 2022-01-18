const { app, BrowserWindow } = require("electron");
const ipc = require("electron").ipcMain;
const fs = require("fs");
let path = "";
let content = "";
let win;
function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  win.loadFile("index.html");
  // win.setMenu(null);
}
ipc.on("get-path", async (e, ar) => {
  path = ar.path;
});
setInterval(() => {
  try {
    if (path) {
      const newContent = fs.readFileSync(path, "utf8");

      if (newContent != content) {
        content = newContent;

        win.webContents.send("asynchronous-message", { content });
      }
    }
  } catch (error) {}
}, 1000);

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
