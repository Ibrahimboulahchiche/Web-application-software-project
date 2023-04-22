import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    private readonly baseUrl: string = environment.serverUrl;

    constructor(private readonly http: HttpClient) {}

    get(route?: string): Observable<HttpResponse<string>> {
        return this.http.get(`${this.baseUrl}${route}`, { observe: 'response', responseType: 'text' });
    }

    post<Type>(message: Type, route: string): Observable<HttpResponse<string>> {
        return this.http.post(`${this.baseUrl}${route}`, message, { observe: 'response', responseType: 'text' });
    }

    delete(route: string): Observable<HttpResponse<string>> {
        return this.http.delete(`${this.baseUrl}${route}`, { observe: 'response', responseType: 'text' });
    }
}
