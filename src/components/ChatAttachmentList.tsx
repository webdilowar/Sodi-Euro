import React, { useState } from 'react';
import { FileText, Download, Eye, X, Paperclip, Film, ExternalLink } from 'lucide-react';

interface Attachment {
  name: string;
  url: string;
}

interface ChatAttachmentListProps {
  attachments: Attachment[];
  isDarkBubble?: boolean;
}

export const getFileType = (url: string = '', fileName: string = ''): 'image' | 'video' | 'pdf' | 'other' => {
  const lowercaseUrl = (url || '').toLowerCase();
  const lowercaseName = (fileName || '').toLowerCase();

  if (
    lowercaseUrl.startsWith('data:image/') ||
    /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/i.test(lowercaseName) ||
    /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/i.test(lowercaseUrl)
  ) {
    return 'image';
  }

  if (
    lowercaseUrl.startsWith('data:video/') ||
    /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(lowercaseName) ||
    /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(lowercaseUrl)
  ) {
    return 'video';
  }

  if (
    lowercaseUrl.startsWith('data:application/pdf') ||
    lowercaseName.endsWith('.pdf') ||
    lowercaseUrl.includes('.pdf')
  ) {
    return 'pdf';
  }

  return 'other';
};

export const ChatAttachmentList: React.FC<ChatAttachmentListProps> = ({ attachments, isDarkBubble = false }) => {
  const [activeModalItem, setActiveModalItem] = useState<{ url: string; name: string; type: 'image' | 'pdf' } | null>(null);

  if (!attachments || attachments.length === 0) return null;

  const handleDownload = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewPdf = (url: string) => {
    // Open in new window or modal
    const win = window.open();
    if (win) {
      win.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>PDF View - NOVENTRA</title>
            <style>
              body { margin: 0; background: #1e293b; height: 100vh; display: flex; flex-direction: column; font-family: system-ui, sans-serif; }
              iframe { flex: 1; border: none; width: 100%; height: 100%; }
            </style>
          </head>
          <body>
            <iframe src="${url}"></iframe>
          </body>
        </html>
      `);
    } else {
      setActiveModalItem({ url, name: 'PDF Preview', type: 'pdf' });
    }
  };

  return (
    <>
      <div className="mt-2 space-y-2">
        {attachments.map((file, idx) => {
          const type = getFileType(file.url, file.name);

          if (type === 'image') {
            return (
              <div key={idx} className="group relative my-1">
                {/* Messenger style Image card */}
                <div
                  onClick={() => setActiveModalItem({ url: file.url, name: file.name, type: 'image' })}
                  className="relative cursor-pointer overflow-hidden rounded-2xl border border-black/10 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.01] max-w-[260px] sm:max-w-[300px]"
                >
                  <img
                    src={file.url}
                    alt={file.name}
                    className="max-h-[220px] w-full object-cover rounded-2xl"
                    referrerPolicy="no-referrer"
                  />
                  {/* Subtle overlay on hover */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white">
                    <span className="p-2 rounded-full bg-slate-900/80 backdrop-blur-sm text-xs font-bold flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5 text-brand-gold" />
                      <span>View All</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          }

          if (type === 'video') {
            return (
              <div key={idx} className="my-1 max-w-[280px] sm:max-w-[320px]">
                <div className="rounded-2xl border border-slate-200/50 bg-slate-950 overflow-hidden shadow-sm">
                  <video
                    src={file.url}
                    controls
                    preload="metadata"
                    className="w-full max-h-[220px] object-contain rounded-t-2xl"
                  />
                  <div className="px-3 py-1.5 bg-slate-900 flex items-center justify-between text-[11px] text-slate-300">
                    <span className="truncate font-semibold flex items-center gap-1 text-slate-200">
                      <Film className="h-3.5 w-3.5 text-brand-gold shrink-0" />
                      <span className="truncate">{file.name || 'Video Note'}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDownload(file.url, file.name || 'video.mp4')}
                      className="p-1 hover:text-brand-gold transition-colors text-slate-400"
                      title="Download"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          if (type === 'pdf') {
            return (
              <div
                key={idx}
                className={`my-1.5 p-3 rounded-2xl border transition-all max-w-[280px] sm:max-w-[320px] ${
                  isDarkBubble
                    ? 'bg-slate-800/80 border-slate-700 text-white shadow-sm'
                    : 'bg-rose-50/80 border-rose-200/80 text-slate-800 shadow-sm'
                }`}
              >
                <div className="flex items-start space-x-2.5">
                  <div className="p-2.5 rounded-xl bg-rose-500 text-white shrink-0 shadow-sm">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <span className="text-[9px] font-black uppercase tracking-wider text-rose-500 block">
                      PDF Document
                    </span>
                    <p className="text-xs font-bold truncate mt-0.5 leading-snug">
                      {file.name || 'document.pdf'}
                    </p>
                    <div className="flex items-center gap-2 mt-2 pt-1 border-t border-slate-200/20">
                      <button
                        type="button"
                        onClick={() => handleViewPdf(file.url)}
                        className="flex-1 inline-flex items-center justify-center space-x-1 px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-bold hover:bg-rose-700 transition-colors shadow-xs"
                      >
                        <Eye className="h-3 w-3" />
                        <span>View</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownload(file.url, file.name || 'document.pdf')}
                        className={`flex-1 inline-flex items-center justify-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors border ${
                          isDarkBubble
                            ? 'bg-slate-700 hover:bg-slate-600 text-white border-slate-600'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        <Download className="h-3 w-3" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          /* Other generic files */
          return (
            <div
              key={idx}
              className={`my-1 p-2.5 rounded-2xl border flex items-center justify-between gap-2 max-w-[280px] ${
                isDarkBubble
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-slate-100 border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-center space-x-2 truncate min-w-0">
                <Paperclip className="h-4 w-4 text-brand-gold shrink-0" />
                <span className="text-xs font-bold truncate">{file.name}</span>
              </div>
              <button
                type="button"
                onClick={() => handleDownload(file.url, file.name)}
                className="p-1.5 rounded-lg bg-brand-gold/20 hover:bg-brand-gold/40 text-brand-gold transition-colors shrink-0"
                title="Download"
              >
                <Download className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Lightbox / Modal for Image Preview */}
      {activeModalItem && (
        <div
          className="fixed inset-0 z-[99999] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setActiveModalItem(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-white truncate">
                <FileText className="h-4 w-4 text-brand-gold shrink-0" />
                <span className="text-xs font-bold truncate">{activeModalItem.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleDownload(activeModalItem.url, activeModalItem.name)}
                  className="px-3 py-1.5 rounded-xl bg-brand-gold text-slate-950 text-xs font-bold hover:bg-yellow-400 transition-colors flex items-center gap-1"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModalItem(null)}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-rose-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 flex items-center justify-center min-h-[300px] max-h-[80vh] overflow-auto">
              {activeModalItem.type === 'image' ? (
                <img
                  src={activeModalItem.url}
                  alt={activeModalItem.name}
                  className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg shadow-lg"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <iframe
                  src={activeModalItem.url}
                  className="w-full h-[70vh] border-0 rounded-lg"
                  title="PDF Document"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
