import { NavLink } from 'react-router-dom'

function NavBar() {
  return (
    <nav className="sticky top-0 z-50 bg-neutral-900/95 backdrop-blur border-b border-neutral-800">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <NavLink
          to="/"
          className="font-bold text-2xl text-white"
          style={{
            textShadow:
              '1px 1px 0 #BF0D3E, -1px -1px 0 #BF0D3E, 1px -1px 0 #BF0D3E, -1px 1px 0 #BF0D3E',
          }}
        >
          MLB Highlighter
        </NavLink>
        <div className="flex gap-6">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `text-sm font-medium pb-1 border-b-2 transition-colors ${
                isActive
                  ? 'text-white border-[#BF0D3E]'
                  : 'text-gray-400 border-transparent hover:text-gray-200'
              }`
            }
          >
            Search
          </NavLink>
          <NavLink
            to="/games"
            className={({ isActive }) =>
              `text-sm font-medium pb-1 border-b-2 transition-colors ${
                isActive
                  ? 'text-white border-[#BF0D3E]'
                  : 'text-gray-400 border-transparent hover:text-gray-200'
              }`
            }
          >
            Games
          </NavLink>
        </div>
      </div>
    </nav>
  )
}

export default NavBar
