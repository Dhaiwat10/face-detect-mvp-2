// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels = 'ipc-example';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
    /**
     * Invokes the 'process-images' channel in the main process.
     * @param paths An array of file paths of the images to process.
     * @returns A promise that resolves with the processing result.
     */
    processImages: (paths: string[]): Promise<any> => {
      return ipcRenderer.invoke('process-images', paths);
    },
    getAllIndexedFaces: (): Promise<{ id: number; descriptor: string }[]> =>
      ipcRenderer.invoke('get-all-indexed-faces'),
    openFileDialog: (): Promise<string[]> =>
      ipcRenderer.invoke('dialog:open-file'),
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
