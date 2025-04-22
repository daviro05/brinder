import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedallasComponent } from './medallas.component';

describe('MedallasComponent', () => {
  let component: MedallasComponent;
  let fixture: ComponentFixture<MedallasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedallasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedallasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
