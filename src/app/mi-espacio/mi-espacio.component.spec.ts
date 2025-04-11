import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiEspacioComponent } from './mi-espacio.component';

describe('MiEspacioComponent', () => {
  let component: MiEspacioComponent;
  let fixture: ComponentFixture<MiEspacioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MiEspacioComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiEspacioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
