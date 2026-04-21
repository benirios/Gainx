import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Routes>
          <Route
            path="/"
            element={
              <div className="flex items-center justify-center h-screen text-2xl font-semibold">
                Site Monitor — Coming Soon
              </div>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
