import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const PAUSED_CHATS_FILE = join(process.cwd(), '.local', 'paused_chats.json');

interface PausedChats {
  [chatId: string]: {
    pausedAt: string;
    userName: string;
  };
}

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
