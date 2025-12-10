'use client';

import { useEffect, useState } from 'react';
import { getAllLoanCases, createLoanCase, updateLoanCase, deleteLoanCase } from '@/lib/supabase';
import type { LoanCase } from '@/lib/types';

/**
 * Example component showing how to use Supabase API functions
 * This is a reference implementation - adapt it to your needs
 */
export default function SupabaseExample() {
    const [cases, setCases] = useState<LoanCase[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch all cases on component mount
    useEffect(() => {
        fetchCases();
    }, []);

    const fetchCases = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getAllLoanCases();
            setCases(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch cases');
            console.error('Error fetching cases:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCase = async () => {
        try {
            const newCase: LoanCase = {
                id: `LC-${Date.now()}`,
                applicantName: 'Test User',
                loanAmount: 50000,
                loanType: 'Personal',
                caseType: 'New',
                contactNumber: '123-456-7890',
                email: 'test@example.com',
                address: '123 Test St',
                applicationDate: new Date().toISOString().split('T')[0],
                teamMember: 'John Doe',
                status: 'Document Pending',
                notes: 'Test case created from example',
                history: [],
                salary: 60000,
                location: 'Test City',
                dob: '1990-01-01',
                panCardNumber: 'TEST12345A',
                jobProfile: 'Private',
                jobDesignation: 'Software Engineer',
                referenceName: 'Jane Doe',
                bankName: 'HDFC Bank',
                bankOfficeSm: 'SM-1',
                documents: [],
                tenure: 24,
                obligation: 500,
            };

            await createLoanCase(newCase);
            await fetchCases(); // Refresh the list
            alert('Case created successfully!');
        } catch (err) {
            alert('Failed to create case: ' + (err instanceof Error ? err.message : 'Unknown error'));
        }
    };

    const handleUpdateCase = async (id: string) => {
        try {
            await updateLoanCase(id, {
                status: 'Approved',
                approvedAmount: 50000,
                roi: 8.5,
            });
            await fetchCases(); // Refresh the list
            alert('Case updated successfully!');
        } catch (err) {
            alert('Failed to update case: ' + (err instanceof Error ? err.message : 'Unknown error'));
        }
    };

    const handleDeleteCase = async (id: string) => {
        if (!confirm('Are you sure you want to delete this case?')) return;

        try {
            await deleteLoanCase(id);
            await fetchCases(); // Refresh the list
            alert('Case deleted successfully!');
        } catch (err) {
            alert('Failed to delete case: ' + (err instanceof Error ? err.message : 'Unknown error'));
        }
    };

    if (loading) {
        return (
            <div className="p-8">
                <p>Loading cases...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <p className="text-red-600">Error: {error}</p>
                <button
                    onClick={fetchCases}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Supabase Integration Example</h1>

            <div className="mb-4">
                <button
                    onClick={handleCreateCase}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mr-2"
                >
                    Create Test Case
                </button>
                <button
                    onClick={fetchCases}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Refresh
                </button>
            </div>

            <div className="mb-4">
                <p className="text-gray-600">Total Cases: {cases.length}</p>
            </div>

            <div className="space-y-4">
                {cases.slice(0, 10).map((loanCase) => (
                    <div key={loanCase.id} className="border p-4 rounded">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold">{loanCase.applicantName}</h3>
                                <p className="text-sm text-gray-600">ID: {loanCase.id}</p>
                                <p className="text-sm">
                                    Amount: ₹{loanCase.loanAmount.toLocaleString()} |
                                    Type: {loanCase.loanType} |
                                    Status: {loanCase.status}
                                </p>
                            </div>
                            <div className="space-x-2">
                                <button
                                    onClick={() => handleUpdateCase(loanCase.id)}
                                    className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleDeleteCase(loanCase.id)}
                                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {cases.length > 10 && (
                <p className="mt-4 text-gray-600">
                    Showing 10 of {cases.length} cases
                </p>
            )}
        </div>
    );
}
