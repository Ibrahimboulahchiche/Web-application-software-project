/* eslint-disable no-console */
import { DatabaseService } from '@app/services/database-service/database.service';
import { FileSystemManager } from '@app/services/file-system/file-system-manager';
import {
    DEFAULT_GAMES_PATH,
    DISPLAYED_GAMES_LIMIT,
    IMAGE_DELIVERY_SERVER,
    LAST_GAME_ID_FILE,
    MODIFIED_IMAGE_FILE,
    ORIGINAL_IMAGE_FILE,
    PERSISTENT_DATA_FOLDER_PATH,
} from '@app/utils/env';
import { GameData } from '@common/interfaces/game.data';
import { Ranking, defaultRanking } from '@common/interfaces/ranking';
import {
    DELETE_SUCCESS,
    ERROR,
    ERROR_READING_IMAGE,
    ERROR_READING_SECOND_IMAGE,
    FILE_WAS_NOT_WRITTEN,
    FILE_WRITTEN,
    FOLDER_CREATED,
    FOLDER_NOT_CREATED,
    GAME_DATA_NOT_FOUND,
} from '@common/utils/constants';
import 'dotenv/config';
import { mkdir, readFileSync, readdir, rm, writeFile, writeFileSync } from 'fs';
import { InsertOneResult } from 'mongodb';
import 'reflect-metadata';
import { Service } from 'typedi';

@Service()
export class GameStorageService {
    fileSystemManager: FileSystemManager = new FileSystemManager();

    constructor(private databaseService: DatabaseService) {}

    get collection() {
        return this.databaseService.database.collection(process.env.DATABASE_COLLECTION_GAMES as string);
    }

    getNextAvailableGameId(): number {
        let output = -1;
        // read the next id from the file lastGameId.txt if it exists or create it with 0
        try {
            let lastGameId = 0;
            const data = readFileSync(PERSISTENT_DATA_FOLDER_PATH + LAST_GAME_ID_FILE);
            lastGameId = parseInt(data.toString(), 10);
            const nextGameId = lastGameId + 1;
            writeFileSync(PERSISTENT_DATA_FOLDER_PATH + LAST_GAME_ID_FILE, nextGameId.toString());
            output = nextGameId;
        } catch (err) {
            writeFileSync(PERSISTENT_DATA_FOLDER_PATH + LAST_GAME_ID_FILE, '0');
            output = 0;
        }

        return output;
    }

    async deleteStoredDataForAllTheGame(): Promise<void> {
        readdir(PERSISTENT_DATA_FOLDER_PATH, { withFileTypes: true }, (err, files) => {
            if (err) {
                console.error(err);
            } else {
                files.forEach((file) => {
                    if (file.isDirectory()) {
                        const folderPath = `${PERSISTENT_DATA_FOLDER_PATH}${file.name}`;
                        rm(folderPath, { recursive: true }, (error) => {
                            if (error) {
                                console.error(error);
                            } else {
                                console.log(folderPath + DELETE_SUCCESS);
                            }
                        });
                    }
                });
            }
        });
    }

    async deleteStoredData(gameId: string): Promise<void> {
        readdir(PERSISTENT_DATA_FOLDER_PATH, { withFileTypes: true }, (err, files) => {
            if (err) {
                console.error(err);
            } else {
                files.forEach(async (file) => {
                    if (file.name === gameId) {
                        const folderPath = `${PERSISTENT_DATA_FOLDER_PATH}${file.name}`;
                        rm(folderPath, { recursive: false }, (error) => {
                            if (error) {
                                console.error(error);
                            } else {
                                console.log(folderPath + DELETE_SUCCESS);
                            }
                        });
                        return;
                    }
                });
            }
        });
    }

    async getAllGames(): Promise<
        {
            gameData: GameData;
            originalImage: Buffer;
            modifiedImage: Buffer;
        }[]
    > {
        const allGames = await this.collection.find<GameData>({}).toArray();

        const gamesToReturn = [];
        for (const game of allGames) {
            const images = this.getGameImages(game.id.toString());
            gamesToReturn.push({
                gameData: game,
                originalImage: images.originalImage,
                modifiedImage: images.modifiedImage,
            });
        }
        return gamesToReturn;
    }

    async getNumberOfSavedGames() {
        return await this.collection.countDocuments({});
    }

    async getGameById(id: string) {
        const query = { id: parseInt(id, 10) };
        const game = await this.collection.findOne<GameData>(query);
        const images = this.getGameImages(id);
        return { gameData: game, originalImage: images.originalImage, modifiedImage: images.modifiedImage };
    }

    async deleteById(id: string): Promise<void> {
        const query = { id: parseInt(id, 10) };
        await this.collection.findOneAndDelete(query);
        await this.deleteStoredData(id);
    }

    async deleteAll(): Promise<void> {
        await this.deleteStoredDataForAllTheGame();
        await this.collection.deleteMany({});
    }

    async getGamesInPage(pageNumber: number): Promise<
        {
            gameData: GameData;
            originalImage: string;
            matchToJoinIfAvailable: string | null;
        }[]
    > {
        // checks if the number of games available for one page is under four
        const skipNumber = pageNumber * DISPLAYED_GAMES_LIMIT;
        const nextGames = await this.collection
            .find<GameData>({}, { projection: { differences: 0, nbrDifferences: 0 } })
            .skip(skipNumber)
            .limit(DISPLAYED_GAMES_LIMIT)
            .toArray();

        const gamesToReturn = [];
        for (const game of nextGames) {
            gamesToReturn.push({
                gameData: game,
                originalImage: IMAGE_DELIVERY_SERVER + game.id.toString() + '/1',
                matchToJoinIfAvailable: null,
            });
        }
        return gamesToReturn;
    }

    getGameImages(id: string) {
        const folderPath = PERSISTENT_DATA_FOLDER_PATH + id + '/';
        let firstImage = Buffer.from([0]);
        let secondImage = Buffer.from([0]);

        try {
            firstImage = readFileSync(folderPath + ORIGINAL_IMAGE_FILE);
        } catch (error) {
            console.log(ERROR_READING_IMAGE);
        }

        try {
            secondImage = readFileSync(folderPath + MODIFIED_IMAGE_FILE);
        } catch (error) {
            console.log(ERROR_READING_SECOND_IMAGE);
        }

        return { originalImage: firstImage, modifiedImage: secondImage };
    }

    async storeDefaultGames() {
        const games = JSON.parse(await this.fileSystemManager.readFile(DEFAULT_GAMES_PATH)).games;
        await this.databaseService.populateDb(process.env.DATABASE_COLLECTION_GAMES as string, games);
    }

    async updateGameSoloNewBreakingRecord(id: string, newBreakingRanking: Ranking): Promise<number | undefined> {
        const gameData = (await this.getGameById(id)).gameData;
        const query = { id: parseInt(id, 10) };
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const update = { $set: { 'soloRanking.$[elem]': newBreakingRanking } };
        const scoreUpdate = { $push: { soloRanking: { $each: [], $sort: { score: 1 } } } };
        if (!gameData) throw new Error(GAME_DATA_NOT_FOUND + id);
        const options = {
            multi: false,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            arrayFilters: [{ 'elem.score': { $gt: newBreakingRanking.score }, 'elem.name': gameData.soloRanking[2].name }],
        };
        try {
            await this.collection.findOneAndUpdate(query, update, options);
            await this.collection.updateOne(query, scoreUpdate);
        } catch (e) {
            console.error(ERROR + e);
        }
        return (await this.getGameById(id)).gameData?.soloRanking.findIndex((ranking) => ranking.name === newBreakingRanking.name);
    }

    async updateGameOneVersusOneNewBreakingRecord(id: string, newBreakingRanking: Ranking): Promise<number | undefined> {
        const gameData = (await this.getGameById(id)).gameData;
        const query = { id: parseInt(id, 10) };
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const update = { $set: { 'oneVersusOneRanking.$[elem]': newBreakingRanking } };
        const scoreUpdate = { $push: { oneVersusOneRanking: { $each: [], $sort: { score: 1 } } } };
        if (!gameData) throw new Error(GAME_DATA_NOT_FOUND + id);

        const options = {
            multi: false,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            arrayFilters: [{ 'elem.score': { $gt: newBreakingRanking.score }, 'elem.name': gameData.oneVersusOneRanking[2].name }],
        };

        try {
            await this.collection.findOneAndUpdate(query, update, options);
            await this.collection.updateOne(query, scoreUpdate);
        } catch (e) {
            console.error(ERROR + e);
        }
        return (await this.getGameById(id)).gameData?.oneVersusOneRanking.findIndex((ranking) => ranking.name === newBreakingRanking.name);
    }

    async resetScoresById(id: string) {
        const query = { id: parseInt(id, 10) };
        const resetRanking = { $set: { oneVersusOneRanking: defaultRanking, soloRanking: defaultRanking } };
        try {
            await this.collection.findOneAndUpdate(query, resetRanking);
        } catch (e) {
            console.error(ERROR + e);
        }
    }

    async resetAllScores() {
        const resetRanking = { $set: { oneVersusOneRanking: defaultRanking, soloRanking: defaultRanking } };
        await this.collection.updateMany({}, resetRanking);
    }

    createFolder(folderPath: string) {
        mkdir(folderPath, { recursive: true }, (err) => {
            if (err) {
                console.error(FOLDER_NOT_CREATED);
            } else {
                console.log(FOLDER_CREATED);
            }
        });
    }

    async storeGameImages(id: number, firstImage: Buffer, secondImage: Buffer): Promise<void> {
        const folderPath = PERSISTENT_DATA_FOLDER_PATH + id + '/';
        // Creates the subfolder for the game if it does not exist
        this.createFolder(folderPath);

        writeFile(folderPath + ORIGINAL_IMAGE_FILE, firstImage, this.writeFileErrorManagement);
        writeFile(folderPath + MODIFIED_IMAGE_FILE, secondImage, this.writeFileErrorManagement);
    }

    writeFileErrorManagement = (err: NodeJS.ErrnoException) => {
        if (err) {
            console.error(FILE_WAS_NOT_WRITTEN);
        } else {
            console.log(FILE_WRITTEN);
        }
    };

    async storeGameResult(newGameToAdd: GameData): Promise<InsertOneResult<Document>> {
        return await this.collection.insertOne(newGameToAdd);
    }
}
