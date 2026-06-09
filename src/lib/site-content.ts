/** Central content constants for Westbridge Research public pages. */

export const ORG = {
  name: 'Westbridge Research',
  legalName: 'Strengthen Educational Welfare Society',
  registration: 'Registered under the Societies Registration Act, India (Act XXI of 1860)',
  founded: 2013,
  domain: 'westbridgeresearch.com',
  email: 'contact@westbridgeresearch.com',
  supportEmail: 'support@westbridgeresearch.com',
  office: 'Delhi, India',
  phone: '+91 11 4305 8842',
} as const;

export const STATS = {
  members: '12,481+',
  papers: '7,500+',
  years: '12+',
  researchers: '12,481+',
  projects: '2,130+',
  publications: '7,500+',
  awards: '150+',
  partners: '80+',
  countries: '83+',
} as const;

export const TRUST_SIGNALS = {
  partners: ['MIT Media Lab', 'Oxford University', 'Stanford Research', 'CERN', 'Max Planck Institute'],
  metrics: [
    { label: 'Global Researchers', value: '12,481+' },
    { label: 'Countries Represented', value: '83+' },
    { label: 'Published Papers', value: '7,500+' },
    { label: 'Active Projects', value: '2,130+' },
  ],
} as const;

export const MISSION =
  'Westbridge Research advances credible academic collaboration by connecting researchers, institutions, and industry teams through structured programs, publication support, and verified professional networks.';

export const PILLARS = [
  'Academic Excellence',
  'Industry Relevance',
  'Global Collaboration',
  'Verified Integrity',
] as const;

export const SERVICES = [
  {
    title: 'Research Consultation',
    description: 'Expert guidance on methodology, research design, implementation planning, and academic quality.',
  },
  {
    title: 'Publication Support',
    description: 'Editorial and submission support for journals, proceedings, peer review preparation, and revision strategy.',
  },
  {
    title: 'Data Analysis',
    description: 'Advanced statistical, computational, and technical analysis for research projects across disciplines.',
  },
  {
    title: 'Conference Pathways',
    description: 'Structured access to symposiums, presentation opportunities, and curated scholarly visibility.',
  },
  {
    title: 'Academic Projects',
    description: 'Mentored project tracks for students, faculty, and professionals working on applied research.',
  },
  {
    title: 'Industry Bridge Programs',
    description: 'Programs that connect academic work with corporate problem-solving, training, and research deployment.',
  },
] as const;

export const CONFERENCES = [
  {
    name: 'ICSD',
    slug: 'icsd',
    subtitle: 'International Conference on Sustainable Development',
    description: 'A Scopus-indexed sustainability forum for applied research, policy exchange, and interdisciplinary collaboration.',
    format: 'Hybrid',
  },
  {
    name: 'LLM Nexus',
    slug: 'llm-nexus',
    subtitle: 'AI and Large Language Models Research Symposium',
    description: 'A research symposium focused on trustworthy AI, language systems, and real-world academic and enterprise use cases.',
    format: 'Virtual',
  },
] as const;

export const ISRP = {
  name: 'International Student Research Program',
  partner: 'Global Universities',
  acceptanceRate: 'below 15%',
  benefits: [
    'International visibility',
    'Journal publication priority',
    'Peer review privileges',
  ],
} as const;

export const MEMBERSHIP_FUNNEL = [
  'Nomination or registration',
  'Application submission',
  'CV review',
  'Committee evaluation',
  'Induction',
] as const;
