// =======================================================================
// FILE: src/components/RichTextEditor.jsx (UPDATED)
// PURPOSE: A reusable, theme-aware rich text editor component using CKEditor.
// =======================================================================
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { useTheme } from '../contexts/ThemeContext';

const RichTextEditor = ({ 
  label, 
  value, 
  onChange, 
  placeholder = "Start typing...",
  error = null,
  disabled = false,
  height = 200,
  required = false
}) => {
  const { theme, color } = useTheme();

  const editorConfiguration = {
    toolbar: [
      'heading',
      '|',
      'bold',
      'italic',
      'underline',
      'strikethrough',
      '|',
      'fontSize',
      'fontColor',
      'fontBackgroundColor',
      '|',
      'alignment',
      '|',
      'numberedList',
      'bulletedList',
      '|',
      'outdent',
      'indent',
      '|',
      'link',
      'blockQuote',
      'insertTable',
      '|',
      'undo',
      'redo',
      '|',
      'sourceEditing'
    ],
    placeholder,
    fontSize: {
      options: [9, 11, 13, 'default', 17, 19, 21],
      supportAllValues: true
    },
    fontColor: {
      colors: [
        {
          color: 'hsl(0, 0%, 0%)',
          label: 'Black'
        },
        {
          color: 'hsl(0, 0%, 30%)',
          label: 'Dim grey'
        },
        {
          color: 'hsl(0, 0%, 60%)',
          label: 'Grey'
        },
        {
          color: 'hsl(0, 0%, 90%)',
          label: 'Light grey'
        },
        {
          color: 'hsl(0, 0%, 100%)',
          label: 'White',
          hasBorder: true
        },
        {
          color: 'hsl(0, 75%, 60%)',
          label: 'Red'
        },
        {
          color: 'hsl(30, 75%, 60%)',
          label: 'Orange'
        },
        {
          color: 'hsl(60, 75%, 60%)',
          label: 'Yellow'
        },
        {
          color: 'hsl(90, 75%, 60%)',
          label: 'Light green'
        },
        {
          color: 'hsl(120, 75%, 60%)',
          label: 'Green'
        },
        {
          color: 'hsl(150, 75%, 60%)',
          label: 'Aquamarine'
        },
        {
          color: 'hsl(180, 75%, 60%)',
          label: 'Turquoise'
        },
        {
          color: 'hsl(210, 75%, 60%)',
          label: 'Light blue'
        },
        {
          color: 'hsl(240, 75%, 60%)',
          label: 'Blue'
        },
        {
          color: 'hsl(270, 75%, 60%)',
          label: 'Purple'
        }
      ]
    },
    table: {
      contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
    }
  };

  return (
    <div className={`${theme} theme-${color} w-full`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-card-foreground mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Editor Container */}
      <div className={`
        ck-editor-container rounded-lg border transition-all duration-200
        ${error ? 'border-red-500' : 'border-input'}
        ${disabled ? 'opacity-50 pointer-events-none' : ''}
        focus-within:ring-2 focus-within:ring-ring focus-within:border-transparent
      `}>
        <CKEditor
          editor={ClassicEditor}
          data={value || ''}
          config={editorConfiguration}
          disabled={disabled}
          onChange={(event, editor) => {
            const data = editor.getData();
            onChange(data);
          }}
          onReady={(editor) => {
            // Set minimum height
            const editable = editor.ui.getEditableElement();
            if (editable) {
              editable.style.minHeight = `${height}px`;
            }

            // Apply theme-aware styles
            const toolbar = editor.ui.view.toolbar.element;
            const editableElement = editor.ui.view.editable.element;
            
            if (theme === 'dark') {
              // Dark mode styles
              toolbar.style.backgroundColor = 'hsl(var(--color-muted))';
              toolbar.style.borderColor = 'hsl(var(--color-border))';
              toolbar.style.color = 'hsl(var(--color-foreground))';
              
              editableElement.style.backgroundColor = 'hsl(var(--color-background))';
              editableElement.style.color = 'hsl(var(--color-foreground))';
              editableElement.style.borderColor = 'hsl(var(--color-border))';
            } else {
              // Light mode styles
              toolbar.style.backgroundColor = 'hsl(var(--color-muted))';
              toolbar.style.borderColor = 'hsl(var(--color-border))';
              toolbar.style.color = 'hsl(var(--color-foreground))';
              
              editableElement.style.backgroundColor = 'hsl(var(--color-background))';
              editableElement.style.color = 'hsl(var(--color-foreground))';
              editableElement.style.borderColor = 'hsl(var(--color-border))';
            }

            // Focus ring color based on current theme color
            editableElement.addEventListener('focus', () => {
              editableElement.style.setProperty('--ck-focus-ring', 'hsl(var(--color-ring))');
              editableElement.style.setProperty('--ck-color-focus-border', 'hsl(var(--color-ring))');
            });
          }}
          onError={(error, { willEditorRestart }) => {
            if (willEditorRestart) {
              // Editor will restart - no need to handle this case
            } else {
              console.error('CKEditor error:', error);
            }
          }}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 flex items-center gap-2">
          <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {/* Character Count (Optional) */}
      {value && (
        <div className="mt-2 text-right">
          <span className="text-xs text-muted-foreground">
            {value.replace(/<[^>]*>/g, '').length} characters
          </span>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
