import { Component } from '@angular/core';
import { WidgetEmbedComponent } from '../../components/widget-embed/widget-embed.component';

@Component({
  selector: 'app-home',
  imports: [WidgetEmbedComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  sending = false;
  sent = false;
  error = '';

  readonly services = [
    {
      n: '01',
      title: 'Перевезення по місту',
      text: 'Квартира, офіс, холодильник, шафа.Також надаємо послугу пакування речей та меблів.'
    },
    {
      n: '02',
      title: 'Перевезення по області',
      text: 'Камʼянське, Кривий Ріг, Нікополь, Павлоград, Новомосковськ. Авто під будь-який вантаж.'
    },
    {
      n: '03',
      title: 'Підйом будматеріалів',
      text: 'Мішки, плита, цегла, інструмент, гіпсокартон, бруски, дошки.'
    },
    {
      n: '04',
      title: 'Вантажники',
      text: 'Підйом,розвантаження,збірка меблів,розстановка меблів,тощо'
    }
  ];

  async sendLead(event: Event): Promise<void> {
    event.preventDefault();
    if (this.sending || this.sent) {
      return;
    }

    const form = event.target as HTMLFormElement;
    const data = new FormData(form);
    const name = String(data.get('name') ?? '').trim();
    const phone = String(data.get('phone') ?? '').trim();
    const comment = String(data.get('comment') ?? '').trim();

    if (name.length < 2 || phone.replace(/\D/g, '').length < 9) {
      this.error = 'Вкажіть імʼя і коректний номер телефону.';
      return;
    }

    this.sending = true;
    this.error = '';

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, comment }),
      });
      if (!response.ok) {
        throw new Error('request_failed');
      }
      this.sent = true;
      form.reset();
      gtag_report_conversion();
    } catch {
      this.error = 'Не вдалося надіслати заявку. Зателефонуйте, будь ласка.';
    } finally {
      this.sending = false;
    }
  }
}
