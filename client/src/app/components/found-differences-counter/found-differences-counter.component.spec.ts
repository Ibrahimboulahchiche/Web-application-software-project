import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FoundDifferencesCounterComponent } from './found-differences-counter.component';

describe('FoundDifferencesCounterComponent', () => {
    let component: FoundDifferencesCounterComponent;
    let fixture: ComponentFixture<FoundDifferencesCounterComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [FoundDifferencesCounterComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(FoundDifferencesCounterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
