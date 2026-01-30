import React from 'react';
import { IELogo } from './IELogo';

const LandingPage: React.FC<{ onNavigate: (page: 'signin' | 'signup') => void }> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navigation (simplified for this example, adjust as needed) */}
      <nav className="sticky top-0 z-50 flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="flex items-center space-x-2">
          <IELogo className="h-8 w-8" />
          <span className="text-xl font-bold text-gray-800">ieThreadScan</span>
        </div>
        <div className="space-x-4">
          <button
            onClick={() => onNavigate('signin')}
            className="text-blue-600 hover:text-blue-800 px-4 py-2 rounded-md font-semibold"
          >
            Sign In
          </button>
          <button
            onClick={() => onNavigate('signup')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-100 to-green-100 py-20 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-800 leading-tight mb-6">
            Scan with Precision: AI-Powered Thread Analysis
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Leverage cutting-edge AI to instantly detect defects, measure specifications, and ensure the integrity of industrial threads. Improve quality control and reduce costly errors.
          </p>
          <button
            onClick={() => onNavigate('signin')} // Assuming 'signin' leads to the scanner or dashboard
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors shadow-lg"
          >
            Start Scanning
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">The Smart Way to Ensure Thread Integrity</h2>
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            Our AI-driven thread scanner provides unparalleled accuracy and efficiency for all your inspection needs.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Card 1: High-Accuracy Defect Detection */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
              <div className="text-blue-500 text-3xl mb-4"><i className="fas fa-microscope"></i></div> {/* Placeholder icon */}
              <h3 className="text-xl font-bold text-gray-800 mb-2">High-Accuracy Defect Detection</h3>
              <p className="text-gray-600">Identify cracks, wear, and anomalies with precise AI-driven analysis, ensuring superior quality control.</p>
            </div>
            {/* Feature Card 2: Automated Measurement & Classification */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
              <div className="text-blue-500 text-3xl mb-4"><i className="fas fa-ruler-combined"></i></div> {/* Placeholder icon */}
              <h3 className="text-xl font-bold text-gray-800 mb-2">Automated Measurement & Classification</h3>
              <p className="text-gray-600">Automatically measure thread dimensions and classify thread types against industry standards.</p>
            </div>
            {/* Feature Card 3: Historical Data & Trend Analysis */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
              <div className="text-blue-500 text-3xl mb-4"><i className="fas fa-chart-line"></i></div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Historical Data & Trend Analysis</h3>
              <p className="text-gray-600">Track inspection results over time to identify trends, predict maintenance needs, and optimize operational efficiency.</p>
            </div>
            {/* Feature Card 4: Multi-Angle Image Capture */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
              <div className="text-blue-500 text-3xl mb-4"><i className="fas fa-camera-retro"></i></div> {/* Placeholder icon */}
              <h3 className="text-xl font-bold text-gray-800 mb-2">Multi-Angle Image Capture</h3>
              <p className="text-gray-600">Capture comprehensive views of threads from multiple angles for a complete and thorough inspection.</p>
            </div>
            {/* Feature Card 5: Real-time AI Insights */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
              <div className="text-blue-500 text-3xl mb-4"><i className="fas fa-brain"></i></div> {/* Placeholder icon */}
              <h3 className="text-xl font-bold text-gray-800 mb-2">Real-time AI Insights</h3>
              <p className="text-gray-600">Receive instant analysis and insights as frames are captured, accelerating your decision-making process.</p>
            </div>
            {/* Feature Card 6: Secure & Traceable Reports */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
              <div className="text-blue-500 text-3xl mb-4"><i className="fas fa-file-invoice"></i></div> {/* Placeholder icon */}
              <h3 className="text-xl font-bold text-gray-800 mb-2">Secure & Traceable Reports</h3>
              <p className="text-gray-600">Generate detailed, secure, and traceable inspection reports for compliance and record-keeping.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Optimize Your Inspection Workflow Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Optimize Your Inspection Workflow</h2>
            <p className="text-lg text-gray-600 mb-6">
              ieThreadScan transforms manual, time-consuming inspections into a streamlined, AI-powered process,
              enhancing accuracy and efficiency across your operations.
            </p>
            <ul className="space-y-4 text-gray-700 text-lg">
              <li className="flex items-center">
                <span className="text-blue-500 text-xl mr-3"><i className="fas fa-check-circle"></i></span>
                Automate quality control with advanced AI to minimize human intervention.
              </li>
              <li className="flex items-center">
                <span className="text-blue-500 text-xl mr-3"><i className="fas fa-check-circle"></i></span>
                Reduce human error and improve consistency in defect identification and measurement.
              </li>
              <li className="flex items-center">
                <span className="text-blue-500 text-xl mr-3"><i className="fas fa-check-circle"></i></span>
                Generate comprehensive, shareable inspection reports in seconds for quick decision-making.
              </li>
            </ul>
          </div>
          <div className="lg:w-1/2 mt-10 lg:mt-0">
            {/* Image placeholder - replace with actual image later */}
            <div className="bg-gray-300 rounded-lg overflow-hidden shadow-xl aspect-video flex items-center justify-center">
              <span className="text-gray-600 text-xl">Image Placeholder</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-8 text-center text-gray-600 text-sm border-t border-gray-200">
        <p>© 2024 ieThreadScan. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;