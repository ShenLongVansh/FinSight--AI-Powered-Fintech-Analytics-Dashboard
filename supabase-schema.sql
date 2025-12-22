-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('debit', 'credit')),
    category TEXT NOT NULL,
    bank_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create password_profiles table
CREATE TABLE IF NOT EXISTS password_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    encrypted_password TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_password_profiles_user_id ON password_profiles(user_id);

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies (users can only see their own data)
-- For now, we'll use a simple policy that allows all authenticated operations
-- In production, you'd want to verify the user_id matches the authenticated user

CREATE POLICY "Users can read own transactions" ON transactions
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own transactions" ON transactions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete own transactions" ON transactions
    FOR DELETE USING (true);

CREATE POLICY "Users can read own password profiles" ON password_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own password profiles" ON password_profiles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete own password profiles" ON password_profiles
    FOR DELETE USING (true);
