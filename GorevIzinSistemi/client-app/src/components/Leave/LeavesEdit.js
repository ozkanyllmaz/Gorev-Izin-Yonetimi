import React, { useState, useEffect } from 'react';
import { baseUrl } from '../../api';
import { useNavigate, useParams } from 'react-router-dom';

const LeavesEdit = () => {
    const { leaveId } = useParams(); // url'den gelen izin id sini alır.
    const navigate = useNavigate();
    const [leave, setLeave] = useState(null);
    const [form, setForm] = useState({
        leaveType: '',
        description: '',
        startDate: '',
        endDate: '',
    });

    const leaveTypeLabels = {
        Annual: 'Yıllık',
        Sick: 'Hastalık',
        Maternity: 'Doğum',
        Unpaid: 'Ücretsiz İzin',
        Bereavement: 'Yas',
        Study: 'Çalışma'
    };

    useEffect(() => {
        const fetchLeaves = async () => {
            try {
                const response = await fetch(`${baseUrl}/Leave/${leaveId}`, {
                    credentials: 'include',
                    headers: {
                        'Cache-Control': 'no-cache'
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setLeave(data);
                    setForm({
                        leaveType: data.leaveType,
                        description: data.description,
                        startDate: data.startDate.substring(0, 10),
                        endDate: data.endDate.substring(0, 10),
                    });
                } else {
                    alert('İzin bulunamadı');
                    navigate('/leaves');
                }
            } catch (error) {
                console.error("Hata:", error);
                navigate('/leaves');
            }
        }

        if (leaveId) {
            fetchLeaves();
        }
    }, [leaveId, navigate]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${baseUrl}/Leave/${leaveId}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                body: JSON.stringify(form)
            });

            if (response.ok) {
                //alert('✅ Görev başarıyla güncellendi.');
                navigate('/leaves', { replace: true });

            } else {
                const errorText = await response.text();
                alert(`❌ Güncellenem başarısız. Hata:  ${errorText}`);
            }
        } catch (error) {
            console.error("Güncelleme hatası:", error);
            alert('Güncelleme sırasında hata oluştu');
        }
    };

    if (!leave) return <div>Yükleniyor...</div>


    return (
        <div className='flex items-center justify-center min-h-screen bg-indigo-50'>
            <div className='bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md'>
                <h2 className='text-xl font-bold text-center mb-4'>🔄 İzin Güncelle</h2>
                <form onSubmit={handleSubmit} className='space-y-4'>
                    <div>
                        <label className='block font-medium mb-1'>İzin Tipi:</label>
                        <select
                            className='w-full border border-gray-300 rounded px-3 py-2 '
                            name='leaveType'
                            value={form.leaveType}
                            onChange={handleChange}>
                            {Object.entries(leaveTypeLabels).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className='block font-medium mb-1'>Açıklama:</label>
                        <textarea
                            className='w-full border border-gray-300 rounded px-3 py-2'
                            name='description' value={form.description}
                            onChange={handleChange}
                        ></textarea>
                    </div>
                    <div className='flex items-center justify-between mb-6'>
                        <div>
                            <label className='block font-medium mb-1'>Başlangıç Tarihi:</label>
                            <input
                                className='w-full border border-gray-300 rounded px-3 py-2'
                                type='date'
                                name='startDate'
                                value={form.startDate}
                                onChange={handleChange}></input>
                        </div>
                        <div>
                            <label className='block font-medium mb-1'>Bitiş Tarihi:</label>
                            <input
                                className='w-full border border-gray-300 rounded px-3 py-2'
                                type='date'
                                name='endDate'
                                value={form.endDate}
                                onChange={handleChange}></input>
                        </div>
                    </div>
                    <div>
                        <button
                            type='submit'
                            className='w-full border rounded-3xl mt-4 mb-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-3 py-2 transition-colors duration-200'>Güncelle</button>
                    </div>
                </form>
            </div>
        </div>
    );

};

export default LeavesEdit;