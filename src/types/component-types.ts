/**
 * React Component Types and Utilities
 * Type definitions for React components, forms, and UI elements
 */

import { ReactNode, ComponentProps } from 'react';

// ================== COMPONENT PROPS ==================

/**
 * Base component props
 */
export interface BaseComponentProps {
  children?: ReactNode;
  className?: string;
  id?: string;
  'data-testid'?: string;
}

/**
 * Props with loading state
 */
export interface LoadingProps {
  isLoading?: boolean;
  loadingText?: string;
}

/**
 * Props with error state
 */
export interface ErrorProps {
  error?: string | null;
  hasError?: boolean;
  onErrorClear?: () => void;
}

/**
 * Props with disabled state
 */
export interface DisabledProps {
  disabled?: boolean;
  disabledReason?: string;
}

/**
 * Combined state props
 */
export interface ComponentStateProps extends LoadingProps, ErrorProps, DisabledProps {}

// ================== FORM TYPES ==================

/**
 * Form field state
 */
export interface FieldState<T = string> {
  value: T;
  error?: string;
  touched: boolean;
  dirty: boolean;
  valid: boolean;
}

/**
 * Form validation rules
 */
export interface ValidationRule<T = string> {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: T) => string | null;
  message?: string;
}

/**
 * Form field config
 */
export interface FieldConfig<T = string> {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'tel' | 'number' | 'select' | 'textarea' | 'file' | 'date' | 'checkbox' | 'radio';
  placeholder?: string;
  defaultValue?: T;
  validation?: ValidationRule<T>;
  options?: Array<{ value: string | number; label: string }>;
  disabled?: boolean;
  required?: boolean;
  description?: string;
}

/**
 * Form state
 */
export interface FormState<T extends Record<string, unknown> = Record<string, unknown>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  dirty: boolean;
  valid: boolean;
  submitting: boolean;
  submitted: boolean;
}

/**
 * Form submission result
 */
export interface FormSubmissionResult<T = unknown> {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
  message?: string;
}

// ================== INPUT COMPONENT PROPS ==================

/**
 * Base input props
 */
export interface BaseInputProps extends BaseComponentProps, ComponentStateProps {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  description?: string;
  hint?: string;
}

/**
 * Text input props
 */
export interface TextInputProps extends BaseInputProps {
  type?: 'text' | 'email' | 'password' | 'tel' | 'url';
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  autoComplete?: string;
  autoFocus?: boolean;
}

/**
 * Number input props
 */
export interface NumberInputProps extends BaseInputProps {
  value: number | '';
  onChange: (value: number | '') => void;
  onBlur?: () => void;
  min?: number;
  max?: number;
  step?: number;
}

/**
 * Select input props
 */
export interface SelectInputProps extends BaseInputProps {
  value: string | number;
  onChange: (value: string | number) => void;
  options: Array<{ value: string | number; label: string; disabled?: boolean }>;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  placeholder?: string;
}

/**
 * Checkbox props
 */
export interface CheckboxProps extends BaseInputProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  indeterminate?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Radio button props
 */
export interface RadioProps extends BaseInputProps {
  value: string | number;
  checked: boolean;
  onChange: (value: string | number) => void;
  name: string;
}

/**
 * File input props
 */
export interface FileInputProps extends BaseInputProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number;
  onFileSelect: (files: File[]) => void;
  onFileRemove?: (index: number) => void;
  selectedFiles?: File[];
  preview?: boolean;
}

// ================== BUTTON COMPONENT PROPS ==================

/**
 * Button variant types
 */
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'warning' | 'success' | 'ghost' | 'link';

/**
 * Button size types
 */
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Button props
 */
export interface ButtonProps extends BaseComponentProps, ComponentStateProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  rounded?: boolean;
}

// ================== LAYOUT COMPONENT PROPS ==================

/**
 * Container props
 */
export interface ContainerProps extends BaseComponentProps {
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  centered?: boolean;
}

/**
 * Grid props
 */
export interface GridProps extends BaseComponentProps {
  columns?: number;
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  responsive?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

/**
 * Card props
 */
export interface CardProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  header?: ReactNode;
  footer?: ReactNode;
  variant?: 'default' | 'outlined' | 'elevated' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  clickable?: boolean;
  onClick?: () => void;
}

// ================== MODAL/DIALOG PROPS ==================

/**
 * Modal props
 */
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscapeKey?: boolean;
  showCloseButton?: boolean;
  preventScroll?: boolean;
}

/**
 * Dialog props
 */
export interface DialogProps extends ModalProps {
  type?: 'info' | 'warning' | 'error' | 'success' | 'confirm';
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

// ================== TABLE COMPONENT PROPS ==================

/**
 * Table column definition
 */
export interface TableColumn<T = unknown> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  render?: (value: unknown, record: T, index: number) => ReactNode;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
  hidden?: boolean;
}

/**
 * Table sort configuration
 */
export interface TableSort {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Table pagination configuration
 */
export interface TablePagination {
  page: number;
  pageSize: number;
  total: number;
  showSizeChanger?: boolean;
  pageSizeOptions?: number[];
}

/**
 * Table props
 */
export interface TableProps<T = unknown> extends BaseComponentProps, ComponentStateProps {
  data: T[];
  columns: TableColumn<T>[];
  rowKey?: keyof T | ((record: T) => string | number);
  pagination?: TablePagination;
  sort?: TableSort;
  onSort?: (sort: TableSort) => void;
  onPageChange?: (page: number, pageSize: number) => void;
  selectable?: boolean;
  selectedRows?: (string | number)[];
  onSelectionChange?: (selectedRows: (string | number)[]) => void;
  expandable?: {
    expandedRowRender: (record: T) => ReactNode;
    expandedRowKeys?: (string | number)[];
    onExpand?: (expanded: boolean, record: T) => void;
  };
  emptyText?: string;
  bordered?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// ================== NOTIFICATION PROPS ==================

/**
 * Notification type
 */
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

/**
 * Notification props
 */
export interface NotificationProps {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
}

// ================== CHART COMPONENT PROPS ==================

/**
 * Chart data point
 */
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

/**
 * Chart props
 */
export interface ChartProps extends BaseComponentProps {
  data: ChartDataPoint[];
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area';
  title?: string;
  width?: number;
  height?: number;
  responsive?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  colors?: string[];
  options?: Record<string, unknown>;
}

// ================== NAVIGATION PROPS ==================

/**
 * Navigation item
 */
export interface NavItem {
  id: string;
  label: string;
  href?: string;
  icon?: ReactNode;
  badge?: string | number;
  children?: NavItem[];
  disabled?: boolean;
  hidden?: boolean;
}

/**
 * Navigation props
 */
export interface NavigationProps extends BaseComponentProps {
  items: NavItem[];
  currentPath?: string;
  onItemClick?: (item: NavItem) => void;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'pills' | 'tabs' | 'breadcrumb';
  collapsible?: boolean;
  collapsed?: boolean;
}

// ================== UTILITY TYPES ==================

/**
 * Event handler types
 */
export type EventHandler<T = HTMLElement> = (event: React.SyntheticEvent<T>) => void;
export type ChangeHandler<T = HTMLInputElement> = (event: React.ChangeEvent<T>) => void;
export type ClickHandler<T = HTMLElement> = (event: React.MouseEvent<T>) => void;
export type KeyboardHandler<T = HTMLElement> = (event: React.KeyboardEvent<T>) => void;
export type FocusHandler<T = HTMLElement> = (event: React.FocusEvent<T>) => void;

/**
 * Polymorphic component props
 */
export type PolymorphicProps<E extends React.ElementType> = {
  as?: E;
} & Omit<ComponentProps<E>, 'as'>;

/**
 * Make properties optional
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make properties required
 */
export type RequireFields<T, K extends keyof T> = T & globalThis.Required<Pick<T, K>>;

/**
 * Extract component props
 */
export type PropsOf<T> = T extends React.ComponentType<infer P> ? P : never;
