import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NavService {

  private title = ""

  constructor() { }

  public setTitle(title: string) {
    this.title = title;
  }

  public getTitle(): string {
    return this.title;
  }

}
