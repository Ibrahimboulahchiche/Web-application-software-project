import { expect } from 'chai';
import { FileSystemManager } from './file-system-manager';

describe('FileSysteManager', () => {
    let fileManager: FileSystemManager;
    let path: string;

    beforeEach(async () => {
        fileManager = new FileSystemManager();
        path = './app/services/file-system/test-file.json';
    });

    it('returns a Buffer', async () => {
        const contents = await fileManager.readFile(path);
        expect(Buffer.isBuffer(contents)).to.equal(true);
    });
});
