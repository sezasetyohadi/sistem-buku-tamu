'use client';

import { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import { toast } from 'react-hot-toast';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem";

interface SurveyQuestion {
  id?: number;
  pertanyaan: string;
  tipe_pertanyaan?: 'rating' | 'text';
  tipe_jawaban?: 'rating' | 'teks';
  status?: boolean;
  is_aktif?: boolean;
  jenis_rating_id?: number;
  is_required?: boolean | number; // Allow both boolean and number (1/0 from DB)
  urutan?: number;
  baris?: number;
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
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && questions.length > 0) {
      // Sort questions by baris and assign sequential order - preserve ALL original properties
      const sortedQuestions = [...questions]
        .sort((a, b) => (a.baris || 0) - (b.baris || 0))
        .map((q, index) => ({
          ...q,  // Keep ALL original properties intact
          baris: index + 1 // Only update the row/order number
        }));
      
      setOrderedQuestions(sortedQuestions);
    }
  }, [questions, isOpen]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!active || !over) {
      return;
    }
    
    const activeId = active.id.toString();
    const overId = over.id.toString();
    const oldIndex = orderedQuestions.findIndex(q => `question-${q.id || q.urutan}` === activeId);
    const newIndex = orderedQuestions.findIndex(q => `question-${q.id || q.urutan}` === overId);
    
    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      const reorderedQuestions = arrayMove(orderedQuestions, oldIndex, newIndex);
      
      // Update ONLY baris values to match the new order, preserve all other properties
      const updatedQuestions = reorderedQuestions.map((question, index) => ({
        ...question,  // Keep all original properties
        baris: index + 1 // Only update the row/order number
      }));
      
      setOrderedQuestions(updatedQuestions);
    }
  };

  const handleSaveOrder = async () => {
    try {
      setIsSaving(true);
      await onSaveOrder(orderedQuestions);
      toast.success('Urutan pertanyaan berhasil disimpan!');
      onClose();
    } catch (error) {
      console.error('Error saving question order:', error);
      toast.error('Gagal menyimpan urutan pertanyaan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (questions.length > 0) {
      // Reset to original order, only update baris field
      const sortedQuestions = [...questions]
        .sort((a, b) => (a.baris || 0) - (b.baris || 0))
        .map((q, index) => ({
          ...q, // Keep all original properties
          baris: index + 1 // Only update the row/order number
        }));
      
      setOrderedQuestions(sortedQuestions);
      toast.success('Urutan telah direset ke urutan asli');
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Atur Urutan Pertanyaan" 
      size="lg"
    >
      <div className="space-y-6">
        <div className="text-sm text-gray-600">
          Seret dan lepas pertanyaan untuk mengatur urutan. Urutan akan menentukan bagaimana pertanyaan ditampilkan dalam survei.
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={orderedQuestions.map(q => `question-${q.id || q.urutan}`)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {orderedQuestions.map((question, index) => (
                    <SortableItem
                      key={`question-${question.id || question.urutan}`}
                      id={`question-${question.id || question.urutan}`}
                    >
                      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                                {index + 1}
                              </span>
                              <div>
                                <p className="font-medium text-gray-900 truncate max-w-md">
                                  {question.pertanyaan}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  {/* Removed rating indicator as requested */}
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    question.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {question.status ? 'Aktif' : 'Nonaktif'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-gray-400">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </SortableItem>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}
        
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <button
            onClick={handleReset}
            disabled={isSaving || isLoading}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Reset
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={handleSaveOrder}
              disabled={isSaving || isLoading}
              className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
                isSaving ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Urutan'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
