export const win = (
  window as unknown as {
    electron: {
      api: {
        registerSystemEvent: () => () => void;
      };
    };
  }
).electron;
