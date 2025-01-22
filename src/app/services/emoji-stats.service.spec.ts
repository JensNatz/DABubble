import { TestBed } from '@angular/core/testing';

import { EmojiStatsService } from './emoji-stats.service';

describe('EmojiStatsService', () => {
  let service: EmojiStatsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmojiStatsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
