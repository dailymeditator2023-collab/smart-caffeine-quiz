import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://mozygevmwrcuhtxeyjnr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1venlnZXZtd3JjdWh0eGV5am5yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjA1MjU3NywiZXhwIjoyMDg3NjI4NTc3fQ.HPTBMet-pgbfMkKc6bCl_0hFuNHsJwhMuu1FHluG0l8"
);

// Check if tables already exist by trying to read from them
const { error: campaignsErr } = await supabase.from("campaigns").select("id").limit(1);
if (!campaignsErr) {
  console.log("Tables already exist. Checking for data...");

  const { data: existingCampaigns } = await supabase.from("campaigns").select("id").limit(1);
  const { data: existingQuestions } = await supabase.from("questions").select("id").limit(1);

  if (existingCampaigns?.length > 0 && existingQuestions?.length > 0) {
    console.log("Data already seeded. Done.");
    process.exit(0);
  }
}

// If tables don't exist, we need to create them via SQL
// The Supabase JS client can't run DDL, so we'll use the management API
// For now, let's just try to seed data assuming tables were created via dashboard

console.log("Attempting to seed data...");

// Seed campaign
const { data: campaign, error: campErr } = await supabase
  .from("campaigns")
  .insert({ name: "Smart Caffeine Challenge - March 2026", prize_amount: 5000, is_active: true })
  .select("id")
  .single();

if (campErr) {
  console.error("Failed to seed campaign:", campErr.message);
  console.log("\nYou need to run the migration SQL first.");
  console.log("Go to: https://supabase.com/dashboard/project/mozygevmwrcuhtxeyjnr/sql/new");
  console.log("Paste the contents of supabase/migration.sql and click Run.");
  process.exit(1);
}

console.log("Campaign created:", campaign.id);

// Seed questions
const questions = [
  { question: 'What is the primary active compound in coffee that makes you feel alert?', options: ["Melatonin", "Caffeine", "Serotonin", "Dopamine"], correct_option: 1, category: 'caffeine' },
  { question: 'How long does it typically take for caffeine to reach peak levels in your blood?', options: ["5 minutes", "15-45 minutes", "2 hours", "4 hours"], correct_option: 1, category: 'caffeine' },
  { question: 'What amino acid in tea is known to promote calm focus when combined with caffeine?', options: ["L-Carnitine", "L-Glutamine", "L-Theanine", "L-Arginine"], correct_option: 2, category: 'caffeine' },
  { question: 'What is the half-life of caffeine in the average adult body?', options: ["1-2 hours", "3-5 hours", "8-10 hours", "12-14 hours"], correct_option: 1, category: 'caffeine' },
  { question: 'Which of these is NOT a natural source of caffeine?', options: ["Guarana berries", "Cacao beans", "Spinach leaves", "Kola nuts"], correct_option: 2, category: 'caffeine' },
  { question: 'What does the term "nootropic" mean?', options: ["Energy booster", "Mind-turning (cognitive enhancer)", "Sleep aid", "Muscle relaxant"], correct_option: 1, category: 'caffeine' },
  { question: 'Which country consumes the most coffee per capita?', options: ["USA", "Brazil", "Finland", "Italy"], correct_option: 2, category: 'caffeine' },
  { question: 'Which planet in our solar system has the most moons?', options: ["Jupiter", "Saturn", "Neptune", "Uranus"], correct_option: 1, category: 'trivia' },
  { question: 'What is the smallest country in the world by area?', options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"], correct_option: 1, category: 'trivia' },
  { question: 'How many bones does an adult human body have?', options: ["186", "206", "226", "256"], correct_option: 1, category: 'trivia' },
  { question: 'Which element has the chemical symbol "Au"?', options: ["Silver", "Aluminum", "Gold", "Argon"], correct_option: 2, category: 'trivia' },
  { question: 'What year did the first iPhone launch?', options: ["2005", "2006", "2007", "2008"], correct_option: 2, category: 'trivia' },
  { question: 'Which ocean is the largest?', options: ["Atlantic", "Indian", "Arctic", "Pacific"], correct_option: 3, category: 'trivia' },
  { question: 'In what city were the first modern Olympic Games held?', options: ["Paris", "Athens", "London", "Rome"], correct_option: 1, category: 'trivia' },
];

const { error: qErr } = await supabase.from("questions").insert(questions);
if (qErr) {
  console.error("Failed to seed questions:", qErr.message);
  process.exit(1);
}

console.log(`Seeded ${questions.length} questions. Done!`);
