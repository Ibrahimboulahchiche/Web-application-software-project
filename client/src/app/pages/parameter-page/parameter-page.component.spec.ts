import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistoryService } from '@app/services/history-service/history.service';
import { ParameterPageComponent } from './parameter-page.component';

describe('HistoryService', () => {
    let service: HistoryService;
    let fixture: ComponentFixture<ParameterPageComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [HistoryService],
        });
        service = TestBed.inject(HistoryService);
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ParameterPageComponent);
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
