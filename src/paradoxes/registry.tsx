/* ============================================================
   Paradox Registry — Extensible paradox catalog
   ============================================================ */

import { lazy, type ComponentType, type ReactNode } from 'react';
import { DoorOpen, Cake, CircleDollarSign } from 'lucide-react';

export interface ParadoxEntry {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  icon: ReactNode;
  color: string;
  component: React.LazyExoticComponent<ComponentType>;
}

const registry: ParadoxEntry[] = [
  {
    id: 'monty-hall',
    title: 'Monty Hall Problemi',
    shortTitle: 'Monty Hall',
    description: 'Kapıyı değiştirmek kazanma olasılığını gerçekten artırır mı? Simülasyonla keşfedin.',
    icon: <DoorOpen size={24} />,
    color: '#6366f1',
    component: lazy(() => import('./monty-hall/MontyHallPage')),
  },
  {
    id: 'birthday',
    title: 'Doğum Günü Paradoksu',
    shortTitle: 'Doğum Günü',
    description: 'Bir sınıfta aynı doğum gününe sahip iki kişi olma olasılığı düşündüğünüzden çok daha yüksek.',
    icon: <Cake size={24} />,
    color: '#ec4899',
    component: lazy(() => import('./birthday/BirthdayPage')),
  },
  {
    id: 'martingale',
    title: 'Martingale Stratejisi',
    shortTitle: 'Martingale',
    description: '"Kaybettikçe ikiye katla" stratejisi neden başarısız olur? Simülasyonla test edin.',
    icon: <CircleDollarSign size={24} />,
    color: '#f59e0b',
    component: lazy(() => import('./martingale/MartingalePage')),
  },
];

export default registry;
