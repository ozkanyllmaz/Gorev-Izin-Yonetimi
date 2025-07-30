import React, { useEffect, useState } from "react";
import { baseUrl } from "../../api";
import { useNavigate, useParams } from "react-router-dom";

const TaskEdit = () => {
    const { taskId } = useParams(); //Url'den gelen taskId yi al
    const navigate = useNavigate();
    const [task, setTask] = useState(null);
    const [form, setForm] = useState({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        status: 'Pending'
    });

    const statusLabels = {
        Pending: 'Bekliyor',
        InProgress: 'Devam Ediyor',
        Completed: 'Tamamlandı',
        Cancelled: 'İptal Edildi'
    };



    useEffect(() => {
        const fetchTask = async () => {
            try {
                //GET işlemi yapar. Form alanlarına gelen görevin bilgilerini otomatik olarak doldurur.
                const response = await fetch(`${baseUrl}/UserTask/${taskId}`, {
                    credentials: 'include'
                });
                if (response.ok) {
                    const data = await response.json();
                    setTask(data);
                    setForm({
                        title: data.title,
                        description: data.description,
                        startDate: data.startDate.substring(0, 10), //date is readable
                        endDate: data.endDate.substring(0, 10),
                        status: data.status
                    });
                } else {
                    alert('Gorev bulunamadi ??');
                    navigate('/tasks');
                }
            } catch (error) {
                console.error('Hata:', error);
            }
        };

        fetchTask();

    }, [taskId, navigate]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const response = await fetch(`${baseUrl}/UserTask/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(form)
        });

        if (response.ok) {
            alert('✅ Güncelleme başarılı');
            navigate('/tasks');
        } else {
            const errorText = await response.text;
            alert('❌ Güncelleme başarısız. Hata: ', errorText);

        }

    };

    if (!task) return <div>Yükleniyor...</div>

    return (
        <div className="flex items-center justify-center min-h-screen bg-indigo-50">
            <div className="bg-white shadow-2xl rounded-xl p-8 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-center">🔄 Görev Güncelle</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block font-medium mb-1">Başlık:</label>
                        <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block font-medium mb-1">Açıklama:</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block font-medium mb-1">Başlangıç Tarihi:</label>
                        <input
                            type="date"
                            name="startDate"
                            value={form.startDate}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block font-medium mb-1">Bitiş Tarihi:</label>
                        <input
                            type="date"
                            name="endDate"
                            value={form.endDate}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block font-medium mb-1">Durum:</label>
                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        >
                            {Object.entries(statusLabels).map(([key, label]) => (
                                <option key={key} value={key}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white py-2 rounded-3xl hover:bg-blue-600 mt-4 mb-6"
                        >
                            Güncelle
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );


};

export default TaskEdit;