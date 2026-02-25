import { useState, useCallback } from 'react'
import MLBMerger from './components/MLBMerger.tsx'
import type { Phase } from './components/MLBMerger.tsx'

function App() {
  const [hasSearched, setHasSearched] = useState(false)

  const handlePhaseChange = useCallback((phase: Phase) => {
    if (phase !== 'idle') {
      setHasSearched(true)
    }
  }, [])

  return (
    <div className={`min-h-screen flex flex-col items-center px-4 transition-all duration-500 ease-in-out ${hasSearched ? 'pt-6' : 'pt-[30vh]'}`}>
      <div className={`w-full transition-all duration-500 ease-in-out ${hasSearched ? 'max-w-6xl mx-auto' : 'max-w-2xl'}`}>
        <header className={`mb-8 transition-all duration-500 ease-in-out ${hasSearched ? 'text-left' : 'text-center'}`}>
          <h1
            className={`font-bold text-white mb-2 transition-all duration-500 ease-in-out ${hasSearched ? 'text-2xl' : 'text-6xl'}`}
            style={{textShadow: hasSearched
              ? '1px 1px 0 #BF0D3E, -1px -1px 0 #BF0D3E, 1px -1px 0 #BF0D3E, -1px 1px 0 #BF0D3E'
              : '2px 2px 0 #BF0D3E, -2px -2px 0 #BF0D3E, 2px -2px 0 #BF0D3E, -2px 2px 0 #BF0D3E'
            }}
          >
            MLB Highlighter
          </h1>
        </header>
        <main className={`transition-all duration-500 ease-in-out ${hasSearched ? 'text-left' : 'text-center'}`}>
          <p className={`text-xl text-gray-300 transition-all duration-500 ease-in-out overflow-hidden ${hasSearched ? 'opacity-0 max-h-0 mb-0' : 'opacity-100 max-h-20 mb-8'}`}>
            Baseball statistics search interface
          </p>
          <MLBMerger onPhaseChange={handlePhaseChange} />
        </main>
      </div>
    </div>
  )
}

export default App
