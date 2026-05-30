import React, { useState } from 'react';
import { X, FileSpreadsheet, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

const ImportSandbox = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: Upload/Select, 2: Verification
  const [loading, setLoading] = useState(false);
  const [importData, setImportData] = useState({ clean_rows: [], corrupt_rows: [] });

  // Simulate Excel parsing
  const handleFileSelect = () => {
    setLoading(true);
    // Simulate API call to validate-import
    setTimeout(() => {
      const mockRows = [
        { name: 'John Doe', email: 'john@example.com', corporate_id: 'ep-2026-001-10', department: 'Engineering', role: 'employee' },
        { name: 'Jane Smith', email: 'jane@example.com', corporate_id: 'ep-2026-001-11', department: 'Marketing', role: 'employee' },
        { name: 'Bad Data', email: 'invalid-email', corporate_id: '', department: 'HR', role: 'employee' }, // Corrupt
        { name: 'Existing User', email: 'demoAdmin@vr.lms.com.ph', corporate_id: 'ad-2026-001-01', department: 'Engineering', role: 'admin' }, // Duplicate
      ];

      // In real app, we'd POST to /api/v1/admin/employees/validate-import
      const clean = mockRows.filter(r => r.email.includes('@') && r.corporate_id !== '' && r.name !== 'Existing User');
      const corrupt = mockRows.filter(r => !clean.includes(r));

      setImportData({
        clean_rows: clean,
        corrupt_rows: corrupt.map(r => ({ ...r, errors: [!r.email.includes('@') ? 'Invalid Email' : r.corporate_id === '' ? 'Missing ID' : 'Duplicate Record'] }))
      });
      setStep(2);
      setLoading(false);
    }, 1500);
  };

  const handleCommit = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/v1/admin/employees/batch-store`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({ employees: importData.clean_rows }),
      });
      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error('Batch store failed', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="text-sm font-poppins font-semibold text-gray-900">Excel Data Import Pipeline</h3>
            <p className="text-[10px] font-medium text-gray-400">Intelligent Data Verification Sandbox</p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-white transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 ? (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-100 rounded-lg space-y-4">
              <div className="p-4 bg-green-50 rounded-full text-green-600">
                <FileSpreadsheet size={48} strokeWidth={1.5} />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-700">Select Excel file to import</p>
                <p className="text-[10px] text-gray-400 font-medium mt-1">Supported formats: .xlsx, .csv</p>
              </div>
              <button
                onClick={handleFileSelect}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-2.5 rounded-md text-xs font-bold shadow-md shadow-green-600/10 transition-all flex items-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
                <span>{loading ? 'Analyzing Data...' : 'Browse Files'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Clean Rows */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 size={16} className="text-green-500" />
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Validated Entries ({importData.clean_rows.length})</h4>
                </div>
                <div className="bg-white border border-gray-100 rounded-md overflow-hidden shadow-sm">
                  <table className="w-full text-left text-[10px]">
                    <thead className="bg-gray-50 text-gray-400 font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-2">Name</th>
                        <th className="px-4 py-2">Corporate ID</th>
                        <th className="px-4 py-2">Email</th>
                        <th className="px-4 py-2">Department</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {importData.clean_rows.map((row, i) => (
                        <tr key={i}>
                          <td className="px-4 py-2 font-semibold text-gray-700">{row.name}</td>
                          <td className="px-4 py-2 text-gray-500">{row.corporate_id}</td>
                          <td className="px-4 py-2 text-gray-500">{row.email}</td>
                          <td className="px-4 py-2 text-gray-500">{row.department}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Corrupt Rows */}
              {importData.corrupt_rows.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={16} className="text-red-500" />
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Formatting Anomalies ({importData.corrupt_rows.length})</h4>
                  </div>
                  <div className="bg-red-50/30 border border-red-100 rounded-md overflow-hidden">
                    <table className="w-full text-left text-[10px]">
                      <thead className="bg-red-50 text-red-400 font-semibold uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-2">Name</th>
                          <th className="px-4 py-2">Email</th>
                          <th className="px-4 py-2 text-right">Violation Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-red-50">
                        {importData.corrupt_rows.map((row, i) => (
                          <tr key={i} className="bg-white/50">
                            <td className="px-4 py-2 font-semibold text-gray-400 line-through decoration-red-200">{row.name}</td>
                            <td className="px-4 py-2 text-gray-400">{row.email}</td>
                            <td className="px-4 py-2 text-right">
                              {row.errors?.map((err, ei) => (
                                <span key={ei} className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-bold ml-1">{err}</span>
                              ))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-2 text-[10px] text-gray-400 font-medium">
                    Note: Only completely valid, properly formatted rows will be processed.
                  </p>
                </section>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 transition-all"
          >
            Cancel
          </button>
          {step === 2 && (
            <button
              onClick={handleCommit}
              disabled={loading || importData.clean_rows.length === 0}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-2 rounded-md text-xs font-bold shadow-md shadow-green-600/10 transition-all flex items-center gap-2"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              <span>Commit Valid Entries</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportSandbox;
