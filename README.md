Fraudent is an AI-powered forensic analysis portal designed to detect social media fraud, bot activity, and synthetic content.

Built with a high-stakes investigative aesthetic, the platform provides three core forensic tools:
1.Profile Audit: Analyzes account health by calculating follower-to-following ratios, scanning for financial scam keywords (like "crypto" or "invest"), and identifying bot-like behavioral patterns.
2.Content Forensic: Uses synthetic pattern recognition to determine if images or posts are AI-generated or authentic.
3.Profile Duel: A specialized comparison engine that pits two accounts against each other to identify imposters. It detects stolen profile pictures and uses behavioral analysis to conclude which account is the authentic source.
4.It uses Regression Model to analyze the profiles and classify them based on it's originality
The app leverages a logic-based ML engine and a regression model to calculate "Trust Scores," helping users navigate the digital landscape with forensic precision.
5. It uses Firebase as both backend and database(Firestore) and uses languages such as HTML,TAILWIND CSS ,REACT as frontend.
6.Firebase is used for user authentication too.
7.The app is build manly using Google AI Studio as platform and I have used many AI tools for ideas and error fixing.
8.I have used Google Console Cloud so that users can use their google accounts to login into the app

This app uses predefined profiles to check the user's profiles since we cant access any social media platform without their permission.
Few of the predefined profiles for checking are:
1. "travel_guru": { followers: 1200, following: 300, bio: "travel blogger", text: "just visited bali!", image: "travel.jpg" },
   "fitness_pro": { followers: 800, following: 250, bio: "fitness coach", text: "stay consistent", image: "gym.jpg" },
   "foodie_lover": { followers: 650, following: 400, bio: "food lover", text: "this pasta was insane!", image: "food.jpg" },
   "bot_king99": { followers: 40, following: 1800, bio: "earn money fast", text: "click here free money", image: "ai_bot.png" },
   "crypto_spam": { followers: 70, following: 1500, bio: "crypto expert", text: "invest now", image: "ai_crypto.png" }, // FIXED IMAGE NAME
   "nature_clicks": { followers: 900, following: 350, bio: "nature photography", text: "sunsets are always beautiful", image: "nature.jpg" },
   "giveaway_master": { followers: 60, following: 1700, bio: "daily giveaways", text: "win iphone free click link", image: "ai_giveaway.png" },
   "tech_guy": { followers: 1000, following: 500, bio: "tech enthusiast", text: "new laptop review coming soon", image: "tech.jpg" },
   "fake_model_ai": { followers: 30, following: 2000, bio: "model influencer", text: "dm for collab", image: "ai_model.png" },
   "student_life": { followers: 400, following: 300, bio: "engineering student", text: "exam week stress", image: "college.jpg" }

 2. This list MUST contain the filenames used above for the logic to trigger
const KNOWN_AI_IMAGES = [
'ai_bot.png',
'ai_crypto.png',
'ai_giveaway.png',
'ai_model.png'

APP LINK:https://fraudent.vercel.app/login


