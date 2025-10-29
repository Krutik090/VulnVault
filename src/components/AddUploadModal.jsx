import { useState } from 'react';
import { X, Upload as UploadIcon, Image as ImageIcon } from 'lucide-react';

const AddUploadModal = ({ isOpen, onClose, onSubmit, isUploading }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [captions, setCaptions] = useState({});
  const [previews, setPreviews] = useState({});

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);

    // Create previews and initialize captions
    const newPreviews = {};
    const newCaptions = {};
    
    files.forEach((file, index) => {
      // Create preview URL
      newPreviews[index] = URL.createObjectURL(file);
      // Initialize empty caption
      newCaptions[index] = '';
    });

    setPreviews(newPreviews);
    setCaptions(newCaptions);
  };

  const handleCaptionChange = (index, value) => {
    setCaptions(prev => ({
      ...prev,
      [index]: value
    }));
  };

  const handleSubmit = () => {
    if (selectedFiles.length === 0) {
      alert('Please select at least one file');
      return;
    }

    // Pass files and captions to parent
    onSubmit(selectedFiles, Object.values(captions));
  };

  const handleClose = () => {
    // Cleanup preview URLs
    Object.values(previews).forEach(url => URL.revokeObjectURL(url));
    
    setSelectedFiles([]);
    setCaptions({});
    setPreviews({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-card-foreground">Upload POC Images</h2>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedFiles.length === 0 ? (
            /* File Select Area */
            <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="upload-modal-file-input"
                disabled={isUploading}
              />
              <label
                htmlFor="upload-modal-file-input"
                className="cursor-pointer flex flex-col items-center gap-4"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-medium text-card-foreground mb-1">
                    Click to select images
                  </p>
                  <p className="text-sm text-muted-foreground">
                    You can select multiple images at once
                  </p>
                </div>
              </label>
            </div>
          ) : (
            /* Selected Files with Captions */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {selectedFiles.length} image(s) selected
                </p>
                <button
                  onClick={() => document.getElementById('upload-modal-file-input').click()}
                  disabled={isUploading}
                  className="text-sm text-primary hover:underline"
                >
                  Change files
                </button>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="upload-modal-file-input"
                  disabled={isUploading}
                />
              </div>

              {selectedFiles.map((file, index) => (
                <div key={index} className="border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-4">
                    {/* Preview */}
                    <div className="flex-shrink-0">
                      <img
                        src={previews[index]}
                        alt={file.name}
                        className="w-24 h-24 object-cover rounded border border-border"
                      />
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-card-foreground truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      
                      {/* Caption Input */}
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-card-foreground mb-1">
                          Caption (optional)
                        </label>
                        <input
                          type="text"
                          value={captions[index] || ''}
                          onChange={(e) => handleCaptionChange(index, e.target.value)}
                          placeholder={`Enter caption for ${file.name.substring(0, 20)}...`}
                          disabled={isUploading}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {selectedFiles.length > 0 && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
            <button
              onClick={handleClose}
              disabled={isUploading}
              className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isUploading}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                ${isUploading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }
              `}
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <UploadIcon className="w-4 h-4" />
                  <span>Upload {selectedFiles.length} image(s)</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddUploadModal;
