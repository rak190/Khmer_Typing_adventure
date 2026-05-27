import { useEffect, useState } from 'react';
import {
  ECONOMY_EVENT,
  getInventory,
  loadCachedEconomy,
  loadCachedInventory,
  type EconomyInventoryItem,
  type EconomyState,
} from './economy';

export function useEconomyState() {
  const [economy, setEconomy] = useState<EconomyState>(() => loadCachedEconomy());

  useEffect(() => {
    const refresh = () => setEconomy(loadCachedEconomy());
    refresh();
    window.addEventListener(ECONOMY_EVENT, refresh);
    return () => window.removeEventListener(ECONOMY_EVENT, refresh);
  }, []);

  return economy;
}

export function useInventoryState() {
  const [inventory, setInventory] = useState<EconomyInventoryItem[]>(() => loadCachedInventory());

  useEffect(() => {
    let active = true;
    const refresh = () => setInventory(loadCachedInventory());
    refresh();
    void getInventory().then((items) => {
      if (active) setInventory(items);
    }).catch(() => {
      if (active) refresh();
    });
    window.addEventListener(ECONOMY_EVENT, refresh);
    return () => {
      active = false;
      window.removeEventListener(ECONOMY_EVENT, refresh);
    };
  }, []);

  return inventory;
}
