import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { baseUrl } from '../../api';
import ManagerPanel from '../Admin/ManagerPanel';

const Header = () => {
    const navigate = useNavigate();
    const userRole = localStorage.getItem('role')
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);



    const handleLogOut = async () => {
        try {
            const response = await fetch(`${baseUrl}/Auth/Logout`, {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                const confirmed = window.confirm('⚠️ Çıkış yapmak istediğinize emin misiniz? Oturumunuz sonlandırlacaktır. ');
                if (!confirmed) return;
                localStorage.clear();
                navigate('/login', { replace: true }); //login sayfasına yonlendirir
            } else {
                alert('❌ Çıkış yapılamadi');
            }
        } catch (error) {
            console.error('logout hatası :', error);
            alert('⚠️ Bir hata oluştu');
        }
    };

    const handleTasks = async () => {
        navigate('/tasks');
    };

    const handleLeaves = async () => {
        navigate('/leaves');
    };

    const handleAdminPanel = async () => {
        navigate('/admin-panel')
    };

    const handleManagerPanel = async () => {
        navigate('/manager-panel')
    };

    const handleTaskReports = () => {
        navigate('/reports/tasks');
        setIsDropdownOpen(false);
    };

    const handleLeaveReports = () => {
        navigate('/reports/leaves');
        setIsDropdownOpen(false);
    };

    const handleUserReports = () => {
        navigate('/reports/users');
        setIsDropdownOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isDropdownOpen && !event.target.closest('.dropdown-container')) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        }

    }, [isDropdownOpen]);

    return (
        <header className='sticky top-0 z-50 px-10 py-3 flex justify-between items-center bg-gradient-to-l from-sky-400 via-indigo-400 to-indigo-600 shadow-xl '>
            <div className='flex items-center gap-8'>
                {/**Görevler kismi herkese acik */}
                {userRole !== null && (
                    <span className='text-white font-semibold text-xl cursor-pointer hover:scale-125 duration-300 ' onClick={handleTasks}>Görevler</span>
                )}
                {/**Izinler sadece Admin disindaki herkes icin gosterilir */}
                {(userRole === 'Manager' || !userRole || userRole === 'User') && (
                    <>
                        <span className='text-white font-semibold text-xl cursor-pointer hover:scale-125 duration-300' onClick={handleLeaves}>İzinler</span>
                    </>
                )}

                {/** Manager panel sadece manager icin gosterilir */}
                {userRole === 'Manager' && (
                    <span className='text-white font-semibold text-xl cursor-pointer hover:scale-110 duration-500' onClick={handleManagerPanel}>Manager Panel</span>
                )}

                {/**Admin Panel */}
                {userRole === 'Admin' && (
                    <span onClick={handleAdminPanel} className='text-white font-semibold text-xl cursor-pointer hover:scale-110 duration-500'>Admin Panel</span>
                )}

                {/**Admin ve Manager icin gorulebilir */}
                {userRole !== 'User' && (

                    <div className='relative dropdown-container'>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className='text-white font-semibold text-xl cursor-pointer hover:scale-110 duration-700 flex items-center gap-1'>
                            Raporlar
                            <span className={`transition-transform duration-200 ${!isDropdownOpen ? '-rotate-90 ' : ''}`}>
                                <img src='/icons8-expand-arrow-50.png' className='h-6 w-6 mr-1 text-white'></img>
                            </span>
                        </button>

                        {isDropdownOpen && (
                            <div className='absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50'>
                                <button
                                    onClick={handleTaskReports}
                                    className='w-full text-left px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors font-medium'
                                >Görevler
                                </button>
                                <button
                                    onClick={handleLeaveReports}
                                    className='w-full text-left px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors font-medium'>
                                    İzinler
                                </button>
                                <button
                                    onClick={handleUserReports}
                                    className='w-full text-left px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors font-medium'>
                                    Çalışanlar
                                </button>
                            </div>
                        )}
                    </div>
                )}

            </div>
            <div className='flex items-center gap-3' >
                <button className="font-semibold py-1 px-3 rounded bg-white  hover:bg-indigo-600 hover:text-white transition-colors"
                    onClick={handleLogOut}>Çıkış Yap</button>
            </div>
        </header >
    );
};

export default Header;