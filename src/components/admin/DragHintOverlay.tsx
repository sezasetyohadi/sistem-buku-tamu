interface DragHintOverlayProps {
  isDragging: boolean;
  dragDeltaX: number;
}

export function DragHintOverlay({ isDragging, dragDeltaX }: DragHintOverlayProps) {
  // We no longer need to show horizontal drag hints
  // This component is kept for compatibility but doesn't display anything
  return null;
}
