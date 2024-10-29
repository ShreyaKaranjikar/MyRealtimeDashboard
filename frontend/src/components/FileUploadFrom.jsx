import React, { useState } from 'react';
import axios from 'axios';

const FileUploadForm = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [progress, setProgress] = useState(0);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type !== 'text/csv') {
            setError('Please select a CSV file');
            return;
        }
        setFile(selectedFile);
        setError('');
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            await axios.post('${process.env.NEXT_PUBLIC_API_URL}/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setProgress(percentCompleted);
                }
            });

            setSuccess('File uploaded successfully!');
            setFile(null);
            // Reset file input
            e.target.reset();
        } catch (err) {
            setError(err.response?.data?.message || 'Error uploading file');
        } finally {
            setLoading(false);
            setProgress(0);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Upload CSV File</h2>
            
            <form onSubmit={handleUpload}>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Select CSV File
                    </label>
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                    />
                </div>

                {progress > 0 && (
                    <div className="mb-4">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{progress}% uploaded</p>
                    </div>
                )}

                {error && (
                    <div className="mb-4 text-red-500 text-sm">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 text-green-500 text-sm">
                        {success}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={!file || loading}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-md
                            hover:bg-blue-600 disabled:bg-gray-400 
                            disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? 'Uploading...' : 'Upload File'}
                </button>
            </form>
        </div>
    );
};

export default FileUploadForm;