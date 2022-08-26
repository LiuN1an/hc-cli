import { BrowserWindow, app, Menu } from "electron";
import path from "path";

const loadHTML = (window: BrowserWindow, name: string) => {
  if (process.env.NODE_ENV === "production") {
    window
      .loadFile(path.resolve(__dirname, `../renderer/${name}/index.html`))
      .catch(console.error);
    return;
  } else {
    window
      .loadURL(`http://localhost:${process.env.PORT}/renderer/${name}`)
      .catch(console.error);
  }
};

let mainWindow: BrowserWindow | null = null;

// 创建窗口
const createMainWindow = () => {
  if (mainWindow) return;
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      preload: path.join(
        __dirname,
        `./preload.${
          process.env.NODE_ENV === "production" ? "prod." : "dev."
        }js`
      ),
    },
    frame: false,
    transparent: true,
    show: false,
    // resizable: false,
    width: 1200,
    height: 786,
  });
  loadHTML(mainWindow, "index");
  mainWindow.on("close", () => (mainWindow = null));
  mainWindow.webContents.on("crashed", () => console.error("crash"));
  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow?.show();
    mainWindow?.focus();
  });
  mainWindow.webContents.openDevTools();
};

Menu.setApplicationMenu(null);

app.on("window-all-closed", () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createMainWindow();
    app.on("activate", () => {
      if (mainWindow === null) createMainWindow();
    });
  })
  .catch(console.log);
