import React from 'react'
import { Route, Routes } from 'react-router'
import HomePage from './Pages/HomePage'
import CreatePage from './Pages/CreatePage'
import NoteDetailPage from './Pages/NoteDetailPage'
import Navbar from './Components/Navbar'
import Footer from './Components/Footer'
import DevLogin from './Pages/DevLogin'
import CompanyLogin from './Pages/CompanyLogin'
import DevDashboard from './Pages/DevDashboard'
import DevProfile from './Pages/DevProfile'
import DevChat from './Pages/DevChat'
import HirePage from './Pages/HirePage'
import CompanyChat from './Pages/CompanyChat'
import CompanyFilter from './Pages/CompanyFilter'
import CompanyDashboard from './Pages/CompanyDashboard'
import CompanyProfile from './Pages/CompanyProfile'
import AdminPanel from './Pages/AdminPanel'
import ProtectedRoute from './Components/ProtectedRoute'

const App = () => {
  return (
    <>
      <div>
        <Navbar />
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/create' element={<CreatePage />} />
          <Route path='notedetail/:id' element={<NoteDetailPage />} />

          {/* Dev Flow */}
          <Route path='/login' element={<DevLogin />} />
          <Route element={<ProtectedRoute role='developer' />}>
            <Route path='/dev-profile' element={<DevProfile />} />
            <Route path='/dev-dashboard' element={<DevDashboard />} />
            <Route path='/dev-chat' element={<DevChat />} />
          </Route>

          {/* Company Flow */}
          <Route path='/company-login' element={<CompanyLogin />} />
          <Route element={<ProtectedRoute role='company' />}>
            <Route path='/hire' element={<HirePage />} />
            <Route path='/company-dashboard' element={<CompanyDashboard />} />
            <Route path='/company-profile' element={<CompanyProfile />} />
            <Route path='/company-chat' element={<CompanyChat />} />
            <Route path='/company-filter' element={<CompanyFilter />} />
          </Route>
          <Route path='/admin' element={<AdminPanel />} />
        </Routes>
        <Footer />
      </div>
    </>
  )
}

export default App
