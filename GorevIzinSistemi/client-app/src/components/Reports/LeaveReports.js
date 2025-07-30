import React, { useEffect, useState } from 'react';
import { baseUrl } from '../../api';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver';

const LeaveReports = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState([]);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalLeaves, setTotalLeaves] = useState(0);
    const navigate = useNavigate();


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
        setPageNumber(1);
    }, [filterLeaveType, filterStatus, filterDepartment, filterUser, filterStartDate, filterEndDate])



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
            "Departman": item.departmentName,
            "Kullanıcı": item.userFullName,
            "Başlangıç Tarihi": new Date(item.startDate).toLocaleDateString('tr-TR'),
            "Bitiş Tarihi": new Date(item.endDate).toLocaleDateString('tr-TR'),
            "Açıklama": item.description,
            "Durum": statusLabels[item.managerResponseStatus]
        }));

        const worksheet = XLSX.utils.json_to_sheet(mappedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Izinler Tablosu ");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const fileData = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(fileData, "IzinlerRapor.xlsx");
    };

    useEffect(() => {
        fetchData();
    }, [pageNumber, pageSize, filterLeaveType,
        filterStatus, filterDepartment, filterUser, filterStartDate, filterEndDate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const userRole = localStorage.getItem('role');
            const userInfo = localStorage.getItem('user');

            //Filtre parametrelerini kosullu olarak ekle
            const queryParams = new URLSearchParams({
                pageNumber: pageNumber,
                pageSize: pageSize,
                ...(filterLeaveType && { filterLeaveType }),
                ...(filterStatus && { filterStatus }),
                ...(filterDepartment && { filterDepartment }),
                ...(filterUser && { filterUser }),
                ...(filterStartDate && { filterStartDate }),
                ...filterEndDate && { filterEndDate }
            });

            if (userRole == 'User') {
                throw new Error("Bu sayfaya erişime izniniz yok");
            }

            const leaveRes = await fetch(`${baseUrl}/Department/leaves?${queryParams}`, {
                credentials: 'include'
            });

            if (!leaveRes.ok) {
                throw new Error('Sunucudan veri alınamadı');
            }

            const leaveData = await leaveRes.json();

            setLeaves(leaveData.leaves || []);
            setTotalPages(leaveData.totalPages || 1);

            setTotalLeaves(leaveData.totalLeaves || 0);

        } catch (error) {
            alert('Veri çekilirken hata oldu' + error);

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
            <h1 className='text-3xl font-bold mb-6'>İzinler Tablosu</h1>

            {/* İzinler Tablosu */}
            <section className='mb-10 bg-white p-6 rounded-md shadow-xl'>

                {/**filtre alanları */}
                <div className='filters mb-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4'>
                    {/**Izin Turu */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700'>İzin Türü</label>
                        <select value={filterLeaveType} onChange={(e) => setFilterLeaveType(e.target.value)} className='mt-1 border border-gray-300 rounded-md w-full block shadow-sm focus:ring-blue-200 focus:outline-none text-sm'>
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
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className='mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:ring-blue-200 focus:outline-none text-sm'>
                            <option value=''>Hepsi</option>
                            <option value='Pending'>Bekliyor</option>
                            <option value='Approved'>Onaylandı</option>
                            <option value='Rejected'>Reddedildi</option>
                        </select>
                    </div>
                    {/**Departman */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700'>Departman</label>
                        <select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)} className='mt-1 block w-full rounded-md border border-gray-300 shadow-sm  focus:ring-blue-200 focus:outline-none text-sm'>
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
                        <select value={filterUser} onChange={(e) => setFilterUser(e.target.value)} className='mt-1 block w-full rounded-md border border-gray-300 shadow-sm  focus:ring-blue-200 focus:outline-none text-sm'>
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
                        <input type='date' value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} className='mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:ring focus:ring-blue-200 focus:outline-none text-sm' />
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700'>Bitiş Tarihi</label>
                        <input type='date' value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} className='mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:ring focus:ring-blue-200 focus:outline-none text-sm' />
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
                            <th className='border p-2 text-left'>Departman</th>
                            <th className='border p-2 text-left'>Kullanıcı</th>
                            <th className='border p-2 text-left'>Başlangıç</th>
                            <th className='border p-2 text-left'>Bitiş</th>
                            <th className='border p-2 text-left'>Açıklama</th>
                            <th className='border p-2 text-left'>Durum</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaves.length > 0 ? (
                            leaves.map(leave => (
                                <tr key={leave.id} className='hover:bg-gray-50'>
                                    <td className='border p-2'>{leaveTypeLabels[leave.leaveType] || leave.leaveType}</td>
                                    <td className='border p-2'>{leave.departmentName || '-'}</td>
                                    <td className='border p-2'>{leave.userFullName}</td>
                                    <td className='border p-2'>{new Date(leave.startDate).toLocaleDateString('tr-TR')}</td>
                                    <td className='border p-2'>{new Date(leave.endDate).toLocaleDateString('tr-TR')}</td>
                                    <td className='border p-2'>{leave.description}</td>
                                    <td className='border p-2'>{statusLabels[leave.managerResponseStatus] || leave.managerResponseStatus}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="7" className='border p-2 text-center'>İzin bulunamadı</td></tr>
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
                    <span>Sayfa {pageNumber} / {totalPages} (Toplam: {totalLeaves})</span>
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
    )

};

export default LeaveReports;