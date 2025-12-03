import { createClient } from '@supabase/supabase-js'

// Reemplaza con tus propios datos de Supabase
const supabaseUrl = 'https://rrkocjjdfhdnteoatqnd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJya29jampkZmhkbnRlb2F0cW5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MzcyMjYsImV4cCI6MjA4MDIxMzIyNn0.iyOyDAwfJqslwrhjvlr__E88Ut6QPgit6g8_J3H_8us';

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function getTickets() {
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .order('created_at', { ascending: false }); // Los más nuevos primero
  
  return { data, error };
}

export async function updateTicketStatus(ticketId, newStatus) {
  const { data, error } = await supabase
    .from('tickets')
    .update({ status: newStatus })
    .eq('id', ticketId)
    .select()
    .single();
  
  return { data, error };
}
