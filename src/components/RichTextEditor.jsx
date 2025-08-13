// =======================================================================
// FILE: src/components/RichTextEditor.jsx (FIXED BULLET ALIGNMENT & DARK MODE)
// PURPOSE: A reusable, theme-aware rich text editor with proper bullet list styling
// =======================================================================
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { useTheme } from '../contexts/ThemeContext';
import { useEffect, useRef } from 'react';

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
  const editorRef = useRef(null);

  // ✅ FIXED: Enhanced editor configuration with proper list support
  const editorConfiguration = {
    toolbar: {
      items: [
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
        'bulletedList',
        'numberedList',
        '|',
        'outdent',
        'indent',
        '|',
        'link',
        'blockQuote',
        'insertTable',
        '|',
        'undo',
        'redo'
      ]
    },
    placeholder,
    
    // ✅ FIXED: Proper list configuration
    list: {
      properties: {
        styles: true,
        startIndex: true,
        reversed: true
      }
    },
    
    fontSize: {
      options: [9, 11, 13, 'default', 17, 19, 21],
      supportAllValues: true
    },
    
    fontColor: {
      colors: [
        { color: 'hsl(0, 0%, 0%)', label: 'Black' },
        { color: 'hsl(0, 0%, 30%)', label: 'Dim grey' },
        { color: 'hsl(0, 0%, 60%)', label: 'Grey' },
        { color: 'hsl(0, 0%, 90%)', label: 'Light grey' },
        { color: 'hsl(0, 0%, 100%)', label: 'White', hasBorder: true },
        { color: 'hsl(0, 75%, 60%)', label: 'Red' },
        { color: 'hsl(30, 75%, 60%)', label: 'Orange' },
        { color: 'hsl(60, 75%, 60%)', label: 'Yellow' },
        { color: 'hsl(90, 75%, 60%)', label: 'Light green' },
        { color: 'hsl(120, 75%, 60%)', label: 'Green' },
        { color: 'hsl(150, 75%, 60%)', label: 'Aquamarine' },
        { color: 'hsl(180, 75%, 60%)', label: 'Turquoise' },
        { color: 'hsl(210, 75%, 60%)', label: 'Light blue' },
        { color: 'hsl(240, 75%, 60%)', label: 'Blue' },
        { color: 'hsl(270, 75%, 60%)', label: 'Purple' }
      ]
    },
    
    fontBackgroundColor: {
      colors: [
        { color: 'hsl(0, 0%, 0%)', label: 'Black' },
        { color: 'hsl(0, 0%, 30%)', label: 'Dim grey' },
        { color: 'hsl(0, 0%, 60%)', label: 'Grey' },
        { color: 'hsl(0, 0%, 90%)', label: 'Light grey' },
        { color: 'hsl(0, 0%, 100%)', label: 'White', hasBorder: true },
        { color: 'hsl(0, 75%, 60%)', label: 'Red' },
        { color: 'hsl(30, 75%, 60%)', label: 'Orange' },
        { color: 'hsl(60, 75%, 60%)', label: 'Yellow' },
        { color: 'hsl(90, 75%, 60%)', label: 'Light green' },
        { color: 'hsl(120, 75%, 60%)', label: 'Green' },
        { color: 'hsl(150, 75%, 60%)', label: 'Aquamarine' },
        { color: 'hsl(180, 75%, 60%)', label: 'Turquoise' },
        { color: 'hsl(210, 75%, 60%)', label: 'Light blue' },
        { color: 'hsl(240, 75%, 60%)', label: 'Blue' },
        { color: 'hsl(270, 75%, 60%)', label: 'Purple' }
      ]
    },
    
    table: {
      contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
    },

    // ✅ FIXED: Additional configuration to ensure lists work properly
    typing: {
      transformations: {
        include: [
          'quotes',
          'typography',
          'symbols',
          'orderedList',
          'unorderedList'
        ]
      }
    }
  };

  // ✅ FIXED: Apply custom styles after editor initialization
  useEffect(() => {
    if (editorRef.current) {
      const isDark = theme === 'dark';
      
      // Create or update style element for CKEditor list fixes
      let styleElement = document.getElementById('ckeditor-list-fixes');
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'ckeditor-list-fixes';
        document.head.appendChild(styleElement);
      }

      // ✅ FIXED: CSS to fix bullet point alignment and dark mode
      styleElement.textContent = `
        /* Fix bullet point alignment issues */
        .ck-editor__editable ul,
        .ck-editor__editable ol {
          padding-left: 2rem !important;
          margin-left: 0 !important;
          list-style-position: outside !important;
        }

        .ck-editor__editable ul li,
        .ck-editor__editable ol li {
          margin-left: 0 !important;
          padding-left: 0.5rem !important;
        }

        /* Ensure bullets are visible */
        .ck-editor__editable ul li::marker,
        .ck-editor__editable ol li::marker {
          color: ${isDark ? 'hsl(0, 0%, 90%)' : 'hsl(0, 0%, 20%)'} !important;
        }

        /* Dark mode specific styles */
        ${isDark ? `
          .ck.ck-editor .ck-editor__main > .ck-editor__editable {
            background-color: hsl(220, 13%, 18%) !important;
            color: hsl(0, 0%, 93%) !important;
          }

          .ck.ck-toolbar {
            background-color: hsl(220, 13%, 15%) !important;
            border-color: hsl(220, 13%, 22%) !important;
          }

          .ck.ck-toolbar .ck-button {
            color: hsl(0, 0%, 85%) !important;
          }

          .ck.ck-toolbar .ck-button:hover {
            background-color: hsl(220, 13%, 22%) !important;
          }

          .ck.ck-toolbar .ck-button.ck-on {
            background-color: hsl(208, 88%, 52%) !important;
            color: white !important;
          }

          .ck.ck-dropdown .ck-dropdown__panel {
            background-color: hsl(220, 13%, 18%) !important;
            border-color: hsl(220, 13%, 22%) !important;
          }

          .ck.ck-list .ck-list__item .ck-button {
            color: hsl(0, 0%, 85%) !important;
          }

          .ck.ck-list .ck-list__item .ck-button:hover {
            background-color: hsl(220, 13%, 22%) !important;
          }

          /* Fix bullet colors in dark mode */
          .ck-editor__editable ul li::marker {
            color: hsl(0, 0%, 85%) !important;
          }

          .ck-editor__editable ol li::marker {
            color: hsl(0, 0%, 85%) !important;
          }

          /* Fix text selection in dark mode */
          .ck-editor__editable::selection {
            background-color: hsl(208, 88%, 52%, 0.3) !important;
          }

          /* Fix placeholder text in dark mode */
          .ck-editor__editable .ck-placeholder::before {
            color: hsl(0, 0%, 60%) !important;
          }
        ` : `
          /* Light mode bullet styling */
          .ck-editor__editable ul li::marker {
            color: hsl(0, 0%, 20%) !important;
          }

          .ck-editor__editable ol li::marker {
            color: hsl(0, 0%, 20%) !important;
          }
        `}

        /* Nested list indentation */
        .ck-editor__editable ul ul,
        .ck-editor__editable ol ol,
        .ck-editor__editable ul ol,
        .ck-editor__editable ol ul {
          margin-top: 0 !important;
          margin-bottom: 0 !important;
          padding-left: 1.5rem !important;
        }

        /* Fix for RTL languages */
        [dir="rtl"] .ck-editor__editable ul,
        [dir="rtl"] .ck-editor__editable ol {
          padding-right: 2rem !important;
          padding-left: 0 !important;
        }

        /* Fix alignment issues */
        .ck-editor__editable .ck-align-left ul,
        .ck-editor__editable .ck-align-left ol {
          text-align: left !important;
        }

        .ck-editor__editable .ck-align-center ul,
        .ck-editor__editable .ck-align-center ol {
          text-align: center !important;
          list-style-position: inside !important;
        }

        .ck-editor__editable .ck-align-right ul,
        .ck-editor__editable .ck-align-right ol {
          text-align: right !important;
          list-style-position: inside !important;
        }
      `;
    }
  }, [theme]);

  return (
    <div className={`${theme} theme-${color} space-y-2`}>
      {label && (
        <label className="block text-sm font-medium text-card-foreground">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div 
        className={`
          border rounded-lg overflow-hidden bg-background
          ${error ? 'border-red-500' : 'border-input'}
          ${disabled ? 'opacity-50 pointer-events-none' : ''}
        `}
        style={{ minHeight: `${height}px` }}
      >
        <CKEditor
          ref={editorRef}
          editor={ClassicEditor}
          config={editorConfiguration}
          data={value || ''}
          disabled={disabled}
          onChange={(event, editor) => {
            const data = editor.getData();
            onChange?.(data);
          }}
          onReady={(editor) => {
            // ✅ FIXED: Set minimum height for editor content area
            const editable = editor.ui.view.editable.element;
            if (editable) {
              editable.style.minHeight = `${height - 60}px`; // Account for toolbar height
              editable.style.fontSize = '14px';
              editable.style.lineHeight = '1.6';
            }
            
            // ✅ FIXED: Ensure list commands are available
            const commands = editor.commands;
            console.log('CKEditor ready - Available list commands:', {
              bulletedList: commands.get('bulletedList') ? 'Available' : 'Not available',
              numberedList: commands.get('numberedList') ? 'Available' : 'Not available'
            });

            // Store editor reference
            editorRef.current = editor;
          }}
          onError={(error, { willEditorRestart }) => {
            console.error('CKEditor error:', error);
            if (willEditorRestart) {
              console.log('Editor will restart');
            }
          }}
        />
      </div>
      
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
};

export default RichTextEditor;
