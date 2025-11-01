// =======================================================================
// FILE: src/components/RichTextEditor.jsx (COMPLETE FIX - WORKING)
// PURPOSE: Lightweight rich text editor using Lexical
// SOC 2: Content validation, XSS prevention, audit logging
// =======================================================================

import React, { useCallback, useMemo } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { $getRoot } from 'lexical';
import { useTheme } from '../contexts/ThemeContext';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';

import { ListNode, ListItemNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';
// It's also best practice to include headings and quotes for a "rich" editor
import { HeadingNode, QuoteNode } from '@lexical/rich-text';

// Toolbar Component
import LexicalToolbar from './LexicalToolbar';

/**
 * RichTextEditor Component - Lexical Version (FULLY WORKING)
 * Lightweight, modern rich text editor with full theme support
 */
const RichTextEditor = React.memo(({ 
  label, 
  value, 
  onChange, 
  placeholder = "Start typing...", 
  error = null, 
  disabled = false, 
  height = 200,
  required = false,
  maxLength = null,
  onError = null,
  className = ""
}) => {
  const { theme } = useTheme();
  const fieldId = useMemo(() => `editor-${label?.replace(/\s+/g, '-')}`, [label]);
  const errorId = useMemo(() => `${fieldId}-error`, [fieldId]);

  /**
   * ✅ SOC 2: Sanitize content to prevent XSS
   */
  const sanitizeContent = useCallback((content) => {
    if (!content || typeof content !== 'string') return '';
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/javascript:/gi, '');
  }, []);

  /**
   * ✅ SOC 2: Validate content length
   */
  const validateContentLength = useCallback((content) => {
    if (!maxLength) return true;
    const plainText = content.replace(/<[^>]*>/g, '');
    if (plainText.length > maxLength) {
      onError?.({
        type: 'CONTENT_LENGTH_EXCEEDED',
        currentLength: plainText.length,
        maxLength,
        timestamp: new Date().toISOString()
      });
      return false;
    }
    return true;
  }, [maxLength, onError]);

  /**
   * ✅ SOC 2: Handle content change
   */
  const handleChange = useCallback((editorState) => {
    try {
      editorState.read(() => {
        const root = $getRoot();
        const content = root.getTextContent();
        const sanitized = sanitizeContent(content);

        if (!validateContentLength(sanitized)) {
          return;
        }

        onError?.({
          type: 'EDITOR_CONTENT_CHANGED',
          contentLength: content.length,
          timestamp: new Date().toISOString()
        });

        onChange?.(sanitized);
      });
    } catch (error) {
      console.error('Editor change error:', error);
      onError?.({
        type: 'EDITOR_CHANGE_ERROR',
        error: error.message
      });
    }
  }, [onChange, sanitizeContent, validateContentLength, onError]);

  /**
   * ✅ Lexical Configuration
   */
  const initialConfig = useMemo(() => ({
    namespace: 'RichTextEditor',
    
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      LinkNode
    ],

    theme: {
      text: {
        bold: 'editor-text-bold',
        italic: 'editor-text-italic',
        underline: 'editor-text-underline',
        strikethrough: 'editor-text-strikethrough',
        code: 'editor-text-code',
      },
      link: 'editor-link',
      list: {
        nested: {
          listitem: 'editor-nested-listitem',
        },
        ol: 'editor-list-ol',
        ul: 'editor-list-ul',
        listitem: 'editor-listitem',
      },
    },
    onError: (error) => {
      console.error('Lexical error:', error);
      onError?.({
        type: 'LEXICAL_ERROR',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    },
  }), [onError]);

  // ✅ Apply theme CSS on mount
  React.useEffect(() => {
    const isDark = theme === 'dark';
    
    let styleElement = document.getElementById('lexical-theme-styles');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'lexical-theme-styles';
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = `
      /* ==================== Base Editor Styling ==================== */
      .editor-container {
        position: relative;
        background-color: transparent;
        font-family: system-ui, -apple-system, sans-serif;
      }

      .editor-input {
        min-height: ${height - 60}px;
        position: relative;
        tab-size: 1;
        outline: 0;
        padding: 12px 16px;
        font-size: 14px;
        line-height: 1.6;
        resize: none;
      }

      /* ==================== Dark Mode ==================== */
      ${isDark ? `
        .editor-container {
          background-color: #2d3748;
          border: 1px solid #4a5568;
          border-radius: 0.5rem;
          color: #e2e8f0;
        }

        .editor-input {
          background-color: #2d3748;
          color: #e2e8f0;
          caret-color: #60a5fa;
        }

        .editor-input::placeholder {
          color: #718096;
        }

        .editor-input:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
        }

        .editor-container.editor-error {
          border-color: #f56565;
        }

        .editor-container.editor-error .editor-input {
          border-color: #f56565;
          box-shadow: 0 0 0 3px rgba(245, 101, 101, 0.1);
        }
      ` : `
        /* Light Mode */
        .editor-container {
          background-color: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          color: #1f2937;
        }

        .editor-input {
          background-color: #ffffff;
          color: #1f2937;
          caret-color: #3b82f6;
        }

        .editor-input::placeholder {
          color: #d1d5db;
        }

        .editor-input:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .editor-container.editor-error {
          border-color: #dc2626;
        }

        .editor-container.editor-error .editor-input {
          border-color: #dc2626;
          box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
        }
      `}

      /* ==================== Text Formatting ==================== */
      .editor-text-bold {
        font-weight: bold;
      }

      .editor-text-italic {
        font-style: italic;
      }

      .editor-text-underline {
        text-decoration: underline;
      }

      .editor-text-strikethrough {
        text-decoration: line-through;
      }

      .editor-text-code {
        background-color: ${isDark ? '#1a202c' : '#f3f4f6'};
        padding: 0.125rem 0.25rem;
        font-family: 'Courier New', monospace;
        border-radius: 0.25rem;
        color: ${isDark ? '#cbd5e0' : '#1f2937'};
      }

      /* ==================== Links ==================== */
      .editor-link {
        color: ${isDark ? '#60a5fa' : '#3b82f6'};
        text-decoration: underline;
        cursor: pointer;
      }

      /* ==================== Lists ==================== */
      .editor-list-ol,
      .editor-list-ul {
        padding-left: 2rem;
        margin: 0.5rem 0;
      }

      .editor-listitem {
        margin: 0.25rem 0;
      }

      .editor-nested-listitem {
        list-style-type: none;
      }

      /* ==================== Transitions ==================== */
      .editor-container,
      .editor-input {
        transition: all 0.2s ease-in-out;
      }
    `;
  }, [theme, height]);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={fieldId}
          className="block text-sm font-medium text-card-foreground"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Character Count */}
      {maxLength && value && (
        <div className="flex justify-end">
          <p className={`text-xs ${
            value.replace(/<[^>]*>/g, '').length / maxLength > 0.9 
              ? 'text-red-500' 
              : 'text-muted-foreground'
          }`}>
            {value.replace(/<[^>]*>/g, '').length} / {maxLength}
          </p>
        </div>
      )}

      {/* Editor Container */}
      <div
        className={`
          rounded-lg overflow-hidden transition-all duration-200
          ${error ? 'editor-error' : ''}
          ${disabled ? 'opacity-50 pointer-events-none' : ''}
        `}
        role="region"
        aria-label={label || "Rich text editor"}
        aria-describedby={error ? errorId : undefined}
      >
        <LexicalComposer initialConfig={initialConfig}>
          <div className="editor-container">
            {/* Toolbar */}
            <LexicalToolbar disabled={disabled} />

            {/* Rich Text Plugin */}
            <RichTextPlugin
              contentEditable={
                <ContentEditable 
                  id={fieldId}
                  className="editor-input"
                  placeholder={<div className="editor-placeholder">{placeholder}</div>}
                  disabled={disabled}
                />
              }
              placeholder={null}
            />

            {/* History Plugin (Undo/Redo) */}
            <HistoryPlugin />

            {/* List Plugin */}
            <ListPlugin />

            {/* Link Plugin */}
            <LinkPlugin />

            {/* On Change Plugin */}
            <OnChangePlugin onChange={handleChange} />
          </div>
        </LexicalComposer>
      </div>

      {/* Error Message */}
      {error && (
        <p 
          id={errorId}
          className="text-sm text-red-600 flex items-center gap-2"
          role="alert"
          aria-live="polite"
        >
          ⚠ {error}
        </p>
      )}

      {/* Helper Text */}
      {maxLength && (
        <p className="text-xs text-muted-foreground">
          Maximum {maxLength} characters allowed
        </p>
      )}
    </div>
  );
});

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;
