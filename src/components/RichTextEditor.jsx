// src/components/RichTextEditor.jsx
import React, { useMemo, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import ReactQuill, { Quill } from "react-quill";
import DOMPurify from "dompurify";
import "react-quill/dist/quill.snow.css";

/**
 * RichTextEditor
 * - Uses react-quill (Quill) with a full toolbar.
 * - Sanitizes output with DOMPurify before calling onChange.
 * - Built-in image handler converts chosen image to base64 and inserts it.
 * - Accepts props: label, value (HTML string), onChange, placeholder, error, required
 *
 * Note: If you prefer server upload for images, pass an `uploadImage` prop that returns a URL:
 *   async function uploadImage(file) { const url = await uploadToServer(file); return url; }
 * then the image handler will insert the returned URL instead of base64.
 */

const RichTextEditor = ({
  label,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  uploadImage, // optional async function(file) => url
  readOnly = false,
  ariaLabel,
}) => {
  const quillRef = useRef(null);

  // Toolbar configuration: conservative but feature-rich
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        ["blockquote", "code-block"],
        [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
        [{ align: [] }],
        [{ color: [] }, { background: [] }],
        ["link", "image", "video"],
        ["clean"],
      ],
      handlers: {
        // custom image handler below
        image: function () {
          const input = document.createElement("input");
          input.setAttribute("type", "file");
          input.setAttribute("accept", "image/*");
          input.click();

          input.onchange = async () => {
            const file = input.files[0];
            if (!file) return;

            // optional: limit check
            const maxSizeMB = 5;
            if (file.size > maxSizeMB * 1024 * 1024) {
              // Use window.alert or a toast lib in your app
              alert(`Image exceeds ${maxSizeMB}MB limit`);
              return;
            }

            // If user passed an uploadImage function, call it (server upload)
            if (typeof uploadImage === "function") {
              try {
                const url = await uploadImage(file);
                const editor = quillRef.current.getEditor();
                const range = editor.getSelection(true);
                editor.insertEmbed(range.index, "image", url);
              } catch (err) {
                console.error("Image upload failed", err);
                alert("Image upload failed");
              }
              return;
            }

            // Fallback: convert to base64 and insert (quick local preview)
            const reader = new FileReader();
            reader.onload = (e) => {
              const base64 = e.target.result;
              const editor = quillRef.current.getEditor();
              const range = editor.getSelection(true);
              editor.insertEmbed(range.index, "image", base64);
              editor.setSelection(range.index + 1);
            };
            reader.readAsDataURL(file);
          };
        },
      },
    },
    clipboard: {
      // Disable pasting styles that might break layout; Quill's default already strips
      matchVisual: false,
    },
  }), [uploadImage]);

  const formats = [
    "header",
    "bold", "italic", "underline", "strike",
    "blockquote", "code-block",
    "list", "bullet", "indent",
    "align",
    "color", "background",
    "link", "image", "video"
  ];

  // Quill occasionally holds an internal editor before ref is ready; ensure we mount it safely
  useEffect(() => {
    // no-op but keeps react-quill from complaining in SSR situations
  }, []);

  const handleChange = (rawHtml) => {
    // Sanitize the HTML before sending upward
    const clean = DOMPurify.sanitize(rawHtml, {
      ALLOWED_TAGS: [
        "b","i","u","strong","em","a","p","br","ul","ol","li",
        "h1","h2","h3","blockquote","pre","code","img","div","span"
      ],
      ALLOWED_ATTR: ["href","target","rel","src","alt","class","style"]
    });

    // Keep empty content consistent (quill may produce "<p><br></p>")
    const normalized = (clean === "<p><br></p>" || clean === "") ? "" : clean;
    onChange(normalized);
  };

  return (
    <div className="rich-text-editor">
      {label && (
        <label className="block text-sm font-medium text-foreground mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className={`border rounded-lg ${error ? "border-red-500" : "border-input"} overflow-hidden`}>
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value || ""}
          onChange={handleChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          readOnly={readOnly}
          aria-label={ariaLabel || label}
        />
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

RichTextEditor.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  required: PropTypes.bool,
  uploadImage: PropTypes.func,
  readOnly: PropTypes.bool,
  ariaLabel: PropTypes.string,
};

export default RichTextEditor;
