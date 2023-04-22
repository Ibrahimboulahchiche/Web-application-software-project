import { GameRankingService } from '@app/services/game-ranking-service/game-ranking.service';
import { GameStorageService } from '@app/services/game-storage-service/game-storage.service';
import { MatchManagerService } from '@app/services/match-manager-service/match-manager.service';
import { MatchingDifferencesService } from '@app/services/matching-difference-service/matching-differences.service';
import { Player } from '@common/classes/player';
import { Vector2 } from '@common/classes/vector2';
import { MatchType } from '@common/enums/match.type';
import { GameData } from '@common/interfaces/game.data';
import { MILLISECOND_TO_SECONDS, NOT_FOUND } from '@common/utils/constants';
import * as http from 'http';
import * as io from 'socket.io';

export class SocketManager {
    matchingDifferencesService: MatchingDifferencesService;
    private sio: io.Server;

    // eslint-disable-next-line max-params
    constructor(
        server: http.Server,
        private readonly matchManagerService: MatchManagerService,
        private readonly gameRankingTimeService: GameRankingService,
        private readonly gamesStorageService: GameStorageService,
    ) {
        this.sio = new io.Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] }, maxHttpBufferSize: 1e8 });
        this.matchingDifferencesService = new MatchingDifferencesService();
    }

    handleSockets(): void {
        this.sio.on('connection', (socket) => {
            let joinedRoomName = '';

            socket.on('registerGameData', (data: { gameData: GameData }) => {
                socket.data = data;
                sendMatchUpdate({ matchId: joinedRoomName });
            });

            socket.on('validateDifference', (data: { foundDifferences: boolean[]; position: Vector2; isPlayer1: boolean }) => {
                const foundDifferenceId = this.matchingDifferencesService.getDifferenceIndex(
                    socket.data.gameData as GameData,
                    data.position as Vector2,
                );
                const successfullyFoundDifference = foundDifferenceId !== NOT_FOUND && !data.foundDifferences[foundDifferenceId];

                if (successfullyFoundDifference) {
                    data.foundDifferences[foundDifferenceId] = true;
                }
                this.sio.to(joinedRoomName).emit('validationReturned', {
                    foundDifferences: data.foundDifferences,
                    isValidated: successfullyFoundDifference,
                    foundDifferenceIndex: foundDifferenceId,
                    isPlayer1: data.isPlayer1,
                });
            });

            socket.on('disconnect', () => {
                const matchThatWasAffected = this.matchManagerService.removePlayerFromMatch(socket.id);

                if (matchThatWasAffected) {
                    sendMatchUpdate({ matchId: matchThatWasAffected });
                    sendGameMatchProgressUpdate(matchThatWasAffected);
                }
                this.matchManagerService.currentMatches.forEach((match) => {
                    sendJoinMatchCancel(match.matchId, socket.id);
                });
            });

            socket.on('createMatch', (data) => {
                const newMatchId = this.matchManagerService.createMatch(data.gameId, socket.id).matchId;
                joinMatchRoom({ matchId: newMatchId });
            });

            socket.on('setMatchType', (data: { matchId: string; matchType: MatchType }) => {
                this.matchManagerService.setMatchType(data.matchId, data.matchType);
                sendMatchUpdate({ matchId: data.matchId });
            });

            socket.on('setMatchPlayer', (data: { matchId: string; player: Player }) => {
                this.matchManagerService.setMatchPlayer(data.matchId, data.player);
                sendMatchUpdate({ matchId: data.matchId });
                sendGameMatchProgressUpdate(data.matchId);
            });

            socket.on('setWinner', (data: { matchId: string; winner: Player }) => {
                this.matchManagerService.setMatchWinner(data.matchId, data.winner);
                sendMatchUpdate({ matchId: data.matchId });
            });

            socket.on('setLoser', (data: { matchId: string }) => {
                this.matchManagerService.setMatchLose(data.matchId);
                sendMatchUpdate({ matchId: data.matchId });
            });

            socket.on('joinRoom', (data: { matchId: string }) => {
                joinMatchRoom(data);
            });

            socket.on('requestToJoinMatch', (data: { matchId: string; player: Player }) => {
                socket.to(data.matchId).emit('incomingPlayerRequest', data.player); // send the request to the host
            });

            socket.on('cancelJoinMatch', (data: { matchId: string; player: Player }) => {
                sendJoinMatchCancel(data.matchId, data.player.playerId);
            });

            socket.on('sendIncomingPlayerRequestAnswer', (data: { matchId: string; player: Player; isAccepted: boolean }) => {
                if (data.isAccepted) {
                    this.matchManagerService.setMatchPlayer(data.matchId, data.player);
                    sendGameMatchProgressUpdate(data.matchId);
                }
                this.sio.to(data.matchId).emit('incomingPlayerRequestAnswer', data);
            });

            socket.on('deleteAllGames', () => {
                this.sio.emit('allGamesDeleted');
                this.sendRefreshAvailableGames();
            });

            socket.on('deletedGame', (data: { hasDeletedGame: boolean; id: string }) => {
                this.sio.emit('gameDeleted', { gameDeleted: data.hasDeletedGame, id: data.id }, socket.id);
                this.sendRefreshAvailableGames();
            });

            socket.on('sendingMessage', (data: { username: string; message: string; sentByPlayer1: boolean }) => {
                this.sio
                    .to(joinedRoomName)
                    .emit('messageBetweenPlayers', { username: data.username, message: data.message, sentByPlayer1: data.sentByPlayer1 });
            });

            socket.on('resetAllGames', async () => {
                await this.gamesStorageService.resetAllScores();
                this.sio.emit('allGamesReset');
                this.sendRefreshAvailableGames();
            });

            socket.on('resetGame', async (data: { id: string }) => {
                await this.gamesStorageService.resetScoresById(data.id);
                this.sio.emit('gameReset', { id: data.id }, socket.id);
                this.sendRefreshAvailableGames();
            });

            socket.on(
                'gameOver',
                (data: {
                    gameId: string;
                    isOneVersusOne: boolean;
                    ranking: {
                        name: string;
                        score: number;
                        gameName: string;
                        socketId: string;
                    };
                }) => {
                    sendNewWinningTime(data.gameId, data.isOneVersusOne, data.ranking);
                },
            );

            socket.on('requestRefreshGameMatchProgress', (data: { gameId: number }) => {
                const matchToJoinIfAvailable = this.matchManagerService.getMatchAvailableForGame(data.gameId);
                this.sio.emit('gameProgressUpdate', {
                    gameId: data.gameId,
                    matchToJoinIfAvailable,
                });
            });

            socket.on('requestGetNumberOfGamesOnServer', async () => {
                const count = await this.gamesStorageService.getNumberOfSavedGames();
                this.sio.emit('numberOfGamesOnServer', count);
            });

            socket.on('randomizeGameOrder', async () => {
                const randomSeeds: number[] = [];

                const count = await this.gamesStorageService.getNumberOfSavedGames();
                for (let i = 0; i < count; i++) {
                    randomSeeds.push(Math.random());
                }
                this.sio.to(joinedRoomName).emit('randomizedOrder', { seedsArray: randomSeeds });
            });

            socket.on('readyPlayer', (data: { isPlayer1: boolean }) => {
                this.sio.to(joinedRoomName).emit('readyUpdate', { isPlayer1: data.isPlayer1 });
            });

            const activeMatchTimerData: { key: string; value: { startTime: number; elapsedTime: number } }[] = [];
            let timerInterval: NodeJS.Timeout;

            socket.on('startTimer', (data: { matchId: string; elapsedTime: number }) => {
                // If the timer is already running for this match, don't start it again
                if (activeMatchTimerData.find((timerData) => timerData.key === data.matchId)) return;

                activeMatchTimerData.push({ key: data.matchId, value: { startTime: new Date().getTime(), elapsedTime: data.elapsedTime } });

                // Start the timer interval if it hasn't already started
                if (!timerInterval) {
                    timerInterval = setInterval(() => {
                        const currentTime = new Date().getTime();
                        for (const timerData of activeMatchTimerData) {
                            timerData.value.elapsedTime = Math.floor((currentTime - timerData.value.startTime) / MILLISECOND_TO_SECONDS);
                            this.sio.to(joinedRoomName).emit('playersSyncTime', { elapsedTime: timerData.value.elapsedTime as number });
                        }
                    }, MILLISECOND_TO_SECONDS);
                }
            });

            socket.on('stopTimer', (data: { matchId: string }) => {
                const timerDataIndex = activeMatchTimerData.findIndex((timerData) => timerData.key === data.matchId);
                if (timerDataIndex !== NOT_FOUND) {
                    const timerData = activeMatchTimerData[timerDataIndex];
                    const elapsedTime = new Date().getTime() - timerData.value.startTime;
                    activeMatchTimerData.splice(timerDataIndex, 1);
                    this.sio.to(joinedRoomName).emit('timerStopped', { elapsedTime });

                    // Stop the timer interval if there are no more active matches
                    if (activeMatchTimerData.length === 0) {
                        clearInterval(timerInterval);
                    }
                }
            });

            const joinMatchRoom = (data: { matchId: string }) => {
                joinedRoomName = data.matchId;
                socket.join(joinedRoomName);
                if (socket.rooms.has(joinedRoomName)) {
                    this.sio.to(joinedRoomName).emit('matchJoined', 'User:' + socket.id + 'has joined the match');
                }
            };

            const sendJoinMatchCancel = (matchId: string, playerId: string) => {
                socket.to(matchId).emit('incomingPlayerCancel', playerId);
            };

            const sendMatchUpdate = (data: { matchId: string }) => {
                this.sio.to(data.matchId).emit('matchUpdated', this.matchManagerService.getMatchById(data.matchId));
            };

            const sendGameMatchProgressUpdate = (matchId: string) => {
                const match = this.matchManagerService.getMatchById(matchId);
                if (!match) return;
                const matchToJoinIfAvailable = this.matchManagerService.getMatchAvailableForGame(match.gameId);
                this.sio.emit('gameProgressUpdate', {
                    gameId: match.gameId,
                    matchToJoinIfAvailable,
                });
            };

            const sendNewWinningTime = async (
                gameId: string,
                isOneVersusOne: boolean,
                ranking: {
                    name: string;
                    score: number;
                    gameName: string;
                    socketId: string;
                },
            ) => {
                const rankingData = await this.gameRankingTimeService.handleNewScore(gameId, isOneVersusOne, ranking);
                if (rankingData) {
                    this.sio.emit('newBreakingScore', {
                        rankingData,
                    });
                }
            };
        });
    }

    sendRefreshAvailableGames(): void {
        this.sio.emit('actionOnGameReloadingThePage');
    }

    disconnect(): void {
        this.sio.disconnectSockets();
        this.sio.close();
    }
}
