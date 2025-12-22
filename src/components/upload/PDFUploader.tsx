'use client';

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload,
    FileText,
    X,
    Lock,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Sparkles,
    FileSearch,
    Brain,
    RefreshCw,
    Clock,
    Save
} from 'lucide-react';
import { Button, Modal, Input, Select } from '@/components/ui';
import { UploadedFile, PasswordProfile, Transaction, ProcessingStage } from '@/types';

interface PDFUploaderProps {
    onFilesProcessed: (transactions: Transaction[]) => void;
    passwordProfiles?: PasswordProfile[];
    onAddPasswordProfile?: (profile: Omit<PasswordProfile, 'id' | 'createdAt'>) => void;
}

const STAGE_CONFIG: Record<ProcessingStage, { label: string; icon: React.ReactNode; color: string }> = {
    queued: { label: 'Queued', icon: <FileText size={16} />, color: 'text-slate-400' },
    uploading: { label: 'Uploading', icon: <Upload size={16} />, color: 'text-blue-400' },
    decrypting: { label: 'Decrypting', icon: <Lock size={16} />, color: 'text-amber-400' },
    scanning: { label: 'Scanning for transactions', icon: <FileSearch size={16} />, color: 'text-cyan-400' },
    extracting: { label: 'Extracting Text', icon: <FileSearch size={16} />, color: 'text-violet-400' },
    analyzing: { label: 'AI Analyzing', icon: <Brain size={16} />, color: 'text-emerald-400' },
    complete: { label: 'Complete', icon: <CheckCircle2 size={16} />, color: 'text-emerald-400' },
    error: { label: 'Error', icon: <AlertCircle size={16} />, color: 'text-rose-400' },
};

export function PDFUploader({
    onFilesProcessed,
    passwordProfiles = [],
    onAddPasswordProfile
}: PDFUploaderProps) {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [fileObjects, setFileObjects] = useState<Map<string, File>>(new Map());
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentFileIndex, setCurrentFileIndex] = useState<number | null>(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordMode, setPasswordMode] = useState<'same' | 'different'>('same');
    const [globalPassword, setGlobalPassword] = useState('');
    const [selectedProfileId, setSelectedProfileId] = useState<string>('');
    const [filePasswords, setFilePasswords] = useState<Record<string, string>>({});
    const [showSaveProfileModal, setShowSaveProfileModal] = useState(false);
    const [newProfileName, setNewProfileName] = useState('');
    const [processingStartTime, setProcessingStartTime] = useState<number | null>(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [totalEstimatedSeconds, setTotalEstimatedSeconds] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Track pending files to clear on modal cancel
    const pendingFileIdsRef = useRef<string[]>([]);

    // Timer effect - counts up elapsed seconds
    useEffect(() => {
        if (processingStartTime !== null) {
            timerRef.current = setInterval(() => {
                setElapsedSeconds(Math.floor((Date.now() - processingStartTime) / 1000));
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
            setElapsedSeconds(0);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [processingStartTime]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getRemainingSeconds = () => {
        return Math.max(0, totalEstimatedSeconds - elapsedSeconds);
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = Array.from(e.dataTransfer.files).filter(
            file => file.type === 'application/pdf'
        );
        if (droppedFiles.length > 0) {
            addFiles(droppedFiles);
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        if (selectedFiles.length > 0) {
            addFiles(selectedFiles);
        }
    };

    const addFiles = (newFiles: File[]) => {
        const newUploadedFiles: UploadedFile[] = [];
        const newFileObjects = new Map(fileObjects);
        const newPendingIds: string[] = [];

        newFiles.forEach((file, index) => {
            const id = `file-${Date.now()}-${index}`;
            newUploadedFiles.push({
                id,
                fileName: file.name,
                status: 'pending',
                stage: 'queued',
            });
            newFileObjects.set(id, file);
            newPendingIds.push(id);
        });

        setFiles(prev => [...prev, ...newUploadedFiles]);
        setFileObjects(newFileObjects);
        pendingFileIdsRef.current = [...pendingFileIdsRef.current, ...newPendingIds];

        // Only show password modal if NOT currently processing
        if (!isProcessing) {
            setShowPasswordModal(true);
        }
    };

    // Cancel and clear pending files that haven't been processed yet
    const handleModalCancel = () => {
        // Remove files that were pending when modal opened
        setFiles(prev => prev.filter(f => !pendingFileIdsRef.current.includes(f.id) || f.status !== 'pending'));
        const newFileObjects = new Map(fileObjects);
        pendingFileIdsRef.current.forEach(id => newFileObjects.delete(id));
        setFileObjects(newFileObjects);
        pendingFileIdsRef.current = [];
        setShowPasswordModal(false);
        setGlobalPassword('');
        setSelectedProfileId('');
    };

    const removeFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
        const newFileObjects = new Map(fileObjects);
        newFileObjects.delete(id);
        setFileObjects(newFileObjects);
    };

    const updateFileStage = (fileId: string, stage: ProcessingStage, extra?: Partial<UploadedFile>) => {
        setFiles(prev => prev.map(f =>
            f.id === fileId ? { ...f, stage, ...extra } : f
        ));
    };

    const processFileWithRetry = async (
        file: UploadedFile,
        password: string,
        retries: number = 3
    ): Promise<{ success: boolean; transactions?: Transaction[]; error?: string; estimatedTxns?: number }> => {
        const actualFile = fileObjects.get(file.id);
        if (!actualFile) return { success: false, error: 'File not found' };

        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                // Stage: Uploading
                updateFileStage(file.id, 'uploading');
                await new Promise(r => setTimeout(r, 300)); // Visual delay

                const formData = new FormData();
                formData.append('file', actualFile);
                if (password) {
                    formData.append('password', password);
                    updateFileStage(file.id, 'decrypting');
                    await new Promise(r => setTimeout(r, 300));
                }

                // Stage: Scanning - Quick count for ETA
                updateFileStage(file.id, 'scanning');

                // Call count API
                const countFormData = new FormData();
                countFormData.append('file', actualFile);
                if (password) countFormData.append('password', password);

                const countResponse = await fetch('/api/count', {
                    method: 'POST',
                    body: countFormData,
                });
                const countResult = await countResponse.json();

                if (countResult.success && countResult.count > 0) {
                    // Update file with estimated transactions
                    updateFileStage(file.id, 'scanning', {
                        estimatedTransactions: countResult.count,
                        estimatedSeconds: countResult.estimatedSeconds,
                    });
                    // Update total estimated time for countdown
                    setTotalEstimatedSeconds(prev => prev + countResult.estimatedSeconds);
                }

                // Stage: Extracting - Full AI extraction
                updateFileStage(file.id, 'extracting');

                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                // Stage: Analyzing (happens on server but we show it)
                updateFileStage(file.id, 'analyzing');

                const result = await response.json();

                if (!response.ok) {
                    // Check for 503 retry-able error
                    if (response.status === 503 && attempt < retries) {
                        await new Promise(r => setTimeout(r, 2000 * attempt)); // Exponential backoff
                        continue;
                    }
                    throw new Error(result.error || 'Processing failed');
                }

                return {
                    success: true,
                    transactions: result.transactions || [],
                    estimatedTxns: countResult.count
                };
            } catch (error) {
                if (attempt === retries) {
                    return {
                        success: false,
                        error: error instanceof Error ? error.message : 'Processing failed'
                    };
                }
                // Wait before retry
                await new Promise(r => setTimeout(r, 2000 * attempt));
            }
        }
        return { success: false, error: 'Max retries exceeded' };
    };

    const handlePasswordSubmit = async () => {
        setShowPasswordModal(false);
        setIsProcessing(true);
        setProcessingStartTime(Date.now());
        setTotalEstimatedSeconds(0); // Reset ETA for new batch
        pendingFileIdsRef.current = []; // Clear pending refs as we're now processing

        const pendingFiles = files.filter(f => f.status === 'pending');
        const allTransactions: Transaction[] = [];

        // Process files ONE AT A TIME (sequential queue)
        for (let i = 0; i < pendingFiles.length; i++) {
            const file = pendingFiles[i];
            setCurrentFileIndex(i);

            // Update status
            setFiles(prev => prev.map(f =>
                f.id === file.id ? { ...f, status: 'processing' } : f
            ));

            const password = passwordMode === 'same'
                ? (selectedProfileId ? getProfilePassword(selectedProfileId) : globalPassword)
                : filePasswords[file.id] || '';

            const result = await processFileWithRetry(file, password);

            if (result.success && result.transactions) {
                updateFileStage(file.id, 'complete', {
                    status: 'completed',
                    transactionCount: result.transactions.length
                });
                allTransactions.push(...result.transactions);
            } else {
                updateFileStage(file.id, 'error', {
                    status: 'error',
                    error: result.error
                });
            }
        }

        setIsProcessing(false);
        setCurrentFileIndex(null);
        setProcessingStartTime(null);

        // Clear completed/error files after a short delay
        setTimeout(() => {
            setFiles([]);
            setFileObjects(new Map());
        }, 2000);

        // Pass ALL transactions to parent
        if (allTransactions.length > 0) {
            onFilesProcessed(allTransactions);
        }
    };

    const getProfilePassword = (profileId: string): string => {
        const profile = passwordProfiles.find(p => p.id === profileId);
        return profile?.encryptedPassword || '';
    };

    const handleSaveProfile = () => {
        if (newProfileName && globalPassword && onAddPasswordProfile) {
            onAddPasswordProfile({
                name: newProfileName,
                encryptedPassword: globalPassword,
            });
            // Clear password and auto-select will happen via useEffect when profiles update
            setGlobalPassword('');
            setNewProfileName('');
            setShowSaveProfileModal(false);
        }
    };

    // Auto-select newly added profile
    useEffect(() => {
        if (passwordProfiles.length > 0 && !selectedProfileId) {
            // Select the most recently added profile
            const lastProfile = passwordProfiles[passwordProfiles.length - 1];
            setSelectedProfileId(lastProfile.id);
        }
    }, [passwordProfiles, selectedProfileId]);

    const retryFile = (fileId: string) => {
        setFiles(prev => prev.map(f =>
            f.id === fileId ? { ...f, status: 'pending', stage: 'queued', error: undefined } : f
        ));
        setShowPasswordModal(true);
    };

    return (
        <div className="w-full">
            {/* Drop zone */}
            <motion.div
                className={`
                    relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300
                    ${isDragging
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-slate-700 hover:border-slate-600 bg-slate-900/30'
                    }
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex flex-col items-center">
                    <motion.div
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${isDragging ? 'bg-emerald-500/20' : 'bg-slate-800/50'
                            }`}
                        animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
                    >
                        <Upload className={`w-8 h-8 ${isDragging ? 'text-emerald-400' : 'text-slate-400'}`} />
                    </motion.div>

                    <h3 className="text-lg font-semibold text-white mb-2">
                        {isDragging ? 'Drop your PDFs here' : 'Upload Bank Statements'}
                    </h3>
                    <p className="text-sm text-slate-400 mb-4">
                        Drag and drop your PDF files, or click to browse
                    </p>

                    <label className="inline-block cursor-pointer">
                        <input
                            type="file"
                            accept=".pdf"
                            multiple
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <span className="inline-flex items-center justify-center gap-2 font-medium rounded-xl px-5 py-2.5 text-sm bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition-all duration-200 cursor-pointer">
                            Browse Files
                        </span>
                    </label>

                    <p className="text-xs text-slate-500 mt-4">
                        Files are processed one at a time • Supports password-protected PDFs
                    </p>
                </div>
            </motion.div>

            {/* File Queue with Animated Stages */}
            <AnimatePresence>
                {files.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 space-y-3"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                Processing ({files.filter(f => f.status === 'completed' || f.status === 'error').length}/{files.length})
                                {isProcessing && elapsedSeconds > 0 && (
                                    <span className="flex items-center gap-1 text-amber-400 font-mono text-xs">
                                        <Clock size={12} />
                                        {formatTime(elapsedSeconds)}
                                    </span>
                                )}
                                {/* Show current file's ETA if available */}
                                {isProcessing && totalEstimatedSeconds > 0 && (
                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs">
                                        Est: ~{formatTime(totalEstimatedSeconds)}
                                    </span>
                                )}
                            </h4>
                            {isProcessing && currentFileIndex !== null && (
                                <span className="text-xs text-emerald-400 flex items-center gap-1">
                                    <Loader2 size={12} className="animate-spin" />
                                    File {currentFileIndex + 1} of {files.length}
                                </span>
                            )}
                        </div>

                        {files.map((file, index) => (
                            <motion.div
                                key={file.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ delay: index * 0.05 }}
                                className={`
                                    relative p-4 rounded-xl border transition-all duration-300
                                    ${file.status === 'processing'
                                        ? 'bg-slate-800/80 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                                        : file.status === 'completed'
                                            ? 'bg-emerald-500/5 border-emerald-500/30'
                                            : file.status === 'error'
                                                ? 'bg-rose-500/5 border-rose-500/30'
                                                : 'bg-slate-800/50 border-slate-700/50'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    {/* File Icon with Animation */}
                                    <div className={`
                                        relative w-10 h-10 rounded-lg flex items-center justify-center
                                        ${file.status === 'processing' ? 'bg-emerald-500/20' : 'bg-slate-700/50'}
                                    `}>
                                        {file.status === 'processing' ? (
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                            >
                                                <Sparkles className="w-5 h-5 text-emerald-400" />
                                            </motion.div>
                                        ) : file.status === 'completed' ? (
                                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                        ) : file.status === 'error' ? (
                                            <AlertCircle className="w-5 h-5 text-rose-400" />
                                        ) : (
                                            <FileText className="w-5 h-5 text-slate-400" />
                                        )}
                                    </div>

                                    {/* File Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">
                                            {file.fileName}
                                        </p>

                                        {/* Processing Stage Indicator */}
                                        {file.stage && file.status === 'processing' && (
                                            <motion.div
                                                className="flex items-center gap-2 mt-1"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                            >
                                                <motion.span
                                                    key={file.stage}
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className={`flex items-center gap-1.5 text-xs ${STAGE_CONFIG[file.stage].color}`}
                                                >
                                                    {STAGE_CONFIG[file.stage].icon}
                                                    {STAGE_CONFIG[file.stage].label}
                                                    {file.estimatedTransactions && file.stage === 'scanning' && (
                                                        <span className="ml-1 text-cyan-300">
                                                            • Found ~{file.estimatedTransactions} transactions
                                                        </span>
                                                    )}
                                                    {file.estimatedTransactions && (file.stage === 'extracting' || file.stage === 'analyzing') && (
                                                        <span className="ml-1 text-slate-400">
                                                            ({file.estimatedTransactions} txns)
                                                        </span>
                                                    )}
                                                </motion.span>
                                            </motion.div>
                                        )}

                                        {file.status === 'completed' && (
                                            <p className="text-xs text-emerald-400 mt-1">
                                                ✓ {file.transactionCount} transactions extracted
                                            </p>
                                        )}

                                        {file.status === 'error' && (
                                            <p className="text-xs text-rose-400 mt-1 truncate">
                                                {file.error}
                                            </p>
                                        )}

                                        {file.status === 'pending' && !isProcessing && (
                                            <p className="text-xs text-slate-500 mt-1">
                                                Waiting in queue
                                            </p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        {file.status === 'error' && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => retryFile(file.id)}
                                                className="text-slate-400 hover:text-white"
                                            >
                                                <RefreshCw size={14} />
                                            </Button>
                                        )}
                                        {file.status !== 'processing' && (
                                            <button
                                                onClick={() => removeFile(file.id)}
                                                className="p-1 rounded-lg hover:bg-slate-700/50 text-slate-500 hover:text-slate-300 transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Progress Bar Animation */}
                                {file.status === 'processing' && (
                                    <motion.div
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-700 rounded-b-xl overflow-hidden"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-emerald-500 to-violet-500"
                                            animate={{
                                                x: ['-100%', '100%'],
                                            }}
                                            transition={{
                                                duration: 1.5,
                                                repeat: Infinity,
                                                ease: 'easeInOut',
                                            }}
                                        />
                                    </motion.div>
                                )}
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Password Modal */}
            <Modal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                title="PDF Password"
                size="md"
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-400">
                        If your PDFs are password protected, enter the password below.
                    </p>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setPasswordMode('same')}
                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${passwordMode === 'same'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
                                }`}
                        >
                            Same password for all
                        </button>
                        <button
                            onClick={() => setPasswordMode('different')}
                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${passwordMode === 'different'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
                                }`}
                        >
                            Different passwords
                        </button>
                    </div>

                    {passwordMode === 'same' && (
                        <div className="space-y-3">
                            {passwordProfiles.length > 0 && (
                                <Select
                                    label="Saved Profile"
                                    value={selectedProfileId}
                                    onChange={(e) => {
                                        setSelectedProfileId(e.target.value);
                                        if (e.target.value) setGlobalPassword('');
                                    }}
                                    options={[
                                        { value: '', label: 'Enter new password' },
                                        ...passwordProfiles.map(p => ({ value: p.id, label: p.name }))
                                    ]}
                                />
                            )}
                            {!selectedProfileId && (
                                <Input
                                    label="Password"
                                    type="password"
                                    value={globalPassword}
                                    onChange={(e) => setGlobalPassword(e.target.value)}
                                    placeholder="Enter PDF password (leave blank if none)"
                                />
                            )}
                            {globalPassword && onAddPasswordProfile && (
                                <button
                                    onClick={() => setShowSaveProfileModal(true)}
                                    className="flex items-center gap-2 w-full py-2 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-all"
                                >
                                    <Save size={16} />
                                    Save this password for quick access
                                </button>
                            )}
                        </div>
                    )}

                    {passwordMode === 'different' && (
                        <div className="space-y-3 max-h-40 overflow-y-auto">
                            {files.filter(f => f.status === 'pending').map(file => (
                                <Input
                                    key={file.id}
                                    label={file.fileName}
                                    type="password"
                                    value={filePasswords[file.id] || ''}
                                    onChange={(e) => setFilePasswords(prev => ({
                                        ...prev,
                                        [file.id]: e.target.value
                                    }))}
                                    placeholder="Password for this file"
                                    size="sm"
                                />
                            ))}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="ghost" onClick={handleModalCancel}>
                            Cancel
                        </Button>
                        <Button onClick={handlePasswordSubmit}>
                            Process Files
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Save Profile Modal */}
            <Modal
                isOpen={showSaveProfileModal}
                onClose={() => setShowSaveProfileModal(false)}
                title="Save Password Profile"
                size="sm"
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-400">
                        Save this password for quick access when uploading future bank statements.
                    </p>
                    <Input
                        label="Profile Name"
                        value={newProfileName}
                        onChange={(e) => setNewProfileName(e.target.value)}
                        placeholder="e.g., HDFC Bank, SBI Account"
                    />
                    <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                        <p className="text-xs text-slate-500 mb-1">Password to save</p>
                        <p className="text-sm text-white font-mono">{'•'.repeat(globalPassword?.length || 8)}</p>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="ghost" onClick={() => setShowSaveProfileModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveProfile}
                            disabled={!newProfileName.trim() || !globalPassword}
                        >
                            Save Profile
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
