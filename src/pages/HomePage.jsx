import React from 'react'

const HomePage = () => {
  return (
    <main className="h-full flex items-center justify-center px-6 text-center bg-gradient-to-b from-white to-gray-100">
      <div className="max-w-xl w-full bg-white/90 backdrop-blur-md rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-green-600">Welcome to Ai Assistant</h2>
        <p className="mt-2 text-gray-700">I'm here to help answer any questions you have.</p>
      </div>
    </main>
  )
}

export default HomePage
