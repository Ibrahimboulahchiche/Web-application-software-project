/* eslint-disable max-lines */
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DelayedMethod } from '@app/classes/delayed-method/delayed-method';
import { ChatComponent } from '@app/components/chat/chat.component';
import { HintComponent } from '@app/components/hint/hint.component';
import { GameOverPopUpComponent } from '@app/components/pop-ups/game-over-pop-up/game-over-pop-up.component';
import { SpinnerComponent } from '@app/components/spinner/spinner.component';
import { TimerComponent } from '@app/components/timer/timer.component';
import { CanvasHandlingService } from '@app/services/canvas-handling-service/canvas-handling.service';
import { ChatService } from '@app/services/chat-service/chat.service';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { GameConstantsService } from '@app/services/game-constants-service/game-constants.service';
import { HintService } from '@app/services/hint-service/hint.service';
import { ImageManipulationService } from '@app/services/image-manipulation-service/image-manipulation.service';
import { MatchmakingService } from '@app/services/matchmaking-service/matchmaking.service';
import { ReplayModeService } from '@app/services/replay-mode-service/replay-mode.service';
import { SocketClientService } from '@app/services/socket-client-service/socket-client.service';
import { Match } from '@common/classes/match';
import { Vector2 } from '@common/classes/vector2';
import { MatchStatus } from '@common/enums/match.status';
import { MatchType } from '@common/enums/match.type';
import { GameData } from '@common/interfaces/game.data';
import { GameOverPopUpData } from '@common/interfaces/game.over.pop.up.data';
import { RankingData } from '@common/interfaces/ranking.data';
import {
    ABORTED_GAME_TEXT,
    CANVAS_HEIGHT,
    FOUR_TIMES_SPEED,
    MILLISECOND_TO_SECONDS,
    NORMAL_SPEED,
    TWO_TIMES_SPEED,
    VOLUME_ERROR,
    VOLUME_SUCCESS,
} from '@common/utils/constants';
import { FETCH_ALL_GAMES_PATH, FETCH_GAME_PATH } from '@common/utils/env.http';
import { Buffer } from 'buffer';
import { Observable, Subscription, catchError, filter, fromEvent, map, of } from 'rxjs';

@Component({
    selector: 'app-classic-page',
    templateUrl: './classic-page.component.html',
    styleUrls: ['./classic-page.component.scss'],
})
export class ClassicPageComponent implements AfterViewInit, OnInit, OnDestroy {
    @ViewChild('originalImage', { static: true }) leftCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('modifiedImage', { static: true }) rightCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('chat') chat: ChatComponent;
    @ViewChild('timerElement') timerElement: TimerComponent;
    @ViewChild('hintElement') hintElement: HintComponent;
    @ViewChild('popUpElement') popUpElement: GameOverPopUpComponent;
    @ViewChild('errorMessage') errorMessage: ElementRef;
    @ViewChild('penalty') penaltyMessage: ElementRef;
    @ViewChild('successSound', { static: true }) successSound: ElementRef<HTMLAudioElement>;
    @ViewChild('errorSound', { static: true }) errorSound: ElementRef<HTMLAudioElement>;
    @ViewChild('cheatElement') cheat: ElementRef | undefined;
    @ViewChild('spinner') spinnerComponent!: SpinnerComponent;
    isWinByDefault: boolean = true;
    foundDifferences: boolean[];
    letterTPressed: boolean = true;
    currentGameId: string | null;
    gameTitle: string = '';
    player1: string = '';
    player2: string = '';
    totalDifferences: number = 0;
    differencesFound1: number = 0;
    differencesFound2: number = 0;
    minDifferences: number = 0;
    startingTime: Date;
    activePlayer: boolean;
    hasAlreadyReceiveMatchData: boolean = false;
    newRanking: { name: string; score: number; socketId: string };
    games: { gameData: GameData; originalImage: Buffer; modifiedImage: Buffer }[] = [];
    currentGameIndex: number = 0;
    canvasHandlingService: CanvasHandlingService;
    isLoading: boolean = true;
    keydownEventsSubscription: Subscription;
    replaySpeedOptions: number[] = [NORMAL_SPEED, TWO_TIMES_SPEED, FOUR_TIMES_SPEED];
    currentReplaySpeedIndex = 0;
    seedsArray: number[];
    isOver: boolean = false;
    isPlayer1Ready: boolean = false;
    isPlayer2Ready: boolean = false;
    isOriginallyCoop: boolean = false;
    isEasy: boolean | undefined;
    winningPlayerName: string | undefined;
    hasLoadedImagesForTheFirstTime: boolean = false;

    // eslint-disable-next-line max-params
    constructor(
        public socketService: SocketClientService,
        public communicationService: CommunicationService,
        public replayModeService: ReplayModeService,
        public gameConstantsService: GameConstantsService,
        private route: ActivatedRoute,
        public matchmakingService: MatchmakingService,
        private chatService: ChatService,
        private hintService: HintService,
    ) {
        this.gameConstantsService.initGameConstants();
    }

    get leftCanvasContext() {
        return this.leftCanvas.nativeElement.getContext('2d');
    }

    get rightCanvasContext() {
        return this.rightCanvas.nativeElement.getContext('2d');
    }

    get isSolo() {
        return this.matchmakingService.isSoloMode;
    }

    get isOneVersusOne() {
        return this.matchmakingService.isOneVersusOne;
    }

    get isLimitedTimeSolo() {
        return this.matchmakingService.isLimitedTimeSolo;
    }

    get currentMatchType() {
        return this.matchmakingService.currentMatchPlayed?.matchType;
    }

    get isPlayer1() {
        return this.matchmakingService.isPlayer1;
    }

    get isCoop() {
        return this.matchmakingService.isCoopMode;
    }

    get isCheating() {
        return this.canvasHandlingService.isCheating;
    }

    get currentReplaySpeed(): number {
        return this.replaySpeedOptions[this.currentReplaySpeedIndex];
    }

    get numberOfDifferencesRequiredToWin(): number {
        return this.isOneVersusOne ? this.minDifferences : this.totalDifferences;
    }

    get isGameInteractive(): boolean {
        return !this.replayModeService.shouldShowReplayModeGUI;
    }

    get isLimitedTime() {
        return this.currentGameId === '-1';
    }

    getPlayerUsername(isPlayer1: boolean): string {
        if (isPlayer1) return this.matchmakingService.player1Username;
        return this.matchmakingService.player2Username;
    }

    isPlayer1Win(match: Match): boolean {
        return match.matchStatus === MatchStatus.Player1Win;
    }

    isPlayer2Win(match: Match): boolean {
        return match.matchStatus === MatchStatus.Player2Win;
    }

    gameIsOver(match: Match): boolean {
        return match.matchStatus === MatchStatus.Player1Win || match.matchStatus === MatchStatus.Player2Win;
    }

    ngOnInit(): void {
        this.currentGameId = this.route.snapshot.paramMap.get('id');
        this.addServerSocketMessagesListeners();
        this.matchmakingService.onMatchUpdated.add(this.handleMatchUpdate.bind(this));
        this.canvasHandlingService = new CanvasHandlingService(this.leftCanvas, this.rightCanvas, new ImageManipulationService());
        if (this.isLimitedTime) {
            this.socketService.send('randomizeGameOrder');
        }
        // Replay Mode Initialization
        this.replayModeService.onStartReplayMode.add(this.resetGame.bind(this));
        this.replayModeService.onFinishReplayMode.add(this.finishReplay.bind(this));
        DelayedMethod.speed = 1;

        window.addEventListener('keydown', this.handleClickAndLetterTEvent.bind(this));
        this.keydownEventsSubscription = fromEvent<KeyboardEvent>(window, 'keydown')
            .pipe(filter((event) => event.key === 'i' && (this.matchmakingService.isSoloMode || this.matchmakingService.isLimitedTimeSolo)))
            .subscribe(() => {
                if (this.isGameInteractive && !this.isOver) this.handleHintMode();
            });

        this.hintService.reset();
        this.hintService.initialize();
    }

    sendSystemMessageToChat(message: string) {
        this.chat.sendSystemMessage(message);
    }

    ngOnDestroy(): void {
        this.keydownEventsSubscription.unsubscribe();
        this.replayModeService.stopAllPlayingActions();
        this.socketService.disconnect();
    }

    async playSound(isSuccessSound: boolean) {
        const audioSource = isSuccessSound ? this.successSound : this.errorSound;
        audioSource.nativeElement.currentTime = 0;
        audioSource.nativeElement.volume = isSuccessSound ? VOLUME_SUCCESS : VOLUME_ERROR;
        audioSource.nativeElement.play();
    }

    handleMatchUpdate(match: Match | null) {
        if (this.player1 === '') {
            this.player1 = this.matchmakingService.player1Username;
        }
        if (this.player2 === '') {
            this.player2 = this.matchmakingService.player2Username;
        }
        if (match) {
            this.onReceiveMatchData();
            if (this.gameIsOver(match) && !this.isOver) {
                if (this.isSolo || this.isOneVersusOne) {
                    this.chat.sendSystemMessage((this.isPlayer1Win(match) ? this.player2 : this.player1) + ABORTED_GAME_TEXT);
                    this.onWinGame(this.isPlayer1Win(match), true);
                } else {
                    this.chat.sendSystemMessage((this.isPlayer1Win(match) ? this.player2 : this.player1) + ABORTED_GAME_TEXT);
                    this.matchmakingService.setCurrentMatchType(MatchType.LimitedSolo);
                    this.isOver = true;
                }
            }
            if (match.matchStatus === MatchStatus.PlayersLose) {
                this.onLoseGame();
            }
        }
    }

    onReceiveMatchData(): void {
        if (this.hasAlreadyReceiveMatchData) return;
        this.hasAlreadyReceiveMatchData = true;
        if (this.isPlayer1) {
            this.activePlayer = true;
        } else {
            this.activePlayer = false;
        }
    }

    ngAfterViewInit(): void {
        const leftCanvasContext = this.leftCanvasContext;
        const rightCanvasContext = this.rightCanvasContext;

        if (leftCanvasContext && rightCanvasContext) {
            this.getInitialImagesFromServer();
        }
        this.canvasHandlingService.focusKeyEvent(this.cheat);
        window.removeEventListener('keydown', this.handleClickAndLetterTEvent.bind(this));
    }

    async getInitialImagesFromServer() {
        if (this.currentGameIndex === 0) {
            this.fetchGames().subscribe(async (games) => {
                if (games) {
                    this.games = games;
                }
                if (this.isLimitedTime) {
                    let k = 0;
                    this.games.sort(() => this.matchmakingService.currentSeeds[k++] - 1 / 2);
                }
                await this.canvasHandlingService.updateCanvas(
                    this.games[this.currentGameIndex].originalImage,
                    this.games[this.currentGameIndex].modifiedImage,
                );
                this.updateGameInfo();
            });
        } else {
            await this.canvasHandlingService.updateCanvas(
                this.games[this.currentGameIndex].originalImage,
                this.games[this.currentGameIndex].modifiedImage,
            );
            this.updateGameInfo();
        }
    }

    fetchGames(): Observable<
        | {
              gameData: GameData;
              originalImage: Buffer;
              modifiedImage: Buffer;
          }[]
        | null
    > {
        const gameId: string = this.currentGameId ? this.currentGameId : '0';
        const routeToSend = !this.isLimitedTime ? FETCH_GAME_PATH + gameId : FETCH_ALL_GAMES_PATH;

        return this.communicationService.get(routeToSend).pipe(
            map((response) => {
                if (response.body) {
                    const serverResult = JSON.parse(response.body);
                    this.games = serverResult;
                    return this.games;
                } else {
                    return null;
                }
            }),
            catchError((err) => {
                const responseString = `Server Error : ${err.message}`;
                alert(responseString);
                return of(null);
            }),
        );
    }

    updateGameInfo() {
        this.foundDifferences = new Array(this.games[this.currentGameIndex].gameData.nbrDifferences).fill(false);
        if (!this.isLimitedTime) {
            this.totalDifferences = this.games[this.currentGameIndex].gameData.nbrDifferences;
            this.minDifferences = Math.ceil(this.totalDifferences / 2);
        }
        this.requestStartGame();
        if (this.currentGameIndex === 0) {
            this.replayModeService.startRecording();
        }
        this.isEasy = this.games[this.currentGameIndex].gameData.isEasy;
        this.gameTitle = this.games[this.currentGameIndex].gameData.name;

        this.hintService.refreshCurrentCanvasContext(
            this.rightCanvas,
            this.rightCanvasContext as CanvasRenderingContext2D,
            this.canvasHandlingService.currentModifiedImage,
            this.games[this.currentGameIndex].modifiedImage,
        );
    }

    onMouseDown(event: MouseEvent) {
        if (!this.isGameInteractive) return;
        const coordinateClick: Vector2 = { x: event.offsetX, y: Math.abs(event.offsetY - CANVAS_HEIGHT) };

        this.socketService.send('validateDifference', {
            foundDifferences: this.foundDifferences,
            position: coordinateClick,
            isPlayer1: this.matchmakingService.isSoloMode ? true : this.matchmakingService.isPlayer1,
        });

        this.refreshErrorMessagePosition(event.clientX, event.clientY);
        this.canvasHandlingService.focusKeyEvent(this.cheat);
    }

    refreshErrorMessagePosition(x: number, y: number) {
        const refreshErrorMessagePositionMethod = () => {
            this.errorMessage.nativeElement.style.left = x + 'px';
            this.errorMessage.nativeElement.style.top = y + 'px';
        };
        refreshErrorMessagePositionMethod();
        this.replayModeService.addMethodToReplay(refreshErrorMessagePositionMethod);
    }

    requestStartGame() {
        this.socketService.send('registerGameData', { gameData: this.games[this.currentGameIndex].gameData });
        this.socketService.send('readyPlayer', { isPlayer1: this.isPlayer1 });
    }

    onFinishLoadingImages() {
        this.isLoading = false;
        if (!this.hasLoadedImagesForTheFirstTime) {
            this.timerElement.reset();
            this.socketService.send('startTimer', { matchId: this.matchmakingService.currentMatchId, elapsedTime: 0 });
            this.hasLoadedImagesForTheFirstTime = true;
        }
    }

    updateTimerAccordingToServer(elapsedTime: number) {
        if (this.isOver) return;
        const forceSetTimeMethod = () => {
            this.timerElement.forceSetTime(elapsedTime);
        };
        forceSetTimeMethod();
        this.replayModeService.addMethodToReplay(forceSetTimeMethod);
    }

    addServerSocketMessagesListeners() {
        if (!this.socketService.isSocketAlive) window.alert('Error : socket not connected');

        this.socketService.on('readyUpdate', (data: { isPlayer1: boolean }) => {
            if (!this.isPlayer1Ready && data.isPlayer1) {
                this.isPlayer1Ready = true;
            } else if (!this.isPlayer2Ready && !data.isPlayer1) {
                this.isPlayer2Ready = true;
            }
            if ((this.isPlayer1Ready && this.isPlayer2Ready) || this.isSolo || this.isLimitedTimeSolo) {
                this.onFinishLoadingImages();
            }
            if (this.isCoop) {
                this.isOriginallyCoop = true;
            }
        });

        this.socketService.on('playersSyncTime', (data: { elapsedTime: number }) => {
            this.updateTimerAccordingToServer(data.elapsedTime);
        });

        this.socketService.on('timerStopped', (data: { elapsedTime: number }) => {
            this.updateTimerAccordingToServer(data.elapsedTime);
        });

        this.socketService.on(
            'validationReturned',
            (data: { foundDifferences: boolean[]; isValidated: boolean; foundDifferenceIndex: number; isPlayer1: boolean }) => {
                if (data.isValidated) {
                    let message = 'Différence trouvée par ' + this.getPlayerUsername(data.isPlayer1);
                    if (this.isSolo || this.isLimitedTimeSolo) message = 'Différence trouvée';
                    this.sendSystemMessageToChat(message);
                    this.increasePlayerScore(data.isPlayer1);
                    this.refreshFoundDifferences(data.foundDifferences);

                    if (this.matchmakingService.isLimitedTimeSolo || this.matchmakingService.isCoopMode) {
                        if (this.currentGameIndex === this.games.length - 1) {
                            this.onWinGame(data.isPlayer1, this.isOver);
                        } else {
                            this.currentGameIndex++;
                            // negative penalty is a bonus
                            this.timerElement.applyTimePenalty(-this.gameConstantsService.bonusValue);
                            if (this.isCheating) {
                                this.stopCheating();
                                this.foundDifferences = new Array(this.games[this.currentGameIndex].gameData.nbrDifferences).fill(false);
                                this.startCheating();
                            }
                            this.getInitialImagesFromServer();
                        }
                    } else {
                        const isPlayer1Wins = this.differencesFound1 >= this.numberOfDifferencesRequiredToWin;
                        const isPlayer2Wins = this.differencesFound2 >= this.numberOfDifferencesRequiredToWin;
                        if (isPlayer1Wins) {
                            this.onWinGame(true, !this.isWinByDefault);
                        } else if (isPlayer2Wins) this.onWinGame(false, !this.isWinByDefault);
                    }
                } else {
                    this.onFindWrongDifference(data.isPlayer1);
                }
            },
        );

        this.socketService.on('messageBetweenPlayers', (data: { username: string; message: string; sentByPlayer1: boolean }) => {
            this.chatService.pushMessage(
                {
                    text: data.message,
                    username: data.username,
                    sentBySystem: false,
                    sentByPlayer1: data.sentByPlayer1,
                    sentUpdatedScore: false,
                    sentTime: Date.now(),
                },
                this.chat,
            );
        });

        this.socketService.on('randomizedOrder', async (data: { seedsArray: number[] }) => {
            this.matchmakingService.currentSeeds = data.seedsArray;
        });

        this.socketService.on('newBreakingScore', (data: { rankingData: RankingData }) => {
            this.chat.sendTimeScoreMessage(data.rankingData);
            if (data.rankingData.winnerSocketId === this.matchmakingService.currentSocketId)
                this.popUpElement.updateNewBreakingScore(data.rankingData);
        });
    }

    increasePlayerScore(isPlayer1: boolean): void {
        const increaseScoreMethod = () => {
            if (isPlayer1 || this.isCoop || this.isLimitedTimeSolo) {
                this.differencesFound1++;
            } else this.differencesFound2++;
        };
        increaseScoreMethod();
        this.replayModeService.addMethodToReplay(increaseScoreMethod);
    }

    refreshFoundDifferences(foundDifferences: boolean[]): void {
        const refreshMethod = () => {
            this.foundDifferences = foundDifferences;
            this.onFindDifference();
        };

        refreshMethod();
        this.replayModeService.addMethodToReplay(refreshMethod);
    }

    onFindWrongDifference(isPlayer1: boolean): void {
        let message = 'Erreur';

        if (!this.matchmakingService.isSoloMode) {
            message += ' par ' + this.getPlayerUsername(isPlayer1);
        }
        if (isPlayer1 === this.matchmakingService.isPlayer1) this.showErrorText();
        this.canvasHandlingService.focusKeyEvent(this.cheat);
        this.sendSystemMessageToChat(message);
    }

    showErrorText(): void {
        const showErrorMethod = () => {
            this.errorMessage.nativeElement.style.display = 'block';
            this.leftCanvas.nativeElement.style.pointerEvents = 'none';
            this.rightCanvas.nativeElement.style.pointerEvents = 'none';
            this.playSound(false);

            const delayedHideError = new DelayedMethod(() => {
                this.errorMessage.nativeElement.style.display = 'none';
                this.leftCanvas.nativeElement.style.pointerEvents = 'auto';
                this.rightCanvas.nativeElement.style.pointerEvents = 'auto';
            }, MILLISECOND_TO_SECONDS);
            delayedHideError.start();
        };
        showErrorMethod();
        this.replayModeService.addMethodToReplay(showErrorMethod);
    }

    onFindDifference(): void {
        this.playSound(true);
        if (!this.isLimitedTime) {
            this.canvasHandlingService.refreshModifiedImage(this.games[this.currentGameIndex].gameData, this.foundDifferences);
        }
        if (this.isCheating) {
            this.stopCheating();
            this.startCheating();
        }
        this.canvasHandlingService.focusKeyEvent(this.cheat);
    }

    stopTimer(): void {
        this.socketService.send('stopTimer', this.matchmakingService.currentMatchId);
    }

    gameOver(): void {
        this.stopTimer();
    }

    sendNewTimeScoreToServer(): void {
        this.socketService.send('gameOver', {
            gameId: this.games[this.currentGameIndex].gameData.id.toString(),
            isOneVersusOne: this.isOneVersusOne,
            ranking: {
                name: this.newRanking.name,
                score: this.newRanking.score,
                gameName: this.games[this.currentGameIndex].gameData.name,
                socketId: this.newRanking.socketId,
            },
        });
    }

    onQuitGame() {
        this.popUpElement.displayConfirmation();
    }

    onWinGame(isPlayer1Win: boolean, isWinByDefault: boolean) {
        this.winningPlayerName = isPlayer1Win ? this.player1 : this.player2;
        const isWinner = this.isPlayer1 === isPlayer1Win;
        if (isWinner) {
            this.socketService.send('setWinner', {
                matchId: this.matchmakingService.currentMatchId,
                winner: isPlayer1Win ? this.matchmakingService.player1 : this.matchmakingService.player2,
            });

            this.newRanking = {
                name: this.winningPlayerName,
                score: this.timerElement.elapsedSeconds,
                socketId: this.matchmakingService.currentSocketId,
            };
            if (!isWinByDefault && (this.isSolo || this.isOneVersusOne)) this.sendNewTimeScoreToServer();
        }
        if (this.isOriginallyCoop && (this.getPlayerUsername(true) === undefined || this.getPlayerUsername(false) === undefined)) {
            isWinByDefault = true;
        }
        this.gameOver();
        const startReplayAction = this.replayModeService.startReplayModeAction;
        this.isOver = true;
        this.popUpElement.displayGameOver({
            isWinByDefault,
            isTimerDepleted: this.timerElement.elapsedSeconds <= 0,
            matchType: this.currentMatchType as MatchType,
            startReplayAction,
            username1: this.getPlayerUsername(isPlayer1Win),
            username2: this.getPlayerUsername(!isPlayer1Win),
        } as GameOverPopUpData);
    }

    onTimerEnd() {
        this.socketService.send('setLoser', {
            matchId: this.matchmakingService.currentMatchId,
        });
        this.stopTimer();
    }

    onLoseGame() {
        this.gameOver();
        const startReplayAction = this.replayModeService.startReplayModeAction;
        this.isOver = true;
        this.popUpElement.displayGameOver({
            isWinByDefault: !this.isWinByDefault,
            isTimerDepleted: true,
            matchType: this.currentMatchType as MatchType,
            startReplayAction,
            username1: this.getPlayerUsername(true),
            username2: this.getPlayerUsername(false),
        } as GameOverPopUpData);
    }

    handleClickAndLetterTEvent(event: KeyboardEvent | MouseEvent) {
        if (
            this.matchmakingService.isSoloMode ||
            this.matchmakingService.isLimitedTimeSolo ||
            (this.chat && document.activeElement !== this.chat.input.nativeElement)
        ) {
            if (!this.isGameInteractive || this.isOver) return;
            if (event instanceof KeyboardEvent) {
                if (event.key === 't') {
                    if (this.letterTPressed) {
                        this.startCheating();
                    } else {
                        this.stopCheating();
                    }
                }
            } else if (event instanceof MouseEvent && (this.matchmakingService.isSoloMode || this.matchmakingService.isLimitedTimeSolo)) {
                const element = this.hintElement.div.nativeElement;
                if (element && element.contains(event.target as HTMLElement)) {
                    this.handleHintMode();
                }
            }
        }
    }

    onWinGameLimited(winningPlayer1: string, winningPlayer2: string, isWinByDefault: boolean) {
        this.gameOver();
        this.popUpElement.displayLimitedGameOver(
            { username1: winningPlayer1, username2: winningPlayer2 },
            isWinByDefault,
            this.matchmakingService.isLimitedTimeSolo,
        );
    }

    hintModeButton() {
        if (this.isGameInteractive) this.handleHintMode();
    }

    handleHintMode() {
        if (this.hintService.maxGivenHints <= 0) return;

        const showHintMethod = () => {
            if (this.hintService.maxGivenHints > 0) {
                this.hintService.showHint(
                    this.rightCanvas,
                    this.rightCanvasContext as CanvasRenderingContext2D,
                    this.canvasHandlingService.currentModifiedImage,
                    this.games[this.currentGameIndex].modifiedImage,
                    {
                        gameData: this.games[this.currentGameIndex].gameData,
                        hints: this.hintService.maxGivenHints,
                        diffs: this.foundDifferences,
                    },
                );
                this.timerElement.applyTimePenalty(this.hintService.getTimePenalty(this.isLimitedTimeSolo));
                this.hintService.showRedError(this.penaltyMessage);
                this.hintService.decrement();
            }
        };
        showHintMethod();
        this.hintService.sendHintMessage(this.chat);
        this.replayModeService.addMethodToReplay(showHintMethod);
    }

    startCheating() {
        const startCheatingMethod = () => {
            this.canvasHandlingService.initializeCheatMode(
                this.games[this.currentGameIndex].gameData,
                {
                    originalImage: this.games[this.currentGameIndex].originalImage,
                    modifiedImage: this.games[this.currentGameIndex].modifiedImage,
                },
                this.foundDifferences,
            );
            this.letterTPressed = false;
        };
        startCheatingMethod();
        this.replayModeService.addMethodToReplay(startCheatingMethod);
    }

    stopCheating() {
        const stopCheatingMethod = () => {
            this.canvasHandlingService.stopCheating();
            this.letterTPressed = true;
        };
        stopCheatingMethod();
        this.replayModeService.addMethodToReplay(stopCheatingMethod);
    }

    resetGame() {
        this.foundDifferences = [];
        this.stopCheating();
        this.canvasHandlingService.currentModifiedImage = Buffer.from(this.games[this.currentGameIndex].modifiedImage);
        this.canvasHandlingService.updateCanvas(this.games[this.currentGameIndex].originalImage, this.games[this.currentGameIndex].modifiedImage);
        this.chat.reset();
        this.differencesFound1 = 0;
        this.differencesFound2 = 0;
        this.hintService.reset();
        this.timerElement.forceSetTime(0);
        this.timerElement.reset();
    }

    onReplaySpeedButtonClick(): void {
        this.currentReplaySpeedIndex = (this.currentReplaySpeedIndex + 1) % this.replaySpeedOptions.length;
        this.replayModeService.replaySpeed = this.currentReplaySpeed;
    }

    finishReplay() {
        this.stopCheating();
    }
}
