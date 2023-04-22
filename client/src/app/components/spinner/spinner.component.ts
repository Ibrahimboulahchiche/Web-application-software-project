import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
    selector: 'app-spinner',
    templateUrl: './spinner.component.html',
    styleUrls: ['./spinner.component.scss'],
})
export class SpinnerComponent {
    @ViewChild('spinner') spinner!: ElementRef;

    showSpinner() {
        this.spinner.nativeElement.style.display = 'flex';
    }

    hideSpinner() {
        this.spinner.nativeElement.style.display = 'none';
    }
}
