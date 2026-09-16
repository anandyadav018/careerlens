import { useState, useRef } from 'react';
import { UploadCloud, FileText, X } from 'lucide-react';
import Button from '../common/Button';

const ResumeUploader = ({ onUpload, isUploading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (selectedFile) => {
    setError(null);
    if (!selectedFile) return false;
    
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a PDF or DOCX file.');
      return false;
    }
    
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB.');
      return false;
    }
    
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };
  
  const removeFile = () => {
    setFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleSubmit = () => {
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!file ? (
        <div 
          className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl transition-colors
            ${dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}
            ${error ? 'border-red-400 bg-red-50' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".pdf,.docx"
            onChange={handleChange}
            disabled={isUploading}
          />
          
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
            <UploadCloud className={`w-12 h-12 mb-4 ${error ? 'text-red-500' : 'text-primary-500'}`} />
            <p className="mb-2 text-sm text-gray-700 font-semibold">
              <span className="cursor-pointer text-primary-600 hover:underline" onClick={onButtonClick}>Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">PDF or DOCX (MAX. 5MB)</p>
            {error && <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center w-full p-8 border border-gray-200 rounded-xl bg-white shadow-sm">
          <div className="flex items-center gap-4 p-4 border border-primary-100 bg-primary-50 rounded-lg w-full mb-6">
            <div className="p-2 bg-white rounded-md text-primary-600 shadow-sm">
              <FileText size={24} />
            </div>
            <div className="flex-grow overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
              <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button 
              type="button"
              onClick={removeFile}
              disabled={isUploading}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>
          
          <Button 
            onClick={handleSubmit} 
            isLoading={isUploading} 
            className="w-full sm:w-auto"
            size="lg"
          >
            {isUploading ? 'Analyzing Resume...' : 'Analyze My Resume'}
          </Button>
          {isUploading && (
            <p className="mt-4 text-sm text-gray-500 text-center animate-pulse">
              Our AI is extracting skills and generating feedback. This usually takes 10-15 seconds.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeUploader;
