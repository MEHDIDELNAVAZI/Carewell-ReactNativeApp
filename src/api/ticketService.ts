// services/ticketService.ts
import client from './client';

export interface Ticket {
  id: number;
  subject: string;
  status: 'open' | 'closed';
  unread_by_user: number;
  updated_at: string;
  last_message: {
    body: string;
    is_from_admin: boolean;
    created_at: string;
  } | null;
}

export interface TicketDetail extends Ticket {
  created_at: string;
  user: {
    id: number;
    full_name: string;
    email: string;
  };
}

export interface Message {
  id: number;
  sender_name: string;
  body: string;
  is_from_admin: boolean;
  is_read: boolean;
  created_at: string;
}

export interface CreateTicketData {
  subject: string;
  first_message: string;
}

export interface UnreadCount {
  unread_count: number;
  has_unread: boolean;
}

// ─── User Routes ───────────────────────────────────────────────────────────

export const getTickets = async (): Promise<Ticket[]> => {
  const { data } = await client.get<Ticket[]>('/tickets/');
  return data;
};

export const createTicket = async (subject: string, firstMessage: string): Promise<Ticket> => {
  const { data } = await client.post<Ticket>('/tickets/', { 
    subject, 
    first_message: firstMessage 
  });
  return data;
};

export const getUnreadCount = async (): Promise<UnreadCount> => {
  const { data } = await client.get<UnreadCount>('/tickets/unread/');
  return data;
};

export const getTicketDetail = async (ticketId: number): Promise<TicketDetail> => {
  const { data } = await client.get<TicketDetail>(`/tickets/${ticketId}/`);
  return data;
};

export const updateTicketStatus = async (ticketId: number, status: 'open' | 'closed'): Promise<TicketDetail> => {
  const { data } = await client.patch<TicketDetail>(`/tickets/${ticketId}/`, { status });
  return data;
};


export const deleteTicket = async (ticketId: number): Promise<void> => {
  await client.delete(`/tickets/${ticketId}/`);
};

export const getTicketMessages = async (ticketId: number): Promise<Message[]> => {
  const { data } = await client.get<Message[]>(`/tickets/${ticketId}/messages/`);
  return data;
};

export const sendMessage = async (ticketId: number, body: string): Promise<Message> => {
  const { data } = await client.post<Message>(`/tickets/${ticketId}/messages/`, { body });
  return data;
};