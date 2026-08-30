import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Zap, Users, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: 'AI-Powered Verification',
      description: 'Advanced AI analyzes content authenticity using multiple verification methods',
    },
    {
      icon: Zap,
      title: 'Instant Results',
      description: 'Get real-time authenticity scores and detailed verification reports',
    },
    {
      icon: Users,
      title: 'Community Fact-Checking',
      description: 'Participate in community voting to help verify content authenticity',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Trustgram</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Social Media You Can
          <span className="block text-blue-600 mt-2">Trust</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Share, discover, and verify content with AI-powered authenticity analysis.
          Know the truth before you share.
        </p>

        <div className="flex gap-4 justify-center mb-12">
          <button
            onClick={() => navigate('/register')}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2 text-lg"
          >
            Get Started <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate('/explore')}
            className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium text-lg"
          >
            Explore Platform
          </button>
        </div>

        {/* Hero Image Placeholder */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-20 max-w-3xl mx-auto">
          <div className="aspect-video bg-gradient-to-br from-blue-200 to-indigo-300 rounded-lg flex items-center justify-center">
            <Shield className="w-24 h-24 text-blue-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
            Why Choose Trustgram?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="p-8 rounded-lg border-2 border-gray-100 hover:border-blue-300 transition hover:shadow-lg"
                >
                  <Icon className="w-12 h-12 text-blue-600 mb-4" />
                  <h3 className="text-xl font-bold mb-2 text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
            How It Works
          </h2>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Upload', desc: 'Share content with caption' },
              {
                step: '2',
                title: 'Analyze',
                desc: 'AI checks text, images & sources',
              },
              {
                step: '3',
                title: 'Verify',
                desc: 'Community fact-checks content',
              },
              {
                step: '4',
                title: 'Trust Score',
                desc: 'Get authenticity passport',
              },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Capabilities */}
      <div className="bg-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
            Advanced Verification
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { title: 'Text Analysis', desc: 'NLP-based credibility scoring' },
              { title: 'Image Forensics', desc: 'EXIF metadata and manipulation detection' },
              { title: 'Source Reliability', desc: 'Domain trust and origin verification' },
              { title: 'Deepfake Detection', desc: 'AI-generated content identification' },
              { title: 'Originality Check', desc: 'Duplicate and repost detection' },
              { title: 'Community Voting', desc: 'Crowdsourced fact-checking' },
            ].map((cap, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900">{cap.title}</h3>
                  <p className="text-gray-600 text-sm">{cap.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to share with confidence?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of users who are making the internet a more trustworthy place.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition font-bold text-lg"
          >
            Create Account Now
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2024 Trustgram. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <a href="#" className="hover:text-white">
              Privacy
            </a>
            <a href="#" className="hover:text-white">
              Terms
            </a>
            <a href="#" className="hover:text-white">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
