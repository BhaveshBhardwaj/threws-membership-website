import type { LucideIcon } from 'lucide-react';
import { Award, Briefcase, Crown, GraduationCap, Star, Users } from 'lucide-react';

export type MembershipTierId =
  | 'student'
  | 'collaborator'
  | 'professional'
  | 'senior'
  | 'fellow'
  | 'distinguished_fellow';

export interface MembershipTier {
  id: MembershipTierId;
  name: string;
  tagline: string;
  price: number;
  priceLabel: string;
  period: string;
  admission: string;
  description: string;
  applyPath: string;
  icon: LucideIcon;
  featured?: boolean;
  features: string[];
  requirements: string[];
}

export const MEMBERSHIP_TIERS: MembershipTier[] = [
  {
    id: 'student',
    name: 'Student Researcher',
    tagline: 'Begin your research journey',
    price: 50,
    priceLabel: '$50',
    period: 'per year',
    admission: 'Open Application',
    description: 'For university students and early-stage researchers looking to join a credible academic network.',
    applyPath: '/membership/student',
    icon: GraduationCap,
    features: [
      'Digital member profile',
      'Access to student projects directory',
      'Community forums and networking events',
      'Discounted conference registrations',
    ],
    requirements: ['Valid student ID or university email', 'Brief statement of research interest'],
  },
  {
    id: 'collaborator',
    name: 'Collaborator',
    tagline: 'Active research participation',
    price: 150,
    priceLabel: '$150',
    period: 'per year',
    admission: 'Open Application',
    description: 'For independent researchers, academicians, and practitioners contributing to active projects.',
    applyPath: '/membership/collaborator',
    icon: Users,
    features: [
      'Digital member profile and directory listing',
      'Research syndicate publications access',
      'Project directory listing and collaborator search',
      'Application review within 7 to 14 business days',
    ],
    requirements: [
      'Valid academic or professional affiliation',
      'Completed application with motivation statement',
      'CV and profile photograph',
    ],
  },
  {
    id: 'professional',
    name: 'Professional Member',
    tagline: 'Industry and academic bridge',
    price: 250,
    priceLabel: '$250',
    period: 'per year',
    admission: 'Open Application',
    description: 'For established professionals seeking applied research opportunities and stronger scholarly ties.',
    applyPath: '/membership/professional',
    icon: Briefcase,
    features: [
      'Everything in Collaborator, plus',
      'Industry-focused research syndicates',
      'Professional networking events',
      '@westbridgeresearch.com academic email eligibility',
    ],
    requirements: ['3+ years of professional or academic experience', 'CV and professional references'],
  },
  {
    id: 'senior',
    name: 'Senior Member',
    tagline: 'Experienced leadership',
    price: 350,
    priceLabel: '$350',
    period: 'per year',
    admission: 'Committee Review',
    description: 'For senior researchers and industry leaders with a record of sustained contribution.',
    applyPath: '/membership/senior',
    icon: Star,
    featured: true,
    features: [
      'Everything in Professional Member, plus',
      'Priority peer-review syndicate access',
      'Featured researcher spotlight opportunities',
      'Voting rights in regional chapters',
    ],
    requirements: [
      '10+ years of research or industry experience',
      'Documented publications and achievements',
      '2 to 3 professional references',
    ],
  },
  {
    id: 'fellow',
    name: 'Fellow (F.Res)',
    tagline: 'Distinguished recognition',
    price: 450,
    priceLabel: '$450',
    period: 'per year',
    admission: 'By Nomination',
    description: 'A prestigious tier for outstanding contributors recognized by peers for scholarly or professional impact.',
    applyPath: '/membership/fellow',
    icon: Award,
    features: [
      'Everything in Senior Member, plus',
      'Fellow credential badge and digital certificate',
      'Fellowship verification via QR code',
      'Executive research board participation',
    ],
    requirements: [
      'Nomination by an existing Fellow or Senior Member',
      'Outstanding scholarly or industry contributions',
      'Committee and board approval',
    ],
  },
  {
    id: 'distinguished_fellow',
    name: 'Honorary Fellow',
    tagline: 'Invitation-only distinction',
    price: 0,
    priceLabel: 'Honorary',
    period: 'lifetime',
    admission: 'By Invitation Only',
    description: 'Our highest distinction, reserved for global leaders shaping the future of research, education, and enterprise.',
    applyPath: '/honorary-fellow',
    icon: Crown,
    features: [
      'Everything in Fellow, plus',
      'Grants and closed-event access',
      'Lifetime membership without dues',
      'Keynote speaking opportunities',
    ],
    requirements: ['Invitation by the board of directors', 'Globally recognized impact and leadership'],
  },
];

export function getTierById(id: MembershipTierId): MembershipTier | undefined {
  return MEMBERSHIP_TIERS.find((tier) => tier.id === id);
}

export function formatTierPrice(tier: MembershipTier): string {
  return `${tier.priceLabel} ${tier.period}`;
}

export function normalizeTierId(legacy: string): MembershipTierId | undefined {
  const map: Record<string, MembershipTierId> = {
    associate: 'collaborator',
    senior: 'senior',
    fellow: 'fellow',
    honorary_fellow: 'distinguished_fellow',
    'honorary-fellow': 'distinguished_fellow',
    distinguished_fellow: 'distinguished_fellow',
    'distinguished-fellow': 'distinguished_fellow',
    student: 'student',
    collaborator: 'collaborator',
    professional: 'professional',
  };

  return map[legacy];
}
