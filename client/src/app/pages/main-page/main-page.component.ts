import { Component, OnInit } from '@angular/core';
import { MatchmakingService } from '@app/services/matchmaking-service/matchmaking.service';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent implements OnInit {
    constructor(private matchmakingService: MatchmakingService) {}
    ngOnInit(): void {
        this.matchmakingService.disconnectSocket();
    }
}
