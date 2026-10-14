import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

/** Висота контенту калькулятора, при якій внутрішній скрол зникає. */
const CALCULATOR_FIT_HEIGHT = 1280;

@Component({
  selector: 'app-widget-embed',
  templateUrl: './widget-embed.component.html',
  styleUrl: './widget-embed.component.scss'
})
export class WidgetEmbedComponent implements AfterViewInit, OnDestroy {
  @ViewChild('slot') private slot?: ElementRef<HTMLElement>;
  @ViewChild('frame') private frame?: ElementRef<HTMLIFrameElement>;

  readonly iframeSrc: SafeResourceUrl | null;
  passClicks = false;

  private readonly cleanups: Array<() => void> = [];

  constructor(sanitizer: DomSanitizer) {
    this.iframeSrc = environment.calculatorIframeUrl
      ? sanitizer.bypassSecurityTrustResourceUrl(this.embedUrl(environment.calculatorIframeUrl))
      : null;
  }

  ngAfterViewInit(): void {
    window.addEventListener('resize', this.fit);
    window.addEventListener('pointerup', this.restoreBridge);
    window.addEventListener('pointercancel', this.restoreBridge);
    this.cleanups.push(
      () => window.removeEventListener('resize', this.fit),
      () => window.removeEventListener('pointerup', this.restoreBridge),
      () => window.removeEventListener('pointercancel', this.restoreBridge)
    );
    queueMicrotask(() => this.fit());
  }

  ngOnDestroy(): void {
    this.cleanups.forEach((fn) => fn());
  }

  onIframeLoad(): void {
    this.fit();
  }

  allowClicks(): void {
    this.passClicks = true;
  }

  private embedUrl(url: string): string {
    const parsed = new URL(url, window.location.origin);
    parsed.searchParams.set('embed', '1');
    parsed.searchParams.set('noScroll', '1');
    return parsed.toString();
  }

  private readonly restoreBridge = (): void => {
    this.passClicks = false;
  };

  private readonly fit = (): void => {
    const iframe = this.frame?.nativeElement;
    const slot = this.slot?.nativeElement;
    if (!iframe || !slot) {
      return;
    }

    const boxH = slot.clientHeight || 1;
    let innerH = CALCULATOR_FIT_HEIGHT;
    try {
      const doc = iframe.contentDocument;
      if (doc) {
        innerH = Math.max(
          CALCULATOR_FIT_HEIGHT,
          doc.documentElement.scrollHeight,
          doc.body?.scrollHeight ?? 0
        );
      }
    } catch {
      /* cross-origin */
    }

    const scale = Math.min(1, boxH / innerH);
    iframe.style.width = `${100 / scale}%`;
    iframe.style.height = `${innerH}px`;
    iframe.style.transformOrigin = 'top left';
    iframe.style.transform = `scale(${scale})`;
  };
}
