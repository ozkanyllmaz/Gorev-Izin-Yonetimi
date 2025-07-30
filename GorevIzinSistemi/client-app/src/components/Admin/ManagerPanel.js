import React, { cache, useEffect, useState, useRef } from 'react';
import { baseUrl } from '../../api';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const ManagerPanel = () => {
    const [tasks, setTasks] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tasksPageNumber, setTasksPageNumber] = useState(1);
    const [tasksPageSize, setTasksPageSize] = useState(10);
    const [tasksTotalPages, setTasksTotalPages] = useState(1);
    const [leavesPageNumber, setLeavesPageNumber] = useState(1);
    const [leavesPageSize, setLeavesPageSize] = useState(10);
    const [leavesTotalPages, setLeavesTotalPages] = useState(1);
    const [usersPageNumber, setUsersPageNumber] = useState(1);
    const [usersPageSize, setUsersPageSize] = useState(10);
    const [usersTotalPages, setUsersTotalPages] = useState(1);
    const [totalLeaves, setTotalLeaves] = useState(0);
    const [totalTasks, setTotalTasks] = useState(0);
    const [totalUsers, setTotalUsers] = useState(0);
    const [managerDepartmentId, setManagerDepartmentId] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const navigate = useNavigate();

    var scrollPositionRef = useRef(0);

    const taskStatusLabels = {
        Pending: 'Bekliyor',
        InProgress: 'Devam Ediyor',
        Completed: 'Tamamlandı',
        Cancelled: 'İptal edildi'
    };


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

    const [filterLeaveType, setFilterLeaveType] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('');
    const [filterUser, setFilterUser] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    // filtre degistiginde pageNumber 1 olsun
    useEffect(() => {
        setLeavesPageNumber(1);
    }, [filterLeaveType, filterStatus, filterDepartment, filterUser, filterStartDate, filterEndDate]);

    // Sayfalandirma degistiginde mevcut scroll konumu sakla
    const saveScrollPosition = () => {
        scrollPositionRef.current = window.scrollY;
    };

    // Render sonrasi scroll konumunu geri yukle
    useEffect(() => {
        window.scrollTo(0, scrollPositionRef.current);
    }, [tasks, leaves, users]);

    const handleResetFilter = () => {
        setFilterLeaveType("");
        setFilterStatus("");
        setFilterDepartment("");
        setFilterUser("");
        setFilterStartDate("");
        setFilterEndDate("");
    };

    const exportToExcel = (data) => {
        const mappedData = data.map(item => ({
            "İzin Türü": leaveTypeLabels[item.leaveType],
            "Durum": statusLabels[item.managerResponseStatus],
            "Departman": item.departmentName,
            "Kullanıcı": item.userFullName,
            "Başlangıç Tarihi": new Date(item.startDate).toLocaleDateString('tr-TR'),
            "Bitiş Tarihi": new Date(item.endDate).toLocaleDateString('tr-TR'),
            "Açıklama": item.description
        }));

        const worksheet = XLSX.utils.json_to_sheet(mappedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "İzinler");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const fileData = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(fileData, "izinler.xlsx");
    };

    useEffect(() => {
        fetchData();
    }, [tasksPageNumber, tasksPageSize, leavesPageNumber, leavesPageSize, usersPageNumber, usersPageSize, filterLeaveType,
        filterStatus, filterDepartment, filterUser, filterStartDate, filterEndDate, leavesPageSize]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const userRole = localStorage.getItem('role');
            const userInfo = localStorage.getItem('user');

            //Filtre parametrelerini kosullu olarak ekle
            const queryParams = new URLSearchParams({
                pageNumber: leavesPageNumber,
                pageSize: leavesPageSize,
                ...(filterLeaveType && { filterLeaveType }),
                ...(filterStatus && { filterStatus }),
                ...(filterDepartment && { filterDepartment }),
                ...(filterUser && { filterUser }),
                ...(filterStartDate && { filterStartDate }),
                ...filterEndDate && { filterEndDate }
            });

            if (userRole !== 'Manager') {
                throw new Error('Bu sayfaya erişim yetkiniz yok');
            }

            const [tasksRes, leavesRes, usersRes] = await Promise.all([
                fetch(`${baseUrl}/Department/tasks?pageNumber=${tasksPageNumber}&pageSize=${tasksPageSize}`, { credentials: 'include' }),
                fetch(`${baseUrl}/Department/leaves?${queryParams}`, { credentials: 'include' }),
                fetch(`${baseUrl}/Department/users?pageNumber=${usersPageNumber}&pageSize=${usersPageSize}`, { credentials: 'include' })
            ]);

            if (!tasksRes.ok || !leavesRes.ok || !usersRes.ok) {
                throw new Error('Sunucudan veri alınamadı');
            }

            const tasksData = await tasksRes.json();
            const leavesData = await leavesRes.json();
            const usersData = await usersRes.json();


            setLeaves(leavesData.leaves || []);
            setLeavesTotalPages(leavesData.totalPages || 1);

            setTasks(tasksData.tasks || []);
            setTasksTotalPages(tasksData.totalPages || 1);

            setUsers(usersData.users || []);
            setUsersTotalPages(usersData.totalPages || 1);

            setTotalLeaves(leavesData.totalLeaves || 0);
            setTotalTasks(tasksData.totalTasks || 0);
            setTotalUsers(usersData.totalUsers || 0);

        } catch (error) {
            alert('Veri çekilirken hata oluştu: ' + error);
            //setError(error.message);

            // Eğer authentication hatası varsa login'e yönlendir
            if (error.message.includes('401') || error.message.includes('yetkiniz yok')) {
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (leaveId) => {
        setActionLoading(true);
        try {
            const res = await fetch(`${baseUrl}/Leave/manager-approved/${leaveId}`, {
                method: 'PUT',
                credentials: 'include',
            });

            if (!res.ok) throw new Error('Onaylama işlemi başarısız');
            alert('✅ İzin onaylandı');
            setLeavesPageNumber(1); // onaylama sonrasi 1. sayfaya don
            fetchData(); //listeyi gunceller
        } catch (error) {
            alert(error.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (leaveId) => {
        setActionLoading(true);
        try {
            const res = await fetch(`${baseUrl}/Leave/manager-rejected/${leaveId}`, {
                method: 'PUT',
                credentials: 'include',
            });

            if (!res.ok) throw new Error('Sunucuya erişilemedi');
            alert('❎ İzin reddedildi');
            setLeavesPageNumber(1); // onaylama sonrasi 1. sayfaya don
            fetchData(); //listeyi gunceller
        } catch (error) {
            alert(error.message);
        } finally {
            setActionLoading(false);
        }
    };


    return (
        <div className='p-6 bg-sky-50 min-h-screen'>
            <h1 className='text-3xl font-bold mb-6'>Manager Panel</h1>

            {/**Gorevler Tablosu */}
            <section className='mb-10 bg-white p-6 rounded-md shadow-xl'>
                <h2 className='text-xl font-semibold mb-4'>Görevler</h2>
                <table className='w-full border border-gray-300 '>
                    <thead className='bg-gray-100'>
                        <tr>
                            <th className='border p-2 text-left'>Başlık</th>
                            <th className='border p-2 text-left'>Durum</th>
                            <th className='border p-2 text-left'>Departman</th>
                            <th className='border p-2 text-left'>Kullanıcı</th>
                            <th className='border p-2 text-left'>Başlangıç</th>
                            <th className='border p-2 text-left'>Bitiş</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks && tasks.length > 0 ? (
                            tasks.map(task => (
                                <tr key={task.id} className='hover:bg-gray-50'>
                                    <td className='border p-2'>{task.title}</td>
                                    <td className='border p-2'>{taskStatusLabels[task.status]}</td>
                                    <td className='border p-2'>{task.departmentName || '-'}</td>
                                    <td className='border p-2'>{task.userFullName}</td>
                                    <td className='border p-2'>{new Date(task.startDate).toLocaleDateString('tr-TR')}</td>
                                    <td className='border p-2'>{new Date(task.endDate).toLocaleDateString('tr-TR')}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="7" className='border p-2 text-center'>Görevler bulunamadı</td></tr>
                        )}
                    </tbody>
                </table>
                <div className="flex justify-between mt-4">
                    <button
                        onClick={() => {
                            saveScrollPosition();
                            setTasksPageNumber(prev => Math.max(prev - 1, 1))
                        }}
                        disabled={tasksPageNumber === 1}
                        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                    >
                        Önceki
                    </button>
                    <span>Sayfa {tasksPageNumber} / {tasksTotalPages}   (Toplam: {totalTasks})</span>
                    <span>
                        <select
                            value={tasksPageSize}
                            onChange={(e) => {
                                setTasksPageNumber(1);
                                setTasksPageSize(Number(e.target.value));
                            }}
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
                        onClick={() => {
                            saveScrollPosition();
                            setTasksPageNumber(prev => Math.min(prev + 1, tasksTotalPages))
                        }}
                        disabled={tasksPageNumber === tasksTotalPages}
                        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                    >
                        Sonraki
                    </button>
                </div>
            </section>

            {/* İzinler Tablosu */}
            <section className='mb-10 bg-white p-6 rounded-md shadow-xl'>
                <h2 className='text-xl font-semibold mb-4'>İzinler</h2>
                {/**filtre alanları */}
                <div className='filters mb-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4'>
                    {/**Izin Turu */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700'>İzin Türü</label>
                        <select value={filterLeaveType} onChange={(e) => {
                            saveScrollPosition();
                            setFilterLeaveType(e.target.value);
                        }} className='mt-1 border border-gray-300 rounded-md w-full block shadow-sm focus:ring-blue-200 focus:outline-none text-sm'>
                            <option value=''>Hepsi</option>
                            <option value='Annual'>Yıllık</option>
                            <option value='Sick'>Hastalık</option>
                            <option value='Maternity'>Doğum</option>
                            <option value='Unpaid'>Ücretsiz</option>
                            <option value='Bereavement'>Yas</option>
                            <option value='Study'>Çalışma</option>
                        </select>
                    </div>
                    {/**Durum */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700'>Durum</label>
                        <select value={filterStatus} onChange={(e) => {
                            saveScrollPosition();
                            setFilterStatus(e.target.value);
                        }} className='mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:ring-blue-200 focus:outline-none text-sm'>
                            <option value=''>Hepsi</option>
                            <option value='Pending'>Bekliyor</option>
                            <option value='Approved'>Onaylandı</option>
                            <option value='Rejected'>Reddedildi</option>
                        </select>
                    </div>
                    {/**Departman */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700'>Departman</label>
                        <select value={filterDepartment} onChange={(e) => {
                            saveScrollPosition();
                            setFilterDepartment(e.target.value);
                        }} className='mt-1 block w-full rounded-md border border-gray-300 shadow-sm  focus:ring-blue-200 focus:outline-none text-sm'>
                            <option value=''>Hepsi</option>
                            {
                                [...new Set(leaves.map(l => l.departmentName))].map((dep, i) => (
                                    <option key={i} value={dep}>{dep}</option>
                                ))
                            }
                        </select>
                    </div>
                    {/**Kullanıcı */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700'>Kullanıcı</label>
                        <select value={filterUser} onChange={(e) => {
                            saveScrollPosition();
                            setFilterUser(e.target.value);
                        }} className='mt-1 block w-full rounded-md border border-gray-300 shadow-sm  focus:ring-blue-200 focus:outline-none text-sm'>
                            <option value=''>Hepsi</option>
                            {
                                [...new Set(leaves.map(l => l.userFullName))].map((dep, i) => (
                                    <option key={i} value={dep}>{dep}</option>
                                ))
                            }
                        </select>
                    </div>
                    {/**Tarih aralığı */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700'>Başlangıç Tarihi</label>
                        <input type='date' value={filterStartDate} onChange={(e) => {
                            saveScrollPosition();
                            setFilterStartDate(e.target.value);
                        }} className='mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:ring focus:ring-blue-200 focus:outline-none text-sm' />
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700'>Bitiş Tarihi</label>
                        <input type='date' value={filterEndDate} onChange={(e) => {
                            saveScrollPosition();
                            setFilterEndDate(e.target.value);
                        }} className='mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:ring focus:ring-blue-200 focus:outline-none text-sm' />
                    </div>
                </div>
                <div className='mt-1 mb-4 flex gap-4'>
                    <button onClick={handleResetFilter} className='w-40 font-medium text-sm px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-400 hover:text-white border border-gray-300 shadow-sm'>Filtreleri Sıfırla</button>
                    <button onClick={() => exportToExcel(leaves)} className=' w-40 border border-gray-300 rounded-md bg-green-500 text-white font-medium shadow-sm hover:bg-green-600 px-4 py-2 flex items-center gap-2'>
                        <img src="/excel.png" alt="excel" className="w-6 h-6 mr-1" />
                        Excele aktar
                    </button>
                </div>
                <table className='w-full border border-gray-300'>
                    <thead className='bg-gray-100'>
                        <tr>
                            <th className='border p-2 text-left'>İzin Türü</th>
                            <th className='border p-2 text-left'>Durum</th>
                            <th className='border p-2 text-left'>Departman</th>
                            <th className='border p-2 text-left'>Kullanıcı</th>
                            <th className='border p-2 text-left'>Başlangıç</th>
                            <th className='border p-2 text-left'>Bitiş</th>
                            <th className='border p-2 text-left'>Açıklama</th>
                            <th className='border p-2 text-left'>İşlem</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaves.length > 0 ? (
                            leaves.map(leave => (
                                <tr key={leave.id} className='hover:bg-gray-50'>
                                    <td className='border p-2'>{leaveTypeLabels[leave.leaveType] || leave.leaveType}</td>
                                    <td className='border p-2'>{statusLabels[leave.managerResponseStatus] || leave.managerResponseStatus}</td>
                                    <td className='border p-2'>{leave.departmentName || '-'}</td>
                                    <td className='border p-2'>{leave.userFullName}</td>
                                    <td className='border p-2'>{new Date(leave.startDate).toLocaleDateString('tr-TR')}</td>
                                    <td className='border p-2'>{new Date(leave.endDate).toLocaleDateString('tr-TR')}</td>
                                    <td className='border p-2'>{leave.description}</td>
                                    <td className='border p-2 space-x-2 w-48'>
                                        {leave.managerResponseStatus === 'Pending' && (
                                            <>
                                                <button
                                                    disabled={actionLoading}
                                                    onClick={() => handleApprove(leave.id)}
                                                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:opacity-50 font-medium"
                                                >
                                                    Onayla
                                                </button>
                                                <button
                                                    disabled={actionLoading}
                                                    onClick={() => handleReject(leave.id)}
                                                    className='bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:opacity-50 font-medium'
                                                >
                                                    Reddet
                                                </button>
                                            </>
                                        )}
                                        {(leave.managerResponseStatus === 'Approved') && (
                                            <span className='italic text-gray-500 inline-flex items-center gap-2'>
                                                İşlem onaylandı
                                                <img src="/checked.png" alt="Check" className='w-4 h-4 mr-1'></img>
                                            </span>
                                        )}
                                        {(leave.managerResponseStatus === 'Rejected') && (
                                            <span
                                                className='italic text-gray-500 inline-flex items-center gap-2'
                                            >işlem reddedildi
                                                <img src='/remove.png' alt='X' className='w-4 h-4 mr-1'></img>
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="7" className='border p-2 text-center'>İzin bulunamadı</td></tr>
                        )}
                    </tbody>
                </table>
                <div className="flex justify-between mt-4">
                    <button
                        onClick={() => {
                            saveScrollPosition();
                            setLeavesPageNumber(prev => Math.max(prev - 1, 1))
                        }}
                        disabled={leavesPageNumber === 1}
                        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                    >
                        Önceki
                    </button>
                    <span>Sayfa {leavesPageNumber} / {leavesTotalPages}   (Toplam: {totalLeaves})</span>
                    <span>
                        <select
                            value={leavesPageSize}
                            onChange={(e) => {
                                setLeavesPageNumber(1);
                                setLeavesPageSize(Number(e.target.value));
                            }}
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
                        onClick={() => {
                            saveScrollPosition();
                            setLeavesPageNumber(prev => Math.min(prev + 1, leavesTotalPages))
                        }}
                        disabled={leavesPageNumber === leavesTotalPages}
                        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                    >
                        Sonraki
                    </button>
                </div>
            </section>

            {/* Kullanıcılar Tablosu */}
            <section className='mb-10 bg-white p-6 rounded-md shadow-xl'>
                <h2 className='text-xl font-semibold mb-4'>Kullanıcılar</h2>
                <table className='w-full border border-gray-300'>
                    <thead className='bg-gray-100'>
                        <tr>
                            <th className='border p-2 text-left'>ID</th>
                            <th className='border p-2 text-left'>Ad Soyad</th>
                            <th className='border p-2 text-left'>E-posta</th>
                            <th className='border p-2 text-left'>Rol</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users && users.length > 0 ? (
                            users.map(user => (
                                <tr key={user.id} className='hover:bg-gray-50'>
                                    <td className='border p-2'>{user.id}</td>
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
                        onClick={() => {
                            saveScrollPosition();
                            setUsersPageNumber(prev => Math.max(prev - 1, 1))
                        }}
                        disabled={usersPageNumber === 1}
                        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                    >
                        Önceki
                    </button>
                    <span>Sayfa {usersPageNumber} / {usersTotalPages}   (Toplam: {totalUsers})</span>
                    <span>
                        <select
                            value={usersPageSize}
                            onChange={(e) => {
                                setUsersPageNumber(1);
                                setUsersPageSize(Number(e.target.value));
                            }}
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
                        onClick={() => {
                            saveScrollPosition();
                            setUsersPageNumber(prev => Math.min(prev + 1, usersTotalPages))
                        }}
                        disabled={usersPageNumber === usersTotalPages}
                        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                    >
                        Sonraki
                    </button>
                </div>
            </section>
        </div>
    )

};

export default ManagerPanel;