import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';
import { Button } from 'primereact/button';
import { Paperclip } from 'lucide-react';
import { fetchGet } from '../../utils/fetch.utils';

export default function LiveTracking() {
    const { id } = useParams();
    const [expense, setExpense] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchExpense = async () => {
        try {
            const res = await fetchGet({ pathName: `employee/tracking/${id}` });
            if (res.success) setExpense(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpense();
        const interval = setInterval(fetchExpense, 5000); // live update every 5 sec
        return () => clearInterval(interval);
    }, [id]);

    if (loading) return <PageLayout><p className="p-5 text-center text-gray-500">Loading...</p></PageLayout>;
    if (!expense) return <PageLayout><p className="p-5 text-center text-red-500">Expense not found</p></PageLayout>;

    const isImage = (filename) => {
        return /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
    };

    return (
        <PageLayout>
            <div className="container p-5">
                <div className="flex items-center gap-1 mb-5">
                    <Button
                        icon={<i className="pi pi-angle-left text-3xl text-primary" />}
                        rounded
                        text
                        aria-label="Back"
                        className="focus:outline-none focus:ring-0"
                        onClick={() => window.history.back()}
                    />
                    <h1 className="text-3xl font-bold text-primary">Expense Tracking</h1>
                </div>
                <div className="ml-9 bg-gradient-to-br from-white via-gray-50 to-white p-6 rounded shadow hover:shadow-xl transition-shadow duration-300">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
                        <div className="space-y-1">
                            <p className="text-sm text-gray-500 font-semibold">Title</p>
                            <p className="font-medium">{expense.title}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-gray-500 font-semibold">Paid By</p>
                            <p className="font-medium">{'Romil'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-gray-500 font-semibold">Amount</p>
                            <p className="font-medium">{expense.amount} {expense.currency}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-gray-500 font-semibold">Date</p>
                            <p className="font-medium">{new Date(expense.date).toLocaleDateString()}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-gray-500 font-semibold">Category</p>
                            <p className="font-medium">{expense.category}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-gray-500 font-semibold">Status</p>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold
                                ${expense.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                    expense.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'}`}>
                                {expense.status}
                            </span>
                        </div>
                        <div className="sm:col-span-2 space-y-1">
                            <p className="text-sm text-gray-500 font-semibold">Remarks</p>
                            <p className="font-medium">{expense.remarks}</p>
                        </div>
                        <div className="sm:col-span-2 space-y-1">
                            <p className="text-sm text-gray-500 font-semibold">Description</p>
                            <p className="font-medium">{expense.description}</p>
                        </div>
                    </div>
                    {expense.receipt && (
                        <div className="mt-6">
                            <h4 className="text-base font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <Paperclip size={20} /> Uploaded Document
                            </h4>
                            <div className="flex flex-wrap gap-3">
                                <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded shadow-sm">
                                    <span className="truncate max-w-xs text-gray-700">
                                        {typeof expense.receipt === 'string'
                                            ? expense.receipt.split('/').pop()
                                            : expense.receipt.name}
                                    </span>
                                    <a
                                        href={expense.receipt}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-2 py-1 text-sm bg-primary text-white rounded hover:bg-primary-hover transition-colors"
                                    >
                                        View
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                <div className="ml-9 mt-5 bg-white p-6 rounded shadow hover:shadow-xl transition-shadow duration-300">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Approvers</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approver</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Decided At</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {expense.approverDecisions.map((a, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors duration-200">
                                        <td className="px-4 py-2 whitespace-nowrap font-medium text-gray-700">{a.userId?.name}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                                ${a.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                    a.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'}`}>
                                                {a.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-gray-600">{a.comment || '-'}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-gray-500">{a.decidedAt ? new Date(a.decidedAt).toLocaleString() : '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </PageLayout>
    );
}
