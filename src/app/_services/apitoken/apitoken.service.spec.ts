import { TestBed } from '@angular/core/testing';

import { ApiTokenService } from './apitoken.service';

describe('ApiTokenService', () => {
  let service: ApiTokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiTokenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
