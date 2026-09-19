import type { AppState } from '@/types';
import { generateId } from '@/lib/calculations';

function daysAgo(n: number): string {
  const now = new Date();
  const rw = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  rw.setDate(rw.getDate() - n);
  return rw.toISOString().split('T')[0];
}

export const DEMO_DATA: AppState = {
  settings: {
    farmName: 'Inzuki Farm',
    currency: 'RWF',
    traySize: 30,
    singleEggPrice: 170,
    trayPrices: [4600, 4700, 4800, 4900, 5000],
  },

  dailyEggs: [
    {
      id: generateId('de'),
      date: daysAgo(6),
      roomA: 90,   // 3 trays
      roomB: 75,   // 2 trays + 15
      roomC: 60,   // 2 trays
      eaten: 6,
      broken: 3,
      notes: 'Normal day',
    },
    {
      id: generateId('de'),
      date: daysAgo(5),
      roomA: 120,  // 4 trays
      roomB: 90,   // 3 trays
      roomC: 75,   // 2 trays + 15
      eaten: 9,
      broken: 0,
      notes: '',
    },
    {
      id: generateId('de'),
      date: daysAgo(4),
      roomA: 105,  // 3 trays + 15
      roomB: 90,   // 3 trays
      roomC: 60,   // 2 trays
      eaten: 6,
      broken: 6,
      notes: 'Some eggs broken during collection',
    },
    {
      id: generateId('de'),
      date: daysAgo(3),
      roomA: 90,
      roomB: 75,
      roomC: 90,
      eaten: 9,
      broken: 0,
      notes: '',
    },
    {
      id: generateId('de'),
      date: daysAgo(2),
      roomA: 120,
      roomB: 105,
      roomC: 90,
      eaten: 6,
      broken: 3,
      notes: '',
    },
    {
      id: generateId('de'),
      date: daysAgo(1),
      roomA: 90,
      roomB: 75,
      roomC: 60,
      eaten: 9,
      broken: 0,
      notes: '',
    },
    {
      id: generateId('de'),
      date: daysAgo(0),
      roomA: 105,
      roomB: 90,
      roomC: 75,
      eaten: 6,
      broken: 3,
      notes: 'Good production today',
    },
  ],

  sales: [
    // day 6
    { id: generateId('sale'), date: daysAgo(6), unitType: 'tray', quantity: 5, price: 4800, total: 24000, eggs: 150, notes: '' },
    // day 5 — two sales
    { id: generateId('sale'), date: daysAgo(5), unitType: 'tray', quantity: 6, price: 4900, total: 29400, eggs: 180, notes: 'Market day' },
    { id: generateId('sale'), date: daysAgo(5), unitType: 'single', quantity: 15, price: 170, total: 2550, eggs: 15, notes: '' },
    // day 4
    { id: generateId('sale'), date: daysAgo(4), unitType: 'tray', quantity: 4, price: 4800, total: 19200, eggs: 120, notes: '' },
    // day 3
    { id: generateId('sale'), date: daysAgo(3), unitType: 'tray', quantity: 5, price: 5000, total: 25000, eggs: 150, notes: 'Weekend price' },
    { id: generateId('sale'), date: daysAgo(3), unitType: 'single', quantity: 20, price: 170, total: 3400, eggs: 20, notes: '' },
    // day 2
    { id: generateId('sale'), date: daysAgo(2), unitType: 'tray', quantity: 7, price: 4800, total: 33600, eggs: 210, notes: '' },
    // day 1
    { id: generateId('sale'), date: daysAgo(1), unitType: 'tray', quantity: 4, price: 4700, total: 18800, eggs: 120, notes: '' },
  ],

  expenses: [
    { id: generateId('exp'), date: daysAgo(5), type: 'Feed', amount: 45000, description: '100kg layer mash' },
    { id: generateId('exp'), date: daysAgo(4), type: 'Medicine', amount: 8000, description: 'Vitamin supplement' },
    { id: generateId('exp'), date: daysAgo(3), type: 'Transport', amount: 3000, description: 'Egg delivery to market' },
    { id: generateId('exp'), date: daysAgo(1), type: 'Equipment', amount: 5000, description: 'Egg crates replacement' },
    { id: generateId('exp'), date: daysAgo(0), type: 'Feed', amount: 22000, description: '50kg layer mash top-up' },
  ],
};
