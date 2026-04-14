-- Create table for user preferences and memory
CREATE TABLE public.jarvis_memory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('preference', 'habit', 'routine', 'project', 'link', 'note')),
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  use_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.jarvis_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own memory" ON public.jarvis_memory FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_jarvis_memory_user_category ON public.jarvis_memory(user_id, category);
CREATE INDEX idx_jarvis_memory_key ON public.jarvis_memory(user_id, key);

-- Create table for conversation history
CREATE TABLE public.jarvis_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'jarvis')),
  content TEXT NOT NULL,
  action_taken JSONB DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.jarvis_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own conversations" ON public.jarvis_conversations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_jarvis_conversations_user ON public.jarvis_conversations(user_id, created_at DESC);

-- Create table for custom commands
CREATE TABLE public.jarvis_commands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  trigger_phrase TEXT NOT NULL,
  actions JSONB NOT NULL DEFAULT '[]',
  voice_response TEXT DEFAULT 'Done.',
  use_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.jarvis_commands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own commands" ON public.jarvis_commands FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create table for reminders
CREATE TABLE public.jarvis_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  remind_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_done BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.jarvis_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own reminders" ON public.jarvis_reminders FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_jarvis_memory_updated_at BEFORE UPDATE ON public.jarvis_memory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_jarvis_commands_updated_at BEFORE UPDATE ON public.jarvis_commands FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();