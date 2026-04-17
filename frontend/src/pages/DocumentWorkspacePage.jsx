import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postJson } from '../utils/api';
import { addLibraryItem, getLibrary } from '../utils/studyLibrary';

const DocumentWorkspacePage = () => {
  const navigate = useNavigate();
  const library = useMemo(() => getLibrary(), []);
  const [documentName, setDocumentName] = useState('');
  const [documentText, setDocumentText] = useState('');
  const [question, setQuestion] = useState('');
  const [summary, setSummary] = useState('');
  const [chatReply, setChatReply] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    event.target.value = '';

    try {
      setDocumentName(file.name);
      setDocumentText('Extracting context from document, please wait...');

      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/ai/extract', {
        method: 'POST',
        body: formData,
      });
      
      let data = null;
      try { data = await res.json(); } catch(e) {}
      
      if (!res.ok) throw new Error(data?.detail || 'Extraction failed securely on server.');
      
      setDocumentText(data.text || '');
      addLibraryItem('documents', {
        title: file.name,
        content: data.text || '',
      });
      setError('');
    } catch (err) {
      setDocumentText('');
      setError(err.message || 'This file could not be parsed securely. Try a supported document or paste manually.');
    }
  };

  const handleSummarize = async () => {
    if (!documentText.trim()) return;
    setLoadingSummary(true);
    setError('');
    try {
      const data = await postJson('/api/ai/summarize', {
        text: documentText,
        style: 'exam-prep',
      });
      setSummary(data.summary);
      addLibraryItem('summaries', {
        title: documentName || 'Untitled document summary',
        content: data.summary,
        source: documentName || 'Pasted document',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleAsk = async () => {
    if (!documentText.trim() || !question.trim()) return;
    setLoadingChat(true);
    setError('');
    try {
      const data = await postJson('/api/ai/document-chat', {
        document_name: documentName || 'Uploaded document',
        document_text: documentText,
        question,
      });
      setChatReply(data.response);
      addLibraryItem('chats', {
        title: `${documentName || 'Document'} Q&A`,
        prompt: question,
        response: data.response,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleLoadSavedDocument = (event) => {
    const selected = library.documents.find((item) => item.id === event.target.value);
    if (!selected) return;
    setDocumentName(selected.title || 'Saved document');
    setDocumentText(selected.content || '');
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-headline font-extrabold text-primary">Document Workspace</h1>
            <p className="text-on-surface-variant mt-2 max-w-2xl">
              Upload or paste study material, generate summaries, and chat with the document.
            </p>
          </div>
          <button
            onClick={() => navigate('/library')}
            className="px-4 py-3 rounded-xl bg-surface-container text-on-surface font-bold hover:bg-surface-container-high transition-colors"
          >
            Open Library
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap gap-3 items-center">
              <label className="px-4 py-3 rounded-xl bg-primary text-white font-bold cursor-pointer hover:bg-primary-container transition-colors">
                Upload Document
                <input type="file" className="hidden" onChange={handleFileUpload} />
              </label>
              <select
                className="rounded-xl border-outline-variant/30 bg-surface-container-lowest"
                defaultValue=""
                onChange={handleLoadSavedDocument}
              >
                <option value="">Load saved document</option>
                {library.documents.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.title}
                  </option>
                ))}
              </select>
            </div>

            <input
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              className="w-full rounded-xl border-outline-variant/30 bg-surface-container-lowest"
              placeholder="Document title"
            />

            <textarea
              value={documentText}
              onChange={(e) => setDocumentText(e.target.value)}
              className="w-full min-h-[420px] rounded-2xl border-outline-variant/30 bg-surface-container-lowest"
              placeholder="Paste lecture notes, a chapter, or document text here..."
            />
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-headline font-bold">Summary</h2>
                <button
                  onClick={handleSummarize}
                  disabled={loadingSummary}
                  className="px-4 py-3 rounded-xl bg-secondary-container text-on-secondary-container font-bold disabled:opacity-60"
                >
                  {loadingSummary ? 'Summarizing...' : 'Generate Summary'}
                </button>
              </div>
              <div className="min-h-[220px] rounded-2xl bg-surface-container-low p-4 whitespace-pre-wrap">
                {summary || 'Your document summary will appear here.'}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-headline font-bold">Chat With Document</h2>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full min-h-[120px] rounded-2xl border-outline-variant/30 bg-surface-container-lowest"
                placeholder="Ask a question about the uploaded document..."
              />
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={() => navigate('/quiz', { state: { sourceText: documentText, title: documentName } })}
                  className="px-4 py-3 rounded-xl bg-surface-container text-on-surface font-bold hover:bg-surface-container-high transition-colors"
                >
                  Make Quiz From This
                </button>
                <button
                  onClick={handleAsk}
                  disabled={loadingChat}
                  className="px-4 py-3 rounded-xl bg-primary text-white font-bold disabled:opacity-60"
                >
                  {loadingChat ? 'Answering...' : 'Ask Document'}
                </button>
              </div>
              <div className="min-h-[220px] rounded-2xl bg-surface-container-low p-4 whitespace-pre-wrap">
                {chatReply || 'Document answers will appear here.'}
              </div>
              {error ? <p className="text-error font-semibold">{error}</p> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentWorkspacePage;
