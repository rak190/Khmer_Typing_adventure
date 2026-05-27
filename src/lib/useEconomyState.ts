import { useEffect, useState } from 'react';
import {
  ECONOMY_EVENT,
  getInventory,
  getDailyQuestClaimIds,
  getRewardClaimIds,
  loadCachedEconomy,
  loadCachedDailyQuestClaimIds,
  loadCachedInventory,
  loadCachedRewardClaimIds,
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

export function useRewardClaimIds(rewardType: string) {
  const [claimIds, setClaimIds] = useState<string[]>(() => loadCachedRewardClaimIds(rewardType));

  useEffect(() => {
    let active = true;
    const refresh = () => setClaimIds(loadCachedRewardClaimIds(rewardType));
    refresh();
    void getRewardClaimIds(rewardType).then((items) => {
      if (active) setClaimIds(items);
    }).catch(() => {
      if (active) refresh();
    });
    window.addEventListener(ECONOMY_EVENT, refresh);
    return () => {
      active = false;
      window.removeEventListener(ECONOMY_EVENT, refresh);
    };
  }, [rewardType]);

  return claimIds;
}

export function useDailyQuestClaimIds(date?: string) {
  const [claimIds, setClaimIds] = useState<string[]>(() => loadCachedDailyQuestClaimIds(date));

  useEffect(() => {
    let active = true;
    const refresh = () => setClaimIds(loadCachedDailyQuestClaimIds(date));
    refresh();
    void getDailyQuestClaimIds(date).then((items) => {
      if (active) setClaimIds(items);
    }).catch(() => {
      if (active) refresh();
    });
    window.addEventListener(ECONOMY_EVENT, refresh);
    return () => {
      active = false;
      window.removeEventListener(ECONOMY_EVENT, refresh);
    };
  }, [date]);

  return claimIds;
}
