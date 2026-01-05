"use client";

import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Logo from '@/components/ui/Logo';

const PagesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
    <polyline points="2 17 12 22 22 17"></polyline>
    <polyline points="2 12 12 17 22 12"></polyline>
  </svg>
);

const DesignIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M14 19.9V16h3a2 2 0 0 0 2-2v-2H5v2c0 1.1.9 2 2 2h3v3.9a2 2 0 1 0 4 0Z"></path>
    <path d="M6 12V2h12v10"></path>
    <path d="M14 2v4"></path>
    <path d="M10 2v2"></path>
  </svg>
);

const WelcomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 12s2-5 10-5 10 5 10 5-2 5-10 5-10-5-10-5Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);
const RatingIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
);
const QuestionIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 12H6"></path><path d="M15 9h-3"></path><path d="M12 15H9"></path><path d="M8 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-1"></path><path d="M12 3V1"></path></svg>
);
const NegativeFeedbackIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17 14V2"></path><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L11 22Z"></path></svg>
);
const PrivateFeedbackIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 20V10"></path><path d="m16 10-4 4"></path><path d="m12 10 4 4"></path><path d="M3 10h4v4"></path><path d="M7 10 3 14"></path><circle cx="6" cy="6" r="3"></circle><path d="M17 17a2.5 2.5 0 0 0 0-5h-1.5a2.5 2.5 0 0 1 0-5H17"></path></svg>
);
const ConsentIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path><path d="m9 12 2 2 4-4"></path></svg>
);
const AboutYouIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="8" r="5"></circle><path d="M20 21a8 8 0 0 0-16 0"></path></svg>
);
const AboutCompanyIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path><rect width="20" height="14" x="2" y="6" rx="2"></rect></svg>
);
const ReadyToSendIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m22 2-7 20-4-9-9-4Z"></path><path d="m22 2-11 11"></path></svg>
);
const ThankYouIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M7 10v12"></path><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path></svg>
);

const iconMap: { [key: string]: React.ElementType } = {
  welcome: WelcomeIcon,
  rating: RatingIcon,
  question: QuestionIcon,
  question2: QuestionIcon,
  negative: NegativeFeedbackIcon,
  private: PrivateFeedbackIcon,
  consent: ConsentIcon,
  about: AboutYouIcon,
  company: AboutCompanyIcon,
  ready: ReadyToSendIcon,
  thankyou: ThankYouIcon,
};

const getPageIcon = (pageKey: string) => {
  const Icon = iconMap[pageKey];
  return Icon ? <Icon className="w-5 h-5 text-gray-400" /> : null;
};

// Minimal type to avoid importing from app route
type SidebarPage = { id: number; key: string; title: string; enabled: boolean };

interface Props {
  pages: SidebarPage[];
  onTogglePage: (id: number) => void;
}

const FormBuilderSidebar = ({ pages, onTogglePage }: Props) => {
  const [activeTab, setActiveTab] = useState<'Pages' | 'Design'>('Pages');

  return (
    <aside className="w-[26rem] flex-none flex flex-col bg-gray-950 h-screen border-l border-gray-800 text-white">
      <div className="grid grid-cols-2 divide-x divide-gray-800 border-b border-gray-800">
        <button
          onClick={() => setActiveTab('Pages')}
          className={`flex items-center justify-center gap-2 px-4 py-4 text-center transition-colors ${activeTab === 'Pages' ? 'bg-gray-800' : 'bg-transparent'
            }`}
        >
          <PagesIcon className={activeTab === 'Pages' ? 'text-purple-500' : 'text-gray-400'} />
          <span className={`text-sm font-medium ${activeTab === 'Pages' ? 'text-white' : 'text-gray-400'}`}>Pages</span>
        </button>
        <button
          onClick={() => setActiveTab('Design')}
          className={`flex items-center justify-center gap-2 px-4 py-4 text-center transition-colors ${activeTab === 'Design' ? 'bg-gray-800' : 'bg-transparent'
            }`}
        >
          <DesignIcon className={activeTab === 'Design' ? 'text-purple-500' : 'text-gray-400'} />
          <span className={`text-sm font-medium ${activeTab === 'Design' ? 'text-white' : 'text-gray-400'}`}>Design</span>
        </button>
      </div>

      {activeTab === 'Design' && (
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          <h3 className="text-base font-medium text-gray-300">Branding</h3>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Spokesperson avatar</label>
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <button className="text-sm border border-gray-700 rounded-md px-4 py-2 hover:bg-gray-800">
                Upload avatar
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Logo</label>
            <div className="bg-black/20 rounded-lg p-6 flex items-center justify-center border border-gray-800">
              <Logo size={32} className="mr-2" />
              <span className="text-white text-3xl font-bold">Creet</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Primary Color</label>
            <div className="flex items-center gap-2 border border-gray-800 bg-gray-900 rounded-md px-3 py-2">
              <div className="w-6 h-6 rounded-md bg-[#6701E6]"></div>
              <input type="text" defaultValue="#6701E6" className="bg-transparent text-white w-full focus:outline-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Heading Font</label>
            <select className="w-full bg-gray-900 border border-gray-800 rounded-md px-3 py-2 text-white">
              <option>Default</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Body Font</label>
            <select className="w-full bg-gray-900 border border-gray-800 rounded-md px-3 py-2 text-white">
              <option>DM Sans</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-400">Show Creet Powered By</label>
            <div className="relative">
              <input type="checkbox" id="power-toggle" className="sr-only peer" defaultChecked />
              <label htmlFor="power-toggle" className="flex items-center cursor-pointer w-12 h-6 bg-gray-700 rounded-full p-1 peer-checked:bg-purple-600 transition-colors">
                <span className="w-4 h-4 bg-white rounded-full shadow-md transform transition-transform translate-x-0 peer-checked:translate-x-6"></span>
              </label>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Pages' && (
        <div className="flex-grow overflow-y-auto p-6">
          <div className="relative flex flex-col items-center">
            {/* Dotted line */}
            <div className="absolute top-0 left-1/2 w-px h-full -translate-x-1/2 bg-[repeating-linear-gradient(0deg,transparent,transparent_4px,theme(colors.gray.800)_4px,theme(colors.gray.800)_8px)]"></div>

            <div className="flex flex-col gap-4 w-full">
              {pages.map((page) => (
                <div key={page.id} className="relative bg-gray-900 border border-gray-800 rounded-lg p-4 w-full z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getPageIcon(page.key)}
                      <h3 className="text-sm font-medium text-gray-300">{page.title}</h3>
                    </div>
                    <div className="relative">
                      <input
                        type="checkbox"
                        id={`page-toggle-${page.id}`}
                        className="sr-only peer"
                        checked={page.enabled}
                        onChange={() => onTogglePage(page.id)}
                      />
                      <label
                        htmlFor={`page-toggle-${page.id}`}
                        className="flex items-center cursor-pointer w-12 h-6 bg-gray-800 rounded-full p-1 transition-colors peer-checked:bg-purple-600"
                      >
                        <span className="w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 translate-x-0 peer-checked:translate-x-6"></span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default FormBuilderSidebar;
