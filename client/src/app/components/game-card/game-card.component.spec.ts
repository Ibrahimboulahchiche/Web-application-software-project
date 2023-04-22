import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameData } from '@common/interfaces/game.data';
import { defaultRanking } from '@common/interfaces/ranking';
import { Buffer } from 'buffer';
import { GameCardComponent } from './game-card.component';
describe('GameCardComponent', () => {
    let component: GameCardComponent;
    let fixture: ComponentFixture<GameCardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameCardComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameCardComponent);
        component = fixture.componentInstance;
        const game: GameData = {
            id: 1,
            name: 'Test',
            isEasy: true,
            nbrDifferences: 4,
            differences: [
                [
                    { x: 4, y: 0 },
                    { x: 3, y: 0 },
                    { x: 2, y: 0 },
                    { x: 1, y: 0 },
                    { x: 0, y: 0 },
                ],
            ],
            soloRanking: defaultRanking,
            oneVersusOneRanking: defaultRanking,
        };
        component.game = { gameData: game, originalImage: 'http://localhost:3000/api/images/104/1', matchToJoinIfAvailable: '1' };
        component.isPlayable = true;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should set the difficulty correctly', () => {
        expect(component.difficulty).toEqual('Facile');
    });

    it('should set the original image source correctly', () => {
        expect(component.originalImageSrc).not.toContain('data:image/bmp;base64,');
        expect(component.originalImageSrc).not.toContain(Buffer.alloc(3).toString('base64'));
    });

    it('should return green if the game is easy', () => {
        expect(component.difficultyColor).toEqual('green');
    });

    it('should return red if the game is not easy', () => {
        const game2: GameData = {
            id: 1,
            name: 'Test',
            isEasy: false,
            nbrDifferences: 4,
            differences: [
                [
                    { x: 4, y: 0 },
                    { x: 3, y: 0 },
                    { x: 2, y: 0 },
                    { x: 1, y: 0 },
                    { x: 0, y: 0 },
                ],
            ],
            soloRanking: defaultRanking,
            oneVersusOneRanking: defaultRanking,
        };
        component.game = { gameData: game2, originalImage: 'http://localhost:3000/api/images/104/1', matchToJoinIfAvailable: '1' };
        component.ngOnInit();
        fixture.detectChanges();
        expect(component.difficultyColor).toEqual('red');
    });
});
