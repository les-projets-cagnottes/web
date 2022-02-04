import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

import { ConfigService } from '../config/config.service';

import { AuthorityModel, OrganizationAuthorityModel, UserModel, OrganizationModel } from '../../_models';

import { Authority, OrganizationAuthority, User, Organization } from '../../_entities';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {

    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;
    private currentOrganizationSubject: BehaviorSubject<Organization>;
    public currentOrganization: Observable<Organization>;
  
    constructor(private http: HttpClient, private configService: ConfigService) {
        var userInLocalStorage = localStorage.getItem('currentUser');
        if(userInLocalStorage !== null) {
            this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(userInLocalStorage));
        } else {
            this.currentUserSubject = new BehaviorSubject<User>(new User());
        }
        this.currentUser = this.currentUserSubject.asObservable();

        var organizationInLocalStorage = localStorage.getItem('currentOrganization');
        if(organizationInLocalStorage != null) {
            this.currentOrganizationSubject = new BehaviorSubject<Organization>(JSON.parse(organizationInLocalStorage));
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
        return this.http.post<any>(`${this.configService.get('apiUrl')}/auth/login`,
            {
                email,
                password
            })
            .pipe(map(user => {
                if (user && user.token) {
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    this.currentUserSubject.next(user);
                }
                return user;
            }));
    }

    whoami(): Observable<User> {
        const principal = this.http.get<UserModel>(`${this.configService.get('apiUrl')}/whoami`);
        const authorities = this.http.get<AuthorityModel[]>(`${this.configService.get('apiUrl')}/authority`);
        const orgauthorities = this.http.get<OrganizationAuthorityModel[]>(`${this.configService.get('apiUrl')}/orgauthorities`);
        const organizations = this.http.get<OrganizationModel[]>(`${this.configService.get('apiUrl')}/organizations`);
        return forkJoin([principal, authorities, orgauthorities, organizations])
            .pipe(map(responses =>{
                var user = User.fromModel(responses[0]);
                var userInLocalStorage = localStorage.getItem('currentUser');
                if(userInLocalStorage !== null) {
                    user.token = JSON.parse(userInLocalStorage).token;
                }
                user.userAuthorities = Authority.fromModels(responses[1]);
                user.userOrganizationAuthorities = OrganizationAuthority.fromModels(responses[2]);
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

    slack(code: string, redirect_uri: string) {
        return this.http.get<any>(`${this.configService.get('apiUrl')}/auth/login/slack?code=${code}&redirect_uri=${redirect_uri}`)
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
        this.currentUserSubject.next(new User());
    }
}