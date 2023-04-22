import { GameStorageService } from '@app/services/game-storage-service/game-storage.service';
import { RankingData } from '@common/interfaces/ranking.data';
import { NOT_FOUND } from '@common/utils/constants';
import { Service } from 'typedi';

@Service()
export class GameRankingService {
    private position: string;
    private gameName: string;
    private newRanking: { name: string; score: number; gameName: string; socketId: string };
    private matchType: string;

    constructor(private readonly gameStorageService: GameStorageService) {}

    async handleNewScore(
        gameId: string,
        isOneVersusOne: boolean,
        ranking: {
            name: string;
            score: number;
            gameName: string;
            socketId: string;
        },
    ): Promise<RankingData | void> {
        this.newRanking = ranking;
        this.gameName = ranking.gameName;
        this.matchType = isOneVersusOne ? '1 contre 1' : 'Solo';
        return await this.updateRanking(gameId, isOneVersusOne);
    }

    async updateRanking(gameId: string, isOneVersusOne: boolean): Promise<RankingData | void> {
        try {
            if ((await this.gameStorageService.getGameById(gameId)).gameData === null) {
                return;
            }
            const updateRankingIndex = isOneVersusOne
                ? await this.gameStorageService.updateGameOneVersusOneNewBreakingRecord(gameId, this.newRanking)
                : await this.gameStorageService.updateGameSoloNewBreakingRecord(gameId, this.newRanking);

            if (updateRankingIndex !== NOT_FOUND && updateRankingIndex !== undefined) {
                this.positionToString(updateRankingIndex + 1);
                return {
                    username: this.newRanking.name,
                    position: this.position,
                    gameName: this.gameName,
                    matchType: this.matchType,
                    winnerSocketId: this.newRanking.socketId,
                } as RankingData;
            }
        } catch (e) {
            return Promise.reject(e);
        }
    }

    private positionToString(position: number): void {
        switch (position) {
            case 1: {
                this.position = 'première';
                break;
            }
            case 2: {
                this.position = 'deuxième';
                break;
            }
            case 3: {
                this.position = 'troisième';
                break;
            }
            default: {
                this.position = '';
                break;
            }
        }
    }
}
