import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { MainLayout } from './layouts/MainLayout'

export const App = () => {
  return (
    <Router>
      <MainLayout />
    </Router>
  )
} 