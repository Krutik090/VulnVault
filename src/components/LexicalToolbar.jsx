// =======================================================================
// FILE: src/components/LexicalToolbar.jsx (COMPLETE FIX)
// PURPOSE: Toolbar for Lexical editor with theme support
// =======================================================================

import React, { useCallback, useState, useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  CAN_UNDO_COMMAND,
  CAN_REDO_COMMAND,
} from 'lexical';
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
} from '@lexical/list';
import { useTheme } from '../contexts/ThemeContext';

const LexicalToolbar = ({ disabled }) => {
  const [editor] = useLexicalComposerContext();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const { theme } = useTheme();

  // ✅ FIXED: Use event listeners instead of canUndo/canRedo methods
  useEffect(() => {
    const handleUndo = () => {
      setCanUndo(true);
    };
    const handleRedo = () => {
      setCanRedo(true);
    };

    // Register listeners
    return editor.registerCommand(
      CAN_UNDO_COMMAND,
      (payload) => {
        setCanUndo(payload);
        return false;
      },
      0
    );
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      CAN_REDO_COMMAND,
      (payload) => {
        setCanRedo(payload);
        return false;
      },
      0
    );
  }, [editor]);

  const applyFormat = (formatType) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, formatType);
  };

  const insertList = (listType) => {
    if (listType === 'ul') {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND);
    } else if (listType === 'ol') {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND);
    }
  };

  const isDark = theme === 'dark';

  const buttonClass = `p-2 rounded transition-colors focus:outline-none focus:ring-2 ${
    isDark
      ? 'hover:bg-gray-700 text-gray-300 focus:ring-blue-500'
      : 'hover:bg-gray-200 text-gray-600 focus:ring-blue-400'
  }`;

  const disabledClass = 'opacity-50 cursor-not-allowed';

  return (
    <div
      className={`
        flex flex-wrap items-center gap-1 p-3 border-b
        ${isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-gray-50 border-gray-200'}
      `}
    >
      {/* Bold */}
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          applyFormat('bold');
        }}
        disabled={disabled}
        className={`${buttonClass} ${disabled ? disabledClass : ''}`}
        title="Bold (Ctrl+B)"
      >
        <strong>B</strong>
      </button>

      {/* Italic */}
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          applyFormat('italic');
        }}
        disabled={disabled}
        className={`${buttonClass} ${disabled ? disabledClass : ''}`}
        title="Italic (Ctrl+I)"
      >
        <em>I</em>
      </button>

      {/* Underline */}
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          applyFormat('underline');
        }}
        disabled={disabled}
        className={`${buttonClass} ${disabled ? disabledClass : ''}`}
        title="Underline (Ctrl+U)"
      >
        <u>U</u>
      </button>

      {/* Strikethrough */}
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          applyFormat('strikethrough');
        }}
        disabled={disabled}
        className={`${buttonClass} ${disabled ? disabledClass : ''}`}
        title="Strikethrough"
      >
        <s>S</s>
      </button>

      {/* Divider */}
      <div className={`w-px h-6 ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />

      {/* Bullet List */}
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          insertList('ul');
        }}
        disabled={disabled}
        className={`${buttonClass} ${disabled ? disabledClass : ''}`}
        title="Bullet List"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 5a1 1 0 100-2 1 1 0 000 2zM2 11a1 1 0 100-2 1 1 0 000 2zM2 17a1 1 0 100-2 1 1 0 000 2zM6 6a1 1 0 011-1h11a1 1 0 110 2H7a1 1 0 01-1-1zM6 12a1 1 0 011-1h11a1 1 0 110 2H7a1 1 0 01-1-1zM6 18a1 1 0 011-1h11a1 1 0 110 2H7a1 1 0 01-1-1z" />
        </svg>
      </button>

      {/* Numbered List */}
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          insertList('ol');
        }}
        disabled={disabled}
        className={`${buttonClass} ${disabled ? disabledClass : ''}`}
        title="Numbered List"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 100-2 1 1 0 000 2zM3 10a1 1 0 100-2 1 1 0 000 2zM3 16a1 1 0 100-2 1 1 0 000 2zM7 6a1 1 0 011-1h11a1 1 0 110 2H8a1 1 0 01-1-1zM7 12a1 1 0 011-1h11a1 1 0 110 2H8a1 1 0 01-1-1zM7 18a1 1 0 011-1h11a1 1 0 110 2H8a1 1 0 01-1-1z" />
        </svg>
      </button>

      {/* Divider */}
      <div className={`w-px h-6 ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />

      {/* Undo */}
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          editor.dispatchCommand(UNDO_COMMAND);
        }}
        disabled={!canUndo || disabled}
        className={`${buttonClass} ${!canUndo || disabled ? disabledClass : ''}`}
        title="Undo (Ctrl+Z)"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v6h6M21 17v-6h-6" />
        </svg>
      </button>

      {/* Redo */}
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          editor.dispatchCommand(REDO_COMMAND);
        }}
        disabled={!canRedo || disabled}
        className={`${buttonClass} ${!canRedo || disabled ? disabledClass : ''}`}
        title="Redo (Ctrl+Y)"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 7v6h-6M3 17v-6h6" />
        </svg>
      </button>
    </div>
  );
};

export default LexicalToolbar;
