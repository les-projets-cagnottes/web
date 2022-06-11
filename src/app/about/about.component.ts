import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  constructor() {
    console.debug('Component About constructed');
  }

  ngOnInit() {
    console.debug('Component About initialized');
  }

}
