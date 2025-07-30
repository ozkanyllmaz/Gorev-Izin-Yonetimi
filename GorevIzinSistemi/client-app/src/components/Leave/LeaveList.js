import React, { useState, useEffect } from "react";
import { baseUrl } from "../../api";
import { useNavigate, useLocation } from "react-router-dom";

const LeaveList = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();//location degisimlerini dinlemek icin

    const statusLabels = {
        Pending: 'Bekliyor',
        Approved: 'Onaylandı',
        Rejected: 'Reddedildi'
    };

    const leaveTypeLabels = {
        Annual: 'Yıllık',
        Sick: 'Hastalık',
        Maternity: 'Doğum',
        Unpaid: 'Ücretsiz İzin',
        Bereavement: 'Yas',
        Study: 'Çalışma'
    };

    const statusIcons = {
        Pending: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
                className="w-5 h-5 inline-block mr-1 text-yellow-500">
                <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
        ),
        Approved: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
                className="w-5 h-5 inline-block mr-1 text-green-500">
                <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
        ),
        Rejected: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
                className="w-5 h-5 inline-block mr-1 text-red-500">
                <path strokeLinecap="round" strokeLinejoin="round"
                    d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
        )
    };

    const statusStyles = {
        Pending: "bg-yellow-100 text-yellow-800",
        Approved: "bg-green-100 text-green-800",
        Rejected: "bg-red-100 text-red-800"
    };

    const fetchLeaves = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${baseUrl}/Leave/MyLeaves`, {
                credentials: 'include',
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });

            if (response.status === 401) {
                alert('Oturumunuz sona ermiş veya yetkiniz yok. Lütfen giriş yapın.');
                navigate('/login');
                return;
            }

            if (response.ok) {
                const data = await response.json();
                setLeaves(data);
            } else {
                console.error('İzinler alınamadı');
            }
        } catch (error) {
            alert('Hata oluştu:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaves();

    }, [navigate, location.pathname]);

    const handleCreate = async () => {
        navigate('/leaves/create');
    };

    const handleUpdate = async (leaveId) => {
        //console.log('leaveId: ', leaveId);
        navigate(`/leaves/edit/${leaveId}`);
    };

    const handleDelete = async (leaveId) => {
        const confirmed = window.confirm('⚠️ İzni silmek istediğine emin misin?');
        if (!confirmed) return;

        try {
            const response = await fetch(`${baseUrl}/Leave/${leaveId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (response.ok) {
                alert('✅ Görev silindi.');
                setLeaves(leaves.filter((l) => l.id !== leaveId)) //listeyi güncelle
            } else {
                alert('❌ Silme işlemi başarısız.');
            }
        } catch (error) {
            console.error('Silme hatası oluştu:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div>Yükleniyor...</div>
    }

    return (
        <div className="min-h-screen p-8 bg-indigo-50">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">İzinler</h2>
                <button onClick={handleCreate} className="bg-blue-500 text-white py-2 px-3 rounded hover:bg-blue-600"> ✚ İzin Oluştur</button>
            </div>

            {leaves.length === 0 ? (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="flex flex-col items-center justify-center h-96 text-gray-600 bg-white rounded-2xl shadow-2xl max-w-md px-20">
                        <img src='No data-pana.svg' alt="Boş" className="w-80 h-60 mb-4" />
                        <p className="font-bold text-gray-600">Henüz bir izin talebiniz bulunmamaktadır.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {leaves.map((leave) => (
                        <div key={leave.id} className="bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between border border-gray-200 hover:shadow-2xl transition-shadow">
                            <div className="space-y-3">
                                <div>
                                    <strong className="text-xl">İzin Tipi: </strong>
                                    <span className="text-gray-700 text-xl font-semibold">{leaveTypeLabels[leave.leaveType]}</span>
                                </div>
                                <p className="text-gray-700">{leave.description}</p>
                                <div>
                                    <p>
                                        <strong>Başlangıç:</strong>{" "}
                                        {new Date(leave.startDate).toLocaleDateString('tr-TR')}
                                    </p>
                                    <p>
                                        <strong>Bitiş:</strong>{" "}
                                        {new Date(leave.endDate).toLocaleDateString('tr-TR')}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <strong>Durum:</strong>{" "}
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-semibold ${statusStyles[leave.statusType]}`}>
                                        {statusIcons[leave.statusType]}
                                        {statusLabels[leave.statusType]}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    className={`text-blue-600 hover:text-blue-800 transition-colors ${leave.managerResponseStatus !== 'Pending' || leave.statusType !== 'Pending' ? 'cursor-not-allowed text-gray-400 hover:text-gray-400' : 'cursor-pointer'}`}
                                    disabled={leave.managerResponseStatus !== 'Pending' || leave.statusType !== 'Pending'}
                                    onClick={() => handleUpdate(leave.id)}
                                    title="Güncelle"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="w-5 h-5"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                                        />
                                    </svg>
                                </button>
                                <button
                                    className="text-red-500 hover:text-red-700 transition-colors"
                                    onClick={() => handleDelete(leave.id)}
                                    title="Sil"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="w-5 h-5"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div >
    );

};

export default LeaveList;