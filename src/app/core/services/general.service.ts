import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ConstructionType } from '../model/constructionType.model';
import { Country } from '../model/country.model';
import { CityHall } from '../model/cityHall.model';

@Injectable({
    providedIn: 'root',
})
export class GeneralService {
    env = environment;

    constructor(private http: HttpClient) {}

    getAllCityHalls(): Observable<CityHall[]> {
        return this.http.get<CityHall[]>(`${this.env.urlBase}/general/cities`);
    }

    getAllCountries(): Observable<Country[]> {
        return this.http.get<Country[]>(`${this.env.urlBase}/general/countries`);
    }

    getAllConstructionTypes(): Observable<ConstructionType[]> {
        return this.http.get<ConstructionType[]>(`${this.env.urlBase}/general/constructionTypes`);
    }

    getDocument(id: string, url: string): Observable<any> {
        return this.http.get<any>(`${this.env.urlBPM}/getFileDS?datasetId=${id}&connUrl=${url}`);
    }

    getDocumentsByRole(role: string): Observable<any> {
        //return this.http.get<any>(`${this.env.urlBase}/general/documents/${role}`);
        return this.http.get<any>(`${this.env.urlBase}/general/documents`);
    }

    downloadFile(filename: string) {
        return this.http.get(`${this.env.urlBase}/general/documents/${filename}`, {
            responseType: 'blob',
        });
    }
}
