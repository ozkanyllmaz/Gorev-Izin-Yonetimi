import React, { useState, useEffect } from "react";
import { baseUrl } from "../../api";
import { useNavigate } from "react-router-dom";

const TaskList = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const statusLabels = {
        Pending: 'Bekliyor',
        InProgress: 'Devam Ediyor',
        Completed: 'Tamamlandı',
        Cancelled: 'İptal Edildi'
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
        InProgress: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
                className="w-5 h-5 inline-block mr-1 text-blue-500">
                <path strokeLinecap="round" strokeLinejoin="round"
                    d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
            </svg>
        ),
        Completed: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
                className="w-5 h-5 inline-block mr-1 text-green-500">
                <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
        ),
        Cancelled: (
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
        InProgress: "bg-blue-100 text-blue-800",
        Completed: "bg-green-100 text-green-800",
        Cancelled: "bg-red-100 text-red-800"
    };


    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await fetch(`${baseUrl}/UserTask/MyTasks`, {
                    credentials: 'include' // Cookie ile giris yapilmissa session verisini tasir
                });

                if (response.status === 401) {
                    alert('Oturumunuz sona ermiş veya yetkiniz yok. Lütfen giriş yapın.');
                    navigate('/login');
                    return;
                }

                if (response.ok) {
                    const data = await response.json(); //tum task nesnelerini alir
                    setTasks(data);
                } else {
                    console.error("Gorevler alinamadi");
                }
            } catch (error) {
                console.error("Hata oluştu", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [navigate]);

    const handleCreate = async () => {
        navigate('/tasks/create');
    };


    const handleDelete = async (taskId) => {
        const confirmed = window.confirm('Görevi silmek istediğinizden emin misiniz?');
        if (!confirmed) return;

        try {
            const response = await fetch(`${baseUrl}/UserTask/${taskId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                alert('Görev silindi');
                setTasks(tasks.filter((t) => t.id !== taskId)); //listeyi guncelle
            } else {
                alert('Silme işlemi başarısız');
            }
        } catch (error) {
            console.error('Silme hatası: ', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (taskId) => {
        navigate(`/tasks/edit/${taskId}`);
    };


    if (loading) {
        return <div>Yükleniyor...</div>
    }

    return (
        <div className="min-h-screen bg-indigo-50 p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Görev Listesi</h2>
                <button
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                    onClick={handleCreate}
                >
                    ✚ Görev Oluştur
                </button>
            </div>

            {tasks.length === 0 ? (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="flex flex-col items-center justify-center h-96 text-gray-600 bg-white rounded-2xl shadow-2xl max-w-md px-20">
                        <img src='Add tasks-pana.svg' alt="Boş" className="w-80 h-60 mb-4" />
                        <p className="font-bold text-gray-600">Henüz görev eklemediniz.</p>
                    </div>
                </div>

            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {tasks.map((task) => (
                        <div
                            key={task.id}
                            className=" bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between border border-gray-200 hover:shadow-2xl transition-shadow"
                        >
                            <div className="space-y-3">
                                <h3 className="text-2xl font-semibold text-gray-800">{task.title}</h3>

                                <p className="text-gray-700">{task.description}</p>

                                <div className="text-gray-600">
                                    <p>
                                        <strong>Başlangıç:</strong>{" "}
                                        {new Date(task.startDate).toLocaleDateString('tr-TR')}
                                    </p>
                                    <p>
                                        <strong>Bitiş:</strong>{" "}
                                        {new Date(task.endDate).toLocaleDateString('tr-TR')}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <strong>Durum:</strong>
                                    <span
                                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${statusStyles[task.status]}`}
                                    >
                                        {statusIcons[task.status]}
                                        {statusLabels[task.status]}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    className="text-blue-600 hover:text-blue-800 transition-colors"
                                    onClick={() => handleUpdate(task.id)}
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
                                    className="text-red-600 hover:text-red-800 transition-colors"
                                    onClick={() => handleDelete(task.id)}
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


        </div>
    );



};

export default TaskList;