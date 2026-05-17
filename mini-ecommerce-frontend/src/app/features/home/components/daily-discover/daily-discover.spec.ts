import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, OnInit, inject, Input, OnChanges, SimpleChanges } from '@angular/core';

import { DailyDiscover } from './daily-discover';

describe('DailyDiscover', () => {
  let component: DailyDiscover;
  let fixture: ComponentFixture<DailyDiscover>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyDiscover],
    }).compileComponents();

    fixture = TestBed.createComponent(DailyDiscover);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
