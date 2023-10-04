import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { NavService } from './_services/nav/nav.service';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  routerSubscription: Subscription;

  constructor(
    private router: Router,
    private navService: NavService) {

    this.routerSubscription = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.navService.setTitle("");
        this.navService.setPath(e.urlAfterRedirects);
      });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}
