import React, { useState, useEffect } from "react";
import { baseUrl } from "../../api";
import * as XLSX from 'xlsx';
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";

const TaskReports = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState([]);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalTasks, setTotalTasks] = useState(0);
    const navigate = useNavigate();


    const taskStatusLabels = {
        Pending: 'Bekliyor',
        InProgress: 'Devam Ediyor',
        Completed: 'Tamamlandı',
        Cancelled: 'İptal Edildi'
    };

    const translateStatus = (status) => {
        switch (status) {
            case "Pending": return "Bekliyor";
            case "InProgress": return "Devam Ediyor";
            case "Completed": return "Tamamlandı";
            case "Cancelled": return "İptal Edildi";
        }
    };

    const [filterStatus, setFilterStatus] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('');
    const [filterUser, setFilterUser] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    // filtre degistiginde pageNumber 1 olsun
    useEffect(() => {
        setPageNumber(1);
    }, [filterStatus, filterDepartment, filterUser, filterStartDate, filterEndDate])

    const handleResetFilter = () => {
        setFilterStatus('');
        setFilterDepartment('');
        setFilterUser('');
        setFilterStartDate('');
        setFilterEndDate('');
    };

    const exportToExcel = (data) => {
        const mappedData = data.map(item => ({
            "Başlık": item.title,
            "Açıklama": item.description,
            "Durum": translateStatus(item.status),
            "Departman": item.departmentName,
            "Kullanıcı": item.userFullName,
            "Başlangıç Tarihi": new Date(item.startDate).toLocaleDateString('tr-TR'),
            "Bitiş Tarihi": new Date(item.endDate).toLocaleDateString('tr-TR')
        }))

        const worksheet = XLSX.utils.json_to_sheet(mappedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Görevler Tablosu");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const fileData = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(fileData, "GorevlerRapor.xlsx");
    };


    useEffect(() => {
        fetchData();
    }, [pageNumber, pageSize, filterStatus, filterUser, filterDepartment, filterStartDate, filterEndDate]);


    const fetchData = async () => {
        setLoading(true);
        try {
            const userRole = localStorage.getItem('role');
            const userInfo = localStorage.getItem('user');

            //filtre parametrelerini kosullu olarak ekle
            const queryParams = new URLSearchParams({
                pageNumber: pageNumber,
                pageSize: pageSize,
                ...(filterStatus && { filterStatus }),
                ...(filterUser && { filterUser }),
                ...(filterDepartment && { filterDepartment }),
                ...(filterStartDate && { filterStartDate }),
                ...(filterEndDate && { filterEndDate })
            });

            //console.log('User Role:', userRole);
            //console.log('User Info:', userInfo);

            if (userRole == 'User') {
                throw new Error('Bu sayfaya erişim izniniz yok');
            }

            const tasksRes = await fetch(`${baseUrl}/Department/tasks?${queryParams}`, {
                credentials: 'include'
            });

            //console.log('***********tasksRes:', tasksRes);

            if (!tasksRes.ok) {
                throw new Error('Sunucudan veri alınamadı');
            }

            const taskData = await tasksRes.json();

            setTasks(taskData.tasks || []);
            setTotalPages(taskData.totalPages || 1);

            setTotalTasks(taskData.totalTasks || 0);

        } catch (error) {
            alert('Veri çekilirken hata oldu' + error);

            //eger authantication hatasi verirse logine yonlendir
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
        <div className="p-6 bg-sky-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-6">Görevler Tablosu</h1>

            <section className="bg-white mb-10 p-6 rounded shadow-md">
                {/**filtreler */}
                <div className="filters mb-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                    {/**Durum */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Durum</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="mt-1 border border-gray-300 rounded-md w-full block shadow-sm"
                        >
                            <option value={''}>Hepsi</option>
                            <option value={'Pending'}>Bekliyor</option>
                            <option value={'InProgress'}>Devam Ediyor</option>
                            <option value={'Completed'}>Tamamlandı</option>
                            <option value={'Cancelled'}>İptal Edildi</option>
                        </select>
                    </div>
                    {/**Departman */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Departman</label>
                        <select
                            value={filterDepartment}
                            onChange={(e) => setFilterDepartment(e.target.value)}
                            className="mt-1 border border-gray-300 rounded-md block w-full shadow-sm"
                        >
                            <option value={''}>Hepsi</option>
                            {
                                [...new Set(tasks.map(t => t.departmentName))].map((dep, i) => (
                                    <option key={i} value={dep}>{dep}</option>
                                ))
                            }
                        </select>
                    </div>
                    {/**User */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Kullanıcı</label>
                        <select
                            value={filterUser}
                            onChange={(e) => setFilterUser(e.target.value)}
                            className="mt-1 border border-gray-300 rounded-md block w-full shadow-sm"
                        >
                            <option value={''}>Hepsi</option>
                            {
                                [...new Set(tasks.map(t => t.userFullName))].map((dep, i) => (
                                    <option key={i} value={dep}>{dep}</option>
                                ))
                            }
                        </select>
                    </div>
                    {/**tarih araligi */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Başlangıç Tarihi</label>
                        <input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} className="mt-1 block w-full border  border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Bitiş Tarihi</label>
                        <input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} className="block w-full border border-gray-300 rounded-md shadow-sm mt-1" />
                    </div>
                </div>
                <div className="mt-1 mb-4 flex gap-4">
                    <button
                        onClick={handleResetFilter}
                        className="w-40 font-medium text-sm px-4 py-2 border border-gray-300 rounded-md bg-gray-200
                            hover:bg-gray-400 hover:text-white"
                    >
                        Filtreleri Sıfırla
                    </button>
                    <button
                        onClick={() => exportToExcel(tasks)}
                        className=' w-40 border border-gray-300 rounded-md bg-green-500 text-white font-medium shadow-sm hover:bg-green-600 px-4 py-2 flex items-center gap-2'
                    >
                        <img src="/excel.png" alt="excel" className="w-6 h-6 mr-1" />
                        Excele aktar
                    </button>
                </div>
                <table className="w-full border border-gray-300">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className='border p-2 text-left'>Başlık</th>
                            <th className="border p-2 text-left">Açıklama</th>
                            <th className='border p-2 text-left'>Durum</th>
                            <th className='border p-2 text-left'>Departman</th>
                            <th className='border p-2 text-left'>Kullanıcı</th>
                            <th className='border p-2 text-left'>Başlangıç</th>
                            <th className='border p-2 text-left'>Bitiş</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.length > 0 ? (
                            tasks.map(task => (
                                <tr key={task.id} className="hover:bg-gray-50">
                                    <td className="border p-2">{task.title}</td>
                                    <td className="border p-2">{task.description}</td>
                                    <td className="border p-2">{taskStatusLabels[task.status]}</td>
                                    <td className="border p-2">{task.departmentName}</td>
                                    <td className="border p-2">{task.userFullName}</td>
                                    <td className="border p-2">{new Date(task.startDate).toLocaleDateString('tr-TR')}</td>
                                    <td className="border p-2">{new Date(task.endDate).toLocaleDateString('tr-TR')}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="7" className="border text-center p-2">Görevler bulunamadı</td></tr>
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
                    <span>Sayfa {pageNumber} / {totalPages} (Toplam: {totalTasks})</span>
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


export default TaskReports;