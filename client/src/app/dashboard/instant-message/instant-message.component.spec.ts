import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InstantMessageComponent } from './instant-message.component';

describe('InstantMessageComponent', () => {
  let component: InstantMessageComponent;
  let fixture: ComponentFixture<InstantMessageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InstantMessageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InstantMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
