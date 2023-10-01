import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NavService {

  private title = ""
  private path = ""

  constructor() { }

  public setTitle(title: string) {
    this.title = title;
  }

  public getTitle(): string {
    return this.title;
  }

  public setPath(path: string) {
    this.path = path;
  }

  public getPath(): string {
    return this.path;
  }

}
