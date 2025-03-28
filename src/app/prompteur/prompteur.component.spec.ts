import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrompteurComponent } from './prompteur.component';

describe('PrompteurComponent', () => {
  let component: PrompteurComponent;
  let fixture: ComponentFixture<PrompteurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrompteurComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrompteurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
