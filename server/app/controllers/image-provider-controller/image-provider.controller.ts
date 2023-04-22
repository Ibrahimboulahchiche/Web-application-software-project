import { PERSISTENT_DATA_FOLDER_PATH } from '@app/utils/env';
import { Request, Response, Router } from 'express';
import * as fs from 'fs';
import { StatusCodes } from 'http-status-codes';
import * as path from 'path';
import { Service } from 'typedi';

@Service()
export class ImageProviderController {
    router: Router;

    constructor() {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.get('/:gameId/:imgId', async (req: Request, res: Response) => {
            const imgPath = path.join(PERSISTENT_DATA_FOLDER_PATH, req.params.gameId, `${req.params.imgId}.bmp`);

            // Check if the file exists
            fs.access(imgPath, fs.constants.F_OK, (err) => {
                if (err) {
                    // If the file doesn't exist, send a 404 error
                    res.status(StatusCodes.NOT_FOUND).send('Image not found at ' + imgPath + '');
                } else {
                    // If the file exists, read it and send it as the response
                    fs.readFile(imgPath, (err2, data) => {
                        if (err2) {
                            // If there's an error reading the file, send a 500 error
                            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Internal server error');
                        } else {
                            // Set the Content-Type header to indicate that it's a BMP image
                            res.setHeader('Content-Type', 'image/bmp');
                            res.send(data);
                        }
                    });
                }
            });
        });
    }
}
