import type { LessonStage } from '../../types/game';
import GameMapNode from '../game-ui/GameMapNode';

type WorldMapNodeProps = {
  stage: LessonStage;
  selected?: boolean;
  className?: string;
  stylePosition?: { x: number; y: number };
  onSelect?: (stage: LessonStage) => void;
};

export default function WorldMapNode({ stage, selected, className, stylePosition, onSelect }: WorldMapNodeProps) {
  const state = stage.status === 'locked' ? 'locked' : stage.status === 'current' ? 'current' : 'completed';

  return (
    <GameMapNode
      level={stage.id}
      state={state}
      color={stage.color}
      stars={stage.stars}
      label={stage.khmer}
      subtitle={stage.english}
      selected={selected}
      className={className}
      style={stylePosition ? { left: stylePosition.x, top: stylePosition.y } : undefined}
      onClick={() => onSelect?.(stage)}
    />
  );
}
