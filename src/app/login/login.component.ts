import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AuthenticationService } from '../_services';
import { ConfigService } from '../_services/config/config.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup = this.formBuilder.group({
    email: ['', Validators.required],
    password: ['', Validators.required]
  });;
  loading = false;
  submitted = false;
  returnUrl: string = '';

  // Slack OAuth
  slackEnabled: boolean = false;
  slackClientId: string = '';
  redirectUrlSlackOAuth: string = '';
  code: string = '';

  // Microsoft OAuth
  microsoftEnabled: boolean = false;
  microsoftTenantId: string = '';
  microsoftClientId: string = '';
  redirectUrlMSOAuth: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private configService: ConfigService
  ) {
    // redirect to home if successful logged in
    if (this.authenticationService.currentUserValue) {
      this.router.navigate(['/']);
    }
    console.log(this.router.url);
    if (this.router.url.startsWith('/login')
      && !this.router.url.startsWith('/login/slack')) {
      this.redirectUrlSlackOAuth = location.href.replace(/\/login/, "/login/slack");
    }
    if (this.router.url.startsWith('/login')
      && !this.router.url.startsWith('/login/ms')) {
      this.redirectUrlMSOAuth = location.href.replace(/\/login.*/, "/login/ms");
    }
    if(this.router.url.startsWith('/login/slack')) {
      this.redirectUrlSlackOAuth = encodeURIComponent(location.href.replace(/\?code.*/, "").replace(/&code.*/, ""));
      this.code = this.route.snapshot.queryParams['code'];
      this.authenticationService.slack(this.code, this.redirectUrlSlackOAuth)
        .subscribe(() => {
          this.router.navigate([this.returnUrl]);
        });
    }
    if(this.router.url.startsWith('/login/ms')) {
      this.redirectUrlMSOAuth = encodeURIComponent(location.href.replace(/\?code.*/, "").replace(/&code.*/, ""));
      this.code = this.route.snapshot.queryParams['code'];
      this.authenticationService.microsoft(this.code, this.redirectUrlMSOAuth, this.configService.get('microsoftTenantId'))
        .subscribe(() => {
          this.router.navigate([this.returnUrl]);
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
      .pipe(first())
      .subscribe(
        () => {
          console.log(this.returnUrl);
          this.router.navigate([this.returnUrl]);
        },
        error => {
          this.loading = false;
        });
  }
}
