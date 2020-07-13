import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

import { AuthorityModel, OrganizationAuthorityModel, UserModel, OrganizationModel } from '../_models';

import { Authority, OrganizationAuthority, User, Organization } from '../_entities';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {

    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;
    private currentOrganizationSubject: BehaviorSubject<Organization>;
    public currentOrganization: Observable<Organization>;
  
    constructor(private http: HttpClient) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
        if(localStorage.getItem('currentOrganization') != undefined) {
            this.currentOrganizationSubject = new BehaviorSubject<Organization>(JSON.parse(localStorage.getItem('currentOrganization')));
        } else {
            this.currentOrganizationSubject = new BehaviorSubject<Organization>(new Organization());
        }
        this.currentOrganization = this.currentOrganizationSubject.asObservable();
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    public get currentOrganizationValue(): Organization {
        return this.currentOrganizationSubject.value;
    }

    login(email: string, password: string) {
        return this.http.post<any>(`${environment.apiUrl}/auth/login`,
            {
                email,
                password
            })
            .pipe(map(user => {
                // login successful if there's a jwt token in the response
                if (user && user.token) {
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    this.currentUserSubject.next(user);
                }
                return user;
            }));
    }

    whoami(): Observable<User> {
        const principal = this.http.get<UserModel>(`${environment.apiUrl}/whoami`);
        const authorities = this.http.get<AuthorityModel[]>(`${environment.apiUrl}/authority`);
        const orgauthorities = this.http.get<OrganizationAuthorityModel[]>(`${environment.apiUrl}/orgauthorities`);
        const organizations = this.http.get<OrganizationModel[]>(`${environment.apiUrl}/organizations`);
        return forkJoin([principal, authorities, orgauthorities, organizations])
            .pipe(map(responses =>{
                var user = User.fromModel(responses[0]);
                user.userAuthorities = Authority.fromModels(responses[1]);
                user.userOrganizationAuthorities = OrganizationAuthority.fromModels(responses[2]);
                user.token = JSON.parse(localStorage.getItem('currentUser')).token;
                user.organizations = Organization.fromModels(responses[3]);
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.currentUserSubject.next(user);
                if(this.currentOrganizationValue.id <= 0 && user.organizations.length >= 0) {
                    this.setCurrentOrganization(user.organizations[0]);
                }
                return user;
            }));
    }

    setCurrentOrganization(organization: Organization) {
        localStorage.setItem('currentOrganization', JSON.stringify(organization));
        this.currentOrganizationSubject.next(organization);
    }

    slack(code: string, redirect_uri) {
        return this.http.get<any>(`${environment.apiUrl}/auth/login/slack?code=${code}&redirect_uri=${redirect_uri}`)
        .pipe(map(user => {
            // login successful if there's a jwt token in the response
            if (user && user.token) {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.currentUserSubject.next(user);
            }
            return user;
        }));
    }

    logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
    }
}