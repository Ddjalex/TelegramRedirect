import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

const PAUSED_CHATS_FILE = join(process.cwd(), '.local', 'paused_chats.json');
const BUSINESS_CONNECTIONS_FILE = join(process.cwd(), '.local', 'business_connections.json');

interface PausedChats {
  [chatId: string]: {
    pausedAt: string;
    userName: string;
  };
}

interface BusinessConnection {
  connectionId: string;
  userChatId: string;
  userName: string;
  isEnabled: boolean;
  updatedAt: string;
}

interface BusinessConnections {
  [connectionId: string]: BusinessConnection;
}

function ensureDirectoryExists(filePath: string): void {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

// ============ BUSINESS CONNECTIONS (Telegram Business) ============

export function updateBusinessConnection(
  connectionId: string,
  userChatId: string,
  userName: string,
  isEnabled: boolean
): void {
  try {
    ensureDirectoryExists(BUSINESS_CONNECTIONS_FILE);
    
    let connections: BusinessConnections = {};
    if (existsSync(BUSINESS_CONNECTIONS_FILE)) {
      const data = readFileSync(BUSINESS_CONNECTIONS_FILE, 'utf-8');
      connections = JSON.parse(data);
    }
    
    connections[connectionId] = {
      connectionId,
      userChatId,
      userName,
      isEnabled,
      updatedAt: new Date().toISOString(),
    };
    
    writeFileSync(BUSINESS_CONNECTIONS_FILE, JSON.stringify(connections, null, 2));
  } catch (error) {
    console.error('Error updating business connection:', error);
  }
}

export function getBusinessConnection(connectionId: string): BusinessConnection | null {
  try {
    if (!existsSync(BUSINESS_CONNECTIONS_FILE)) {
      return null;
    }
    const data = readFileSync(BUSINESS_CONNECTIONS_FILE, 'utf-8');
    const connections: BusinessConnections = JSON.parse(data);
    return connections[connectionId] || null;
  } catch (error) {
    console.error('Error getting business connection:', error);
    return null;
  }
}

export function isBusinessConnectionEnabled(connectionId: string): boolean {
  const connection = getBusinessConnection(connectionId);
  return connection?.isEnabled ?? true; // Default to enabled if not found
}

export function getAllBusinessConnections(): BusinessConnections {
  try {
    if (!existsSync(BUSINESS_CONNECTIONS_FILE)) {
      return {};
    }
    const data = readFileSync(BUSINESS_CONNECTIONS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error getting all business connections:', error);
    return {};
  }
}

// ============ LEGACY CHAT PAUSING (for backward compatibility) ============

export function getPausedChats(): string[] {
  try {
    if (!existsSync(PAUSED_CHATS_FILE)) {
      return [];
    }
    const data = readFileSync(PAUSED_CHATS_FILE, 'utf-8');
    const paused: PausedChats = JSON.parse(data);
    return Object.keys(paused);
  } catch (error) {
    console.error('Error reading paused chats:', error);
    return [];
  }
}

export function pauseChat(chatId: string, userName: string): void {
  try {
    ensureDirectoryExists(PAUSED_CHATS_FILE);
    
    let paused: PausedChats = {};
    if (existsSync(PAUSED_CHATS_FILE)) {
      const data = readFileSync(PAUSED_CHATS_FILE, 'utf-8');
      paused = JSON.parse(data);
    }
    
    paused[chatId] = {
      pausedAt: new Date().toISOString(),
      userName,
    };
    
    writeFileSync(PAUSED_CHATS_FILE, JSON.stringify(paused, null, 2));
  } catch (error) {
    console.error('Error pausing chat:', error);
  }
}

export function resumeChat(chatId: string): void {
  try {
    if (!existsSync(PAUSED_CHATS_FILE)) {
      return;
    }
    
    const data = readFileSync(PAUSED_CHATS_FILE, 'utf-8');
    const paused: PausedChats = JSON.parse(data);
    
    delete paused[chatId];
    
    writeFileSync(PAUSED_CHATS_FILE, JSON.stringify(paused, null, 2));
  } catch (error) {
    console.error('Error resuming chat:', error);
  }
}

export function isChatPaused(chatId: string): boolean {
  const pausedChats = getPausedChats();
  return pausedChats.includes(chatId);
}
