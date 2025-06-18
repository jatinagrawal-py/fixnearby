import React, { useState } from 'react';
import { Shield, Lock, Trash2, CreditCard, MapPin, Phone, Eye, EyeOff, CheckCircle, AlertCircle, ShieldAlert } from 'lucide-react';

export default function Privacy() {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const privacySections = [
    {
      id: 'collection',
      title: 'Information We Collect',
      icon: <Phone className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-emerald-50 p-4 rounded-lg">
            <h4 className="font-semibold text-emerald-900 mb-2">What We Collect:</h4>
            <ul className="space-y-2 text-emerald-800">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-1 text-emerald-600" />
                <span><strong>Mobile Number:</strong> Required for account creation and service communication</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-1 text-emerald-600" />
                <span><strong>Password:</strong> Securely hashed and encrypted for account protection</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-1 text-emerald-600" />
                <span><strong>UPI ID:</strong> For repairers only, to facilitate commission payments</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-1 text-emerald-600" />
                <span><strong>Service Location:</strong> Temporarily collected during service creation</span>
              </li>
            </ul>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-semibold text-red-900 mb-2">What We DON'T Collect:</h4>
            <ul className="space-y-2 text-red-800">
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-1 text-red-600" />
                <span>Email addresses</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-1 text-red-600" />
                <span>Permanent address storage</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-1 text-red-600" />
                <span>Personal financial information (except UPI for repairers)</span>
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'usage',
      title: 'How We Use Your Information',
      icon: <Shield className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">We use your information solely to provide and improve our service:</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-emerald-50 p-4 rounded-lg">
              <h4 className="font-semibold text-emerald-900 mb-2">Service Operations</h4>
              <ul className="space-y-1 text-emerald-800 text-sm">
                <li>• Connect customers with local repairers</li>
                <li>• Facilitate service bookings</li>
                <li>• Process commission payments</li>
                <li>• Send service notifications via SMS</li>
              </ul>
            </div>
            <div className="bg-lime-50 p-4 rounded-lg">
              <h4 className="font-semibold text-lime-900 mb-2">Platform Improvement</h4>
              <ul className="space-y-1 text-lime-800 text-sm">
                <li>• Analyze service patterns</li>
                <li>• Improve matching algorithms</li>
                <li>• Enhance user experience</li>
                <li>• Prevent fraud and abuse</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'security',
      title: 'Data Security & Protection',
      icon: <Lock className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white p-6 rounded-lg">
            <h4 className="font-bold text-lg mb-3">🔐 Security Measures</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-semibold mb-2">Password Protection</h5>
                <p className="text-emerald-100 text-sm">All passwords are hashed using industry-standard encryption algorithms before storage</p>
              </div>
              <div>
                <h5 className="font-semibold mb-2">Secure Transmission</h5>
                <p className="text-emerald-100 text-sm">All data transmission uses SSL/TLS encryption protocols</p>
              </div>
              <div>
                <h5 className="font-semibold mb-2">Access Control</h5>
                <p className="text-emerald-100 text-sm">Strict access controls limit who can view your information</p>
              </div>
              <div>
                <h5 className="font-semibold mb-2">Regular Audits</h5>
                <p className="text-emerald-100 text-sm">We conduct regular security audits and updates</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'deletion',
      title: 'Data Deletion & Retention',
      icon: <Trash2 className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
            <h4 className="font-semibold text-amber-900 mb-2">🗑️ Automatic Deletion Policy</h4>
            <p className="text-amber-800">Service addresses are automatically deleted once the service is completed or cancelled. We don't store your location permanently.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-stone-100 p-4 rounded-lg text-center">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-red-500" />
              <h5 className="font-semibold">Service Addresses</h5>
              <p className="text-sm text-gray-600 mt-1">Deleted immediately after service completion</p>
            </div>
            <div className="bg-stone-100 p-4 rounded-lg text-center">
              <Phone className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
              <h5 className="font-semibold">Account Data</h5>
              <p className="text-sm text-gray-600 mt-1">Retained while account is active</p>
            </div>
            <div className="bg-stone-100 p-4 rounded-lg text-center">
              <CreditCard className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <h5 className="font-semibold">Payment Info</h5>
              <p className="text-sm text-gray-600 mt-1">UPI IDs stored securely for active repairers</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'sharing',
      title: 'Information Sharing',
      icon: <Eye className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-red-50 border-2 border-red-200 p-4 rounded-lg">
            <h4 className="font-semibold text-red-900 mb-2">❌ We Never Sell Your Data</h4>
            <p className="text-red-800">FixNearby will never sell, rent, or trade your personal information to third parties for marketing purposes.</p>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold">Limited Sharing Only For:</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-amber-50 p-3 rounded border-l-4 border-amber-400">
                <h5 className="font-semibold text-amber-900">Service Fulfillment</h5>
                <p className="text-amber-800 text-sm">Mobile numbers shared between customers and repairers for service coordination</p>
              </div>
              <div className="bg-emerald-50 p-3 rounded border-l-4 border-emerald-400">
                <h5 className="font-semibold text-emerald-900">Legal Requirements</h5>
                <p className="text-emerald-800 text-sm">When required by law enforcement or court orders</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'rights',
      title: 'Your Privacy Rights',
      icon: <CheckCircle className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-emerald-400 to-lime-500 text-white p-6 rounded-lg">
            <h4 className="font-bold text-lg mb-4">✨ Your Rights</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-stone-100 bg-opacity-20 backdrop-blur p-3 rounded">
                <h5 className="font-semibold mb-1">Access Your Data</h5>
                <p className="text-sm">Request a copy of all information we have about you</p>
              </div>
              <div className="bg-stone-100 bg-opacity-20 backdrop-blur p-3 rounded">
                <h5 className="font-semibold mb-1">Delete Account</h5>
                <p className="text-sm">Permanently delete your account and associated data</p>
              </div>
              <div className="bg-stone-100 bg-opacity-20 backdrop-blur p-3 rounded">
                <h5 className="font-semibold mb-1">Update Information</h5>
                <p className="text-sm">Modify your mobile number or other account details</p>
              </div>
              <div className="bg-stone-100 bg-opacity-20 backdrop-blur p-3 rounded">
                <h5 className="font-semibold mb-1">Opt-out Communications</h5>
                <p className="text-sm">Choose which notifications you want to receive</p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-700 text-white">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-emerald-700 bg-opacity-30 backdrop-blur p-3 rounded-full">
                <ShieldAlert className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
              At FixNearby, your privacy is our priority. We're committed to protecting your personal information while connecting you with trusted local repair services.
            </p>
            <div className="mt-6 bg-white bg-opacity-10 backdrop-blur p-4 rounded-lg inline-block">
              <p className="text-sm text-gray-600"><strong>Last Updated:</strong> June 2025</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Privacy at a Glance</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <Phone className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-emerald-800">Minimal Data</h3>
              <p className="text-sm text-gray-600">Only mobile & password required</p>
            </div>
            <div className="text-center">
              <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <Lock className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-emerald-800">Secure Storage</h3>
              <p className="text-sm text-gray-600">Passwords hashed & encrypted</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-orange-800">Auto-Delete</h3>
              <p className="text-sm text-gray-600">Addresses deleted after service</p>
            </div>
            <div className="text-center">
              <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <EyeOff className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-emerald-800">No Selling</h3>
              <p className="text-sm text-gray-600">We never sell your data</p>
            </div>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-4">
          {privacySections.map((section) => (
            <div key={section.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-emerald-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    {section.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">{section.title}</h3>
                </div>
                <div className={`transform transition-transform ${expandedSection === section.id ? 'rotate-180' : ''}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              {expandedSection === section.id && (
                <div className="px-6 pb-6">
                  {section.content}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-neutral-700 to-neutral-800 text-white rounded-2xl p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Questions About Your Privacy?</h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              We're here to help! If you have any questions about this privacy policy or how we handle your data, don't hesitate to reach out.
            </p>
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="bg-neutral-600 bg-opacity-20 backdrop-blur p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Privacy Officer</h3>
                <p className="text-sm text-gray-300">privacy@fixnearby.com</p>
              </div>
              <div className="bg-neutral-600 bg-opacity-20 backdrop-blur p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Support Team</h3>
                <p className="text-sm text-gray-300">Available 24/7 through the app</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-600">
          <p className="text-sm">
            © 2025 FixNearby. All rights reserved. | 
            <span className="ml-2">Connecting communities, protecting privacy.</span>
          </p>
        </div>
      </div>
    </div>
  );
}