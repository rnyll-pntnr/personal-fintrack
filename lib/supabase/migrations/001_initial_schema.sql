-- Create enums first
CREATE TYPE theme_accent AS ENUM ('blue', 'emerald', 'violet', 'rose');
CREATE TYPE recurring_frequency AS ENUM ('weekly', 'monthly', 'yearly');

-- Create tables with proper structure and RLS policies

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  theme_preference theme_accent DEFAULT 'blue',
  dark_mode boolean DEFAULT false,
  currency text DEFAULT 'AED',
  current_balance numeric DEFAULT 0,
  monthly_income numeric DEFAULT 0,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text NOT NULL,
  icon_name text,
  type text NOT NULL DEFAULT 'expense',
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT NOW()
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'AED',
  description text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  date timestamptz NOT NULL DEFAULT NOW(),
  created_at timestamptz DEFAULT NOW()
);

-- Income table
CREATE TABLE IF NOT EXISTS income (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'AED',
  description text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  date timestamptz NOT NULL DEFAULT NOW(),
  created_at timestamptz DEFAULT NOW()
);

-- Recurring items table
CREATE TABLE IF NOT EXISTS recurring_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  amount numeric NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  frequency recurring_frequency NOT NULL DEFAULT 'monthly',
  last_processed_date timestamptz,
  next_due_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT NOW()
);

-- RLS Policies

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT
  USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own categories" ON categories
  FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own categories" ON categories
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own categories" ON categories
  FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own categories" ON categories
  FOR DELETE
  USING (auth.uid() = user_id);

-- Expenses
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own expenses" ON expenses
  FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own expenses" ON expenses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own expenses" ON expenses
  FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own expenses" ON expenses
  FOR DELETE
  USING (auth.uid() = user_id);

-- Income
ALTER TABLE income ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own income" ON income
  FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own income" ON income
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own income" ON income
  FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own income" ON income
  FOR DELETE
  USING (auth.uid() = user_id);

-- Recurring Items
ALTER TABLE recurring_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own recurring items" ON recurring_items
  FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own recurring items" ON recurring_items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own recurring items" ON recurring_items
  FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own recurring items" ON recurring_items
  FOR DELETE
  USING (auth.uid() = user_id);

-- Functions

-- Function to mark recurring item as paid and create expense
CREATE OR REPLACE FUNCTION mark_recurring_as_paid(p_recurring_id uuid, p_user_id uuid)
RETURNS TABLE(success boolean, expense_id uuid) AS $$
DECLARE
  v_item recurring_items%ROWTYPE;
  v_expense_id uuid;
BEGIN
  -- Get the recurring item
  SELECT * INTO v_item
  FROM recurring_items
  WHERE id = p_recurring_id AND user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL;
    RETURN;
  END IF;

  -- Create expense record
  INSERT INTO expenses (user_id, amount, currency, description, category_id, date)
  VALUES (p_user_id, v_item.amount, 'AED', v_item.name, v_item.category_id, NOW())
  RETURNING id INTO v_expense_id;

  -- Update recurring item
  UPDATE recurring_items
  SET last_processed_date = NOW(),
      next_due_at = CASE
        WHEN frequency = 'weekly' THEN NOW() + INTERVAL '1 week'
        WHEN frequency = 'monthly' THEN NOW() + INTERVAL '1 month'
        WHEN frequency = 'yearly' THEN NOW() + INTERVAL '1 year'
        ELSE NOW() + INTERVAL '1 month'
      END
  WHERE id = p_recurring_id;

  RETURN QUERY SELECT true, v_expense_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get pending recurring items
CREATE OR REPLACE FUNCTION get_pending_recurring_items(p_user_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  name text,
  amount numeric,
  category_id uuid,
  frequency recurring_frequency,
  last_processed_date timestamptz,
  next_due_at timestamptz,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM recurring_items
  WHERE user_id = p_user_id
    AND (
      last_processed_date IS NULL OR
      DATE_TRUNC('month', last_processed_date) != DATE_TRUNC('month', NOW())
    )
  ORDER BY next_due_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get expense stats by category
CREATE OR REPLACE FUNCTION get_expense_stats(p_user_id uuid, p_start_date timestamptz, p_end_date timestamptz)
RETURNS TABLE(
  total_amount numeric,
  category_id uuid,
  category_name text,
  category_color text
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(e.amount), 0) as total_amount,
    c.id as category_id,
    c.name as category_name,
    c.color as category_color
  FROM expenses e
  LEFT JOIN categories c ON e.category_id = c.id
  WHERE e.user_id = p_user_id
    AND e.date BETWEEN p_start_date AND p_end_date
  GROUP BY c.id, c.name, c.color
  ORDER BY total_amount DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile and default categories on user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Create user profile
  INSERT INTO profiles (id, email)
  VALUES (new.id, new.email);

  -- Create default expense categories
  INSERT INTO categories (name, color, icon_name, type, user_id)
  VALUES
    ('Food', '#f97316', 'Utensils', 'expense', new.id),
    ('Transport', '#3b82f6', 'Car', 'expense', new.id),
    ('Utilities', '#eab308', 'Zap', 'expense', new.id),
    ('Entertainment', '#a855f7', 'Film', 'expense', new.id),
    ('Grocery', '#ec4899', 'ShoppingBag', 'expense', new.id),
    ('Healthcare', '#ef4444', 'Heart', 'expense', new.id),
    ('Education', '#06b6d4', 'GraduationCap', 'expense', new.id),
    ('Rent', '#14b8a6', 'Home', 'expense', new.id),
    ('Personal Care', '#f472b6', 'Sparkles', 'expense', new.id),
    ('Other', '#6b7280', 'MoreHorizontal', 'expense', new.id),
    -- Income categories
    ('Salary', '#10b981', 'Briefcase', 'income', new.id),
    ('Freelance', '#3b82f6', 'Laptop', 'income', new.id),
    ('Investments', '#8b5cf6', 'TrendingUp', 'income', new.id),
    ('Side Hustle', '#f59e0b', 'Zap', 'income', new.id),
    ('Rental Income', '#06b6d4', 'Home', 'income', new.id);

  RETURN new;
END;
$$;

-- Trigger on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime subscriptions
alter publication supabase_realtime add table expenses;
alter publication supabase_realtime add table income;
alter publication supabase_realtime add table recurring_items;
alter publication supabase_realtime add table categories;
alter publication supabase_realtime add table profiles;