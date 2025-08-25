import { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragMoveEvent,
  DragOverEvent
} from "@dnd-kit/core";
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem";
import { DragHintOverlay } from "./DragHintOverlay";

interface SurveyQuestion {
  id?: number;
  pertanyaan: string;
  tipe_pertanyaan?: 'rating' | 'text';  // From page component
  tipe_jawaban?: 'rating' | 'teks';     // From backend
  status?: boolean;                     // From page component
  is_aktif?: boolean;                   // From backend
  jenis_rating_id?: number;
  is_required?: boolean;
  urutan?: number;
  baris?: number;
  kolom?: number;
}

interface QuestionOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveOrder: (questions: SurveyQuestion[]) => Promise<void>;
  questions: SurveyQuestion[];
  isLoading?: boolean;
}

export default function QuestionOrderModal({
  isOpen,
  onClose,
  onSaveOrder,
  questions = [],
  isLoading = false
}: QuestionOrderModalProps) {
  const [orderedQuestions, setOrderedQuestions] = useState<SurveyQuestion[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragDeltaX, setDragDeltaX] = useState(0);
  
  // Initialize the ordered questions when questions prop changes or modal opens
  useEffect(() => {
    if (isOpen && questions.length > 0) {
      // Map questions to ensure consistent property names
      const mappedQuestions = questions.map(q => ({
        ...q,
        // Ensure both naming conventions are preserved
        tipe_pertanyaan: q.tipe_pertanyaan || (q.tipe_jawaban === 'rating' ? 'rating' : 'text'),
        tipe_jawaban: q.tipe_jawaban || (q.tipe_pertanyaan === 'rating' ? 'rating' : 'teks'),
        status: q.status !== undefined ? q.status : q.is_aktif,
        is_aktif: q.is_aktif !== undefined ? q.is_aktif : q.status,
        // Ensure baris and kolom always have valid values
        baris: q.baris || 1,
        kolom: q.kolom || 1
      }));
      
      // Apply the recalculatePositions function to ensure proper grid layout
      const organizedQuestions = recalculatePositions(mappedQuestions);
      
      setOrderedQuestions(organizedQuestions);
    }
  }, [questions, isOpen]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const handleDragStart = (event: DragStartEvent) => {
    setIsDragging(true);
  };
  
  const handleDragMove = (event: DragMoveEvent) => {
    setDragDeltaX(event.delta.x);
  };
  
  const handleDragOver = (event: DragOverEvent) => {
    // Additional logic can be added here if needed
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false);
    setDragDeltaX(0);
    const { active, over } = event;
    
    // Nothing was dropped or dropped over nothing
    if (!active || !over) {
      return;
    }
    
    // Calculate the old and new indexes
    const activeId = active.id.toString();
    const overId = over.id.toString();
    const oldIndex = orderedQuestions.findIndex(q => `question-${q.id || q.urutan}` === activeId);
    const newIndex = orderedQuestions.findIndex(q => `question-${q.id || q.urutan}` === overId);
    
    // Only process if we have valid indexes and they're different
    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      // Get the dragged item and the target item
      const draggedItem = {...orderedQuestions[oldIndex]};
      const targetItem = {...orderedQuestions[newIndex]};
      
      // Create a copy of the ordered questions
      const updatedQuestions = [...orderedQuestions];
      
      // Check if this is a direct overlap (dropping directly onto an item)
      // We consider it an overlap/merge when dragging onto the exact same item
      const isOverlap = activeId !== overId;
      
      if (isOverlap) {
        // Find all items in the target row
        const targetRow = targetItem.baris || 1;
        const itemsInTargetRow = updatedQuestions.filter(
          q => q !== draggedItem && (q.baris || 1) === targetRow
        );
        
        // Find the max column in the target row
        const maxColumn = itemsInTargetRow.length > 0 
          ? Math.max(...itemsInTargetRow.map(q => q.kolom || 1))
          : 0;
        
        // Remove the dragged item from its current position
        updatedQuestions.splice(oldIndex, 1);
        
        // Create the updated dragged item with new position
        const updatedDraggedItem = {
          ...draggedItem,
          baris: targetRow,
          kolom: maxColumn + 1
        };
        
        // Find the new insert position
        const insertIndex = updatedQuestions.findIndex(q => 
          (q.baris || 1) > targetRow || 
          ((q.baris || 1) === targetRow && (q.kolom || 1) > updatedDraggedItem.kolom)
        );
        
        if (insertIndex === -1) {
          // Add to the end if no suitable position found
          updatedQuestions.push(updatedDraggedItem);
        } else {
          // Insert at the appropriate position
          updatedQuestions.splice(insertIndex, 0, updatedDraggedItem);
        }
      } else {
        // Standard reordering - insert between items
        // Remove the dragged item from its current position
        updatedQuestions.splice(oldIndex, 1);
        
        // Handle special case for moving to first position
        if (newIndex === 0) {
          // If moving to position 0, we shift all other items down
          for (let i = 0; i < updatedQuestions.length; i++) {
            // Shift all other items down one row
            updatedQuestions[i].baris = (updatedQuestions[i].baris || 1) + 1;
          }
          
          // Insert at the beginning with row 1, column 1
          updatedQuestions.unshift({
            ...draggedItem,
            baris: 1,
            kolom: 1
          });
        } 
        // Handle standard insertion between rows
        else {
          // Calculate the target position based on where it was dropped
          const prevItemIndex = Math.max(0, newIndex > oldIndex ? newIndex - 1 : newIndex);
          const nextItemIndex = Math.min(updatedQuestions.length - 1, prevItemIndex + 1);
          
          const prevItem = updatedQuestions[prevItemIndex];
          const nextItem = updatedQuestions.length > nextItemIndex ? updatedQuestions[nextItemIndex] : null;
          
          let targetRow: number;
          let targetCol: number = 1;
          
          // Determine the target row
          if (!nextItem) {
            // If there's no next item, we're at the end
            targetRow = (prevItem.baris || 1) + 1;
          } else if ((prevItem.baris || 1) === (nextItem.baris || 1)) {
            // If prev and next items are in the same row, insert in that row
            targetRow = prevItem.baris || 1;
          } else {
            // Insert in a new row between prev and next
            targetRow = (prevItem.baris || 1) + 1;
            
            // Shift all items at or below the new row down
            for (let i = 0; i < updatedQuestions.length; i++) {
              if ((updatedQuestions[i].baris || 1) >= targetRow) {
                updatedQuestions[i].baris = (updatedQuestions[i].baris || 1) + 1;
              }
            }
          }
          
          // Insert at the determined position
          const insertIndex = updatedQuestions.findIndex(q => 
            (q.baris || 1) > targetRow || 
            ((q.baris || 1) === targetRow && (q.kolom || 1) >= targetCol)
          );
          
          if (insertIndex === -1) {
            // Add to the end if no suitable position found
            updatedQuestions.push({
              ...draggedItem,
              baris: targetRow,
              kolom: targetCol
            });
          } else {
            // Insert at the appropriate position
            updatedQuestions.splice(insertIndex, 0, {
              ...draggedItem,
              baris: targetRow,
              kolom: targetCol
            });
          }
        }
      }
      
      // Recalculate all positions to ensure proper ordering
      const finalQuestions = recalculatePositions(updatedQuestions);
      setOrderedQuestions(finalQuestions);
    }
  };
  
  /**
   * Recalculate positions (baris and kolom) for all questions
   */
  const recalculatePositions = (questions: SurveyQuestion[]): SurveyQuestion[] => {
    // First, group questions by row value
    const rowsMap = new Map<number, SurveyQuestion[]>();
    
    // Group items by their current row
    questions.forEach(question => {
      const row = question.baris || 1;
      if (!rowsMap.has(row)) {
        rowsMap.set(row, []);
      }
      rowsMap.get(row)!.push({...question});
    });
    
    // Sort rows
    const sortedRows = Array.from(rowsMap.keys()).sort((a, b) => a - b);
    
    // Create a new array with updated positions
    const updatedQuestions: SurveyQuestion[] = [];
    let currentRow = 1;
    
    // Process each row
    sortedRows.forEach(rowNumber => {
      const rowQuestions = rowsMap.get(rowNumber)!;
      
      // Sort questions in this row by column
      rowQuestions.sort((a, b) => (a.kolom || 1) - (b.kolom || 1));
      
      // Update columns to be sequential starting from 1
      rowQuestions.forEach((question, index) => {
        updatedQuestions.push({
          ...question,
          baris: currentRow,
          kolom: index + 1,
          // Ensure both naming conventions are preserved
          tipe_pertanyaan: question.tipe_pertanyaan || (question.tipe_jawaban === 'rating' ? 'rating' : 'text'),
          tipe_jawaban: question.tipe_jawaban || (question.tipe_pertanyaan === 'rating' ? 'rating' : 'teks'),
          status: question.status !== undefined ? question.status : question.is_aktif,
          is_aktif: question.is_aktif !== undefined ? question.is_aktif : question.status
        });
      });
      
      currentRow++;
    });
    
    // Update urutan (1-based index) for the entire list
    return updatedQuestions.map((question, index) => ({
      ...question,
      urutan: index + 1
    }));
  };

  const handleSave = async () => {
    try {
      // Recalculate positions one final time to ensure consistency
      const finalQuestions = recalculatePositions(orderedQuestions);
      
      // Prepare data for the API - only send id, baris, and kolom
      const questionPositions = finalQuestions.map(question => ({
        id: question.id,
        baris: question.baris,
        kolom: question.kolom
      }));
      
      // Send the updated questions to the parent component
      await onSaveOrder(finalQuestions);
      
      // Log the position data that would be sent to the API
      console.log("Sending to API:", questionPositions);
      
      onClose();
    } catch (error) {
      console.error("Error saving question order:", error);
      alert("Gagal menyimpan urutan pertanyaan");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Urutan Pertanyaan"
      size="xl"
    >
      <DragHintOverlay isDragging={isDragging} dragDeltaX={dragDeltaX} />
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Sesuaikan urutan pertanyaan survey dengan menarik dan melepas item di bawah ini.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4 space-y-3">
          <div className="flex items-center">
            <div className="text-blue-500 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-sm text-blue-700">
              Urutan pertanyaan akan mempengaruhi tampilan pada form survey yang dilihat oleh responden.
            </span>
          </div>
          
          <div className="flex items-center">
            <div className="text-blue-500 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <span className="text-sm text-blue-700">
              <strong>Menyeret pertanyaan tepat ke atas pertanyaan lain</strong> akan menempatkannya di baris yang sama.
            </span>
          </div>
          
          <div className="flex items-center">
            <div className="text-blue-500 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 12a1 1 0 102 0V6.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L5 6.414V12zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
              </svg>
            </div>
            <span className="text-sm text-blue-700">
              Menyeret pertanyaan <strong>di antara dua baris</strong> akan menyisipkan pertanyaan tersebut dan menggeser pertanyaan di bawahnya.
            </span>
          </div>
        </div>

        {orderedQuestions.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            Tidak ada pertanyaan untuk diurutkan
          </div>
        ) : (
          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="max-h-[65vh] overflow-y-auto">
              {/* Use CSS Grid for a flexible layout */}
              <div className="grid gap-2">
                {/* Create a single sortable context with all items */}
                <SortableContext 
                  items={orderedQuestions.map(q => `question-${q.id || q.urutan}`)} 
                  strategy={verticalListSortingStrategy}
                >
                  {/* Group questions by row */}
                  {(() => {
                    // Get unique rows, sorted
                    const uniqueRows = Array.from(
                      new Set(orderedQuestions.map(q => q.baris || 1))
                    ).sort((a, b) => a - b);
                    
                    return uniqueRows.map(row => {
                      // Get all questions in this row
                      const rowQuestions = orderedQuestions
                        .filter(q => (q.baris || 1) === row)
                        .sort((a, b) => (a.kolom || 1) - (b.kolom || 1));

                      // Determine the number of columns for this row
                      const columnsCount = rowQuestions.length;
                      
                      return (
                        <div 
                          key={`row-${row}`} 
                          className="grid gap-2 mb-2"
                          style={{ 
                            gridTemplateColumns: columnsCount > 1 
                              ? `repeat(${columnsCount}, 1fr)` 
                              : "1fr" 
                          }}
                        >
                          {rowQuestions.map((question) => {
                            const questionIndex = orderedQuestions.findIndex(q => q.id === question.id);
                            return (
                              <SortableItem 
                                key={`question-${question.id || questionIndex}`} 
                                id={`question-${question.id || questionIndex}`}
                              >
                                <div className="bg-white border border-gray-200 p-3 rounded-md shadow-sm hover:bg-gray-50 cursor-move">
                                  <div className="flex items-center gap-3">
                                    <div className="bg-gray-100 h-8 w-8 rounded-full flex items-center justify-center text-gray-600 font-medium">
                                      {questionIndex + 1}
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-gray-800 font-medium truncate">{question.pertanyaan}</p>
                                      <div className="flex items-center gap-2 text-sm mt-1">
                                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                                          (question.tipe_jawaban === 'rating' || question.tipe_pertanyaan === 'rating')
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-purple-100 text-purple-700'
                                        }`}>
                                          {(question.tipe_jawaban === 'rating' || question.tipe_pertanyaan === 'rating') ? 'Rating' : 'Teks'}
                                        </span>
                                        <span className={`flex items-center gap-1 text-xs ${
                                          (question.is_aktif || question.status) ? 'text-green-700' : 'text-gray-500'
                                        }`}>
                                          <span className={`w-1.5 h-1.5 rounded-full ${
                                            (question.is_aktif || question.status) ? 'bg-green-500' : 'bg-gray-400'
                                          }`}></span>
                                          {(question.is_aktif || question.status) ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="text-gray-400">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                  </div>
                                </div>
                              </SortableItem>
                            );
                          })}
                        </div>
                      );
                    });
                  })()}
                </SortableContext>
              </div>
            </div>
          </DndContext>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 mt-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || orderedQuestions.length === 0}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Menyimpan...' : 'Simpan Urutan'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
