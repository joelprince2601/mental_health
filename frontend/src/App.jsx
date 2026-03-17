import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Configuration from './pages/Configuration'
import Analytics from './pages/Analytics'
import Reports from './pages/Reports'
import Processing from './pages/Processing'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/configuration" element={<Configuration />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/processing" element={<Processing />} />
      </Routes>
    </Layout>
  )
}

export default App
