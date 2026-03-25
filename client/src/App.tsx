import { Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar.tsx'
import Search from './pages/Search.tsx'
import GameSearch from './pages/GameSearch.tsx'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <Routes>
        <Route path="/" element={<Search />} />
        <Route path="/games" element={<GameSearch />} />
      </Routes>
    </div>
  )
}

export default App
