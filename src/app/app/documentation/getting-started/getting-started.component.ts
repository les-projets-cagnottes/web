import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-getting-started',
  templateUrl: './getting-started.component.html',
  styleUrls: ['./getting-started.component.css']
})
export class GettingStartedComponent implements OnInit {

  constructor() {
    console.debug('Component Getting Started constructed');
  }

  ngOnInit() {
    console.debug('Component Getting Started initialized');
  }

}
