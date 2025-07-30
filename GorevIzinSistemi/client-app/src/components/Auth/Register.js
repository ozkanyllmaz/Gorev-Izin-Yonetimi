import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { baseUrl } from '../../api';

const Register = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [departments, setDepartments] = useState([]);
    const [departmentId, setDepartmentId] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const res = await fetch(`${baseUrl}/Department`);
                const data = await res.json();
                setDepartments(data);
            } catch (error) {
                console.error("Bölümler alınırken bir hata oluştu:", error);
            }
        };

        fetchDepartments();

    }, []);

    const handleRegister = async (e) => {
        e.preventDefault();

        const response = await fetch(`${baseUrl}/Auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fullName, email, password, departmentId })
        });

        if (response.ok) {
            alert('✅ Kayıt başarılı! Lütfen e-posta adresinizi doğrulayın.');
            navigate('/login');
        } else {
            alert('❌ Kayıt başarısız!');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-blue-400" >
            <div className='bg-white p-8 rounded-lg shadow-2xl w-full max-w-md'>
                <h2 className='text-2xl font-bold text-center text-gray-800 mb-2'>Kayıt Ol</h2>
                <form onSubmit={handleRegister} className='space-y-4'>
                    <input
                        type='text'
                        placeholder='Ad Soyad'
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className='w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />

                    <input
                        type='email'
                        placeholder='E-Posta'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className='w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />

                    <input
                        type='password'
                        placeholder='Şifre'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className='w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />

                    <select
                        value={departmentId}
                        onChange={(e) => setDepartmentId(e.target.value)}
                        required
                        className='w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus: ring-blue-500'
                    >
                        <option value="">Bölüm Seçiniz</option>
                        {departments
                            .filter((dept) => dept.name !== "Yönetim")
                            .map((dept) => (
                                <option key={dept.id} value={dept.id}>
                                    {dept.name}
                                </option>
                            ))}
                    </select>

                    <button type='submit' className='w-full bg-blue-600 text-white py-2 rounded-3xl hover:bg-blue-700 transition'>Kayıt Ol</button>
                </form>
                {/* Login sayfasina gecis linki*/}
                <p className='mt-4 text-center text-sm text-gray-600'>
                    Zaten hesabınız var mı?{" "}
                    <span onClick={() => navigate('/login')}
                        className='text-blue-600 hover:underline cursor-pointer'>
                        Giriş Yap
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Register;