import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

const EMBED_RESIZE_MESSAGE = 'cargo-calculator:resize';
const EMBED_CONVERSION_MESSAGE = 'cargo-calculator:conversion';

declare function gtag_report_conversion(url?: string): boolean;

@Component({
  selector: 'app-widget-embed',
  templateUrl: './widget-embed.component.html',
  styleUrl: './widget-embed.component.scss'
})
export class WidgetEmbedComponent implements AfterViewInit, OnDestroy {
  @ViewChild('slot') private slot?: ElementRef<HTMLElement>;
  @ViewChild('frame') private frame?: ElementRef<HTMLIFrameElement>;

  readonly iframeSrc: SafeResourceUrl | null;

  private readonly allowedOrigin: string;

  constructor(sanitizer: DomSanitizer) {
    const url = environment.calculatorIframeUrl;
    this.allowedOrigin = url ? new URL(url, window.location.origin).origin : '';
    this.iframeSrc = url
      ? sanitizer.bypassSecurityTrustResourceUrl(this.embedUrl(url))
      : null;
  }

  ngAfterViewInit(): void {
    window.addEventListener('message', this.onMessage);
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', this.onMessage);
  }

  onIframeLoad(): void {
    this.readSameOriginHeight();
  }

  private embedUrl(url: string): string {
    const parsed = new URL(url, window.location.origin);
    parsed.searchParams.set('embed', '1');
    return parsed.toString();
  }

  private readonly onMessage = (event: MessageEvent): void => {
    if (!this.allowedOrigin || event.origin !== this.allowedOrigin) {
      return;
    }

    const data = event.data as { type?: string; height?: number } | null;
    if (!data) {
      return;
    }

    if (data.type === EMBED_CONVERSION_MESSAGE) {
      if (typeof gtag_report_conversion === 'function') {
        gtag_report_conversion();
      }
      return;
    }

    if (data.type !== EMBED_RESIZE_MESSAGE) {
      return;
    }

    const height = Number(data.height);
    if (!Number.isFinite(height) || height <= 0) {
      return;
    }

    this.applyHeight(height);
  };

  private readSameOriginHeight(): void {
    const iframe = this.frame?.nativeElement;
    if (!iframe) {
      return;
    }

    try {
      const doc = iframe.contentDocument;
      const height = doc?.documentElement.scrollHeight ?? 0;
      if (height > 0) {
        this.applyHeight(height);
      }
    } catch {
      // Cross-origin frame reports size via postMessage.
    }
  }

  private applyHeight(height: number): void {
    const iframe = this.frame?.nativeElement;
    const slot = this.slot?.nativeElement;
    if (!iframe || !slot) {
      return;
    }

    const px = `${Math.ceil(height)}px`;
    slot.style.height = px;
    slot.classList.add('sized');
    iframe.style.height = px;
  }
}
