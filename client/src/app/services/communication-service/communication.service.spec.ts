/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { Message } from '@common/interfaces/message';

describe('CommunicationService', () => {
    let httpMock: HttpTestingController;
    let service: CommunicationService;
    let baseUrl: string;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [CommunicationService],
        });
        service = TestBed.inject(CommunicationService);
        httpMock = TestBed.inject(HttpTestingController);
        // eslint-disable-next-line dot-notation -- baseUrl is private and we need access for the test
        baseUrl = service['baseUrl'];
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should perform a GET request with get()', () => {
        const expectedMessage: Message = { body: 'Hello', title: 'World' };
        const expectedUrl = '/example';

        service.get(expectedUrl).subscribe({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            next: (response: any) => {
                // expect(response.title).toEqual(expectedMessage.title);
                expect(JSON.parse(response.body).body).toEqual(expectedMessage.body);
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/example`);
        expect(req.request.method).toBe('GET');
        req.flush(expectedMessage);
    });

    it('should post data', () => {
        const sentMessage: Message = { body: 'Hello', title: 'World' };
        const expectedUrl = '/example/send';
        service.post(sentMessage, expectedUrl).subscribe({
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            next: () => {},
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}${expectedUrl}`);
        expect(req.request.method).toEqual('POST');
        expect(req.request.body).toEqual(sentMessage);
        req.flush({ message: 'Data posted successfully' }, { status: 200, statusText: 'OK' });
    });

    it('should delete data', () => {
        const testRoute = '/test';

        service.delete(testRoute).subscribe((response) => {
            expect(response.status).toEqual(200);
            expect(response.body).toEqual('Data deleted successfully');
        });

        const req = httpMock.expectOne(`${baseUrl}${testRoute}`);
        expect(req.request.method).toEqual('DELETE');
        req.flush('Data deleted successfully', { status: 200, statusText: 'OK' });
    });
});
