import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@app/services/auth-service/auth.service';
import { IncomingPlayerService } from '@app/services/incoming-player-service/incoming-player.service';
import { MatchmakingService } from '@app/services/matchmaking-service/matchmaking.service';
import { RegistrationService } from '@app/services/registration-service/registration.service';
import { Match } from '@common/classes/match';
import { Player } from '@common/classes/player';
import { MatchType } from '@common/enums/match.type';

@Component({
    selector: 'app-registration-page',
    templateUrl: './registration-page.component.html',
    styleUrls: ['./registration-page.component.scss'],
})
export class RegistrationPageComponent implements OnInit, OnDestroy {
    username: string | null | undefined;
    id: string | null;
    // used to determine if we should display the username field in the html page
    hasUsernameRegistered: boolean = false;
    hasSentJoinRequest: boolean;
    coopMatchToJoinIfAvailable: string = '';
    registrationForm = new FormGroup({
        username: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z0-9]{3,15}$')])),
    });
    limitedTimeMatchId: string | null;
    showButtons: boolean = true;
    noGamesAvailableOnServer: boolean = false; // used to determine if we should display the "no games available" message in the html page
    // eslint-disable-next-line max-params
    constructor(
        private auth: AuthService,
        private route: ActivatedRoute,
        private matchmakingService: MatchmakingService,
        private incomingPlayerService: IncomingPlayerService,
        private readonly registrationService: RegistrationService,
    ) {}

    get user() {
        return this.auth.registeredUsername;
    }

    get hasFoundIncomingPlayer(): boolean {
        return this.incomingPlayerService.hasFoundOpponent;
    }

    get queueStatusMessage(): string {
        return this.incomingPlayerService.statusToDisplay;
    }

    ngOnInit(): void {
        this.id = this.route.snapshot.paramMap.get('id');
        if (this.id === '-1') {
            this.matchmakingService.connectSocket();
        }
        this.incomingPlayerService.id = this.id;
        this.addServerSocketMessagesListeners();
        this.matchmakingService.onGetJoinRequestAnswer.add(this.handleIncomingPlayerJoinRequestAnswer.bind(this));
        this.matchmakingService.onMatchUpdated.add(this.handleMatchUpdated.bind(this));
        this.matchmakingService.onGetJoinRequest.add(this.incomingPlayerService.handleIncomingPlayerJoinRequest.bind(this.incomingPlayerService));
        this.matchmakingService.onGetJoinCancel.add(this.incomingPlayerService.handleIncomingPlayerJoinCancel.bind(this.incomingPlayerService));
        this.matchmakingService.onDeletedAllGames.add(this.registrationService.handleGameDeleted.bind(this.registrationService));
        this.matchmakingService.onDeletedSingleGame.add(this.registrationService.handleGameDeleted.bind(this.registrationService));
    }

    createSoloLimitedTimeGame() {
        this.matchmakingService.createGame('-1');
        this.matchmakingService.setCurrentMatchType(MatchType.LimitedSolo);
        this.matchmakingService.setCurrentMatchPlayer(this.username as string);
        this.registrationService.loadGamePage(this.id);
    }

    ngOnDestroy(): void {
        if (this.username && this.hasSentJoinRequest) this.matchmakingService.sendMatchJoinCancel(this.username);

        this.matchmakingService.onGetJoinRequest.clear();
        this.matchmakingService.onGetJoinCancel.clear();
        this.matchmakingService.onGetJoinRequestAnswer.clear();
        this.matchmakingService.onMatchUpdated.clear();
        this.matchmakingService.onDeletedAllGames.clear();
        this.matchmakingService.onDeletedSingleGame.clear();
        this.matchmakingService.onResetAllGames.clear();
        this.matchmakingService.onResetSingleGame.clear();
        this.hasSentJoinRequest = false;
        this.incomingPlayerService.reset();
    }

    loadGamePage() {
        this.registrationService.loadGamePage(this.id);
    }

    createCoopGame() {
        if (!this.limitedTimeMatchId) {
            this.matchmakingService.createGame('-1');
            this.matchmakingService.setCurrentMatchType(MatchType.LimitedCoop);
            this.matchmakingService.setCurrentMatchPlayer(this.username as string);
            this.limitedTimeMatchId = this.matchmakingService.currentMatchId;
            this.showButtons = false;
            this.incomingPlayerService.updateWaitingForIncomingPlayerMessage();
        }
    }
    addServerSocketMessagesListeners() {
        this.matchmakingService.socketClientService.on('gameProgressUpdate', (data: { gameId: number; matchToJoinIfAvailable: string | null }) => {
            if (data.gameId.toString() === '-1') {
                this.limitedTimeMatchId = data.matchToJoinIfAvailable as string;
            }
        });

        this.matchmakingService.socketClientService.on('numberOfGamesOnServer', (numberOfGames: number) => {
            this.noGamesAvailableOnServer = numberOfGames === 0;
        });

        this.matchmakingService.socketClientService.socket.emit('requestRefreshGameMatchProgress', { gameId: -1 });
        this.matchmakingService.socketClientService.socket.emit('requestGetNumberOfGamesOnServer');
    }

    joinLimitedTimeGame() {
        if (!this.limitedTimeMatchId) return;

        this.showButtons = false;
        this.incomingPlayerService.updateWaitingForIncomingPlayerAnswerMessage();
        this.matchmakingService.joinGame(this.limitedTimeMatchId, this.id as string);
        this.limitedTimeMatchId = null;

        if (this.username) {
            this.matchmakingService.sendMatchJoinRequest(this.username);
        }
    }

    registerUser() {
        this.auth.registerUser(this.registrationForm.value.username as string);
        this.username = this.registrationForm.value.username;
        this.hasUsernameRegistered = true;

        if (this.matchmakingService.currentMatchPlayed) {
            if (
                this.username &&
                (this.matchmakingService.isOneVersusOne || this.matchmakingService.isSoloMode || this.matchmakingService.isCoopMode)
            ) {
                this.matchmakingService.setCurrentMatchPlayer(this.username);
            }

            if (this.matchmakingService.isSoloMode) {
                this.loadGamePage();
            } else {
                if (this.id !== '-1') {
                    this.incomingPlayerService.updateWaitingForIncomingPlayerMessage();
                }
            }
        } else {
            if (this.id !== '-1') {
                this.sendMatchJoinRequest();
            } else {
                this.incomingPlayerService.updateLimitedTimeNameEntered();
            }
        }
    }

    handleIncomingPlayerJoinRequestAnswer(data: { matchId: string; player: Player; isAccepted: boolean }) {
        if (
            this.incomingPlayerService.isAcceptedByHost(data.isAccepted, data.player) ||
            this.incomingPlayerService.isHostAcceptingIncomingPlayer(data.isAccepted)
        ) {
            this.loadGamePage();
        }

        if (this.incomingPlayerService.isHostRejectingIncomingPlayer(data.isAccepted)) {
            this.incomingPlayerService.handleHostRejectingIncomingPlayer();
            if (this.incomingPlayerService.hasIncomingPlayer) {
                this.incomingPlayerService.handleIncomingPlayerJoinRequest(this.incomingPlayerService.firstIncomingPlayer);
            }
        }
        if (this.incomingPlayerService.isRejectedByHost(data.isAccepted, data.player)) {
            this.registrationService.redirectToMainPage();
        }
    }

    sendMatchJoinRequest() {
        this.hasSentJoinRequest = true;
        this.incomingPlayerService.updateWaitingForIncomingPlayerAnswerMessage();
        if (this.username) this.matchmakingService.sendMatchJoinRequest(this.username);
    }

    handleMatchUpdated(match: Match | null) {
        if (!match) return;

        if (!this.matchmakingService.isHost) {
            if (this.matchmakingService.isMatchAborted(match)) {
                this.registrationService.redirectToMainPage();
            }
        }
    }

    acceptIncomingPlayer() {
        this.incomingPlayerService.acceptIncomingPlayer();
    }

    refuseIncomingPlayer() {
        this.incomingPlayerService.refuseIncomingPlayer();
    }
}
