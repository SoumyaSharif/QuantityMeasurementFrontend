import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AuthService, SessionUser } from '../../core/auth.service';

type MeasurementType = 'length' | 'weight' | 'temperature' | 'volume' | '';
type ActionType = 'comparison' | 'conversion' | 'arithmetic' | '';
type OperatorType = '+' | '-' | '*' | '/';

interface HistoryItem {
  text: string;
  type: MeasurementType;
  action: ActionType;
  createdAt: string;
}

interface UnitMap {
  base: string;
  units: Record<string, number>;
}

@Component({
  selector: 'app-dashboard-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css'
})
export class DashboardPageComponent implements OnInit {
  private readonly historyKey = 'qm_history';
  private readonly historyLimit = 12;

  readonly opLabels: Record<OperatorType, { symbol: string; label: string }> = {
    '+': { symbol: '+', label: 'Add' },
    '-': { symbol: '-', label: 'Subtract' },
    '*': { symbol: 'x', label: 'Multiply' },
    '/': { symbol: '/', label: 'Divide' }
  };

  readonly units: Record<Exclude<MeasurementType, ''>, UnitMap | null> = {
    length: {
      base: 'Meter',
      units: {
        Kilometer: 1000,
        Meter: 1,
        Centimeter: 0.01,
        Millimeter: 0.001,
        Mile: 1609.344,
        Yard: 0.9144,
        Foot: 0.3048,
        Inch: 0.0254
      }
    },
    weight: {
      base: 'Kilogram',
      units: {
        Kilogram: 1,
        Gram: 0.001,
        Milligram: 0.000001,
        Pound: 0.453592,
        Ounce: 0.0283495,
        Tonne: 1000
      }
    },
    temperature: null,
    volume: {
      base: 'Liter',
      units: {
        Liter: 1,
        Milliliter: 0.001,
        Gallon: 3.78541,
        Quart: 0.946353,
        Pint: 0.473176,
        Cup: 0.24,
        'Fluid Ounce': 0.0295735,
        Cubic_Meter: 1000
      }
    }
  };

  readonly tempUnits = ['Celsius', 'Fahrenheit', 'Kelvin'];
  readonly operators: OperatorType[] = ['+', '-', '*', '/'];

  session: SessionUser | null = null;
  state = {
    type: '' as MeasurementType,
    action: '' as ActionType,
    op: '+' as OperatorType
  };

  fromValue = '';
  toValue = '';
  fromUnit = '';
  toUnit = '';
  resultText = 'Choose type and action to begin';
  resultIsError = false;
  historyItems: HistoryItem[] = [];
  isHistoryOpen = false;
  isOpMenuOpen = false;

  constructor(private readonly authService: AuthService) {}

  ngOnInit(): void {
    this.session = this.authService.getSession();
    this.historyItems = this.getHistory();
  }

  selectType(type: MeasurementType): void {
    this.state.type = type;
    this.resetSelections();
  }

  selectAction(action: ActionType): void {
    this.state.action = action;
    this.resetSelections();
  }

  selectOp(op: OperatorType): void {
    this.state.op = op;
    this.isOpMenuOpen = false;
    this.calculate();
  }

  toggleOpMenu(): void {
    this.isOpMenuOpen = !this.isOpMenuOpen;
  }

  syncUnits(): void {
    if (!this.state.type) {
      return;
    }

    const units = this.getUnitList(this.state.type);
    if (!units.includes(this.toUnit)) {
      this.toUnit = '';
    }
  }

  calculate(): void {
    if (!this.state.type || !this.state.action) {
      return;
    }

    const fromVal = Number.parseFloat(this.fromValue);
    const toVal = Number.parseFloat(this.toValue);

    if (this.state.action === 'comparison') {
      if (!this.fromUnit || !this.toUnit) {
        this.setResult('Select both units to compare', true);
        return;
      }

      if (Number.isNaN(fromVal) || Number.isNaN(toVal)) {
        this.setResult('Enter values to compare', true);
        return;
      }

      const fromBase = this.convertToBase(fromVal, this.fromUnit, this.state.type);
      const toBase = this.convertToBase(toVal, this.toUnit, this.state.type);
      const symbol = fromBase < toBase ? '<' : fromBase > toBase ? '>' : '=';
      this.setResult(`${this.formatNum(fromVal)} ${this.fromUnit} ${symbol} ${this.formatNum(toVal)} ${this.toUnit}`);
      return;
    }

    if (this.state.action === 'conversion') {
      if (!this.fromUnit || !this.toUnit) {
        this.setResult('Select both units to convert', true);
        return;
      }

      if (Number.isNaN(fromVal)) {
        this.setResult('Enter a value to convert', true);
        return;
      }

      const converted = this.convertValue(fromVal, this.fromUnit, this.toUnit, this.state.type);
      this.toValue = this.formatNum(converted);
      this.setResult(`${this.formatNum(fromVal)} ${this.fromUnit} = ${this.formatNum(converted)} ${this.toUnit}`);
      return;
    }

    if (!this.fromUnit || !this.toUnit) {
      this.setResult('Select both units first', true);
      return;
    }

    if (Number.isNaN(fromVal) || Number.isNaN(toVal)) {
      this.setResult('Enter both values', true);
      return;
    }

    const aBase = this.convertToBase(fromVal, this.fromUnit, this.state.type);
    const bBase = this.convertToBase(toVal, this.toUnit, this.state.type);
    let result = 0;

    switch (this.state.op) {
      case '+':
        result = aBase + bBase;
        break;
      case '-':
        result = aBase - bBase;
        break;
      case '*':
        result = aBase * bBase;
        break;
      case '/':
        if (bBase === 0) {
          this.setResult('Cannot divide by zero', true);
          return;
        }
        result = aBase / bBase;
        break;
    }

    const resultInFrom = this.convertFromBase(result, this.fromUnit, this.state.type);
    this.setResult(
      `${this.formatNum(fromVal)} ${this.fromUnit} ${this.opLabels[this.state.op].symbol} ${this.formatNum(toVal)} ${this.toUnit} = ${this.formatNum(resultInFrom)} ${this.fromUnit}`
    );
  }

  toggleHistoryPanel(forceOpen?: boolean): void {
    this.isHistoryOpen = typeof forceOpen === 'boolean' ? forceOpen : !this.isHistoryOpen;
    if (this.isHistoryOpen) {
      this.historyItems = this.getHistory();
    }
  }

  clearHistory(): void {
    localStorage.setItem(this.historyKey, JSON.stringify([]));
    this.historyItems = [];
  }

  logout(): void {
    this.authService.logout();
  }

  getUnitList(type: MeasurementType): string[] {
    if (!type) {
      return [];
    }

    if (type === 'temperature') {
      return this.tempUnits;
    }

    return Object.keys(this.units[type]?.units || {});
  }

  displayUnit(unit: string): string {
    return unit.replace('_', ' ');
  }

  formatHistoryTime(isoString: string): string {
    return new Date(isoString).toLocaleString([], {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (!target.closest('#opDropBtn') && !target.closest('#opMenu')) {
      this.isOpMenuOpen = false;
    }

    if (!target.closest('#historyPanel') && !target.closest('#historyFab')) {
      this.isHistoryOpen = false;
    }
  }

  private resetSelections(): void {
    this.fromValue = '';
    this.toValue = '';
    this.fromUnit = '';
    this.toUnit = '';
    this.resultText = this.state.type && this.state.action ? 'Select units and enter values to begin' : 'Choose type and action to begin';
    this.resultIsError = false;
  }

  private convertToBase(value: number, unit: string, type: Exclude<MeasurementType, ''>): number {
    if (type === 'temperature') {
      return this.toTempBase(value, unit);
    }

    return value * (this.units[type]?.units[unit] || 1);
  }

  private convertFromBase(baseValue: number, unit: string, type: Exclude<MeasurementType, ''>): number {
    if (type === 'temperature') {
      return this.fromTempBase(baseValue, unit);
    }

    return baseValue / (this.units[type]?.units[unit] || 1);
  }

  private convertValue(value: number, fromUnit: string, toUnit: string, type: Exclude<MeasurementType, ''>): number {
    if (fromUnit === toUnit) {
      return value;
    }

    const base = this.convertToBase(value, fromUnit, type);
    return this.convertFromBase(base, toUnit, type);
  }

  private toTempBase(value: number, unit: string): number {
    if (unit === 'Celsius') {
      return value;
    }

    if (unit === 'Fahrenheit') {
      return ((value - 32) * 5) / 9;
    }

    return value - 273.15;
  }

  private fromTempBase(celsius: number, unit: string): number {
    if (unit === 'Celsius') {
      return celsius;
    }

    if (unit === 'Fahrenheit') {
      return (celsius * 9) / 5 + 32;
    }

    return celsius + 273.15;
  }

  private round(value: number, decimals = 6): number {
    return Number.parseFloat(value.toFixed(decimals));
  }

  private formatNum(value: number): string {
    if (Math.abs(value) >= 1e6 || (Math.abs(value) < 0.0001 && value !== 0)) {
      return value.toExponential(4);
    }

    return this.round(value, 4).toString();
  }

  private setResult(text: string, isError = false): void {
    this.resultText = text;
    this.resultIsError = isError;

    if (!isError) {
      this.addHistoryEntry(text);
    }
  }

  private getHistory(): HistoryItem[] {
    return JSON.parse(localStorage.getItem(this.historyKey) || '[]');
  }

  private addHistoryEntry(text: string): void {
    const items = this.getHistory();
    const latest = items[0];

    if (latest && latest.text === text && latest.type === this.state.type && latest.action === this.state.action) {
      return;
    }

    const nextItems: HistoryItem[] = [
      {
        text,
        type: this.state.type,
        action: this.state.action,
        createdAt: new Date().toISOString()
      },
      ...items
    ].slice(0, this.historyLimit);

    localStorage.setItem(this.historyKey, JSON.stringify(nextItems));
    this.historyItems = nextItems;
  }
}
