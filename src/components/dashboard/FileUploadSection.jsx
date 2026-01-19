import React from 'react';
import { Upload, FileText, X } from 'lucide-react';

const FileUploadSection = ({
    fileInputRef,
    onFileUpload,
    uploadedFileName,
    onRemoveUpload
}) => {
    return (
        <div className="p-4 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl border-2 border-dashed border-indigo-400 dark:border-indigo-500 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all shadow-lg" style={{ display: 'block !important', visibility: 'visible !important' }}>
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-200 dark:bg-indigo-900/50 mb-2 shadow-md">
                    <Upload className="text-indigo-700 dark:text-indigo-300" size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    Upload Your Script
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 font-medium">
                    Have a script ready? Upload a .txt file to get started instantly
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt"
                        onChange={onFileUpload}
                        className="hidden"
                        id="script-upload"
                    />
                    <label
                        htmlFor="script-upload"
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold cursor-pointer transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 flex items-center gap-2 text-sm"
                    >
                        <Upload size={18} />
                        Choose .txt File
                    </label>
                    {uploadedFileName && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-800">
                            <FileText size={16} />
                            <span className="text-xs font-medium">{uploadedFileName}</span>
                            <button
                                onClick={onRemoveUpload}
                                className="ml-1 hover:bg-green-200 dark:hover:bg-green-900/50 rounded p-0.5 transition-colors"
                                title="Remove file"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FileUploadSection;
