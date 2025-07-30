import React, { useState } from "react";
import { baseUrl } from "../../api";
import { useNavigate } from "react-router-dom";

const TaskCreate = () => {
    const navigate = useNavigate();

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

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); //spa olduğunda dolayı sadece yaptığım işlemler güncellenir. Tum html sayfasi güncellenmez.

        const start = new Date(form.startDate);
        const end = new Date(form.endDate);

        if (end < start) {
            alert('⚠️ Bitiş tarihi başlangıc tarihinden önce olamaz.');
            return;
        }

        try {
            const response = await fetch(`${baseUrl}/UserTask`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(form)
            });

            if (response.ok || response.status === 201) {
                alert('✅ Görev başarıyla eklendi');
                navigate('/tasks');
            } else {
                const errorText = await response.text;
                alert('❌ Görev eklenemedi. Hata:', errorText);
            }
        } catch (error) {
            console.error("İstek Hatası:", error);
            alert('Sunucuya ulaşılamadı');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-indigo-50">
            <div className="bg-white shadow-2xl rounded-xl p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">📝 Görev Oluşturma</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block font-medium mb-1">Başlık:</label>
                        <input type="text" name="title" value={form.title} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
                    </div>
                    <div>
                        <label className="block font-medium mb-1">Açıklama:</label>
                        <textarea name="description" value={form.description} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
                    </div>
                    <div>
                        <label className="block font-medium mb-1">Başlangıç Tarihi:</label>
                        <input type="date" name="startDate" value={form.startDate} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
                    </div>
                    <div>
                        <label className="block font-medium mb-1">Bitiş Tarihi:</label>
                        <input type="date" name="endDate" value={form.endDate} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
                    </div>
                    <div>
                        <label className="block font-medium mb-1">Durum:</label>
                        <select className="w-full border border-gray-300 rounded px-3 py-2" name="status" value={form.status} onChange={handleChange}>
                            {Object.entries(statusLabels).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <button className="w-full bg-blue-500 text-white py-2 rounded-3xl hover:bg-blue-600 transition-colors mt-4 mb-6" type="submit">Görev Oluştur</button>
                    </div>
                </form>
            </div>
        </div>
    );

};

export default TaskCreate;

