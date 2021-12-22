import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AlertService, AuthenticationService } from '../_services';
import { ConfigService } from '../_services/config/config.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  slackClientId: string;

  // slack oauth
  redirectUrlOAuth: string;
  code: string;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private alertService: AlertService,
    private configService: ConfigService
  ) {
    // redirect to home if alSUCCESSFUL logged in
    if (this.authenticationService.currentUserValue) {
      this.router.navigate(['/']);
    }
    if (this.router.url.startsWith('/login')
      && !this.router.url.startsWith('/login/slack')) {
      this.redirectUrlOAuth = location.href.replace("/login", "/login/slack");
    }
    if(this.router.url.startsWith('/login/slack')) {
      this.redirectUrlOAuth = encodeURIComponent(location.href.replace(/\?code.*/, "").replace(/&code.*/, ""));
      this.code = this.route.snapshot.queryParams['code'];
      this.authenticationService.slack(this.code, this.redirectUrlOAuth)
        .subscribe(() => {
          this.router.navigate([this.returnUrl]);
        });
    }
    this.slackClientId = this.configService.get('slackClientId');
  }

  ngOnInit() {

    this.loginForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });

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
          this.router.navigate([this.returnUrl]);
        },
        error => {
          this.alertService.error(error);
          this.loading = false;
        });
  }
}
