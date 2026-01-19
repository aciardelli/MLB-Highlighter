import MLBMerger from './components/MLBMerger.tsx'

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <header className="text-center mb-8">
          <h1 className="text-6xl font-bold text-white mb-2" style={{textShadow: '2px 2px 0 #BF0D3E, -2px -2px 0 #BF0D3E, 2px -2px 0 #BF0D3E, -2px 2px 0 #BF0D3E'}}>MLB Highlighter</h1>
        </header>
        <main className="text-center">
          <p className="mb-8 text-xl text-gray-300">Baseball statistics search interface</p>
            <MLBMerger />
        </main>
      </div>
    </div>
  )
}

export default App
