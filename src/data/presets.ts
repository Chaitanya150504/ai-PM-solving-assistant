import { ProblemInput } from '../types';

export interface PresetScenario {
  id: string;
  badge: string;
  title: string;
  description: string;
  input: ProblemInput;
}

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'food-delivery',
    badge: 'B2C Marketplace',
    title: 'Drop in Repeat Orders',
    description: 'Food delivery app seeing declining 30-day re-order rates among university students.',
    input: {
      problemStatement: 'Users of our food delivery app are placing fewer repeat orders.',
      productCompany: 'Food Delivery App',
      targetUsers: 'College Students',
      goal: 'Increase repeat orders',
      additionalContext:
        'New user sign-ups remain active, but users are ordering less frequently after their first orders. No baseline analytics or competitor data have been confirmed yet.',
    },
  },
  {
    id: 'b2b-saas-churn',
    badge: 'B2B SaaS',
    title: 'Post-Onboarding Churn',
    description: 'Mid-market accounts churn before reaching month 3 despite completing technical onboarding.',
    input: {
      problemStatement: 'Mid-market accounts are dropping product usage and churning heavily between day 30 and day 60.',
      productCompany: 'TaskFlow Work Management Suite',
      targetUsers: 'Product & Project Managers in companies of 100-500 employees',
      goal: 'Improve 90-day Net Revenue Retention and Weekly Active Team Members',
      additionalContext:
        'Admin managers set up team workspaces during trial, but team members abandon the interface and revert to Slack and spreadsheets. Support tickets show users find weekly planning ceremonies too rigid.',
    },
  },
  {
    id: 'fintech-kyc',
    badge: 'Fintech',
    title: 'KYC Verification Drop-off',
    description: '38% of prospective mobile banking customers abandon during identity photo verification.',
    input: {
      problemStatement: 'Over 38% of new users abandon account creation at the government ID photo and selfie verification step.',
      productCompany: 'Nova Digital Bank',
      targetUsers: 'Young professionals and gig workers opening primary mobile banking accounts',
      goal: 'Increase KYC completion rate from 62% to >80% without lowering fraud detection thresholds',
      additionalContext:
        'Drop-offs peak on optical document scanning errors and lighting issues on budget Android smartphones. Average time on step is 4.5 minutes before drop-off.',
    },
  },
  {
    id: 'marketplace-coldstart',
    badge: 'Marketplace',
    title: 'Merchant Cold-Start Problem',
    description: 'New artisan sellers leave within 14 days because their first listing receives zero views.',
    input: {
      problemStatement: 'Newly registered handmade goods sellers leave the platform after 14 days because their initial listings get virtually no impressions or sales.',
      productCompany: 'CraftHaven Marketplace',
      targetUsers: 'Independent artisans and small craft business owners',
      goal: 'Achieve at least 1 sale or 50 authentic views within 7 days for 40% of newly onboarded sellers',
      additionalContext:
        'Search algorithm currently favors established shops with high historical reviews and sales volume, starving new listings of discovery impressions.',
    },
  },
];
