import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { baseUrl } from '../../api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate(); // useNavigate hook'u ekledik

    const handleLogin = async (e) => {
        e.preventDefault();

        const response = await fetch(`${baseUrl}/Auth/Login`, {
            method: 'POST',
            credentials: 'include', //Cookie icin gerekli
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();



        if (response.ok) {
            //console.log("Giriş yapan kullanıcı bilgileri:", data);

            if (data.user?.role === "Admin") {
                localStorage.setItem('role', data.user.role);
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/admin-panel', { replace: true });
            } else if (data.user?.role === "Manager") {
                localStorage.setItem('role', data.user.role);
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/manager-panel', { replace: true });
            } else if (data.user?.role === "User") {
                localStorage.setItem('role', data.user.role);
                localStorage.setItem('user', JSON.stringify(data.user));
                //console.log("data", data);
                navigate('/tasks', { replace: true }); //anasayfaya yonlendirir
            }
        } else {
            //const errorText = await response.text;
            alert('❌ Giriş başarısız! E-posta veya şifre hatalı.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-blue-400" >
            {/* Üstteki başlık */}
            <h1 className="absolute top-12 text-4xl font-extrabold text-white drop-shadow-md text-center mt-10">
                Görev İzin Yönetimi Uygulaması
            </h1>
            <div className='bg-white p-8 rounded-lg shadow-2xl w-full max-w-md'>
                <h2 className='text-2xl font-bold text-center text-gray-800 mb-2'>Giriş Yap</h2>
                <p className='text-center font-bold text-gray-600 mb-6'>Görevlerinizi yönetin ve takip edin</p>
                <form onSubmit={handleLogin} className='space-y-4'>
                    <input
                        type="email"
                        placeholder="E-Posta"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className='w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />

                    <input
                        type="password"
                        placeholder='Şifre'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className='w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />

                    <button type="submit" className='w-full bg-blue-600 text-white py-2 rounded-3xl hover:bg-blue-700 transition'>Giriş Yap</button>
                </form>
                {/*Register sayfasina gecis linki */}
                <p className='mt-4 text-center text-sm text-gray-600'>Hesabınız yok mu?{" "}
                    <span onClick={() => navigate('/register')}
                        className='text-blue-600 hover:underline cursor-pointer'>
                        Kayıt ol
                    </span>
                </p>
            </div>
        </div>
    );

};

export default Login;