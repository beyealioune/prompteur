import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CameratestComponent } from './cameratest.component';

describe('CameratestComponent', () => {
  let component: CameratestComponent;
  let fixture: ComponentFixture<CameratestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CameratestComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CameratestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
