import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [],
  templateUrl: './test.component.html',
  styleUrl: './test.component.css'
})
export class TestComponent implements OnInit{
  ngOnInit() {
    document.addEventListener('deviceready', () => {
      if (typeof window.store === 'undefined') {
        alert('store undefined');
        return;
      }
      alert('store detected');
      window.store.verbosity = window.store.DEBUG;
      window.store.register({
        id: 'prompteur_1_9',
        type: window.store.PAID_SUBSCRIPTION
      });
      window.store.ready(() => {
        alert('Store READY');
      });
      window.store.error((err: any) => {
        alert('Store ERROR: ' + JSON.stringify(err));
      });
      window.store.refresh();
    }, false);
  }
}
