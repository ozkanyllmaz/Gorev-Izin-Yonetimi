import React, { useState } from "react";
import { baseUrl } from "../../api";
import { useNavigate } from "react-router-dom";

const LeaveCreate = () => {
    const navigate = useNavigate();
    const [errorText, setErrorText] = useState('');

    const [form, setForm] = useState({
        leaveType: '',
        description: '',
        startDate: '',
        endDate: ''
    });

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

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const start = new Date(form.startDate);
        const end = new Date(form.endDate);

        //tarih kontrolu
        if (end < start) {
            alert('⚠️ Bitiş tarihi başlangıc tarihinden önce olamaz.');
            return;
        }

        const role = localStorage.getItem('role');
        const endpoint = role === 'Manager' ? `${baseUrl}/Leave/Manager` : `${baseUrl}/Leave`;

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(form)
            });

            if (response.ok || response.status === 201) {
                alert('✅ İzin başarıyla eklendi.');
                navigate('/leaves');
            } else {
                const errorJson = await response.json();
                alert(`❌ İzin oluşturulamadı. Hata: ${errorJson.message}`);
            }
        } catch (error) {
            console.error('İstek hatası oluştu:', error);
            alert('Sunucuya ulaşılamadı');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-indigo-50">
            <div className="bg-white shadow-2xl rounded-xl p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">✍ İzin Oluştur</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block font-medium mb-1">İzin Tipi:</label>
                        <select className="w-full border rounded border-gray-300 px-3 py-2" name="leaveType" value={form.leaveType} onChange={handleChange} required >
                            <option value="" disabled hidden>--Lütfen bir izin tipi seçin --</option>
                            {Object.entries(leaveTypeLabels).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block font-medium mb-1">Açıklama:</label>
                        <textarea className="w-full border rounded border-gray-300 px-3 py-2" name="description" value={form.description} onChange={handleChange} required />
                    </div>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <label className="block font-medium mb-1">Başlangıç Tarihi:</label>
                            <input className="w-full border border-gray-300 rounded px-3 py-2" type="date" name="startDate" value={form.startDate} onChange={handleChange} required></input>
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Bitiş Tarihi:</label>
                            <input className="w-full border border-gray-300 rounded px-3 py-2" type="date" name="endDate" value={form.endDate} onChange={handleChange} required></input>
                        </div>
                    </div>
                    <div>
                        <button className="w-full border border-gray-300 rounded-3xl bg-blue-500 text-white hover:bg-blue-600 py-2 transition-colors duration-200 mt-4 mb-6" type="submit">İzin Al</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LeaveCreate;