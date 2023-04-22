import { DatabaseService } from '@app/services/database-service/database.service';
import { HistoryStorageService } from '@app/services/history-storage-service/history-storage.service';
import { MatchManagerService } from '@app/services/match-manager-service/match-manager.service';
import { Match } from '@common/classes/match';
import { Player } from '@common/classes/player';
import { MatchStatus } from '@common/enums/match.status';
import { MatchType } from '@common/enums/match.type';
import { expect } from 'chai';
import { assert } from 'console';
import * as sinon from 'sinon';

describe('MatchManagerService', () => {
    let matchManagerService: MatchManagerService;
    let createdMatch: Match;

    const match = {
        gameId: 0,
        matchId: 'match1',
    };

    const matchPlayer: Player = {
        username: 'player',
        playerId: 'socket1',
    };

    const player2: Player = {
        username: 'player2',
        playerId: 'socket2',
    };

    const expectedMatch = {
        gameId: 0,
        matchId: 'match1',
    };

    beforeEach(async () => {
        matchManagerService = new MatchManagerService(new HistoryStorageService(new DatabaseService()));
        createdMatch = matchManagerService.createMatch(match.gameId, match.matchId);
    });

    it('should set the match Status when creating a match', () => {
        const methodSpy = sinon.spy(matchManagerService, 'createMatch');
        assert(methodSpy.calledWith(match.gameId, match.matchId));
        expect(createdMatch.matchStatus).to.deep.equal(MatchStatus.WaitingForPlayer1);
    });

    it('should add the match to current matches array when create game is called', () => {
        expect(matchManagerService.currentMatches.length).to.deep.equal(1);
    });

    it('should set the given match type with match id', () => {
        matchManagerService.setMatchType(match.matchId, MatchType.LimitedCoop);
        expect(createdMatch.matchType).to.deep.equal(MatchType.LimitedCoop);
    });

    it('should not change the match type if match id is not valid', () => {
        const invalidMatchId = 'match2';
        matchManagerService.setMatchType(match.matchId, MatchType.OneVersusOne);
        matchManagerService.setMatchType(invalidMatchId, MatchType.LimitedCoop);
        expect(createdMatch.matchType).to.deep.equal(MatchType.OneVersusOne);
    });

    it('should set match player 1 and set match status to wait for player 2', () => {
        expect(createdMatch.matchStatus).to.deep.equal(MatchStatus.WaitingForPlayer1);
        matchManagerService.setMatchPlayer(match.matchId, matchPlayer);
        expect(createdMatch.player1).to.deep.equal(matchPlayer);
        expect(createdMatch.player2).to.deep.equal(undefined);
        expect(createdMatch.matchStatus).to.deep.equal(MatchStatus.WaitingForPlayer2);
    });

    it('should correctly modify a match after a loss', () => {
        const storeHistoryStub = sinon.stub(matchManagerService, 'storeHistory');
        const testMatch = new Match(match.gameId, match.matchId);
        testMatch.matchStatus = MatchStatus.InProgress;
        sinon.stub(matchManagerService, 'getMatchById').returns(testMatch);
        matchManagerService.setMatchLose(match.matchId);
        sinon.assert.called(storeHistoryStub);
    });

    it('should correctly modify a match after a win (p2)', () => {
        const storeHistoryStub = sinon.stub(matchManagerService, 'storeHistory');
        const testMatch = new Match(match.gameId, match.matchId);
        testMatch.player1 = matchPlayer;
        testMatch.matchStatus = MatchStatus.InProgress;
        sinon.stub(matchManagerService, 'getMatchById').returns(testMatch);
        matchManagerService.setMatchWinner(match.matchId, matchPlayer);
        sinon.assert.called(storeHistoryStub);
    });

    it('should set match player 1 and not change match status is not waiting for player 1', () => {
        const newPlayer: Player = {
            username: 'player3',
            playerId: 'socket4',
        };
        matchManagerService.setMatchPlayer(match.matchId, matchPlayer);
        matchManagerService.setMatchPlayer(match.matchId, player2);
        matchManagerService.removePlayerFromMatch(matchPlayer.playerId);
        matchManagerService.setMatchPlayer(match.matchId, newPlayer);
        expect(createdMatch.player1).to.deep.equal(newPlayer);
        expect(createdMatch.matchStatus).to.deep.equal(MatchStatus.InProgress);
    });

    it('should set match player 1 and not change match status is not waiting for player 2', () => {
        const newPlayer: Player = {
            username: 'player3',
            playerId: 'socket4',
        };
        matchManagerService.setMatchPlayer(match.matchId, matchPlayer);
        matchManagerService.setMatchPlayer(match.matchId, player2);
        matchManagerService.removePlayerFromMatch(player2.playerId);
        matchManagerService.setMatchPlayer(match.matchId, newPlayer);
        expect(createdMatch.player1).to.deep.equal(matchPlayer);
        expect(createdMatch.matchStatus).to.deep.equal(MatchStatus.InProgress);
    });

    it('should set match player 2 and set match status to in progress', () => {
        matchManagerService.setMatchPlayer(match.matchId, matchPlayer);
        matchManagerService.setMatchPlayer(match.matchId, player2);
        expect(createdMatch.player1).to.deep.equal(matchPlayer);
        expect(createdMatch.player2).to.deep.equal(player2);
        expect(createdMatch.matchStatus).to.deep.equal(MatchStatus.InProgress);
    });

    it('should not set the match player if match id is not valid', () => {
        const invalidMatchId = 'match2';
        matchManagerService.setMatchPlayer(invalidMatchId, matchPlayer);
        expect(createdMatch.player1).to.deep.equal(undefined);
    });

    it('should remove player from match', () => {
        matchManagerService.setMatchPlayer(match.matchId, matchPlayer);
        matchManagerService.setMatchPlayer(match.matchId, player2);
        matchManagerService.removePlayerFromMatch(matchPlayer.playerId);
        matchManagerService.removePlayerFromMatch(player2.playerId);
        expect(createdMatch.player1).to.deep.equal(null);
        expect(createdMatch.player2).to.deep.equal(null);
    });

    it('should remove player from match and set match status to aborted when waiting for player 2', () => {
        matchManagerService.setMatchPlayer(match.matchId, matchPlayer);
        matchManagerService.removePlayerFromMatch(matchPlayer.playerId);
        expect(createdMatch.matchStatus).to.deep.equal(MatchStatus.Aborted);
    });

    it('removePlayerFromMatch should store the leaderboard data ', () => {
        const testMatch = new Match(match.gameId, match.matchId);
        testMatch.player1 = matchPlayer;
        testMatch.matchType = MatchType.Solo;
        testMatch.matchStatus = MatchStatus.InProgress;
        matchManagerService['currentOnlinePlayedMatches'] = [testMatch];
        sinon.stub(matchManagerService, 'getMatchById').returns(testMatch);
        matchManagerService.removePlayerFromMatch(matchPlayer.playerId);
        expect(createdMatch.matchStatus).to.deep.equal(MatchStatus.WaitingForPlayer1);
    });

    it('should remove player 1 from match and make the player 2 win', () => {
        matchManagerService.setMatchPlayer(match.matchId, matchPlayer);
        matchManagerService.setMatchPlayer(match.matchId, player2);
        matchManagerService.removePlayerFromMatch(matchPlayer.playerId);
        expect(createdMatch.matchStatus).to.deep.equal(MatchStatus.InProgress);
    });

    it('should remove player 2 from match and make the player 1 win', () => {
        matchManagerService.setMatchPlayer(match.matchId, matchPlayer);
        matchManagerService.setMatchPlayer(match.matchId, player2);
        matchManagerService.removePlayerFromMatch(player2.playerId);
        expect(createdMatch.matchStatus).to.deep.equal(MatchStatus.InProgress);
    });
    it('should not remove player when given player is invalid', () => {
        matchManagerService.setMatchPlayer(match.matchId, matchPlayer);
        matchManagerService.setMatchPlayer(match.matchId, player2);
        const matchReturned = matchManagerService.removePlayerFromMatch('socket3');
        expect(createdMatch.player1).to.deep.equal(matchPlayer);
        expect(createdMatch.player2).to.deep.equal(player2);
        expect(matchReturned).to.deep.equal(null);
    });

    it('should remove player 2', () => {
        matchManagerService.setMatchPlayer(match.matchId, matchPlayer);
        matchManagerService.setMatchPlayer(match.matchId, player2);
        const matchReturnedId = matchManagerService.removePlayerFromMatch(player2.playerId);
        expect(createdMatch.player2).to.deep.equal(null);
        expect(matchReturnedId).to.deep.equal(expectedMatch.matchId);
    });

    it('should return the modified match id when removing player from match', () => {
        matchManagerService.setMatchPlayer(match.matchId, matchPlayer);
        matchManagerService.setMatchPlayer(match.matchId, player2);
        const removedResult = matchManagerService.removePlayerFromMatch(player2.playerId);
        expect(removedResult).to.deep.equal(expectedMatch.matchId);
    });

    it('should get the available matches for game with game id', () => {
        matchManagerService.setMatchType(match.matchId, MatchType.OneVersusOne);
        matchManagerService.setMatchPlayer(match.matchId, matchPlayer);
        const matchIdResult = matchManagerService.getMatchAvailableForGame(match.gameId);
        expect(createdMatch.matchId).to.deep.equal(matchIdResult);
    });

    it('should not get the available matches if status is not waiting for player 2', () => {
        matchManagerService.setMatchType(match.matchId, MatchType.OneVersusOne);
        matchManagerService.setMatchPlayer(match.matchId, matchPlayer);
        matchManagerService.setMatchPlayer(match.matchId, player2);
        const matchIdResult = matchManagerService.getMatchAvailableForGame(match.gameId);
        expect(matchIdResult).to.deep.equal(null);
    });

    it('should not get the available matches for game with invalid game id', () => {
        const invalidGameId = 2;
        matchManagerService.setMatchType(match.matchId, MatchType.OneVersusOne);
        matchManagerService.setMatchPlayer(match.matchId, matchPlayer);
        const matchIdResult = matchManagerService.getMatchAvailableForGame(invalidGameId);
        expect(matchIdResult).to.deep.equal(null);
    });
});
