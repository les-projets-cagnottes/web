import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavService } from './_services/nav/nav.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(
    router: Router,
    navService: NavService) {
    router.events.subscribe(() => {
      navService.setTitle("");
    })
  }
}
