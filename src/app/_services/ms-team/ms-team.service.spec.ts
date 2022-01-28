import { TestBed } from '@angular/core/testing';

import { MsTeamService } from './ms-team.service';

describe('MsTeamService', () => {
  let service: MsTeamService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MsTeamService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
