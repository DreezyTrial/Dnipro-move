import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-widget-embed',
  templateUrl: './widget-embed.component.html',
  styleUrl: './widget-embed.component.scss'
})
export class WidgetEmbedComponent {
  readonly iframeSrc: SafeResourceUrl | null;

  constructor(sanitizer: DomSanitizer) {
    this.iframeSrc = environment.calculatorIframeUrl
      ? sanitizer.bypassSecurityTrustResourceUrl(this.embedUrl(environment.calculatorIframeUrl))
      : null;
  }

  private embedUrl(url: string): string {
    const parsed = new URL(url, window.location.origin);
    parsed.searchParams.set('embed', '1');
    return parsed.toString();
  }
}
