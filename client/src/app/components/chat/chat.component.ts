import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ChatService } from '@app/services/chat-service/chat.service';
import { RankingData } from '@common/interfaces/ranking.data';
import { CHAT_TITLE } from '@common/utils/constants';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent {
    @Input() isGameInteractive: boolean;
    @ViewChild('chat') chat: ElementRef;
    @ViewChild('inputElement') input: ElementRef;

    messages: {
        text: string;
        username: string;
        sentBySystem: boolean;
        sentByPlayer1: boolean;
        sentUpdatedScore: boolean;
        sentTime: number;
    }[] = [];
    newMessage = '';
    title = CHAT_TITLE;

    constructor(private chatService: ChatService) {}

    get isMode1vs1() {
        return this.chatService.isMode1vs1;
    }

    sendMessage() {
        this.chatService.sendMessage(this.chatService.isPlayer1, this.newMessage);
        this.chatService.clearMessage(this);
    }

    sendTimeScoreMessage(rankingData: RankingData) {
        this.chatService.sendRecordBreakingMessage(rankingData, this);
    }

    sendSystemMessage(textToSend: string) {
        this.chatService.sendMessageFromSystem(textToSend, this.newMessage, this);
    }

    reset() {
        this.messages = [];
    }
}
