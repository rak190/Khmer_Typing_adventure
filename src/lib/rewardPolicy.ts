export type RewardCalculationInput = {
  mode: 'lesson' | 'boss' | 'challenge';
  accuracy: number;
  CPM: number;
  targetCPM: number;
  mistakes: number;
  stars: number;
  passed: boolean;
  score: number;
  previousBestScore?: number;
  currentStreak: number;
  worldId?: number | string;
  lessonId?: string;
};

export type CalculatedRewards = {
  coinsEarned: number;
  xpEarned: number;
  gemsEarned: number;
  heartChange: number;
  rewardReasons: string[];
};

export function calculateLevelFromXP(totalXP: number) {
  const xp = Math.max(0, totalXP);
  const thresholds = [0, 100, 250, 450, 700];
  for (let index = thresholds.length - 1; index >= 0; index -= 1) {
    if (xp >= thresholds[index]) {
      if (index < thresholds.length - 1) return index + 1;
      break;
    }
  }

  let level = 5;
  let requirement = 700;
  let step = 350;
  while (xp >= requirement + step) {
    requirement += step;
    step = Math.round(step * 1.18);
    level += 1;
  }
  return level;
}

export function getStreakBonus(streak: number) {
  if (streak >= 14) return 0.15;
  if (streak >= 7) return 0.10;
  if (streak >= 3) return 0.05;
  return 0;
}

export function calculateRewards(input: RewardCalculationInput): CalculatedRewards {
  const rewardReasons: string[] = [];
  const improvedBest = typeof input.previousBestScore === 'number' && input.score > input.previousBestScore;
  const firstRecordedClear = input.previousBestScore === undefined || input.previousBestScore <= 0;
  const streakBonus = getStreakBonus(input.currentStreak);

  if (input.accuracy < 70) {
    rewardReasons.push('XP តិចសម្រាប់ការចូលរួម ព្រោះ accuracy ក្រោម 70%។');
    return {
      coinsEarned: input.passed ? 5 : 0,
      xpEarned: 5,
      gemsEarned: 0,
      heartChange: 0,
      rewardReasons,
    };
  }

  let coinsEarned = 0;
  let xpEarned = 0;
  let gemsEarned = 0;

  if (input.passed) {
    if (input.mode === 'boss') {
      coinsEarned += 100;
      xpEarned += 100;
      rewardReasons.push('+100 កាក់ និង +100 XP សម្រាប់ឆ្លង Boss។');
      if (input.worldId === 1 && firstRecordedClear) {
        gemsEarned += 2;
        rewardReasons.push('+2 ពេជ្រ សម្រាប់ឆ្លង Boss ពិភព 1។');
      }
      if (input.lessonId === 'w10-final-boss' && firstRecordedClear) {
        gemsEarned += 5;
        rewardReasons.push('+5 ពេជ្រ សម្រាប់ Final Boss។');
      }
    } else {
      coinsEarned += 20;
      xpEarned += 30;
      rewardReasons.push('+20 កាក់ និង +30 XP សម្រាប់ឆ្លងមេរៀន។');
    }
  } else {
    xpEarned += 5;
    rewardReasons.push('+5 XP សម្រាប់ការហាត់។');
  }

  if (input.stars >= 2) {
    coinsEarned += 10;
    rewardReasons.push('+10 កាក់ bonus សម្រាប់ 2 ផ្កាយ។');
  }
  if (input.stars >= 3) {
    coinsEarned += 25;
    rewardReasons.push('+25 កាក់ bonus សម្រាប់ 3 ផ្កាយ។');
  }
  if (input.accuracy >= 90) {
    xpEarned += 10;
    rewardReasons.push('+10 XP សម្រាប់ accuracy 90%+។');
  }
  if (input.accuracy >= 95) {
    xpEarned += 25;
    rewardReasons.push('+25 XP សម្រាប់ accuracy 95%+។');
  }
  if (input.accuracy === 100) {
    coinsEarned += 50;
    rewardReasons.push('+50 កាក់ សម្រាប់ accuracy 100%។');
  }
  if (input.CPM >= input.targetCPM) {
    xpEarned += 15;
    rewardReasons.push('+15 XP សម្រាប់ឈានដល់គោលដៅ CPM។');
  }
  if (input.mistakes === 0) {
    xpEarned += 30;
    rewardReasons.push('+30 XP សម្រាប់គ្មានកំហុស។');
  }
  if (improvedBest) {
    coinsEarned += 20;
    xpEarned += 10;
    rewardReasons.push('+20 កាក់ និង +10 XP សម្រាប់បំបែកពិន្ទុល្អបំផុត។');
  }
  if (streakBonus > 0) {
    const bonusXP = Math.round(xpEarned * streakBonus);
    xpEarned += bonusXP;
    rewardReasons.push(`+${bonusXP} XP bonus ពី streak។`);
  }

  return { coinsEarned, xpEarned, gemsEarned, heartChange: 0, rewardReasons };
}

