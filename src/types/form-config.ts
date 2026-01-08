import { UUID } from 'crypto';

export interface Form {
  id: string;
  name: string;
  project_id: string;
  created_at: string;
  settings: any;
  project?: {
    id: string;
    name: string;
  };
  /** Number of testimonials submitted via this form (computed, not stored) */
  response_count?: number;
}

// ---------------------------------------------------------------- //
//                         Block Types Enum                         //
// ---------------------------------------------------------------- //

export enum FormBlockType {
  Welcome = 'welcome',
  Rating = 'rating',
  Question = 'question',
  NegativeFeedback = 'negative-feedback',
  PrivateFeedback = 'private-feedback',
  Consent = 'consent',
  AboutYou = 'about-you',
  AboutCompany = 'about-company',
  ReadyToSend = 'ready-to-send',
  ThankYou = 'thank-you',
}

// ---------------------------------------------------------------- //
//                       Base Block Interface                       //
// ---------------------------------------------------------------- //

export interface BaseBlockConfig {
  id: string;
  type: FormBlockType;
  enabled: boolean;
}

// ---------------------------------------------------------------- //
//                  Specific Block Configurations                   //
// ---------------------------------------------------------------- //

export interface WelcomeBlockConfig extends BaseBlockConfig {
  type: FormBlockType.Welcome;
  props: {
    title: string;
    description: string;
    buttonText: string;
    timingMessage: string;
    consentMessage: string;
    // logoUrl moved to theme level (FormTheme.logoUrl)
    titleColor: string;
    descriptionColor: string;
    buttonBgColor: string;
    buttonTextColor: string;
  };
}

export interface RatingBlockConfig extends BaseBlockConfig {
  type: FormBlockType.Rating;
  props: {
    title: string;
    description: string;
    titleColor: string;
    descriptionColor: string;
    buttonText: string;
  };
}

export interface QuestionBlockConfig extends BaseBlockConfig {
  type: FormBlockType.Question;
  props: {
    question: string;
    description: string;
    questionColor: string;
    descriptionColor: string;
    enableTextTestimonial: boolean;
    enableVideoTestimonial: boolean;
    videoOptionTitle: string;
    videoOptionDescription: string;
    textOptionTitle: string;
    textOptionDescription: string;
    tips: string[];
  };
}

export interface NegativeFeedbackBlockConfig extends BaseBlockConfig {
  type: FormBlockType.NegativeFeedback;
  props: {
    title: string;
    description: string;
    feedbackQuestion: string;
    feedbackPlaceholder: string;
    feedbackHelperText: string;
    buttonText: string;
    titleColor: string;
    descriptionColor: string;
    tips: string[];
  };
}

export interface PrivateFeedbackBlockConfig extends BaseBlockConfig {
  type: FormBlockType.PrivateFeedback;
  props: {
    title: string;
    description: string;
    placeholder: string;
    buttonText: string;
    titleColor: string;
  };
}

export interface ConsentBlockConfig extends BaseBlockConfig {
  type: FormBlockType.Consent;
  props: {
    title: string;
    description: string;
    // Usage permission options
    publicOptionTitle: string;
    publicOptionDescription: string;
    privateOptionTitle: string;
    privateOptionDescription: string;
    // Legacy checkbox (can be removed later)
    checkboxLabel: string;
    buttonText: string;
    trustNote: string;
    titleColor: string;
    descriptionColor: string;
  };
}

export interface AboutYouBlockConfig extends BaseBlockConfig {
  type: FormBlockType.AboutYou;
  props: {
    title: string;
    description: string;
    buttonText: string;
    titleColor: string;
    fields: {
      name: { enabled: boolean; required: boolean; label: string; placeholder: string };
      email: { enabled: boolean; required: boolean; label: string; placeholder: string };
      company: { enabled: boolean; required: boolean; label: string; placeholder: string };
      avatar: { enabled: boolean; required: boolean; label: string };
    };
  };
}

export interface AboutCompanyBlockConfig extends BaseBlockConfig {
  type: FormBlockType.AboutCompany;
  props: {
    title: string;
    description: string;
    buttonText: string;
    titleColor: string;
    fields: {
      companyName: { enabled: boolean; required: boolean; label: string; placeholder: string };
      jobTitle: { enabled: boolean; required: boolean; label: string; placeholder: string };
      companyWebsite: { enabled: boolean; required: boolean; label: string; placeholder: string };
      companyLogo: { enabled: boolean; required: boolean; label: string };
    };
  };
}

export interface ReadyToSendBlockConfig extends BaseBlockConfig {
  type: FormBlockType.ReadyToSend;
  props: {
    title: string;
    description: string;
    buttonText: string;
    titleColor: string;
    descriptionColor: string;
  };
}

export interface ThankYouBlockConfig extends BaseBlockConfig {
  type: FormBlockType.ThankYou;
  props: {
    title: string;
    description: string;
    showSocials: boolean;
    showAnimations: boolean;
    titleColor: string;
    descriptionColor: string;
  };
}

// ---------------------------------------------------------------- //
//                       Union Type for Blocks                      //
// ---------------------------------------------------------------- //

export type FormBlock =
  | WelcomeBlockConfig
  | RatingBlockConfig
  | QuestionBlockConfig
  | NegativeFeedbackBlockConfig
  | PrivateFeedbackBlockConfig
  | ConsentBlockConfig
  | AboutYouBlockConfig
  | AboutCompanyBlockConfig
  | ReadyToSendBlockConfig
  | ThankYouBlockConfig;

// ---------------------------------------------------------------- //
//                     Theme and Main Config                        //
// ---------------------------------------------------------------- //

export interface FormTheme {
  backgroundColor: string;
  logoUrl?: string;
  primaryColor: string;
  ratingColor: string; // Color for star ratings (default: yellow/amber)
  headingFont: string;
  bodyFont: string;
}

/**
 * Form Settings - Controls form behavior and logic
 * 
 * These settings determine how the form flows and behaves based on user input.
 */
export interface FormSettings {
  /**
   * Low Rating Threshold (1-4)
   * 
   * If a user's rating is STRICTLY BELOW this value (rating < threshold),
   * they will be redirected to the "Improvement Tips" page for private feedback.
   * 
   * If their rating is AT or ABOVE this value (rating >= threshold),
   * they proceed to the Question page for a positive testimonial.
   * 
   * Example:
   * - If set to 3: Ratings 1,2 go to Improvement Tips; Ratings 3,4,5 go to Question
   * - If set to 5: All ratings 1,2,3,4 go to Improvement Tips; only 5 goes to Question
   * 
   * Default: 3
   */
  lowRatingThreshold: 2 | 3 | 4 | 5;

  /**
   * Brand/Company Name
   * Used in card titles (e.g., "How was your experience with [Brand]?")
   * and in social share messages.
   * This can override the project-level brand name for this specific form.
   */
  brandName?: string;
}

/**
 * Rewards Configuration - Coupon/discount settings for testimonial submissions
 */
export interface RewardsConfig {
  /**
   * Master toggle to enable/disable rewards
   */
  enabled: boolean;

  /**
   * The coupon code to display to users
   */
  couponCode: string;

  /**
   * Description explaining the reward (e.g., "Use this code for 20% off your next order!")
   */
  description: string;

  /**
   * Which testimonial types are eligible for rewards
   * - 'all': Both video and text testimonials get rewards
   * - 'video': Only video testimonials get rewards
   * - 'text': Only text testimonials get rewards
   */
  eligibleTypes: 'all' | 'video' | 'text';

  /**
   * Optional expiry message (e.g., "Valid until Dec 31, 2024")
   */
  expiryMessage?: string;
}

export interface FormConfig {
  id: UUID;
  name: string;
  projectId: UUID;
  createdAt: string; // ISO 8601 date string
  theme: FormTheme;
  settings: FormSettings;
  rewards?: RewardsConfig;
  blocks: FormBlock[];
  brandName?: string; // Company/brand name for social sharing
}

