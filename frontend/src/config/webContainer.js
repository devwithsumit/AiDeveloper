import { WebContainer } from '@webcontainer/api';

let webcontainerInstance = null;
// Call only once
export const getWebContainer = async () => {
    if (webcontainerInstance === null) {
        webcontainerInstance = await WebContainer.boot()
    }
    return webcontainerInstance;
}