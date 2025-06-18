import React, { useState } from 'react';
import { AlertTriangle, Shield, Ban, UserX, CreditCard, Wrench, Users, FileText, CheckCircle, XCircle, Scale, Clock, Info,Hammer } from 'lucide-react';

export default function TermsCondition() {
  const [expandedSection, setExpandedSection] = useState(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleAcceptTerms = () => {
    setAcceptedTerms(!acceptedTerms);
  };

  const termsSections = [
    {
      id: 'platform-role',
      title: 'Platform Role & Limitations',
      icon: <Users className="w-5 h-5" />,
      critical: true,
      content: (
        <div className="space-y-4">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <h4 className="font-bold text-red-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              IMPORTANT: We Are Just a Connecting Platform
            </h4>
            <p className="text-red-800 mb-3 text-sm">
              FixNearby operates solely as a digital platform that connects customers with independent repair service providers. We do not employ repairers, nor do we provide repair services directly.
            </p>
            <div className="bg-red-100 p-3 rounded">
              <h5 className="font-semibold text-red-900 mb-2 text-sm">What This Means:</h5>
              <ul className="space-y-1 text-red-800 text-xs pl-4 list-disc">
                <li>We facilitate connections only - nothing more</li>
                <li>All repair services are provided by independent third parties</li>
                <li>We have no control over repairer behavior or service quality</li>
                <li>Your agreement is directly with the repairer, not with us</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'no-responsibility',
      title: 'Company Disclaimers & No Responsibility',
      icon: <XCircle className="w-5 h-5" />,
      critical: true,
      content: (
        <div className="space-y-4">
          <div className="bg-orange-50 p-4 rounded-lg border-2 border-orange-200">
            <h4 className="font-bold text-orange-900 mb-3 flex items-center gap-2">
              <Ban className="w-5 h-5 text-orange-600" /> FixNearby Is NOT Responsible For:
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded border-l-4 border-red-400">
                <h5 className="font-semibold text-gray-800">Repairer Behavior</h5>
                <ul className="text-xs text-gray-700 mt-2 space-y-1 pl-4 list-disc">
                  <li>Unprofessional conduct</li>
                  <li>Inappropriate behavior</li>
                  <li>Theft or damage</li>
                  <li>Late arrivals or no-shows</li>
                  <li>Harassment or misconduct</li>
                </ul>
              </div>
              <div className="bg-white p-3 rounded border-l-4 border-orange-400">
                <h5 className="font-semibold text-gray-800">Service Quality</h5>
                <ul className="text-xs text-gray-700 mt-2 space-y-1 pl-4 list-disc">
                  <li>Poor workmanship</li>
                  <li>Failed repairs</li>
                  <li>Damaged devices</li>
                  <li>Use of substandard parts</li>
                  <li>Incomplete services</li>
                </ul>
              </div>
              <div className="bg-white p-3 rounded border-l-4 border-blue-400">
                <h5 className="font-semibold text-gray-800">Payment Issues</h5>
                <ul className="text-xs text-gray-700 mt-2 space-y-1 pl-4 list-disc">
                  <li>Non-payment by customers</li>
                  <li>Overcharging by repairers</li>
                  <li>Payment disputes</li>
                  <li>Hidden charges</li>
                  <li>Refund requests</li>
                </ul>
              </div>
              <div className="bg-white p-3 rounded border-l-4 border-purple-400">
                <h5 className="font-semibold text-gray-800">Legal Issues</h5>
                <ul className="text-xs text-gray-700 mt-2 space-y-1 pl-4 list-disc">
                  <li>Contract disputes</li>
                  <li>Legal proceedings</li>
                  <li>Property damage claims</li>
                  <li>Personal injury</li>
                  <li>Insurance claims</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-red-100 p-4 rounded-lg border border-red-200">
            <h4 className="font-bold text-red-900 mb-2 flex items-center gap-2">⚠️ ZERO WARRANTIES OR GUARANTEES</h4>
            <p className="text-red-800 text-sm">
              FixNearby provides NO warranties, guarantees, or assurances regarding any repair work performed through our platform. 
              All work is performed "AS IS" by independent service providers at your own risk.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'user-responsibilities',
      title: 'User Responsibilities & Obligations',
      icon: <CheckCircle className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Customer Responsibilities
              </h4>
              <ul className="space-y-2 text-blue-800 text-sm pl-4 list-disc">
                <li>Pay repairers directly as agreed upon</li>
                <li>Verify repairer credentials yourself</li>
                <li>Communicate service requirements clearly</li>
                <li>Provide accurate location and contact info</li>
                <li>Report issues through proper channels</li>
                <li>Use platform respectfully and legally</li>
              </ul>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-green-600" />
                Repairer Responsibilities
              </h4>
              <ul className="space-y-2 text-green-800 text-sm pl-4 list-disc">
                <li>Provide accurate service descriptions</li>
                <li>Maintain professional conduct</li>
                <li>Honor agreed pricing and timelines</li>
                <li>Provide genuine parts and quality service</li>
                <li>Complete services as promised</li>
                <li>Maintain valid licenses and insurance</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
              <Info className="w-5 h-5 text-yellow-600" /> Direct Relationship
            </h4>
            <p className="text-yellow-800 text-sm">
              By using FixNearby, you acknowledge that any service agreement is directly between you and the repairer. 
              FixNearby is not a party to this agreement and bears no responsibility for its fulfillment.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'account-termination',
      title: 'Account Termination & Bans',
      icon: <Ban className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-red-50 border-2 border-red-200 p-4 rounded-lg">
            <h4 className="font-bold text-red-900 mb-3 flex items-center gap-2">
              <UserX className="w-5 h-5 text-red-600" />
              Immediate Account Termination
            </h4>
            <p className="text-red-800 mb-3 text-sm">
              We reserve the right to immediately suspend or permanently ban accounts for the following violations:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded border-l-4 border-red-500">
                <h5 className="font-semibold text-gray-800 mb-2">Fraudulent Activities</h5>
                <ul className="text-xs text-gray-700 space-y-1 pl-4 list-disc">
                  <li>Fake reviews or ratings</li>
                  <li>False service claims</li>
                  <li>Identity fraud</li>
                  <li>Payment fraud or chargebacks</li>
                  <li>Creating multiple fake accounts</li>
                </ul>
              </div>
              
              <div className="bg-white p-3 rounded border-l-4 border-orange-500">
                <h5 className="font-semibold text-gray-800 mb-2">Platform Abuse</h5>
                <ul className="text-xs text-gray-700 space-y-1 pl-4 list-disc">
                  <li>Spam or excessive messaging</li>
                  <li>Harassment of users</li>
                  <li>Circumventing commission payments</li>
                  <li>Manipulating search rankings</li>
                  <li>Automated bot usage</li>
                </ul>
              </div>
              
              <div className="bg-white p-3 rounded border-l-4 border-purple-500">
                <h5 className="font-semibold text-gray-800 mb-2">Illegal Activities</h5>
                <ul className="text-xs text-gray-700 space-y-1 pl-4 list-disc">
                  <li>Unlicensed service provision</li>
                  <li>Theft or property damage</li>
                  <li>Threatening behavior</li>
                  <li>Violation of local laws</li>
                  <li>Tax evasion or money laundering</li>
                </ul>
              </div>
              
              <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                <h5 className="font-semibold text-gray-800 mb-2">Commission Fraud</h5>
                <ul className="text-xs text-gray-700 space-y-1 pl-4 list-disc">
                  <li>Avoiding platform commissions</li>
                  <li>Direct payment circumvention</li>
                  <li>False transaction reporting</li>
                  <li>Collusion with customers</li>
                  <li>Using platform for leads only</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Hammer className="w-5 h-5 text-gray-600" /> Enforcement Actions
            </h4>
            <div className="grid md:grid-cols-3 gap-3">
              <div className="bg-yellow-100 p-3 rounded text-center border border-yellow-200">
                <Clock className="w-6 h-6 mx-auto mb-1 text-yellow-600" />
                <h5 className="font-semibold text-yellow-800 text-sm">Warning</h5>
                <p className="text-xs text-yellow-700">First-time minor violations</p>
              </div>
              <div className="bg-orange-100 p-3 rounded text-center border border-orange-200">
                <Ban className="w-6 h-6 mx-auto mb-1 text-orange-600" />
                <h5 className="font-semibold text-orange-800 text-sm">Suspension</h5>
                <p className="text-xs text-orange-700">Repeated or serious violations</p>
              </div>
              <div className="bg-red-100 p-3 rounded text-center border border-red-200">
                <UserX className="w-6 h-6 mx-auto mb-1 text-red-600" />
                <h5 className="font-semibold text-red-800 text-sm">Permanent Ban</h5>
                <p className="text-xs text-red-700">Severe or repeated violations</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'commission-payment',
      title: 'Commission & Payment Terms',
      icon: <CreditCard className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-green-600" /> How Our Commission Works
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-green-200 rounded-full p-1">
                  <CheckCircle className="w-4 h-4 text-green-700" />
                </div>
                <div>
                  <h5 className="font-semibold text-green-800 text-sm">Service Completion</h5>
                  <p className="text-green-700 text-xs">Commission is calculated automatically when service is marked complete</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-green-200 rounded-full p-1">
                  <CreditCard className="w-4 h-4 text-green-700" />
                </div>
                <div>
                  <h5 className="font-semibold text-green-800 text-sm">Automatic Deduction</h5>
                  <p className="text-green-700 text-xs">Commission is deducted from total payment before transfer to repairer</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-green-200 rounded-full p-1">
                  <Users className="w-4 h-4 text-green-700" />
                </div>
                <div>
                  <h5 className="font-semibold text-green-800 text-sm">UPI Transfer</h5>
                  <p className="text-green-700 text-xs">Remaining amount transferred to repairer's registered UPI ID</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <h4 className="font-bold text-red-900 mb-2 flex items-center gap-2">⚠️ Commission Evasion = Account Ban</h4>
            <p className="text-red-800 text-sm mb-2">
              Attempting to avoid platform commissions through direct payments or other methods will result in immediate account termination.
            </p>
            <div className="bg-red-100 p-2 rounded text-xs text-red-700">
              This includes: exchanging contact info to bypass platform, requesting cash payments, or any other method to circumvent our commission structure.
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'liability-limitation',
      title: 'Liability Limitations & Legal',
      icon: <Scale className="w-5 h-5" />,
      critical: true,
      content: (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h4 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
              <Scale className="w-6 h-6 text-green-600" /> 
              Legal Disclaimers
            </h4>
            
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-red-400"> 
                <h5 className="font-semibold text-red-700 mb-2">MAXIMUM LIABILITY LIMIT</h5> 
                <p className="text-gray-700 text-sm"> 
                  In no event shall FixNearby's liability exceed the commission amount paid by the repairer for the specific transaction in question. 
                  This represents our maximum liability under any circumstances.
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-orange-400"> 
                <h5 className="font-semibold text-orange-700 mb-2">NO CONSEQUENTIAL DAMAGES</h5> 
                <p className="text-gray-700 text-sm"> {/* Text color adjusted */}
                  We are not liable for any indirect, incidental, special, or consequential damages including but not limited to: 
                  lost profits, business interruption, loss of data, or any other commercial damages.
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-blue-400"> 
                <h5 className="font-semibold text-blue-700 mb-2">INDEMNIFICATION</h5> 
                <p className="text-gray-700 text-sm"> 
                  Users agree to indemnify and hold FixNearby harmless from any claims, damages, or expenses arising from their use of our platform 
                  or their relationships with other users.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
              <Scale className="w-5 h-5 text-yellow-600" /> Governing Law & Disputes
            </h4>
            <p className="text-yellow-800 text-sm">
              These terms are governed by Indian law. Any disputes must be resolved through binding arbitration in [Your City], India. 
              Users waive their right to participate in class action lawsuits.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'platform-changes',
      title: 'Platform Changes & Updates',
      icon: <FileText className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200"> {/* Retained blue for informational */}
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" /> Terms Updates
            </h4>
            <p className="text-blue-800 text-sm mb-3">
              We may update these terms at any time. Continued use of the platform after changes constitutes acceptance of new terms.
            </p>
            <div className="bg-blue-100 p-3 rounded">
              <p className="text-blue-700 text-xs">
                Major changes will be notified through the app. It's your responsibility to review terms periodically.
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200"> {/* Changed from purple to gray for neutrality */}
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-gray-600" /> Service Modifications
            </h4>
            <p className="text-gray-700 text-sm">
              We reserve the right to modify, suspend, or discontinue any part of our service at any time without notice. 
              We are not liable for any such modifications or discontinuations.
            </p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans antialiased"> 
      {/* Header */}
      <div className="bg-green-50 text-gray-900 py-12 px-6 sm:px-8 lg:px-10 rounded-b-3xl shadow-md"> 
        <div className="container mx-auto text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-4 rounded-full shadow-md"> 
              <FileText className="w-14 h-14 text-green-700" /> 
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">Terms & Conditions</h1>
          <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto mb-6">
            By using FixNearby, you agree to these terms. Please read carefully - we're just a connecting platform with limited responsibilities.
          </p>
          <div className="bg-red-100 text-red-800 p-3 rounded-lg inline-block border border-red-200">
            <p className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" /> CRITICAL: We are NOT responsible for repairer actions or service quality
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-10">
        {/* Critical Warnings Section - Prominent, but styled within theme */}
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 sm:p-8 mb-8 shadow-lg">
          <h2 className="text-2xl sm:text-3xl font-bold text-red-900 mb-6 flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            READ THIS FIRST - CRITICAL INFORMATION
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg border-l-4 border-red-500 shadow-sm">
              <h3 className="font-bold text-red-800 mb-2 text-lg">We Are Just a Platform</h3>
              <p className="text-gray-700 text-sm">
                FixNearby only connects you with repairers. We don't employ them, control them, or guarantee their work. 
                All agreements are directly between you and the repairer.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border-l-4 border-orange-500 shadow-sm">
              <h3 className="font-bold text-orange-800 mb-2 text-lg">No Warranties or Guarantees</h3>
              <p className="text-gray-700 text-sm">
                We provide zero warranties on repair work. If something goes wrong with the service, 
                you must resolve it directly with the repairer - not with us.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {termsSections.map((section) => (
            <div key={section.id} className={`bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 ${section.critical ? 'border-2 border-red-200' : ''}`}>
              <button
                onClick={() => toggleSection(section.id)}
                className={`w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 ${expandedSection === section.id ? 'bg-gray-50' : ''} ${section.critical ? 'bg-red-50 hover:bg-red-100' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${section.critical ? 'bg-red-200 text-red-800' : 'bg-green-100 text-green-800'}`}> {/* Themed icon background */}
                    {section.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{section.title}</h3>
                    {section.critical && (
                      <p className="text-red-600 text-sm font-medium flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" /> Critical Section
                      </p>
                    )}
                  </div>
                </div>
                <div className={`transform transition-transform duration-300 ${expandedSection === section.id ? 'rotate-180' : ''}`}>
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              {expandedSection === section.id && (
                <div className="px-6 pb-6 pt-4 border-t border-gray-200">
                  {section.content}
                </div>
              )}
            </div>
          ))}
        </div>


        {/* Contact & Support */}
        <div className="mt-12 bg-gray-50 rounded-xl p-8 shadow-md border border-gray-100">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-2">
              <Shield className="w-7 h-7 text-green-600" /> Questions About These Terms?
            </h3>
            <p className="text-gray-700 mb-6 text-base max-w-xl mx-auto">
              If you have any questions or require clarifications regarding these terms and conditions, please do not hesitate to contact our legal team.
            </p>
            <div className="bg-white p-5 rounded-lg inline-block shadow-sm border border-gray-200">
              <p className="text-green-800 font-semibold text-xl">legal@fixnearby.com</p>
              <p className="text-gray-600 text-sm mt-1">Response within 24-48 business hours</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>
            Last Updated: June 2025 | 
            <span>FixNearby - Connecting Services, Limiting Liability</span>
          </p>
          <p className="mt-2 text-xs">© 2025 FixNearby. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
