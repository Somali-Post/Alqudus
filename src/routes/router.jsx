import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AdminShell } from '../components/admin/AdminShell'
import { AppLayout } from '../components/layout/AppLayout'
import { AdminApplicationsPage } from '../pages/admin/AdminApplicationsPage'
import { AdminApplicationDetailPage } from '../pages/admin/AdminApplicationDetailPage'
import { AdminLoginPage } from '../pages/admin/AdminLoginPage'
import { AboutPage } from '../pages/AboutPage'
import { ApplyPage } from '../pages/ApplyPage'
import { ContactPage } from '../pages/ContactPage'
import { HomePage } from '../pages/HomePage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { OwnerOperatorsPage } from '../pages/OwnerOperatorsPage'
import { UploadDocumentsPage } from '../pages/UploadDocumentsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'owner-operators', element: <OwnerOperatorsPage /> },
      { path: 'apply', element: <ApplyPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: '/admin/login',
    element: <AdminLoginPage />,
  },
  {
    path: '/upload-documents/:token',
    element: <UploadDocumentsPage />,
  },
  {
    path: '/admin',
    element: <AdminShell />,
    children: [
      { index: true, element: <Navigate to="/admin/applications" replace /> },
      { path: 'applications', element: <AdminApplicationsPage /> },
      { path: 'applications/:id', element: <AdminApplicationDetailPage /> },
    ],
  },
])
