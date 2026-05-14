import GameProgressBar from '../game-ui/GameProgressBar';

type ProgressBarProps = {
  value: number;
  max?: number;
  label?: string;
  color?: 'green' | 'blue' | 'gold' | 'purple' | 'red';
  className?: string;
  showValue?: boolean;
};

export default function ProgressBar({ color = 'green', ...props }: ProgressBarProps) {
  return <GameProgressBar variant={color} {...props} />;
}
