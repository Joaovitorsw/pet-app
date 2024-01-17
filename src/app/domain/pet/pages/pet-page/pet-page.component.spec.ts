import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PetPageComponent } from './pet-page.component';

describe('PetPageComponent', () => {
  let component: PetPageComponent;
  let fixture: ComponentFixture<PetPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PetPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PetPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
