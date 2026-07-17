import { useState } from 'react';
import { ExternalLink, Youtube, ChevronDown, ChevronUp, BookOpen, Heart, Users, Shield } from 'lucide-react';

const SCHEMES = {
  oldAge: [
    {
      id: 'ipsc',
      emoji: '🏛️',
      title: 'Integrated Programme for Senior Citizens (IPSC)',
      tag: 'For NGOs & Institutions',
      description:
        'Financial assistance to NGOs to run and maintain old-age homes. Supports day-care centres, continuous care homes, and mobile medical units for senior citizens.',
      officialUrl: 'https://socialjustice.gov.in/schemes/4',
      officialLabel: 'Ministry of Social Justice',
      youtube: [
        { label: 'IPSC Scheme Application Videos', url: 'https://www.youtube.com/results?search_query=IPSC+Scheme+Application+Videos' },
      ],
      who: 'Registered NGOs, trusts, and institutions that run old-age homes apply for grants.',
      color: 'blue',
    },
    {
      id: 'avyay',
      emoji: '🤝',
      title: 'Atal Vayo Abhyudaya Yojana (AVYAY)',
      tag: 'Umbrella Scheme',
      description:
        'An umbrella scheme covering: Senior citizen homes, Caregiver training, Awareness programmes, Elderline helpline (14567), and welfare initiatives for elderly citizens.',
      officialUrl: 'https://socialjustice.gov.in/schemes/27',
      officialLabel: 'AVYAY Scheme Portal',
      youtube: [
        { label: 'AVYAY Application Videos', url: 'https://www.youtube.com/results?search_query=AVYAY+Application+Videos' },
      ],
      who: 'NGOs and registered institutions applying for senior citizen welfare programmes.',
      color: 'purple',
    },
    {
      id: 'ignoaps',
      emoji: '💰',
      title: 'Indira Gandhi National Old Age Pension Scheme (IGNOAPS)',
      tag: 'Monthly Pension',
      description:
        'Eligible senior citizens receive a monthly pension through the National Social Assistance Programme (NSAP). States often add their own contribution. Applications go through local Panchayat or Block office.',
      officialUrl: 'https://nsap.nic.in/',
      officialLabel: 'NSAP Portal',
      secondaryUrl: 'https://nsap.nic.in/ig.do',
      secondaryLabel: 'IGNOAPS Guidelines',
      youtube: [
        { label: 'IGNOAPS Application Videos', url: 'https://www.youtube.com/results?search_query=IGNOAPS+Application+Videos' },
      ],
      who: 'Senior citizens aged 60+ below poverty line. Applications via local Panchayat or state welfare portal.',
      color: 'green',
    },
    {
      id: 'rvy',
      emoji: '♿',
      title: 'Rashtriya Vayoshri Yojana (RVY)',
      tag: 'Assistive Devices',
      description:
        'Provides free assistive devices to elderly: Wheelchairs, Walking sticks, Hearing aids, Spectacles, Artificial dentures. Devices are given through assessment camps or designated centres.',
      officialUrl: 'https://www.alimco.in/rashtriyavayoshriyojana.aspx',
      officialLabel: 'RVY Official Portal',
      youtube: [
        { label: 'RVY Application Videos', url: 'https://www.youtube.com/results?search_query=RVY+Application+Videos' },
      ],
      who: 'Senior citizens aged 60+ belonging to BPL category.',
      color: 'orange',
    },
    {
      id: 'ayushman',
      emoji: '🏥',
      title: 'Ayushman Bharat / PM-JAY',
      tag: 'Health Insurance',
      description:
        'Eligible elderly residents can receive cashless healthcare benefits up to ₹5 lakh per family per year where applicable. Senior citizens above 70 are now covered regardless of income.',
      officialUrl: 'https://pmjay.gov.in/',
      officialLabel: 'Ayushman Bharat PM-JAY',
      youtube: [
        { label: 'Ayushman Bharat Card Application', url: 'https://www.youtube.com/results?search_query=Ayushman+Bharat+Card+Application+Videos' },
      ],
      who: 'Eligible BPL families and senior citizens above 70. eKYC required.',
      color: 'teal',
    },
  ],
  children: [
    {
      id: 'vatsalya',
      emoji: '🌸',
      title: 'Mission Vatsalya',
      tag: 'Flagship Child Scheme',
      description:
        "India's flagship child protection scheme under the Ministry of Women & Child Development. Supports: Child Care Institutions (CCIs), Orphanages, Foster Care, Sponsorship, Adoption, Child Protection Services, Rehabilitation.",
      officialUrl: 'https://missionvatsalya.wcd.gov.in/',
      officialLabel: 'Mission Vatsalya Portal',
      secondaryUrl: 'https://wcd.gov.in/',
      secondaryLabel: 'WCD Ministry Guidelines',
      youtube: [
        { label: 'Mission Vatsalya Scheme', url: 'https://www.youtube.com/results?search_query=Mission+Vatsalya+Scheme+application' },
        { label: 'Mission Vatsalya Registration', url: 'https://www.youtube.com/results?search_query=Mission+Vatsalya+registration' },
      ],
      who: 'Registered Child Care Institutions (CCIs), NGOs running orphanages.',
      color: 'pink',
    },
    {
      id: 'cci',
      emoji: '🏠',
      title: 'Child Care Institution (CCI) Support',
      tag: 'Institution Grant',
      description:
        'Registered CCIs can receive assistance for: Food, Shelter, Education, Medical Care, Clothing, Staff Salary, Rehabilitation, Skill Development.',
      officialUrl: 'https://missionvatsalya.wcd.gov.in/',
      officialLabel: 'Mission Vatsalya Portal',
      youtube: [
        { label: 'CCI Registration', url: 'https://www.youtube.com/results?search_query=Child+Care+Institution+registration+India' },
        { label: 'Mission Vatsalya CCI Grant', url: 'https://www.youtube.com/results?search_query=Mission+Vatsalya+CCI+grant' },
      ],
      who: 'Institutions registered under JJ Act 2015 with CWC/DCPU.',
      color: 'indigo',
    },
    {
      id: 'scholarships',
      emoji: '📚',
      title: 'Scholarships for Children',
      tag: 'Education Support',
      description:
        'Children in orphanages may be eligible for: Pre-Matric & Post-Matric Scholarships, NSP Scholarships, Minority / SC / ST / BC Scholarships, Jnanabhumi (Andhra Pradesh).',
      officialUrl: 'https://scholarships.gov.in/',
      officialLabel: 'National Scholarship Portal',
      secondaryUrl: 'https://jnanabhumi.ap.gov.in/',
      secondaryLabel: 'AP Jnanabhumi Portal',
      youtube: [
        { label: 'NSP Application', url: 'https://www.youtube.com/results?search_query=National+Scholarship+Portal+application' },
        { label: 'Jnanabhumi Scholarship', url: 'https://www.youtube.com/results?search_query=Jnanabhumi+Scholarship+application' },
      ],
      who: 'Children enrolled in schools/colleges, especially SC/ST/Minority/BPL categories.',
      color: 'yellow',
    },
    {
      id: 'education',
      emoji: '🎓',
      title: 'Education Benefits',
      tag: 'RTE & Samagra',
      description:
        'Eligible children receive: Free School Education (RTE), Free Textbooks & Uniforms, Hostel Facilities, Mid-Day Meals, Skill Development & Vocational Training.',
      officialUrl: 'https://education.gov.in/',
      officialLabel: 'Education Ministry Portal',
      secondaryUrl: 'https://samagrashiksha.education.gov.in/',
      secondaryLabel: 'Samagra Shiksha',
      youtube: [
        { label: 'Samagra Shiksha Scheme', url: 'https://www.youtube.com/results?search_query=Samagra+Shiksha+scheme' },
      ],
      who: 'All children of school age, especially those in CCIs, orphanages, and government hostels.',
      color: 'green',
    },
  ],
  andhraPradesh: [
    {
      id: 'ap-pension',
      emoji: '💳',
      title: 'AP Social Security Pension',
      tag: 'Andhra Pradesh',
      description: 'State pension for elderly, widow, and disabled residents in Andhra Pradesh.',
      officialUrl: 'https://sspensions.ap.gov.in/',
      officialLabel: 'AP Pensions Portal',
      youtube: [{ label: 'AP Pension Application', url: 'https://www.youtube.com/results?search_query=Andhra+Pradesh+old+age+pension+application' }],
      color: 'blue',
    },
    {
      id: 'ap-ration',
      emoji: '🌾',
      title: 'AP Ration Card (EPDS)',
      tag: 'Food Security',
      description: 'Electronic Public Distribution System for food grain benefits in Andhra Pradesh.',
      officialUrl: 'https://epdsap.ap.gov.in/',
      officialLabel: 'AP EPDS Portal',
      youtube: [{ label: 'AP Ration Card Application', url: 'https://www.youtube.com/results?search_query=AP+Ration+Card+application' }],
      color: 'orange',
    },
    {
      id: 'ntrvaidya',
      emoji: '🏥',
      title: 'Dr. NTR Vaidya Seva',
      tag: 'Health Insurance — AP',
      description: 'Cashless health insurance scheme for BPL families in Andhra Pradesh. Covers hospitalization costs.',
      officialUrl: 'https://www.ntrvaidyaseva.ap.gov.in/',
      officialLabel: 'NTR Vaidya Seva Portal',
      youtube: [{ label: 'NTR Vaidya Seva Registration', url: 'https://www.youtube.com/results?search_query=NTR+Vaidya+Seva+registration' }],
      color: 'teal',
    },
    {
      id: 'sadarem',
      emoji: '♿',
      title: 'SADAREM — Disability Welfare (AP)',
      tag: 'Disability Certificate',
      description: 'AP Differently Abled Welfare Department. Provides disability certificates, assistive devices, and welfare benefits.',
      officialUrl: 'https://sadarem.ap.gov.in/',
      officialLabel: 'SADAREM Portal',
      youtube: [{ label: 'SADAREM Certificate', url: 'https://www.youtube.com/results?search_query=SADAREM+certificate+application' }],
      color: 'purple',
    },
    {
      id: 'ngodarpan',
      emoji: '🏢',
      title: 'NGO Darpan & CSR Portal',
      tag: 'Institution Support',
      description: 'Registered NGOs and Institutions can access Government Grants, CSR Funding, Donations, and Nutrition/Medical/Volunteer Support Programmes.',
      officialUrl: 'https://ngodarpan.gov.in/',
      officialLabel: 'NGO Darpan Registration',
      secondaryUrl: 'https://www.csr.gov.in/',
      secondaryLabel: 'CSR Portal',
      youtube: [
        { label: 'NGO Darpan Registration', url: 'https://www.youtube.com/results?search_query=NGO+Darpan+registration' },
        { label: 'CSR Funding for NGOs', url: 'https://www.youtube.com/results?search_query=CSR+funding+for+NGOs+India' },
      ],
      color: 'green',
    },
  ],
};

const ELIGIBILITY_TABLE = [
  { icon: '👴', type: 'Elderly (68 Years)', schemes: ['Old Age Pension (IGNOAPS)', 'Rashtriya Vayoshri (RVY)', 'Ayushman Bharat PM-JAY', 'AP Pension', 'AP Ration Card'] },
  { icon: '👵', type: 'Widow (62 Years)', schemes: ['Widow Pension (NSAP)', 'AP Social Security Pension', 'AP Ration Card', 'NTR Vaidya Seva'] },
  { icon: '👦', type: 'Orphan Child (12 Years)', schemes: ['Mission Vatsalya', 'CCI Support Grant', 'Scholarships (NSP/Jnanabhumi)', 'Education Benefits (RTE)'] },
  { icon: '♿', type: 'Disabled (18 Years)', schemes: ['Disability Pension (SADAREM)', 'SADAREM Certificate', 'Rashtriya Vayoshri (RVY)', 'Ayushman Bharat PM-JAY'] },
];

const COLOR_MAP = {
  blue: { card: 'border-blue-200 bg-blue-50', badge: 'bg-blue-100 text-blue-700', btn: 'bg-blue-600 hover:bg-blue-700', yt: 'bg-red-600 hover:bg-red-700' },
  purple: { card: 'border-purple-200 bg-purple-50', badge: 'bg-purple-100 text-purple-700', btn: 'bg-purple-600 hover:bg-purple-700', yt: 'bg-red-600 hover:bg-red-700' },
  green: { card: 'border-green-200 bg-green-50', badge: 'bg-green-100 text-green-700', btn: 'bg-green-700 hover:bg-green-800', yt: 'bg-red-600 hover:bg-red-700' },
  orange: { card: 'border-orange-200 bg-orange-50', badge: 'bg-orange-100 text-orange-700', btn: 'bg-orange-600 hover:bg-orange-700', yt: 'bg-red-600 hover:bg-red-700' },
  teal: { card: 'border-teal-200 bg-teal-50', badge: 'bg-teal-100 text-teal-700', btn: 'bg-teal-600 hover:bg-teal-700', yt: 'bg-red-600 hover:bg-red-700' },
  pink: { card: 'border-pink-200 bg-pink-50', badge: 'bg-pink-100 text-pink-700', btn: 'bg-pink-600 hover:bg-pink-700', yt: 'bg-red-600 hover:bg-red-700' },
  indigo: { card: 'border-indigo-200 bg-indigo-50', badge: 'bg-indigo-100 text-indigo-700', btn: 'bg-indigo-600 hover:bg-indigo-700', yt: 'bg-red-600 hover:bg-red-700' },
  yellow: { card: 'border-yellow-200 bg-yellow-50', badge: 'bg-yellow-100 text-yellow-700', btn: 'bg-yellow-600 hover:bg-yellow-700', yt: 'bg-red-600 hover:bg-red-700' },
};

function SchemeCard({ scheme }) {
  const [expanded, setExpanded] = useState(false);
  const c = COLOR_MAP[scheme.color] || COLOR_MAP.blue;
  return (
    <div className={`border rounded-2xl overflow-hidden transition-shadow hover:shadow-md ${c.card}`}>
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="text-3xl flex-shrink-0 mt-0.5">{scheme.emoji}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${c.badge}`}>{scheme.tag}</span>
                <h3 className="font-bold text-gray-900 text-base mt-1.5 leading-snug">{scheme.title}</h3>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">{scheme.description}</p>

            {scheme.who && (
              <div className="mt-3 flex items-start gap-2">
                <Users className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-500">{scheme.who}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-4">
              <a
                href={scheme.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-1.5 text-xs text-white px-3 py-1.5 rounded-lg font-semibold transition-colors ${c.btn}`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {scheme.officialLabel || 'Apply Now'}
              </a>
              {scheme.secondaryUrl && (
                <a
                  href={scheme.secondaryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg font-semibold hover:bg-white transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  {scheme.secondaryLabel}
                </a>
              )}
            </div>

            {scheme.youtube?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {scheme.youtube.map((yt, i) => (
                  <a
                    key={i}
                    href={yt.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg font-semibold transition-colors"
                  >
                    <Youtube className="w-3.5 h-3.5" />
                    {yt.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ emoji, title, subtitle, count }) {
  return (
    <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200">
      <div className="text-4xl">{emoji}</div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{subtitle} · <span className="font-semibold text-gray-700">{count} schemes</span></p>
      </div>
    </div>
  );
}

export default function SchemesPage() {
  const [activeSection, setActiveSection] = useState('all');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-700 via-primary-600 to-teal-600 text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <Shield className="w-4 h-4" />
            Government Welfare Schemes
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            Schemes for Homes & Residents
          </h1>
          <p className="text-lg text-primary-100 max-w-2xl mx-auto">
            A comprehensive guide to Central & State Government schemes for old-age homes,
            orphanages, and individual residents. Find eligibility, apply online, or watch
            step-by-step videos.
          </p>
        </div>
      </div>

      {/* Section Filter Tabs */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 flex gap-2 overflow-x-auto py-3">
          {[
            { id: 'all', label: '📋 All Schemes' },
            { id: 'oldAge', label: '👴 Old Age Homes' },
            { id: 'children', label: '👶 Orphanages & Children' },
            { id: 'andhraPradesh', label: '🏛️ Andhra Pradesh' },
            { id: 'eligibility', label: '✅ Eligibility Guide' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeSection === tab.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-14">

        {/* Old Age Homes */}
        {(activeSection === 'all' || activeSection === 'oldAge') && (
          <section>
            <SectionHeader
              emoji="👴"
              title="Schemes for Old Age Homes"
              subtitle="Central Government schemes for elderly welfare & institution support"
              count={SCHEMES.oldAge.length}
            />
            <div className="grid md:grid-cols-2 gap-5">
              {SCHEMES.oldAge.map((scheme) => (
                <SchemeCard key={scheme.id} scheme={scheme} />
              ))}
            </div>
          </section>
        )}

        {/* Orphanages */}
        {(activeSection === 'all' || activeSection === 'children') && (
          <section>
            <SectionHeader
              emoji="👶"
              title="Schemes for Orphanages & Children"
              subtitle="Central Government child welfare and education schemes"
              count={SCHEMES.children.length}
            />
            <div className="grid md:grid-cols-2 gap-5">
              {SCHEMES.children.map((scheme) => (
                <SchemeCard key={scheme.id} scheme={scheme} />
              ))}
            </div>
          </section>
        )}

        {/* Andhra Pradesh */}
        {(activeSection === 'all' || activeSection === 'andhraPradesh') && (
          <section>
            <SectionHeader
              emoji="🏛️"
              title="Andhra Pradesh State Schemes"
              subtitle="State-level welfare benefits for AP residents and institutions"
              count={SCHEMES.andhraPradesh.length}
            />
            <div className="grid md:grid-cols-2 gap-5">
              {SCHEMES.andhraPradesh.map((scheme) => (
                <SchemeCard key={scheme.id} scheme={scheme} />
              ))}
            </div>
          </section>
        )}

        {/* Eligibility Guide */}
        {(activeSection === 'all' || activeSection === 'eligibility') && (
          <section>
            <SectionHeader
              emoji="✅"
              title="Resident Eligibility Quick Reference"
              subtitle="Which schemes apply based on resident profile"
              count={ELIGIBILITY_TABLE.length}
            />

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-5 py-4 text-sm font-bold text-gray-700">Resident Profile</th>
                      <th className="text-left px-4 py-4 text-sm font-bold text-gray-700">Eligible Schemes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {ELIGIBILITY_TABLE.map((row) => (
                      <tr key={row.type} className="hover:bg-gray-50">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{row.icon}</span>
                            <p className="font-semibold text-gray-900 text-sm">{row.type}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            {row.schemes.map((s, i) => (
                              <span key={i} className="bg-primary-50 text-primary-700 text-xs px-2.5 py-1 rounded-full font-medium border border-primary-100">
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-5 bg-gradient-to-r from-primary-50 to-teal-50 border-t border-gray-100">
                <div className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-900 text-sm mb-1">💡 Feature: Scheme Recommendation Engine</p>
                    <p className="text-sm text-gray-600">
                      In the Manager and Admin dashboards, each resident's scheme eligibility,
                      application status, and next actions are tracked automatically based on their
                      profile (age, disability, gender, pension status). See the Reports section for
                      home-wise eligibility reports.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
