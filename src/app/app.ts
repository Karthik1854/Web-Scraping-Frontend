import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from './components/header/header.component';

export interface CalendarDay {
  day: number;
  date: Date;
  isCurrentMonth: boolean;
  isPast: boolean;
  isToday: boolean;
  isSelected: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  // Search widget state
  selectedLocation = signal<string>('My Location');
  selectedDateLabel = signal<string>('Tomorrow');
  selectedPlayers = signal<number>(2);
  selectedHoles = signal<number>(18);

  // Dropdown toggles
  isLocationOpen = signal<boolean>(false);
  isCalendarOpen = signal<boolean>(false);
  isPlayersOpen = signal<boolean>(false);
  isHolesOpen = signal<boolean>(false);

  // Locations, Players & Holes options
  locations = ['My Location', 'Brooksville, FL', 'Tampa, FL', 'Orlando, FL', 'Miami, FL', 'Jacksonville, FL'];
  playerOptions = [1, 2, 3, 4];
  holeOptions = [9, 18, 27, 36];

  // Calendar State (Defaults to September 2026 to match reference design)
  calendarViewDate = signal<Date>(new Date(2026, 8, 1)); // September 2026
  todayDate = new Date(2026, 8, 22); // 22 Sep 2026
  selectedDate = signal<Date>(new Date(2026, 8, 23)); // 23 Sep 2026 (Tomorrow)

  // Time Window State
  fromTime = signal<string>('5 AM');
  toTime = signal<string>('9 PM');

  timeOptions = [
    '5 AM', '6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM',
    '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM',
  ];

  weekdays = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

  // Month & Year header display string
  currentMonthName = computed(() => {
    return this.calendarViewDate().toLocaleString('en-US', { month: 'long', year: 'numeric' });
  });

  // Calendar days grid computation
  calendarDays = computed<CalendarDay[]>(() => {
    const view = this.calendarViewDate();
    const year = view.getFullYear();
    const month = view.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const days: CalendarDay[] = [];

    // Previous month filler days (inactive)
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, prevMonthDays - i);
      days.push({
        day: prevMonthDays - i,
        date: prevDate,
        isCurrentMonth: false,
        isPast: true,
        isToday: false,
        isSelected: false,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday =
        date.getFullYear() === this.todayDate.getFullYear() &&
        date.getMonth() === this.todayDate.getMonth() &&
        date.getDate() === this.todayDate.getDate();

      const isSelected =
        date.getFullYear() === this.selectedDate().getFullYear() &&
        date.getMonth() === this.selectedDate().getMonth() &&
        date.getDate() === this.selectedDate().getDate();

      const isPast = date < new Date(this.todayDate.getFullYear(), this.todayDate.getMonth(), this.todayDate.getDate());

      days.push({
        day,
        date,
        isCurrentMonth: true,
        isPast,
        isToday,
        isSelected,
      });
    }

    // Next month filler days (inactive)
    const remainingSlots = (7 - (days.length % 7)) % 7;
    for (let day = 1; day <= remainingSlots; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({
        day,
        date: nextDate,
        isCurrentMonth: false,
        isPast: false,
        isToday: false,
        isSelected: false,
      });
    }

    return days;
  });

  toggleDropdown(type: 'location' | 'date' | 'players' | 'holes'): void {
    if (type === 'location') {
      this.isLocationOpen.update((v) => !v);
      this.isCalendarOpen.set(false);
      this.isPlayersOpen.set(false);
      this.isHolesOpen.set(false);
    } else if (type === 'date') {
      this.isCalendarOpen.update((v) => !v);
      this.isLocationOpen.set(false);
      this.isPlayersOpen.set(false);
      this.isHolesOpen.set(false);
    } else if (type === 'players') {
      this.isPlayersOpen.update((v) => !v);
      this.isLocationOpen.set(false);
      this.isCalendarOpen.set(false);
      this.isHolesOpen.set(false);
    } else if (type === 'holes') {
      this.isHolesOpen.update((v) => !v);
      this.isLocationOpen.set(false);
      this.isCalendarOpen.set(false);
      this.isPlayersOpen.set(false);
    }
  }

  closeAllDropdowns(): void {
    this.isLocationOpen.set(false);
    this.isCalendarOpen.set(false);
    this.isPlayersOpen.set(false);
    this.isHolesOpen.set(false);
  }

  prevMonth(event: MouseEvent): void {
    event.stopPropagation();
    const curr = this.calendarViewDate();
    this.calendarViewDate.set(new Date(curr.getFullYear(), curr.getMonth() - 1, 1));
  }

  nextMonth(event: MouseEvent): void {
    event.stopPropagation();
    const curr = this.calendarViewDate();
    this.calendarViewDate.set(new Date(curr.getFullYear(), curr.getMonth() + 1, 1));
  }

  selectDay(day: CalendarDay, event: MouseEvent): void {
    event.stopPropagation();
    if (!day.isCurrentMonth || day.isPast) return;
    this.selectedDate.set(day.date);
  }

  applyCalendar(event: MouseEvent): void {
    event.stopPropagation();
    const sel = this.selectedDate();
    const diffDays = Math.round(
      (sel.getTime() - this.todayDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) {
      this.selectedDateLabel.set('Today');
    } else if (diffDays === 1) {
      this.selectedDateLabel.set('Tomorrow');
    } else {
      this.selectedDateLabel.set(
        sel.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      );
    }

    this.isCalendarOpen.set(false);
  }

  selectLocation(loc: string): void {
    this.selectedLocation.set(loc);
    this.isLocationOpen.set(false);
  }

  selectPlayers(count: number): void {
    this.selectedPlayers.set(count);
    this.isPlayersOpen.set(false);
  }

  selectHoles(count: number): void {
    this.selectedHoles.set(count);
    this.isHolesOpen.set(false);
  }

  onSearch(): void {
    console.log('Searching tee times with:', {
      location: this.selectedLocation(),
      date: this.selectedDate(),
      fromTime: this.fromTime(),
      toTime: this.toTime(),
      players: this.selectedPlayers(),
      holes: this.selectedHoles(),
    });
  }
}
