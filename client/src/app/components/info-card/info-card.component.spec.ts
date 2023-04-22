import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatchType } from '@common/enums/match.type';
import { InfoCardComponent } from './info-card.component';

describe('InfoIconComponent', () => {
    let component: InfoCardComponent;
    let fixture: ComponentFixture<InfoCardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [InfoCardComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(InfoCardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return "Difficile" when isEasy is false', () => {
        component.isEasy = false;
        expect(component.difficulty).toEqual('Difficile');
    });

    it('should return "Facile" when isEasy is true', () => {
        component.isEasy = true;
        expect(component.difficulty).toEqual('Facile');
    });

    it('should return the correct match type string when matchType is Classic Solo', () => {
        component.matchType = MatchType.Solo;
        expect(component.matchTypeToString).toEqual('Classique Solo');
    });

    it('should return the correct match type string when matchType is Classic 1v1', () => {
        component.matchType = MatchType.OneVersusOne;
        expect(component.matchTypeToString).toEqual('Classique 1v1');
    });

    it('should return the correct match type string when matchType is Limited Coop', () => {
        component.matchType = MatchType.LimitedCoop;
        expect(component.matchTypeToString).toEqual('Temps Limité Coop');
    });

    it('should return the correct match type string when matchType is Limited Solo', () => {
        component.matchType = MatchType.LimitedSolo;
        expect(component.matchTypeToString).toEqual('Temps Limité Solo');
    });

    it('should one versus one mode when matchType is OneVersusOne', () => {
        component.matchType = MatchType.OneVersusOne;
        expect(component.isOneVersusOne).toBeTruthy();
    });

    it('shoudl return the match mode string', () => {
        component.matchType = MatchType.OneVersusOne;
        expect(component.matchMode).toEqual('Classique 1v1');
    });
});
