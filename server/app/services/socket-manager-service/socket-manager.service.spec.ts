/* eslint-disable no-dupe-keys */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Server } from '@app/server';
import { MatchManagerService } from '@app/services/match-manager-service/match-manager.service';
import { MatchingDifferencesService } from '@app/services/matching-difference-service/matching-differences.service';
import { Match } from '@common/classes/match';
import { Player } from '@common/classes/player';
import { Vector2 } from '@common/classes/vector2';
import { MatchStatus } from '@common/enums/match.status';
import { MatchType } from '@common/enums/match.type';
import { GameData } from '@common/interfaces/game.data';
import { defaultRanking } from '@common/interfaces/ranking';
import { RankingData } from '@common/interfaces/ranking.data';
import { NOT_FOUND } from '@common/utils/constants';
import { assert, expect } from 'chai';
import * as sinon from 'sinon';
import { SinonSandbox, SinonStub, SinonStubbedInstance, createSandbox } from 'sinon';
// eslint-disable-next-line import/no-named-as-default
import Container from 'typedi';
import { SocketManager } from './socket-manager.service';
const RESPONSE_DELAY = 200;
describe('SocketManager', () => {
    let sandbox: SinonSandbox;
    let server: Server;
    let socketManager: SocketManager;
    let connectionStub: SinonStub;
    let emitStub: SinonStub;
    let matchingDifferencesServiceStub: SinonStubbedInstance<MatchingDifferencesService>;
    let matchManagerServiceStub: SinonStubbedInstance<MatchManagerService>;
    let roomEmitStub: SinonStub;

    beforeEach(async () => {
        sandbox = createSandbox();
        server = Container.get(Server);
        server.init();
        socketManager = server['socketManager'];
        connectionStub = sinon.stub(socketManager['sio'], 'on');
        emitStub = sinon.stub(socketManager['sio'].sockets, <any>'emit');
        matchingDifferencesServiceStub = sinon.createStubInstance(MatchingDifferencesService);
        matchManagerServiceStub = sinon.createStubInstance(MatchManagerService);
        matchManagerServiceStub.getMatchById.returns(new Match(1, 'test'));
        matchManagerServiceStub.getMatchAvailableForGame.returns('test');
        matchManagerServiceStub.removePlayerFromMatch.returns('test');
        sinon.stub(socketManager['matchManagerService'], 'getMatchAvailableForGame').returns('test');
        socketManager['matchManagerService']['currentOnlinePlayedMatches'] = [new Match(1, 'test')];

        roomEmitStub = sinon.stub(socketManager['sio'], <any>'to');
    });

    afterEach(() => {
        connectionStub.restore();
        emitStub.restore();
        roomEmitStub.restore();
        sandbox.restore();
        socketManager.disconnect();
        socketManager['sio'].close();
        sinon.restore();
    });

    const matchPlayer1 = {
        username: 'player1',
        playerId: 'socket1',
    };

    const matchPlayer2 = {
        username: 'player2',
        playerId: 'socket2',
    };
    const match: Match = {
        gameId: 0,
        matchId: 'match1',
        player1: matchPlayer1,
        player2: matchPlayer2,
        player1Archive: matchPlayer1,
        player2Archive: matchPlayer2,
        matchType: MatchType.OneVersusOne,
        matchStatus: MatchStatus.InProgress,
    };
    const socket = {
        id: 'socket1',
        emit: sinon.stub(),
        on: sinon.stub(),
        join: sinon.stub(),
        to: sinon.stub(),
        rooms: new Set<string>(['match1']),
        data: {},
    };

    describe('handleSockets', () => {
        it('should registerGameData and call update match', (done) => {
            const dataTest: GameData = {
                id: 0,
                name: 'Jeu1',
                isEasy: true,
                nbrDifferences: 2,
                differences: [
                    [
                        { x: 200, y: 100 },
                        { x: 100, y: 200 },
                    ],
                ],
                oneVersusOneRanking: defaultRanking,
                soloRanking: defaultRanking,
            };
            socketManager.handleSockets();
            matchManagerServiceStub.createMatch(match.gameId, match.matchId);
            const connectionCallback = connectionStub.getCall(0).args[1];
            connectionCallback(socket);
            const fakeEmit = sinon.fake();
            roomEmitStub.returns({ emit: fakeEmit });
            validateSocket.rooms.has = sinon.stub().returns(true);
            const registerCallback = socket.on.getCall(0).args[1];
            registerCallback(dataTest);
            setTimeout(() => {
                assert(socket.on.calledWith('registerGameData'));
                expect(socket.data).to.deep.equal(dataTest);
                done();
            }, RESPONSE_DELAY);
        });
    });
    const data: GameData = {
        id: 0,
        name: 'Jeu1',
        isEasy: true,
        nbrDifferences: 2,
        differences: [
            [
                { x: 200, y: 100 },
                { x: 100, y: 200 },
            ],
        ],
        oneVersusOneRanking: defaultRanking,
        soloRanking: defaultRanking,
    };
    const validateSocket = {
        id: 'socket1',
        emit: sinon.stub(),
        on: sinon.stub(),
        join: sinon.stub(),
        rooms: new Set<string>(['0user1socket1']),
        data: {
            gameData: {
                id: 0,
                name: 'Jeu1',
                isEasy: true,
                nbrDifferences: 2,
                differences: [
                    [
                        { x: 200, y: 100 },
                        { x: 100, y: 200 },
                    ],
                ],
                oneVersusOneRanking: defaultRanking,
                soloRanking: defaultRanking,
            },
        },
    };

    it('should validate difference when one is found', (done) => {
        const differencePosition: Vector2 = new Vector2(200, 100);
        matchingDifferencesServiceStub.getDifferenceIndex.withArgs(data, differencePosition).returns(0);
        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        connectionCallback(validateSocket);
        const fakeEmit = sinon.fake();
        roomEmitStub.returns({ emit: fakeEmit });
        socket.rooms.has = sinon.stub().returns(true);

        const validateCallback = validateSocket.on.getCall(1).args[1];
        validateCallback({ foundDifferences: [false, false], position: differencePosition, isPlayer1: true });
        setTimeout(() => {
            assert(validateSocket.on.calledWith('validateDifference'));
            assert(roomEmitStub.called);
            roomEmitStub.restore();
            sinon.restore();
            done();
        }, RESPONSE_DELAY); // 1 seconde
    });

    it('should not validate difference when not found', (done) => {
        const differencePosition: Vector2 = new Vector2(300, 200);
        matchingDifferencesServiceStub.getDifferenceIndex.withArgs(data, differencePosition).returns(-1);
        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        connectionCallback(socket);
        const fakeEmit = sinon.fake();
        roomEmitStub.returns({ emit: fakeEmit });
        socket.rooms.has = sinon.stub().returns(true);
        const validateCallback = socket.on.getCall(1).args[1];
        validateCallback({ foundDifferences: [true, true], position: differencePosition });
        setTimeout(() => {
            assert(socket.on.calledWith('validateDifference'));
            roomEmitStub.restore();
            sinon.restore();
            done();
        }, RESPONSE_DELAY);
    });

    it('should remove player from match when disconnect is called and update if a match was affected', (done) => {
        sinon.stub(socketManager['matchManagerService'], 'currentMatches').value([match, match, match]);
        sinon.stub(socketManager['matchManagerService'], 'removePlayerFromMatch').resolves(null);
        sinon.stub(socketManager['matchManagerService'], 'getMatchById').returns(new Match(1, '-1'));
        matchManagerServiceStub.getMatchById.resolves(new Match(1, '-1'));

        const fakeEmit = sinon.fake();
        socket.to.returns({ emit: fakeEmit });

        socketManager.handleSockets();
        socket.rooms.has = sinon.stub().returns(false);
        const connectionCallback = connectionStub.getCall(0).args[1];
        connectionCallback(socket);
        const disconnectCallback = socket.on.getCall(2).args[1];
        disconnectCallback(socket);
        setTimeout(() => {
            assert(socket.on.calledWith('disconnect'));
            done();
        }, RESPONSE_DELAY);
    });

    it('should remove player from match when disconnect is called and update if a match was affected', (done) => {
        sinon.stub(socketManager['matchManagerService'], 'currentMatches').value([match, match, match]);
        sinon.stub(socketManager['matchManagerService'], 'removePlayerFromMatch').returns('-1');
        sinon.stub(socketManager['matchManagerService'], 'getMatchById').returns(new Match(1, '-1'));
        matchManagerServiceStub.getMatchById.resolves(new Match(1, '-1'));

        const fakeEmit = sinon.fake();
        socket.to.returns({ emit: fakeEmit });

        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        connectionCallback(socket);
        const disconnectCallback = socket.on.getCall(2).args[1];
        disconnectCallback(socket);
        setTimeout(() => {
            assert(socket.on.calledWith('disconnect'));
            done();
        }, RESPONSE_DELAY);
    });

    it('should createMatch with matchId and call joinMatchRoom', (done) => {
        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        connectionCallback(socket);
        const createMatchCallback = socket.on.getCall(3).args[1];
        createMatchCallback({ gameId: match.gameId, matchId: match.matchId });
        setTimeout(() => {
            assert(socket.on.calledWith('createMatch'));
            assert(socket.join.called);
            done();
        }, RESPONSE_DELAY);
    });

    it('should set match type', (done) => {
        matchManagerServiceStub.createMatch(match.gameId, match.matchId);
        matchManagerServiceStub.getMatchById.resolves(match);
        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        connectionCallback(socket);
        const setMatchTypeCallback = socket.on.getCall(4).args[1];
        setMatchTypeCallback({ matchId: match.matchId, matchType: MatchType.OneVersusOne });
        setTimeout(() => {
            assert(socket.on.calledWith('setMatchType'));
            done();
        }, RESPONSE_DELAY);
    });

    it('should set match player', (done) => {
        matchManagerServiceStub.createMatch(match.gameId, match.matchId);
        matchManagerServiceStub.getMatchById.resolves('match1');
        matchManagerServiceStub.getMatchAvailableForGame.resolves('match1');
        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        connectionCallback(socket);
        const setMatchPlayerCallback = socket.on.getCall(5).args[1];
        setMatchPlayerCallback({ matchId: '1', player: matchPlayer1 });
        setTimeout(() => {
            assert(socket.on.calledWith('setMatchPlayer'));
            done();
        }, RESPONSE_DELAY);
    });

    it('should join match room', (done) => {
        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        connectionCallback(socket);
        const joinCallback = socket.on.getCall(6).args[1];
        joinCallback({ matchId: match.matchId });
        setTimeout(() => {
            assert(socket.on.calledWith('joinRoom'));
            done();
        }, RESPONSE_DELAY);
    });

    it('should send a request to join a match', (done) => {
        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        connectionCallback(socket);
        const joinCallback = socket.on.getCall(9).args[1];
        const fakeEmit = sinon.fake();
        socket.to.returns({ emit: fakeEmit });
        joinCallback({ matchId: match.matchId, player: new Player('user', 'id') });
        setTimeout(() => {
            assert(socket.on.calledWith('requestToJoinMatch'));
            done();
        }, RESPONSE_DELAY);
    });

    it('should send a request to join a match', (done) => {
        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        connectionCallback(socket);
        const joinCallback = socket.on.getCall(12).args[1];
        joinCallback({ matchId: match.matchId, player: new Player('user', 'id') });
        setTimeout(() => {
            assert(socket.on.calledWith('requestToJoinMatch'));
            done();
        }, RESPONSE_DELAY);
    });
    it('should send a request to join a match', (done) => {
        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        connectionCallback(socket);
        const joinCallback = socket.on.getCall(13).args[1];
        joinCallback({ matchId: match.matchId, player: new Player('user', 'id') });
        setTimeout(() => {
            assert(socket.on.calledWith('requestToJoinMatch'));
            done();
        }, RESPONSE_DELAY);
    });

    it('should set the loser of a game', (done) => {
        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        connectionCallback(socket);
        const joinCallback = socket.on.getCall(7).args[1];
        joinCallback({ matchId: match.matchId });
        setTimeout(() => {
            assert(socket.on.calledWith('setLoser'));
            done();
        }, RESPONSE_DELAY);
    });

    it('should cancel a join request', (done) => {
        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        connectionCallback(socket);
        const fakeEmit = sinon.fake();
        socket.to.returns({ emit: fakeEmit });
        const joinCallback = socket.on.getCall(10).args[1];
        joinCallback({ matchId: match.matchId, player: new Player('user', 'id') });
        setTimeout(() => {
            assert(socket.on.calledWith('cancelJoinMatch'));
            done();
        }, RESPONSE_DELAY);
    });

    it('should cancel join match', (done) => {
        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        connectionCallback(socket);
        socket.rooms.has = sinon.stub().returns(true);
        const fakeEmit = sinon.fake();
        socket.to.returns({ emit: fakeEmit });
        const joinCallback = socket.on.getCall(8).args[1];
        joinCallback({ matchId: match.matchId, player: matchPlayer1 });
        setTimeout(() => {
            assert(socket.on.calledWith('cancelJoinMatch'));
            done();
        }, RESPONSE_DELAY);
    });
    it('should send incoming player request answer', (done) => {
        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        connectionCallback(socket);
        socket.rooms.has = sinon.stub().returns(true);
        const fakeEmit = sinon.fake();
        socket.to.returns({ emit: fakeEmit });
        const joinCallback = socket.on.getCall(11).args[1];
        joinCallback({ matchId: match.matchId, player: matchPlayer1, isAccepted: true });
        setTimeout(() => {
            assert(socket.on.calledWith('randomizeGameOrder'));
            done();
        }, RESPONSE_DELAY);
    });
    it('should randomize the game order', (done) => {
        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        connectionCallback(socket);
        socket.rooms.has = sinon.stub().returns(true);
        const fakeEmit = sinon.fake();
        socket.to.returns({ emit: fakeEmit });
        const joinCallback = socket.on.getCall(12).args[1];
        joinCallback();
        setTimeout(() => {
            assert(socket.on.calledWith('randomizeGameOrder'));
            done();
        }, RESPONSE_DELAY);
    });
    it('should randomize the game order', (done) => {
        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        connectionCallback(socket);
        socket.rooms.has = sinon.stub().returns(true);
        const fakeEmit = sinon.fake();
        socket.to.returns({ emit: fakeEmit });
        const joinCallback = socket.on.getCall(14).args[1];
        joinCallback({ username: matchPlayer1.username, message: 'test', sentByPlayer1: true });
        setTimeout(() => {
            assert(socket.on.calledWith('randomizeGameOrder'));
            done();
        }, RESPONSE_DELAY);
    });

    it('should reset all games', (done) => {
        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        connectionCallback(socket);
        socket.rooms.has = sinon.stub().returns(true);
        const fakeEmit = sinon.fake();
        socket.to.returns({ emit: fakeEmit });
        const joinCallback = socket.on.getCall(15).args[1];
        joinCallback();
        setTimeout(() => {
            assert(socket.on.calledWith('resetAllGames'));
            done();
        }, RESPONSE_DELAY);
    });

    it('should reset one game', (done) => {
        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        connectionCallback(socket);
        socket.rooms.has = sinon.stub().returns(true);
        const fakeEmit = sinon.fake();
        socket.to.returns({ emit: fakeEmit });
        const joinCallback = socket.on.getCall(16).args[1];
        joinCallback({ id: '1' });
        setTimeout(() => {
            assert(socket.on.calledWith('resetGame'));
            done();
        }, RESPONSE_DELAY);
    });

    it('should send the winning time when a game is over', (done) => {
        socketManager.handleSockets();
        sinon
            .stub(socketManager['gameRankingTimeService'], 'handleNewScore')
            .resolves({ username: 'test', position: 'première', gameName: 'testName', matchType: 'test' } as RankingData);
        const connectionCallback = connectionStub.getCall(0).args[1];
        connectionCallback(socket);
        socket.rooms.has = sinon.stub().returns(true);
        const fakeEmit = sinon.fake();
        socket.to.returns({ emit: fakeEmit });
        const joinCallback = socket.on.getCall(17).args[1];
        joinCallback({
            gameId: '1',
            isOneVersusOne: true,
            ranking: {
                name: 'test',
                score: 1,
                gameName: '1',
            },
        });
        setTimeout(() => {
            assert(socket.on.calledWith('gameOver'));
            done();
        }, RESPONSE_DELAY);
    });

    it('should send the winning time when a game is over, but not emit an event for undefined rankingData', (done) => {
        socketManager.handleSockets();
        sinon.stub(socketManager['gameRankingTimeService'], 'handleNewScore').resolves(undefined);
        const connectionCallback = connectionStub.getCall(0).args[1];
        connectionCallback(socket);
        socket.rooms.has = sinon.stub().returns(true);
        const fakeEmit = sinon.fake();
        socket.to.returns({ emit: fakeEmit });
        const joinCallback = socket.on.getCall(17).args[1];
        joinCallback({
            gameId: '1',
            isOneVersusOne: true,
            ranking: {
                name: 'test',
                score: 1,
                gameName: '1',
            },
        });
        setTimeout(() => {
            assert(socket.on.calledWith('gameOver'));
            done();
        }, RESPONSE_DELAY);
    });

    it('should send the winning time when a game is over, but not emit an event for undefined rankingData', (done) => {
        socketManager.handleSockets();
        sinon.stub(socketManager['gameRankingTimeService'], 'handleNewScore').resolves(undefined);
        const connectionCallback = connectionStub.getCall(0).args[1];
        connectionCallback(socket);
        socket.rooms.has = sinon.stub().returns(true);
        const fakeEmit = sinon.fake();
        socket.to.returns({ emit: fakeEmit });
        const joinCallback = socket.on.getCall(17).args[1];
        joinCallback({
            gameId: '1',
            isOneVersusOne: true,
            ranking: {
                name: 'test',
                score: 1,
                gameName: '1',
            },
        });
        setTimeout(() => {
            assert(socket.on.calledWith('gameOver'));
            done();
        }, RESPONSE_DELAY);
    });

    it('should refresh the progress of a match in progress', (done) => {
        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        connectionCallback(socket);
        socket.rooms.has = sinon.stub().returns(true);
        const fakeEmit = sinon.fake();
        socket.to.returns({ emit: fakeEmit });
        const joinCallback = socket.on.getCall(18).args[1];
        joinCallback({
            gameId: 1,
        });
        setTimeout(() => {
            assert(socket.on.calledWith('requestRefreshGameMatchProgress'));
            done();
        }, RESPONSE_DELAY);
    });

    it('should refresh the progress of a match in progress', (done) => {
        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        connectionCallback(socket);
        socket.rooms.has = sinon.stub().returns(true);
        const fakeEmit = sinon.fake();
        socket.to.returns({ emit: fakeEmit });
        const joinCallback = socket.on.getCall(18).args[1];
        joinCallback({
            gameId: 1,
        });
        setTimeout(() => {
            assert(socket.on.calledWith('requestRefreshGameMatchProgress'));
            done();
        }, RESPONSE_DELAY);
    });

    it('should emit the number of games on the server', (done) => {
        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        connectionCallback(socket);
        socket.rooms.has = sinon.stub().returns(true);
        const fakeEmit = sinon.fake();
        socket.to.returns({ emit: fakeEmit });
        const joinCallback = socket.on.getCall(19).args[1];
        joinCallback({});

        setTimeout(() => {
            assert(socket.on.calledWith('requestGetNumberOfGamesOnServer'));
            done();
        }, RESPONSE_DELAY);
    });

    it('should randomize the game order', (done) => {
        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        connectionCallback(socket);
        socket.rooms.has = sinon.stub().returns(true);
        const fakeEmit = sinon.fake();
        socket.to.returns({ emit: fakeEmit });
        const joinCallback = socket.on.getCall(20).args[1];
        joinCallback({});

        setTimeout(() => {
            assert(socket.on.calledWith('randomizeGameOrder'));
            done();
        }, RESPONSE_DELAY);
    });

    it('should randomize the game order', (done) => {
        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        connectionCallback(socket);
        socket.rooms.has = sinon.stub().returns(true);
        const fakeEmit = sinon.fake();
        socket.to.returns({ emit: fakeEmit });
        const joinCallback = socket.on.getCall(21).args[1];
        joinCallback({ isPlayer1: true });

        setTimeout(() => {
            assert(socket.on.calledWith('readyPlayer'));
            done();
        }, RESPONSE_DELAY);
    });

    it('should start the timer', (done) => {
        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        connectionCallback(socket);
        socket.rooms.has = sinon.stub().returns(true);
        const fakeEmit = sinon.fake();
        socket.to.returns({ emit: fakeEmit });
        const joinCallback = socket.on.getCall(22).args[1];
        joinCallback({ matchId: 'test', elapsedTime: 1 });

        setTimeout(() => {
            assert(socket.on.calledWith('startTimer'));
            done();
        }, RESPONSE_DELAY);
    });

    it('should start the timer', (done) => {
        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        connectionCallback(socket);
        socket.rooms.has = sinon.stub().returns(true);
        const fakeEmit = sinon.fake();
        socket.to.returns({ emit: fakeEmit });
        const joinCallback = socket.on.getCall(22).args[1];

        joinCallback({ matchId: NOT_FOUND, elapsedTime: 1 });

        setTimeout(() => {
            assert(socket.on.calledWith('startTimer'));
            done();
        }, RESPONSE_DELAY);
    });

    it("should start the timer interval if it hasn't already started", (done) => {
        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        connectionCallback(socket);
        socket.rooms.has = sinon.stub().returns(true);
        const fakeEmit = sinon.fake();
        socket.to.returns({ emit: fakeEmit });
        const timerCallback = socket.on.getCall(22).args[1];
        timerCallback({ matchId: 'test', elapsedTime: 1 });
        const timerCallback2 = socket.on.getCall(22).args[1];
        timerCallback2({ matchId: 'test', elapsedTime: 0 });

        setTimeout(() => {
            assert(socket.on.calledWith('startTimer'));
            done();
        }, RESPONSE_DELAY);
    });

    it('should stop the timer', (done) => {
        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        connectionCallback(socket);
        socket.rooms.has = sinon.stub().returns(true);
        const fakeEmit = sinon.fake();
        socket.to.returns({ emit: fakeEmit });
        const stopCallback = socket.on.getCall(23).args[1];
        stopCallback({ matchId: 'test' });
        const timerCallback2 = socket.on.getCall(23).args[1];
        timerCallback2({ matchId: 'test' });

        setTimeout(() => {
            assert(socket.on.calledWith('stopTimer'));
            done();
        }, RESPONSE_DELAY);
    });

    it('should stop the timer', (done) => {
        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        connectionCallback(socket);
        socket.rooms.has = sinon.stub().returns(true);
        const fakeEmit = sinon.fake();
        socket.to.returns({ emit: fakeEmit });
        const joinCallback = socket.on.getCall(23).args[1];
        joinCallback({ matchId: NOT_FOUND });

        setTimeout(() => {
            assert(socket.on.calledWith('stopTimer'));
            done();
        }, RESPONSE_DELAY);
    });

    it('should delete all games', (done) => {
        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        connectionCallback(socket);
        const joinCallback = socket.on.getCall(11).args[1];
        joinCallback({ hasDeletedAllGames: true });
        setTimeout(() => {
            assert(socket.on.calledWith('deleteAllGames'));
            done();
        }, RESPONSE_DELAY);
    });

    it('should send a message in the chat', (done) => {
        socketManager.handleSockets();
        const connectionCallback = connectionStub.getCall(0).args[1];
        connectionCallback(socket);
        const fakeEmit = sinon.fake();
        roomEmitStub.returns({ emit: fakeEmit });
        socket.rooms.has = sinon.stub().returns(true);
        const joinCallback = socket.on.getCall(12).args[1];
        joinCallback({ username: 'player1', message: 'salut', sentByPlayer1: true });
        setTimeout(() => {
            assert(socket.on.calledWith('sendingMessage'));
            done();
        }, RESPONSE_DELAY);
    });
});
