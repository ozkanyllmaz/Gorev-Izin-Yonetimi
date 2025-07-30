import './App.css';
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/App/Header';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import TaskList from './components/Task/TaskList';
import TaskEdit from './components/Task/TaskEdit';
import TaskCreate from './components/Task/TaskCreate';
import LeaveList from './components/Leave/LeaveList';
import LeaveCreate from './components/Leave/LeaveCreate';
import LeavesEdit from './components/Leave/LeavesEdit';
import AdminPanel from './components/Admin/AdminPanel';
import ManagerPanel from './components/Admin/ManagerPanel';
import TaskReports from './components/Reports/TaskReports';
import LeaveReports from './components/Reports/LeaveReports';
import UserReports from './components/Reports/UserReports';

function App() {
  const location = useLocation();
  const noHeaderRoutes = ['/login', '/register'];

  return (
    <div className='App'>
      {!noHeaderRoutes.includes(location.pathname) && <Header />}
      <Routes>
        <Route path='/' element={<Navigate to="/login" replace />} />   {/* Anasayfa - default olarak login'e yonlendirir */}
        <Route path='/login' element={<Login />} />   {/* Login sayfasi*/}
        <Route path='/register' element={<Register />} />   {/* Register sayfasi*/}
        <Route path='*' element={<Navigate to="/login" replace />} /> {/*belirsiz endpoint girilirse login'e yonlendir */}
        <Route path='/tasks' element={<TaskList />} />
        <Route path='/tasks/edit/:taskId' element={<TaskEdit />} />
        <Route path='/tasks/create' element={<TaskCreate />} />
        <Route path='/leaves' element={<LeaveList />} />
        <Route path='/leaves/create' element={<LeaveCreate />} />
        <Route path='/leaves/edit/:leaveId' element={<LeavesEdit />} />
        <Route path='/admin-panel' element={<AdminPanel />} />
        <Route path='/manager-panel' element={<ManagerPanel />} />
        <Route path='/reports/tasks' element={<TaskReports />} />
        <Route path='/reports/leaves' element={<LeaveReports />} />
        <Route path='/reports/users' element={<UserReports />} />
      </Routes>
    </div>
  );
}

export default App;
