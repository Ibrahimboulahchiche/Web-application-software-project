import { DatabaseService } from '@app/services/database-service/database.service';
import { HistoryToSave } from '@common/interfaces/history.to.save';
import { InsertOneResult } from 'mongodb';
import { Service } from 'typedi';

@Service()
export class HistoryStorageService {
    constructor(private databaseService: DatabaseService) {}

    get collection() {
        return this.databaseService.database.collection(process.env.DATABASE_COLLECTION_HISTORY as string);
    }

    async getAllHistory(): Promise<HistoryToSave[]> {
        return await this.collection.find<HistoryToSave>({}).toArray();
    }

    async wipeHistory(): Promise<void> {
        await this.collection.deleteMany({});
    }

    async storeHistory(newHistory: HistoryToSave): Promise<InsertOneResult<Document>> {
        return this.collection.insertOne(newHistory);
    }
}
