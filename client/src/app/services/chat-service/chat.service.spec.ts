/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
// import { MatchmakingService } from '../matchmaking-service/matchmaking.service';
// import { SocketClientService } from '../socket-client-service/socket-client.service';

import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ChatComponent } from '@app/components/chat/chat.component';
import { MatchmakingService } from '@app/services/matchmaking-service/matchmaking.service';
import { SocketClientService } from '@app/services/socket-client-service/socket-client.service';
import { ChatService } from './chat.service';

describe('ChatService', () => {
    let chatService: ChatService;
    let socketServiceSpy: jasmine.SpyObj<SocketClientService>;
    let matchmakingService: MatchmakingService;
    let chatComponent: ChatComponent;

    beforeEach(() => {
        // const spy = jasmine.createSpyObj('SocketClientService', ['socket']);
        const socketSpy = jasmine.createSpyObj('Socket', ['emit']);
        const socketServiceMock = {
            socket: socketSpy,
        };

        TestBed.configureTestingModule({
            providers: [
                ChatService,
                {
                    provide: SocketClientService,
                    useValue: socketServiceMock,
                },
                {
                    provide: MatchmakingService,
                    useValue: jasmine.createSpyObj('MatchmakingService', ['player1Id', 'player1Username', 'player2Username', 'isOneVersusOne']),
                },
            ],
        });
        chatService = TestBed.inject(ChatService);
        socketServiceSpy = TestBed.inject(SocketClientService) as jasmine.SpyObj<SocketClientService>;
        matchmakingService = TestBed.inject(MatchmakingService) as jasmine.SpyObj<MatchmakingService>;
        chatComponent = new ChatComponent(chatService);
    });

    it('isPlayer1 getter', () => {
        chatService.isPlayer1;
        matchmakingService.player1Id;
        socketServiceSpy.socketId;
        expect(chatService.isPlayer1).toEqual(false);
    });

    it('is 1v1 getter', () => {
        const mockMatchmakingService = jasmine.createSpyObj('MatchmakingService', ['on']);
        mockMatchmakingService.isLimitedTimeSolo = false;
        mockMatchmakingService.isCoopMode = true;
        chatService['matchmakingService'] = mockMatchmakingService;
        expect(chatService.isMode1vs1).toBeTruthy();
    });

    it('should return false when the message is empty', () => {
        expect(chatService.isTextValid('')).toBe(false);
    });

    it('should return false when the message is only whitespace', () => {
        expect(chatService.isTextValid('   ')).toBe(false);
    });

    it('should return true when the message contains non-whitespace characters', () => {
        expect(chatService.isTextValid('Hello, world!')).toBe(true);
    });

    it('should send a message if the text is valid', () => {
        const isPlayer1 = true;
        const newMessage = 'hello world';
        const socketSpy = jasmine.createSpyObj('Socket', ['emit']);
        socketServiceSpy.socket = socketSpy;
        chatService.sendMessage(isPlayer1, newMessage);

        expect(socketSpy.emit).toHaveBeenCalled();
    });
    it('should send a message if the text is valid', () => {
        const isPlayer1 = false;
        const newMessage = 'hello world';
        const socketSpy = jasmine.createSpyObj('Socket', ['emit']);
        socketServiceSpy.socket = socketSpy;
        chatService.sendMessage(isPlayer1, newMessage);

        expect(socketSpy.emit).toHaveBeenCalled();
    });

    it("clearMessage should return '' ", () => {
        const res = chatService.clearMessage(new ChatComponent(chatService));
        expect(res).toBeUndefined();
    });

    it('should call scrollToBottom and set newMessage to empty string when pushMessage is called', () => {
        const message = {
            text: 'Hello, world!',
            username: 'testuser',
            sentBySystem: false,
            sentByPlayer1: true,
            sentUpdatedScore: false,
            sentTime: Date.now(),
        };
        const mockElementRef = {
            nativeElement: {
                scrollTop: 0,
                scrollHeight: 100,
            },
        };
        chatComponent.chat = mockElementRef;
        spyOn(chatService, 'scrollToBottom');

        chatService.pushMessage(message, chatComponent);

        expect(chatService.scrollToBottom).toHaveBeenCalledWith(mockElementRef);
        expect(chatComponent.newMessage).toBe('');
    });

    it('should push a message to the chat from the system', () => {
        chatComponent.chat = new ElementRef({ scrollTop: 0, nativeElement: { scrollTop: 0, scrollHeight: 100 } });
        const textToSend = 'Hello world!';
        chatService.sendMessageFromSystem(textToSend, '', chatComponent);
        expect(chatComponent.messages.length).toEqual(1);
        expect(chatComponent.messages[0].text).toEqual(textToSend);
        expect(chatComponent.messages[0].username).toEqual('System');
        expect(chatComponent.messages[0].sentBySystem).toEqual(true);
        expect(chatComponent.messages[0].sentByPlayer1).toEqual(false);
        expect(chatComponent.messages[0].sentUpdatedScore).toEqual(false);
        expect(chatComponent.messages[0].sentTime).not.toBeNull();
    });

    it('should add a record-breaking message to the chat', () => {
        const rankingData = {
            username: 'testUser',
            position: '1',
            gameName: 'testGame',
            matchType: 'testMatchType',
            winnerSocketId: '1',
        };
        spyOn(chatService, 'pushMessage');

        chatService.sendRecordBreakingMessage(rankingData, chatComponent);

        expect(chatService.pushMessage).toHaveBeenCalled();
    });
});
