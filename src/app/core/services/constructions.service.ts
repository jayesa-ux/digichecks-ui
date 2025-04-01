import { Injectable } from '@angular/core';
import { Construction } from '../model/construction.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class ConstructionsService {
    env = environment;

    constructor(private http: HttpClient) {}

    // DEPRECATED
    getAllConstructions(): Observable<Construction[]> {
        return this.http.get<Construction[]>(`${this.env.urlBase}/constructions`);
    }

    getconstruction(code: string): Observable<Construction[]> {
        return this.http.get<Construction[]>(`${this.env.urlBase}/constructions/${code}`);
    }

    getConstructionsByGroup(group: string[]): Observable<Construction[]> {
        return this.http.get<Construction[]>(`${this.env.urlBase}/constructions/group/${group[0]}`);
    }

    insertConstruction(constructionData: FormData) {
        return this.http.post(`${this.env.urlBase}/constructions`, constructionData, {
            headers: { enctype: 'multipart/form-data' },
        });
    }
}
