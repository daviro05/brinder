import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiKillerComponent } from './mi-killer.component';

describe('MiKillerComponent', () => {
  let component: MiKillerComponent;
  let fixture: ComponentFixture<MiKillerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MiKillerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiKillerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
