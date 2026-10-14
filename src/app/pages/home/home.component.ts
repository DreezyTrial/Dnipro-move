import { Component } from '@angular/core';
import { WidgetEmbedComponent } from '../../components/widget-embed/widget-embed.component';

@Component({
  selector: 'app-home',
  imports: [WidgetEmbedComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  readonly services = [
    {
      title: 'По місту',
      text: 'Квартирні та офісні переїзди, доставка меблів і техніки по районах Дніпра за кілька годин.'
    },
    {
      title: 'По області',
      text: 'Рейси Дніпро — Камʼянське, Кривий Ріг, Нікополь, Павлоград, Новомосковськ та інші міста.'
    },
    {
      title: 'Будматеріали',
      text: 'Цегла, мішки, плити, інструмент на обʼєкт у місті або на ділянку в області.'
    },
    {
      title: 'Вантажники',
      text: 'Підйом на поверх, занесення, розвантаження. Можна замовити разом із машиною.'
    }
  ];
}
