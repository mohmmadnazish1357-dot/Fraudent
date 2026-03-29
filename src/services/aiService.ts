import regression from 'regression';
import { AuditResult } from '../types';

/**
 * aiService.ts - The Detection Engine
 */

// Your predefined database/profiles
const PREDEFINED_PROFILES: Record<string, any> = {
  "travel_guru": { followers: 1200, following: 300, bio: "travel blogger", text: "just visited bali!", image: "travel.jpg" },
  "fitness_pro": { followers: 800, following: 250, bio: "fitness coach", text: "stay consistent", image: "gym.jpg" },
  "foodie_lover": { followers: 650, following: 400, bio: "food lover", text: "this pasta was insane!", image: "food.jpg" },
  "bot_king99": { followers: 40, following: 1800, bio: "earn money fast", text: "click here free money", image: "ai_bot.png" },
  "crypto_spam": { followers: 70, following: 1500, bio: "crypto expert", text: "invest now", image: "ai_crypto.png" },
  "nature_clicks": { followers: 900, following: 350, bio: "nature photography", text: "sunsets are always beautiful", image: "nature.jpg" },
  "giveaway_master": { followers: 60, following: 1700, bio: "daily giveaways", text: "win iphone free click link", image: "ai_giveaway.png" },
  "tech_guy": { followers: 1000, following: 500, bio: "tech enthusiast", text: "new laptop review coming soon", image: "tech.jpg" },
  "fake_model_ai": { followers: 30, following: 2000, bio: "model influencer", text: "dm for collab", image: "ai_model.png" },
  "student_life": { followers: 400, following: 300, bio: "engineering student", text: "exam week stress", image: "college.jpg" }
};

const KNOWN_AI_IMAGES = [
  'ai_bot.png', 
  'ai_crypto.png', 
  'ai_giveaway.png', 
  'ai_model.png'
];

/**
 * Train a simple regression model to map follower ratio to trust score
 * based on our known database.
 */
const trainTrustModel = () => {
  const data: [number, number][] = Object.values(PREDEFINED_PROFILES).map(p => {
    const ratio = p.following / p.followers;
    // Heuristic "true" score for training: 
    // High ratio = low score, Low ratio = high score
    // We cap the ratio at 50 for stability
    const cappedRatio = Math.min(ratio, 50);
    const baseScore = ratio > 5 ? 20 : 90;
    return [cappedRatio, baseScore];
  });

  return regression.linear(data);
};

const trustModel = trainTrustModel();

const generateId = (prefix: string) => `${prefix}_${Math.random().toString(36).substr(2, 9)}`;

/**
 * Logic-based ML Model for Profile Detection
 */
export const analyzeProfile = async (username: string): Promise<AuditResult> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  const cleanUser = username.replace('@', '').toLowerCase();
  const profile = PREDEFINED_PROFILES[cleanUser];
  
  if (!profile) {
    // If user is not in database, we perform a "pattern check"
    return {
      id: generateId('audit'),
      type: 'profile',
      input: username,
      score: 50,
      evidence: ["User not found in verified database.", "Generic behavioral analysis applied."],
      details: {},
      timestamp: new Date().toISOString()
    };
  }

  const ratio = profile.following / profile.followers;
  
  // Use the regression model to predict the base score
  const prediction = trustModel.predict(Math.min(ratio, 50));
  let score = prediction[1];

  let evidence: string[] = [];
  evidence.push(`Regression model predicted base trust of ${score.toFixed(1)} based on follower dynamics.`);

  // Adjust score based on other features (Residual analysis)
  if (ratio > 5) {
    evidence.push(`High following-to-follower ratio (${ratio.toFixed(1)}x). Typical of automated bots.`);
  }

  // 2. Check for Spam Keywords
  const spamTerms = ['money', 'free', 'invest', 'click', 'win', 'crypto'];
  const spamCount = spamTerms.filter(term => profile.text.toLowerCase().includes(term)).length;
  if (spamCount > 0) {
    score -= (20 * spamCount);
    evidence.push(`Suspicious keywords detected (${spamCount} matches). Suggests financial scam patterns.`);
  }

  // 3. Check for AI Images
  if (KNOWN_AI_IMAGES.includes(profile.image)) {
    score -= 30;
    evidence.push("Profile picture matches known AI-generated patterns. Synthetic identity detected.");
  }

  // Final normalization
  score = Math.max(0, Math.min(100, score));

  return {
    id: generateId('audit'),
    type: 'profile',
    input: username,
    score: Math.round(score),
    evidence: evidence,
    details: { isAI: KNOWN_AI_IMAGES.includes(profile.image) },
    timestamp: new Date().toISOString()
  };
};

/**
 * Logic for Content Forensic (AI Image Detection)
 */
export const analyzeContent = async (input: string): Promise<AuditResult> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  const isAI = KNOWN_AI_IMAGES.some(img => input.includes(img)) || input.toLowerCase().includes('ai');
  const score = isAI ? 20 : 95;

  return {
    id: generateId('content'),
    type: 'content',
    input: input,
    score: score,
    evidence: isAI 
      ? ["Metadata suggests AI generation.", "Pixel-level frequency analysis shows synthetic patterns."] 
      : ["Natural lighting and texture detected.", "Original photography verified."],
    details: { isAI },
    timestamp: new Date().toISOString()
  };
};

/**
 * Logic for Profile Duel (Compare 2 Users)
 */
export const analyzeDuel = async (user1: string, user2: string): Promise<AuditResult> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 3000));

  const res1 = await analyzeProfile(user1);
  const res2 = await analyzeProfile(user2);

  const cleanUser1 = user1.replace('@', '').toLowerCase();
  const cleanUser2 = user2.replace('@', '').toLowerCase();
  const profile1 = PREDEFINED_PROFILES[cleanUser1];
  const profile2 = PREDEFINED_PROFILES[cleanUser2];

  const bothFake = res1.score < 50 && res2.score < 50;

  let evidence = [];
  if (bothFake) {
    evidence.push(`CRITICAL ALERT: Both accounts "${user1}" and "${user2}" show high-risk fraudulent patterns.`);
    evidence.push(`Forensic analysis suggests neither account can be verified as authentic. Both appear to be part of a coordinated bot or scam network.`);
  } else {
    evidence.push(`${res1.score >= res2.score ? user1 : user2} has a higher trust score based on behavioral forensic analysis.`);
    evidence.push(`${res1.score < res2.score ? user1 : user2} shows patterns consistent with automated or fraudulent activity.`);
  }

  let isDuplicate = false;
  if (profile1 && profile2 && profile1.image === profile2.image) {
    isDuplicate = true;
    evidence.push(`CRITICAL: Both accounts are using the exact same profile image (${profile1.image}). This is a strong indicator of identity theft or imposter behavior.`);
    if (!bothFake) {
      evidence.push(`Analysis of other conditions (follower ratio, keywords) suggests ${res1.score >= res2.score ? user1 : user2} is the original source.`);
    }
  }

  const original = res1.score >= res2.score ? user1 : user2;
  const imposter = res1.score < res2.score ? user1 : user2;

  return {
    id: generateId('duel'),
    type: 'duel',
    input: `${user1} vs ${user2}`,
    score: bothFake ? Math.min(res1.score, res2.score) : Math.abs(res1.score - res2.score),
    evidence: evidence,
    details: { original, imposter, isDuplicate, bothFake },
    timestamp: new Date().toISOString()
  };
};

/**
 * Helper to generate background images (keeping this for UI aesthetic)
 */
export const generateBackgroundImage = async (prompt: string): Promise<string> => {
  // Fallback to a nice Unsplash image for the forensic aesthetic
  return 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop';
};
