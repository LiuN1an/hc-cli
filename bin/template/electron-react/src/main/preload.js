const { contextBridge, remote } = require("electron");

const { dialog, getCurrentWindow } = remote;

const fs = require("fs");

const win = getCurrentWindow();

contextBridge.exposeInMainWorld("electron", {
  api: {
    registerSystemEvent() {
      document
        .getElementById("native-close-btn")
        .addEventListener("click", () => {
          console.log("???");
          win.close();
        });
    },
  },
});

const createPromise = () => {
  let resolve, reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};
