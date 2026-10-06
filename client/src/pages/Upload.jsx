import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import { 
  Upload, 
  FileText, 
  Image, 
  FileAudio, 
  FileVideo, 
  CheckCircle, 
  AlertCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

const UploadPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [uploadResult, setUploadResult] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState('');

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setErrorMsg('');
    setUploadResult(null);
    
    const sizeLimit = 100 * 1024 * 1024; // 100MB
    if (selectedFile.size > sizeLimit) {
      setErrorMsg('File size exceeds the 100MB limit. Please upload a smaller file.');
      return;
    }
    
    setFile(selectedFile);
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setErrorMsg('');
    setLoading(true);
    setStatusText('Uploading your learning document to server...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Simulate steps in loading indicator to show user what's happening
      setTimeout(() => setStatusText('Parsing document and running OCR text extraction...'), 2000);
      setTimeout(() => setStatusText('Running AI topic modeling and identifying keywords...'), 4500);

      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUploadResult(response.data);
      // Select the first topic automatically
      if (response.data.topics && response.data.topics.length > 0) {
        setSelectedTopic(response.data.topics[0]);
      } else {
        setSelectedTopic('General Concept');
      }
    } catch (err) {
      console.error('File upload error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to process document. Please make sure the format is valid.');
    } finally {
      setLoading(false);
      setStatusText('');
    }
  };

  const proceedToQuiz = () => {
    if (!uploadResult) return;
    navigate('/quiz-setup', { 
      state: { 
        fileId: uploadResult.fileId,
        topic: selectedTopic,
        fileName: uploadResult.fileName
      } 
    });
  };

  const getFileIcon = (mimeType) => {
    if (!mimeType) return <FileText className="h-10 w-10 text-indigo-400" />;
    if (mimeType.includes('pdf')) return <FileText className="h-10 w-10 text-rose-400" />;
    if (mimeType.includes('word') || mimeType.includes('officedocument')) return <FileText className="h-10 w-10 text-blue-400" />;
    if (mimeType.startsWith('image/')) return <Image className="h-10 w-10 text-emerald-400" />;
    if (mimeType.startsWith('audio/')) return <FileAudio className="h-10 w-10 text-amber-400" />;
    if (mimeType.startsWith('video/')) return <FileVideo className="h-10 w-10 text-violet-400" />;
    return <FileText className="h-10 w-10 text-indigo-400" />;
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto animate-fade-up">
      
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 font-sans">
          Upload Study Materials
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Upload PDF, DOCX, TXT, or images. AI extracts the material, indexes topics, and generates practice questions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Upload Column */}
        <div className="md:col-span-2 space-y-4">
          <GlassCard className="border border-white/5 p-8 relative">
            <form onSubmit={handleUploadSubmit} className="space-y-6">
              
              {/* File Dropzone */}
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileSelect}
                className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-all ${
                  dragActive ? 'border-indigo-500 bg-indigo-500/5' : 'border-glassborder hover:border-indigo-500/40 hover:bg-slate-900/10'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.docx,.txt,image/*"
                />

                {file ? (
                  <div className="flex flex-col items-center text-center space-y-3">
                    {getFileIcon(file.type)}
                    <div>
                      <p className="text-sm font-semibold text-slate-200">{file.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center space-y-3">
                    <Upload className="h-10 w-10 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                    <div>
                      <p className="text-sm font-semibold text-slate-300">Drag and drop file here, or <span className="text-indigo-400 hover:underline">browse</span></p>
                      <p className="text-xs text-slate-500 mt-1">Supports PDF, DOCX, TXT, JPG, PNG (Max 100MB)</p>
                    </div>
                  </div>
                )}
              </div>

              {errorMsg && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Upload Button */}
              {file && !uploadResult && (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700/50 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-neonIndigo"
                >
                  {loading ? (
                    <div className="flex items-center space-x-3">
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-medium">{statusText}</span>
                    </div>
                  ) : (
                    'Analyze Material & Extract Text'
                  )}
                </button>
              )}

            </form>
          </GlassCard>

          {/* Results Summary Box */}
          {uploadResult && (
            <GlassCard className="border border-emerald-500/20 bg-emerald-500/5 p-6 animate-fade-up">
              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-4 w-full">
                  <div>
                    <h3 className="text-base font-bold text-slate-200">Analysis Completed Successfully!</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Identified learning contents from uploaded document.</p>
                  </div>
                  
                  {/* Text Preview */}
                  <div className="p-4 bg-slate-950/40 rounded-xl border border-glassborder">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Text Extract Preview</p>
                    <p className="text-xs text-slate-300 italic leading-relaxed">
                      "{uploadResult.textPreview}"
                    </p>
                  </div>

                  {/* Proceed Options */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
                    <div className="text-xs text-slate-400">
                      Chosen Topic: <span className="font-semibold text-slate-200">{selectedTopic}</span>
                    </div>
                    <button
                      onClick={proceedToQuiz}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center space-x-1 shadow-neonIndigo group transition-all self-end"
                    >
                      <span>Proceed to Quiz Setup</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

        </div>

        {/* Info / Topics Column */}
        <div className="space-y-4">
          <GlassCard className="border border-white/5 p-6 h-full flex flex-col justify-between">
            <div className="space-y-6">
              <h3 className="text-base font-bold text-slate-200 flex items-center space-x-2">
                <HelpCircle className="h-5 w-5 text-indigo-400" />
                <span>Extracted Topics</span>
              </h3>

              {uploadResult && uploadResult.topics && uploadResult.topics.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-400">
                    Select a topic identified by the AI. This topic will be highlighted in your quiz setup:
                  </p>
                  <div className="flex flex-col space-y-2">
                    {uploadResult.topics.map((t, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedTopic(t)}
                        className={`text-left text-xs font-semibold px-4 py-3 rounded-xl border transition-all ${
                          selectedTopic === t 
                            ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/50 shadow-neonIndigo'
                            : 'bg-slate-900/40 text-slate-400 border-glassborder hover:bg-slate-800/40 hover:text-slate-200'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs">
                  <p>Upload a file to view extracted topics.</p>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-glassborder mt-6 text-xs text-slate-500 space-y-2">
              <p className="font-semibold text-slate-400">How topic detection works:</p>
              <p>Our algorithms scan word distribution frequencies in the text to identify core chapters (e.g. arrays, recursion, historical eras) and build matching learning questions.</p>
            </div>
          </GlassCard>
        </div>

      </div>

    </div>
  );
};

export default UploadPage;
