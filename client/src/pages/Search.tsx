import { useState, useCallback } from 'react'
import MLBMerger from '../components/MLBMerger.tsx'
import type { Phase } from '../components/MLBMerger.tsx'

function Search() {
  const [hasSearched, setHasSearched] = useState(false)

  const handlePhaseChange = useCallback((phase: Phase) => {
    if (phase !== 'idle') {
      setHasSearched(true)
    }
  }, [])

  return (
    <div className={`flex flex-col items-center px-4 transition-all duration-500 ease-in-out ${hasSearched ? 'pt-6' : 'pt-[25vh]'}`}>
      <div className={`w-full transition-all duration-500 ease-in-out ${hasSearched ? 'max-w-6xl mx-auto' : 'max-w-2xl'}`}>
        <main className={`transition-all duration-500 ease-in-out ${hasSearched ? 'text-left' : 'text-center'}`}>
          <div className={`transition-all duration-500 ease-in-out overflow-hidden ${hasSearched ? 'opacity-0 max-h-0 mb-0' : 'opacity-100 max-h-40 mb-8'}`}>
            <h2 className="text-4xl font-bold text-white mb-3">Find Any Highlight</h2>
            <p className="text-lg text-gray-400">
              Search across thousands of MLB plays by player, stat, or situation
            </p>
          </div>
          <MLBMerger onPhaseChange={handlePhaseChange} />
        </main>
      </div>
    </div>
  )
}

export default Search
