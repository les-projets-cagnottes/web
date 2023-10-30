import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AuthenticationService } from '../_services';
import { ConfigService } from '../_services/config/config.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: UntypedFormGroup = this.formBuilder.group({
    email: ['', Validators.required],
    password: ['', Validators.required]
  });;
  loading = false;
  submitted = false;
  returnUrl = '';

  // Slack OAuth
  slackEnabled = false;
  slackClientId = '';
  redirectUrlSlackOAuth = '';
  code = '';

  // Microsoft OAuth
  microsoftEnabled = false;
  microsoftTenantId = '';
  microsoftClientId = '';
  redirectUrlMSOAuth = '';

  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private configService: ConfigService
  ) {
    // redirect to home if successful logged in
    if (this.authenticationService.currentUserValue.token) {
      this.router.navigate(['/']);
    }
    if (this.router.url.startsWith('/login')
      && !this.router.url.startsWith('/login/slack')) {
      this.redirectUrlSlackOAuth = location.href.replace(/\/login/, "/login/slack");
    }
    if (this.router.url.startsWith('/login')
      && !this.router.url.startsWith('/login/ms')) {
      this.redirectUrlMSOAuth = location.href.replace(/\/login.*/, "/login/ms");
    }
    if (this.router.url.startsWith('/login/slack')) {
      this.redirectUrlSlackOAuth = encodeURIComponent(location.href.replace(/\?code.*/, "").replace(/&code.*/, ""));
      this.code = this.route.snapshot.queryParams['code'];
      this.loading = true;
      this.authenticationService.slack(this.code, this.redirectUrlSlackOAuth)
        .subscribe({
          next: () => {
            this.authenticationService.refresh()
              .subscribe({
                next: () => {
                  this.router.navigate([this.returnUrl]);
                  this.loading = false;
                },
                complete: () => { },
                error: error => {
                  console.error(error);
                  this.loading = false;
                }
              });
          },
          complete: () => { },
          error: error => {
            console.error(error);
            this.loading = false;
          }
        });
    }
    if (this.router.url.startsWith('/login/ms')) {
      this.redirectUrlMSOAuth = encodeURIComponent(location.href.replace(/\?code.*/, "").replace(/&code.*/, ""));
      this.code = this.route.snapshot.queryParams['code'];
      this.loading = true;
      this.authenticationService.microsoft(this.code, this.redirectUrlMSOAuth, this.configService.get('microsoftTenantId'))
        .subscribe({
          next: () => {
            this.authenticationService.refresh()
              .subscribe({
                next: () => {
                  this.router.navigate([this.returnUrl]);
                  this.loading = false;
                },
                complete: () => { },
                error: error => {
                  console.error(error);
                  this.loading = false;
                }
              });
          },
          complete: () => { },
          error: error => {
            console.error(error);
            this.loading = false;
          }
        });
    }
    this.slackClientId = this.configService.get('slackClientId');
    this.slackEnabled = (/true/i).test(this.configService.get('slackEnabled'));
    this.microsoftEnabled = (/true/i).test(this.configService.get('microsoftEnabled'));
    this.microsoftTenantId = this.configService.get('microsoftTenantId');
    this.microsoftClientId = this.configService.get('microsoftClientId');
  }

  ngOnInit() {

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }
    this.loading = true;
    this.authenticationService.login(this.loginForm.controls['email'].value, this.loginForm.controls['password'].value)
      .subscribe({
        next: () => {
          this.authenticationService.refresh()
            .subscribe({
              next: () => {
                this.router.navigate([this.returnUrl]);
                this.loading = false;
              },
              complete: () => { },
              error: error => {
                console.error(error);
                this.loading = false;
              }
            });
        },
        complete: () => { },
        error: error => {
          console.error(error);
          this.loading = false;
        }
      });
  }
}
