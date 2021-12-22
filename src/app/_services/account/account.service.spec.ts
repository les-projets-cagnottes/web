import { TestBed } from '@angular/core/testing';
import { AccountService } from './account.service';

describe('Account.Service', () => {
  let service: AccountService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccountService);
  });
  it('should create an instance', () => {
    expect(service).toBeTruthy();
  });
});
