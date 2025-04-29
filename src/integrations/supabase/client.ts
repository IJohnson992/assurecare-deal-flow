
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://bvzbpflkjluapzyvfhcz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2emJwZmxramx1YXB6eXZmaGN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MzE2MDEsImV4cCI6MjA2MTUwNzYwMX0.9zpXCbAgNNekKPD9e4U5X_h9WLFkARaKqDv5i5c6CPw";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Function to fetch stage probabilities from Supabase
export async function fetchStageProbabilities() {
  const { data, error } = await supabase
    .from('stage_probabilities')
    .select('*')
    .order('id', { ascending: true });
  
  if (error) {
    console.error('Error fetching stage probabilities:', error);
    return null;
  }
  
  return data;
}

// Function to get user preferences or create default if not exists
export async function getUserPreferences(userId: string) {
  if (!userId) return null;
  
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching user preferences:', error);
    return null;
  }
  
  // If the user doesn't have preferences yet, create default preferences
  if (!data) {
    const defaultPreferences = {
      user_id: userId,
      pipeline_view_type: 'card',
      dashboard_value_type: 'total'
    };
    
    const { data: newPreferences, error: insertError } = await supabase
      .from('user_preferences')
      .insert(defaultPreferences)
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating default user preferences:', insertError);
      return defaultPreferences;
    }
    
    return newPreferences;
  }
  
  return data;
}

// Function to update user preferences
export async function updateUserPreferences(userId: string, preferences: Partial<{
  pipeline_view_type: 'card' | 'list',
  dashboard_value_type: 'total' | 'arr'
}>) {
  if (!userId) return null;
  
  const { data, error } = await supabase
    .from('user_preferences')
    .update(preferences)
    .eq('user_id', userId)
    .select();
  
  if (error) {
    console.error('Error updating user preferences:', error);
    return null;
  }
  
  return data;
}
