// =======================================================================
// FILE: src/components/RichTextEditor.jsx (UPDATED)
// PURPOSE: A reusable component for the CKEditor rich text editor.
// =======================================================================
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const RichTextEditor = ({ label, value, onChange }) => {
    return (
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">{label}</label>
            <div className="prose max-w-none ck-editor-container">
                <CKEditor
                    editor={ClassicEditor}
                    data={value}
                    onChange={(event, editor) => {
                        const data = editor.getData();
                        onChange(data);
                    }}
                    config={{
                        // A more comprehensive toolbar configuration
                        toolbar: [
                            'heading', '|', 
                            'bold', 'italic', 'underline', 'strikethrough', '|',
                            'bulletedList', 'numberedList', '|',
                            'outdent', 'indent', '|',
                            'blockQuote', 'insertTable', 'link', '|',
                            'undo', 'redo'
                        ],
                    }}
                />
            </div>
        </div>
    );
};

export default RichTextEditor;