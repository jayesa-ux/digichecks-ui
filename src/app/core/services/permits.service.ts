import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PermitCreate } from '../model/permits/permitCreate.model';
import { PermitUpdate } from '../model/permits/permitUpdate.model';
import { Permit } from '../model/permits/permit.model';
import { PermitUpdateDate } from '../model/permits/permitUpdateDate.model';

@Injectable({
    providedIn: 'root',
})
export class PermitsService {
    env = environment;

    constructor(private http: HttpClient) {}

    insertPermit(body: PermitCreate): Observable<PermitCreate> {
        return this.http.post<PermitCreate>(`${this.env.urlBase}/permits`, body);
    }

    updatePermit(instanceId: string, body: PermitUpdate): Observable<Permit> {
        return this.http.patch<Permit>(`${this.env.urlBase}/permits/${instanceId}`, body);
    }

    updatePermitDate(instanceId: string, body: PermitUpdateDate): Observable<Permit> {
        const payload = { date: body.modifyDate };
        return this.http.patch<Permit>(`${this.env.urlBase}/permits/${instanceId}/date`, payload);
    }

    deletePermit(permitId: string): Observable<Permit> {
        return this.http.delete<Permit>(`${this.env.urlBase}/permits/${permitId}`);
    }

    findByInstanceId(instanceId: number): Observable<Permit> {
        return this.http.get<Permit>(`${this.env.urlBase}/permits/${instanceId}`);
    }

    // DEPRECATED
    getAllPermits(): Observable<Permit[]> {
        return this.http.get<Permit[]>(`${this.env.urlBase}/permits/all/`);
    }

    getPermitsByParentId(parentId: string): Observable<Permit[]> {
        return this.http.get<Permit[]>(`${this.env.urlBase}/permits/byParentId/${parentId}`);
    }

    getPermitsByConstruction(constructionCode: string): Observable<Permit[]> {
        return this.http.get<Permit[]>(`${this.env.urlBase}/permits/construction/${constructionCode}`);
    }

    getPermitsByConstructions(constructions: (string | undefined)[]): Observable<Permit[]> {
        const body = { constructions: constructions };
        return this.http.post<Permit[]>(`${this.env.urlBase}/permits/constructions`, body);
    }
}
