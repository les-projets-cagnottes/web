import { TestBed } from '@angular/core/testing';

import { SlackTeamService } from './slack-team.service';

describe('SlackTeamService', () => {
  let service: SlackTeamService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SlackTeamService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
