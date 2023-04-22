/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatService } from '@app/services/chat-service/chat.service';
import { ChatComponent } from './chat.component';

describe('ChatComponent', () => {
    let component: ChatComponent;
    let fixture: ComponentFixture<ChatComponent>;
    let chatService: jasmine.SpyObj<ChatService>;

    beforeEach(() => {
        chatService = jasmine.createSpyObj('ChatService', [
            'sendMessage',
            'sendMessageFromSystem',
            'scrollToBottom',
            'sendRecordBreakingMessage',
            'clearMessage',
        ]);
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChatComponent],
            providers: [{ provide: ChatService, useValue: chatService }],
        }).compileComponents();

        fixture = TestBed.createComponent(ChatComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should not add a message to the chat (player) if it is empty', () => {
        component.newMessage = '   ';
        component.sendMessage();

        expect(component.messages.length).toBe(0);
    });
    it('should add a message to the chat (player)', () => {
        component.newMessage = 'test';
        component.sendMessage();

        expect(component.messages.length).toBe(0);
    });

    it('should not add a message to the chat (system)', () => {
        component.messages = [];
        component.newMessage = 'test';
        component.sendSystemMessage('test');

        expect(component.messages.length).toBe(0);
    });

    it('sendMessage should use service', () => {
        spyOn(component, 'sendMessage');
        component.sendMessage();
        expect(chatService.sendMessage).not.toHaveBeenCalled();
    });

    it('should reset the messages array', () => {
        component.messages = [
            {
                text: 'Bonjour',
                username: 'Player1',
                sentBySystem: false,
                sentByPlayer1: true,
                sentUpdatedScore: false,
                sentTime: 10,
            },
        ];
        component.reset();
        expect(component.messages).toEqual([]);
    });

    it('should call sendRecordBreakingMessage with the rankingData and the component', () => {
        const rankingData = {
            username: 'Marc',
            position: '1',
            gameName: 'Tetris',
            matchType: 'Classic Solo',
            winnerSocketId: 'socket1',
        };
        component.sendTimeScoreMessage(rankingData);
        expect(chatService.sendRecordBreakingMessage).toHaveBeenCalledWith(rankingData, component);
    });
});
