/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');

class FileSystemManager {
    /**
     * Lit et retourne le contenu d'un fichier
     *
     * @param path : le chemin qui correspond au fichier JSON
     * @returns le contenu du fichier sous la forme de Buffer
     */

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async readFile(path: any | Buffer) {
        return await fs.promises.readFile(path);
    }
}
export { FileSystemManager };
