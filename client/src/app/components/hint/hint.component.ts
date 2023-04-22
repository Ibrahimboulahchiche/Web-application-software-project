import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HintService } from '@app/services/hint-service/hint.service';

@Component({
    selector: 'app-hint',
    templateUrl: './hint.component.html',
    styleUrls: ['./hint.component.scss'],
})
export class HintComponent implements OnInit {
    @ViewChild('hint') div: ElementRef;
    maxGivenHints: number;

    constructor(private hintService: HintService) {}

    ngOnInit() {
        this.hintService.reset();
        this.maxGivenHints = this.hintService.maxGivenHints;
    }
}
