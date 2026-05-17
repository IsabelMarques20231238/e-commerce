import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryLinks } from './category-links';

describe('CategoryLinks', () => {
  let component: CategoryLinks;
  let fixture: ComponentFixture<CategoryLinks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryLinks],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryLinks);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
