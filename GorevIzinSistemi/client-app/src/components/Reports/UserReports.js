import React, { useState, useEffect } from 'react';
import { baseUrl } from '../../api';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const UserReports = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState([]);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const navigate = useNavigate();

    const [filterUser, setFilterUser] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('');
    const [filterEmail, setFilterEmail] = useState('');

    // filtre degistiginde pageNumber 1 olsun
    useEffect(() => {
        setPageNumber(1);
    }, [filterUser, filterDepartment, filterEmail])


    const handleResetFilter = () => {
        setFilterDepartment("");
        setFilterUser("");
        setFilterEmail("");
    };

    const exportToExcel = (data) => {
        const mappedData = data.map(item => ({
            "ID": item.id,
            "Departman": item.departmentName,
            "Kullanıcı": item.fullName,
            "E-Posta": item.email,
            "Rol": item.role
        }));

        const worksheet = XLSX.utils.json_to_sheet(mappedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Çalışanlar Tablosu ");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const fileData = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(fileData, "ÇalışanlarRapor.xlsx");
    };

    useEffect(() => {
        fetchData();
    }, [pageNumber, pageSize, filterDepartment, filterEmail, filterUser]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const userRole = localStorage.getItem('role');
            const userInfo = localStorage.getItem('user');

            const queryParams = new URLSearchParams({
                pageNumber: pageNumber,
                pageSize: pageSize,
                ...(filterDepartment && { filterDepartment }),
                ...(filterUser && { filterUser }),
                ...(filterEmail && { filterEmail })
            });

            if (userRole == 'User') {
                throw new Error('Bu sayfaya erişmeye yetkiniz yok');
            }

            const userRes = await fetch(`${baseUrl}/Department/users?${queryParams}`, {
                credentials: 'include'
            });


            if (!userRes.ok) {
                throw new Error('Sunucudan veri alınamadı');
            }

            const userData = await userRes.json();
            setUsers(userData);

            setUsers(userData.users || []);
            setTotalPages(userData.totalPages || 1);

            setTotalUsers(userData.totalUsers || 0);
        } catch (error) {
            alert('Veri çekilirken hata oluştu' + error);

            if (error.message.includes('401')) {
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className='p-6 min-h-screen bg-sky-50 '>
            <h1 className='text-3xl font-bold mb-6'>Çalışanlar Tablosu</h1>

            {/* Kullanıcılar Tablosu */}
            <section className='mb-10 bg-white p-6 rounded-md shadow-xl'>
                {/**filtre alanları */}
                <div className='filters mb-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4'>

                    {/**Departman */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700'>Departman</label>
                        <select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)} className='mt-1 block w-full rounded-md border border-gray-300 shadow-sm  focus:ring-blue-200 focus:outline-none text-sm'>
                            <option value=''>Hepsi</option>
                            {
                                [...new Set(users.map(u => u.departmentName))].map((dep, i) => (
                                    <option key={i} value={dep}>{dep}</option>
                                ))
                            }
                        </select>
                    </div>
                    {/**Kullanıcı */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700'>Kullanıcı</label>
                        <select value={filterUser} onChange={(e) => setFilterUser(e.target.value)} className='mt-1 block w-full rounded-md border border-gray-300 shadow-sm  focus:ring-blue-200 focus:outline-none text-sm'>
                            <option value=''>Hepsi</option>
                            {
                                [...new Set(users.map(u => u.fullName))].map((dep, i) => (
                                    <option key={i} value={dep}>{dep}</option>
                                ))
                            }
                        </select>
                    </div>
                    {/**E-Posta */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700'>E-Posta</label>
                        <select value={filterEmail} onChange={(e) => setFilterEmail(e.target.value)} className='mt-1 block w-full rounded-md border border-gray-300 shadow-sm' >
                            <option value=''>Hepsi</option>
                            {
                                [...new Set(users.map(u => u.email))].map((dep, i) => (
                                    <option key={i} value={dep}>{dep}</option>
                                ))
                            }
                        </select>
                    </div>
                </div>
                <div className='mt-1 mb-4 flex gap-4'>
                    <button onClick={handleResetFilter} className='w-40 font-medium text-sm px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-400 hover:text-white border border-gray-300 shadow-sm'>Filtreleri Sıfırla</button>
                    <button onClick={() => exportToExcel(users)} className=' w-40 border border-gray-300 rounded-md bg-green-500 text-white font-medium shadow-sm hover:bg-green-600 px-4 py-2 flex items-center gap-2'>
                        <img src="/excel.png" alt="excel" className="w-6 h-6 mr-1" />
                        Excele aktar
                    </button>
                </div>
                <table className='w-full border border-gray-300'>
                    <thead className='bg-gray-100'>
                        <tr>
                            <th className='border p-2 text-left'>ID</th>
                            <th className='border p-2 text-left'>Departman</th>
                            <th className='border p-2 text-left'>Ad Soyad</th>
                            <th className='border p-2 text-left'>E-posta</th>
                            <th className='border p-2 text-left'>Rol</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length > 0 ? (
                            users.map(user => (
                                <tr key={user.id} className='hover:bg-gray-50'>
                                    <td className='border p-2'>{user.id}</td>
                                    <td className='border p-2'>{user.departmentName}</td>
                                    <td className='border p-2'>{user.fullName}</td>
                                    <td className='border p-2'>{user.email}</td>
                                    <td className='border p-2'>{user.role}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="4" className='border p-2 text-center'>Kullanıcı bulunamadı</td></tr>
                        )}
                    </tbody>
                </table>
                <div className="flex justify-between mt-4">
                    <button
                        onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                        disabled={pageNumber === 1}
                        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                    >
                        Önceki
                    </button>
                    <span>Sayfa {pageNumber} / {totalPages} (Toplam: {totalUsers})</span>
                    <span>
                        <select
                            value={pageSize}
                            onChange={(e) => setPageSize(Number(e.target.value))}
                            className="px-4 py-2 border rounded"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </span>
                    <button
                        onClick={() => setPageNumber(prev => Math.min(prev + 1, totalPages))}
                        disabled={pageNumber === totalPages}
                        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                    >
                        Sonraki
                    </button>
                </div>
            </section>
        </div>
    );
};

export default UserReports;