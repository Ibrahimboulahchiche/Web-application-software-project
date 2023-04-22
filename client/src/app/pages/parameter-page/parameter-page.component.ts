import { Component, OnInit } from '@angular/core';
import { GameConstantsService } from '@app/services/game-constants-service/game-constants.service';
import { HistoryService } from '@app/services/history-service/history.service';

@Component({
    selector: 'app-parameter-page',
    templateUrl: './parameter-page.component.html',
    styleUrls: ['./parameter-page.component.scss'],
})
export class ParameterPageComponent implements OnInit {
    confirmation: boolean = false;
    isReset: boolean = false;
    historyConfirmation: boolean = false;

    constructor(readonly historyService: HistoryService, public gameConstantsService: GameConstantsService) {}

    ngOnInit(): void {
        this.historyService.fetchHistoryFromServer();
        this.gameConstantsService.initGameConstants();
    }
}
