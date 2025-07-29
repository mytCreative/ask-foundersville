import React from 'react';
import { ReviewForm } from './components/ReviewForm';
import { ReviewList } from './components/ReviewList';

function App() {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen font-sans text-gray-900">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <header className="text-center mb-16">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-lg">
              <span className="text-3xl font-bold text-white">mC</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight leading-tight mb-6">
            mytCreative Review System
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Experience Phase 1 of the mytCreative ASK - a custom interface demonstrating 
            our powerful backend services and innovative approach to business solutions.
          </p>
        </header>
        
        <main className="space-y-24">
          <section id="review-form" className="scroll-mt-20">
            <ReviewForm />
          </section>
          
          <section id="review-list" className="scroll-mt-20">
            <ReviewList />
          </section>
        </main>

        <footer className="text-center mt-20 pt-12 border-t border-gray-200">
          <div className="space-y-2 text-gray-500">
            <p>&copy; {new Date().getFullYear()} mytCreative LLC. All Rights Reserved.</p>
            <p className="text-sm">Powered by the mytCreative Application Starter Kit (ASK)</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
