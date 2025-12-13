import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ReactNode } from 'react';

interface SortableItemProps {
  id: string;
  children: ReactNode;
  dragHandleRender?: (listeners: any, attributes: any) => ReactNode;
}

export function SortableItem({ id, children, dragHandleRender }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // If dragHandleRender is provided, only apply listeners to the handle
  if (dragHandleRender) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="touch-manipulation"
      >
        {dragHandleRender(listeners, attributes)}
        {children}
      </div>
    );
  }

  // Default behavior: entire item is draggable
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="touch-manipulation"
    >
      {children}
    </div>
  );
}
