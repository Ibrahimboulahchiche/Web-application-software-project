import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-found-differences-counter',
    templateUrl: './found-differences-counter.component.html',
    styleUrls: ['./found-differences-counter.component.scss'],
})
export class FoundDifferencesCounterComponent {
    @Input() differencesNbr: number;
    @Input() differencesFound: number;
    @Input() username: string;
}
