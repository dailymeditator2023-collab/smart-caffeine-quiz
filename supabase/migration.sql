-- Smart Caffeine Brain Buzz — Weekly Quiz Platform
-- FULL REBUILD: Drop old schema, create new

-- =============================================
-- 1. DROP OLD TABLES
-- =============================================
DROP TABLE IF EXISTS entries CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;

-- =============================================
-- 2. CREATE NEW TABLES
-- =============================================

-- Users table: email is the unique identity
CREATE TABLE users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text NOT NULL,
  streak int NOT NULL DEFAULT 0,
  last_played_week int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Attempts table: one attempt per email+topic+week
CREATE TABLE attempts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id),
  email text NOT NULL,
  topic text NOT NULL,
  week_number int NOT NULL,
  score int NOT NULL,
  time_seconds int NOT NULL,
  badges text[] DEFAULT '{}',
  answers_breakdown jsonb, -- [{selected: 0, correct_index: 1, is_correct: false}, ...]
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(email, topic, week_number)
);

-- Hall of Fame: weekly champions per topic
CREATE TABLE hall_of_fame (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  week_number int NOT NULL,
  topic text NOT NULL,
  user_id uuid REFERENCES users(id),
  user_name text NOT NULL,
  score int NOT NULL,
  time_seconds int NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Questions table: topic-based with optional week restriction
CREATE TABLE questions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  topic text NOT NULL,
  question text NOT NULL,
  options jsonb NOT NULL, -- ["Option A", "Option B", "Option C", "Option D"]
  correct_index int NOT NULL CHECK (correct_index >= 0 AND correct_index <= 3),
  week_number int, -- NULL = always active, set number to restrict to specific week
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- 3. INDEXES
-- =============================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_attempts_email ON attempts(email);
CREATE INDEX idx_attempts_leaderboard ON attempts(topic, week_number, score DESC, time_seconds ASC);
CREATE INDEX idx_attempts_user ON attempts(user_id);
CREATE INDEX idx_questions_topic ON questions(topic, active);
CREATE INDEX idx_hall_of_fame_week ON hall_of_fame(week_number DESC);

-- =============================================
-- 4. ROW LEVEL SECURITY
-- =============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE hall_of_fame ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Users: anyone can read (for login check) and insert (for registration)
CREATE POLICY "Public can read users" ON users FOR SELECT USING (true);
CREATE POLICY "Public can insert users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update own user" ON users FOR UPDATE USING (true);

-- Attempts: anyone can read (leaderboard) and insert (submit quiz)
CREATE POLICY "Public can read attempts" ON attempts FOR SELECT USING (true);
CREATE POLICY "Public can insert attempts" ON attempts FOR INSERT WITH CHECK (true);

-- Hall of Fame: read-only for public
CREATE POLICY "Public can read hall_of_fame" ON hall_of_fame FOR SELECT USING (true);

-- Questions: read-only for active questions
CREATE POLICY "Public can read active questions" ON questions FOR SELECT USING (active = true);

-- =============================================
-- 5. GRANT PERMISSIONS
-- =============================================
GRANT SELECT, INSERT, UPDATE ON users TO anon, authenticated;
GRANT SELECT, INSERT ON attempts TO anon, authenticated;
GRANT SELECT ON hall_of_fame TO anon, authenticated;
GRANT SELECT ON questions TO anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- =============================================
-- 6. SEED QUESTIONS (10 per topic, 5 topics = 50 questions)
-- =============================================

-- ---- TECH & AI ----
INSERT INTO questions (topic, question, options, correct_index) VALUES
('Tech & AI', 'What does GPT stand for in ChatGPT?', '["General Processing Technology", "Generative Pre-trained Transformer", "Global Pattern Tracker", "Guided Programming Tool"]', 1),
('Tech & AI', 'Which company created the iPhone?', '["Samsung", "Google", "Apple", "Microsoft"]', 2),
('Tech & AI', 'What does CPU stand for?', '["Central Processing Unit", "Computer Personal Utility", "Central Program Uploader", "Core Performance Unit"]', 0),
('Tech & AI', 'What year was the World Wide Web invented?', '["1985", "1989", "1993", "1995"]', 1),
('Tech & AI', 'Which programming language is most used for AI/ML?', '["Java", "C++", "Python", "Ruby"]', 2),
('Tech & AI', 'What does HTML stand for?', '["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Mail Link", "Home Tool Markup Language"]', 0),
('Tech & AI', 'Who is the CEO of Tesla and SpaceX?', '["Jeff Bezos", "Elon Musk", "Tim Cook", "Sundar Pichai"]', 1),
('Tech & AI', 'What does ''AI'' stand for?', '["Automated Intelligence", "Artificial Intelligence", "Advanced Integration", "Applied Informatics"]', 1),
('Tech & AI', 'Which company owns Instagram?', '["Google", "Twitter", "Meta (Facebook)", "Snapchat"]', 2),
('Tech & AI', 'What is the most visited website in the world?', '["Facebook", "YouTube", "Google", "Amazon"]', 2);

-- ---- CRICKET ----
INSERT INTO questions (topic, question, options, correct_index) VALUES
('Cricket', 'Who holds the record for most international centuries?', '["Ricky Ponting", "Sachin Tendulkar", "Virat Kohli", "Jacques Kallis"]', 1),
('Cricket', 'How many players are there in a cricket team?', '["9", "10", "11", "12"]', 2),
('Cricket', 'What is the maximum score a batsman can get off a single ball (without extras)?', '["4", "6", "8", "12"]', 1),
('Cricket', 'Which country won the first Cricket World Cup in 1975?', '["India", "Australia", "England", "West Indies"]', 3),
('Cricket', 'What does LBW stand for in cricket?', '["Left Before Wicket", "Leg Before Wicket", "Long Ball Wide", "Low Bounce Wicket"]', 1),
('Cricket', 'How many balls are there in a standard over?', '["4", "5", "6", "8"]', 2),
('Cricket', 'Which ground is known as the ''Home of Cricket''?', '["Eden Gardens", "MCG", "Lord''s", "The Oval"]', 2),
('Cricket', 'What is a ''hat-trick'' in cricket?', '["3 sixes in a row", "3 wickets in 3 consecutive balls", "3 catches in one over", "3 run-outs in one innings"]', 1),
('Cricket', 'Which IPL team has won the most titles (as of 2025)?', '["Royal Challengers Bangalore", "Chennai Super Kings", "Mumbai Indians", "Kolkata Knight Riders"]', 2),
('Cricket', 'What is the term for scoring zero runs?', '["Nil", "Duck", "Blank", "Zero-out"]', 1);

-- ---- SCIENCE ----
INSERT INTO questions (topic, question, options, correct_index) VALUES
('Science', 'What is the chemical symbol for water?', '["HO", "H2O", "O2H", "WA"]', 1),
('Science', 'How many bones does an adult human body have?', '["186", "206", "226", "256"]', 1),
('Science', 'Which planet is known as the Red Planet?', '["Venus", "Jupiter", "Mars", "Saturn"]', 2),
('Science', 'What is the speed of light approximately?', '["300,000 km/s", "150,000 km/s", "500,000 km/s", "1,000,000 km/s"]', 0),
('Science', 'What gas do plants absorb from the atmosphere?', '["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"]', 2),
('Science', 'What is the largest organ in the human body?', '["Liver", "Brain", "Lungs", "Skin"]', 3),
('Science', 'Which element has the chemical symbol ''Au''?', '["Silver", "Aluminum", "Gold", "Argon"]', 2),
('Science', 'What is the smallest unit of life?', '["Atom", "Molecule", "Cell", "Organ"]', 2),
('Science', 'Which ocean is the largest?', '["Atlantic", "Indian", "Arctic", "Pacific"]', 3),
('Science', 'What force keeps us on the ground?', '["Magnetism", "Friction", "Gravity", "Inertia"]', 2);

-- ---- BUSINESS & STARTUPS ----
INSERT INTO questions (topic, question, options, correct_index) VALUES
('Business & Startups', 'What does CEO stand for?', '["Chief Executive Officer", "Corporate Executive Operations", "Central Executive Office", "Chief Enterprise Organizer"]', 0),
('Business & Startups', 'Who founded Amazon?', '["Bill Gates", "Mark Zuckerberg", "Jeff Bezos", "Larry Page"]', 2),
('Business & Startups', 'What does IPO stand for?', '["International Public Offering", "Initial Public Offering", "Internal Profit Operation", "Investment Portfolio Option"]', 1),
('Business & Startups', 'Which company has the slogan ''Just Do It''?', '["Adidas", "Puma", "Reebok", "Nike"]', 3),
('Business & Startups', 'What is a ''unicorn'' in startup terms?', '["A startup with 100 employees", "A startup valued at $1 billion+", "A startup that IPOs in its first year", "A startup with zero funding"]', 1),
('Business & Startups', 'Which Indian startup became the most valued in 2024?', '["Flipkart", "Byju''s", "Swiggy", "Zerodha"]', 0),
('Business & Startups', 'What does B2B mean?', '["Business to Bank", "Business to Business", "Brand to Buyer", "Budget to Balance"]', 1),
('Business & Startups', 'Who is the co-founder of Microsoft alongside Bill Gates?', '["Steve Ballmer", "Paul Allen", "Steve Jobs", "Larry Ellison"]', 1),
('Business & Startups', 'What does ROI stand for?', '["Rate of Interest", "Return on Investment", "Revenue of Income", "Risk of Inflation"]', 1),
('Business & Startups', 'Which country is the largest economy in the world by GDP?', '["China", "Japan", "United States", "Germany"]', 2);

-- ---- COFFEE & CAFFEINE ----
INSERT INTO questions (topic, question, options, correct_index) VALUES
('Coffee & Caffeine', 'What is the primary active compound in coffee that makes you alert?', '["Melatonin", "Caffeine", "Serotonin", "Dopamine"]', 1),
('Coffee & Caffeine', 'How long does it take for caffeine to reach peak levels in your blood?', '["5 minutes", "15-45 minutes", "2 hours", "4 hours"]', 1),
('Coffee & Caffeine', 'What amino acid in tea promotes calm focus with caffeine?', '["L-Carnitine", "L-Glutamine", "L-Theanine", "L-Arginine"]', 2),
('Coffee & Caffeine', 'What is the half-life of caffeine in the average adult?', '["1-2 hours", "3-5 hours", "8-10 hours", "12-14 hours"]', 1),
('Coffee & Caffeine', 'Which of these is NOT a natural source of caffeine?', '["Guarana berries", "Cacao beans", "Spinach leaves", "Kola nuts"]', 2),
('Coffee & Caffeine', 'What does the term ''nootropic'' mean?', '["Energy booster", "Cognitive enhancer", "Sleep aid", "Muscle relaxant"]', 1),
('Coffee & Caffeine', 'Which country consumes the most coffee per capita?', '["USA", "Brazil", "Finland", "Italy"]', 2),
('Coffee & Caffeine', 'What type of coffee bean accounts for ~60% of world production?', '["Robusta", "Arabica", "Liberica", "Excelsa"]', 1),
('Coffee & Caffeine', 'What is an espresso shot typically measured in?', '["Cups", "Ounces/ml", "Liters", "Tablespoons"]', 1),
('Coffee & Caffeine', 'Which beverage has more caffeine per serving: coffee or green tea?', '["Green tea", "Coffee", "They are equal", "Depends on the brand"]', 1);
