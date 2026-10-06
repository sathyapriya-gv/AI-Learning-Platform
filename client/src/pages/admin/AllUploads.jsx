import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import GlassCard from '../../components/GlassCard';
import { FileText, User, Calendar, HardDrive, AlertCircle } from 'lucide-react';

const AllUploads = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await api.get('/analytics/admin/documents');
        setDocuments(response.data);
      } catch (err) {
        console.error('Error fetching admin uploads:', err);
        setErrorMsg('Failed to query uploaded materials database.');
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  const getMimeBadge = (mime) => {
    let color = 'bg-slate-500/10 text-slate-400 border border-slate-500/25';
    if (mime.includes('pdf')) color = 'bg-rose-500/10 text-rose-400 border border-rose-500/25';
    if (mime.includes('word') || mime.includes('docx')) color = 'bg-blue-500/10 text-blue-400 border border-blue-500/25';
    if (mime.startsWith('image/')) color = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25';
    if (mime.startsWith('audio/')) color = 'bg-amber-500/10 text-amber-400 border border-amber-500/25';
    if (mime.startsWith('video/')) color = 'bg-violet-500/10 text-violet-400 border border-violet-500/25';
    
    // Extract short name
    const shortMime = mime.split('/')[1] || mime;
    return (
      <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wide ${color}`}>
        {shortMime.replace('vnd.openxmlformats-officedocument.wordprocessingml.', '')}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto animate-fade-up">
      
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 font-sans flex items-center space-x-2">
          <span>All Uploaded Materials</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Administrator view listing all learning contents, file types, and owner credentials across the platform.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <GlassCard className="border border-white/5 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : documents.length === 0 ? (
          <p className="text-center py-12 text-slate-500 text-xs">No uploaded learning documents found on this system.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs text-slate-400 uppercase bg-slate-900/40 border-b border-glassborder">
                <tr>
                  <th className="py-3.5 px-6 font-semibold">Document Name</th>
                  <th className="py-3.5 px-4 font-semibold">Uploaded By</th>
                  <th className="py-3.5 px-4 font-semibold">Type</th>
                  <th className="py-3.5 px-4 font-semibold">File Size</th>
                  <th className="py-3.5 px-6 font-semibold">Upload Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glassborder bg-slate-900/10">
                {documents.map((doc) => (
                  <tr key={doc._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-200 truncate max-w-[200px]">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-indigo-400 shrink-0" />
                        <span title={doc.originalName}>{doc.originalName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {doc.user ? (
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-slate-300 flex items-center">
                            <User className="h-3 w-3 mr-1 text-slate-500" />
                            {doc.user.username}
                          </p>
                          <p className="text-[10px] text-slate-500">{doc.user.email}</p>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic text-xs">Unknown User</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {getMimeBadge(doc.mimeType)}
                    </td>
                    <td className="py-4 px-4 text-xs font-semibold text-slate-400">
                      <div className="flex items-center space-x-1">
                        <HardDrive className="h-3.5 w-3.5 text-slate-500" />
                        <span>{(doc.size / (1024 * 1024)).toFixed(2)} MB</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-500" />
                        <span>
                          {new Date(doc.createdAt).toLocaleDateString(undefined, { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

    </div>
  );
};

export default AllUploads;
