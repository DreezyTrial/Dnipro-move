import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

document.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof Element)) {
    return;
  }
  const link = target.closest('a[href^="tel:"]');
  if (!(link instanceof HTMLAnchorElement) || typeof gtag_report_conversion !== 'function') {
    return;
  }
  event.preventDefault();
  gtag_report_conversion(link.href);
});

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
