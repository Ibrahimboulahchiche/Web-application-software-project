export interface ChatMessage {
    text: string;
    username: string;
    sentBySystem: boolean;
    sentByPlayer1: boolean;
    sentUpdatedScore: boolean;
    sentTime: number;
}
