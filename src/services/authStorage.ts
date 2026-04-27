import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export interface StoredUser {
  fullName: string;
  firstName: string;
  lastName: string;
  netId: string;
  email: string;
  major: string;
  classLevel: string;
  courses: string[];
  passwordHash: string;
}

const USERS_KEY = 'minita-users-db';
const AUDIT_KEY = 'minita-auth-audit';
const USERS_FILE = `${FileSystem.documentDirectory ?? ''}users-db.txt`;
const AUDIT_FILE = `${FileSystem.documentDirectory ?? ''}auth-audit.txt`;
const DEFAULT_COURSES = ['Physics 2325', 'Math 2417', 'CS 3354', 'History 1301'];

function isWeb() {
  return Platform.OS === 'web';
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? 'Student',
    lastName: parts.slice(1).join(' ') || 'User',
  };
}

function normalizeUser(rawUser: Partial<StoredUser> & { fullName?: string; netId?: string; email?: string; major?: string; passwordHash?: string }): StoredUser {
  const fullName = rawUser.fullName?.trim() || 'Student User';
  const names = splitName(fullName);
  const netId = rawUser.netId?.trim() || 'student';
  return {
    fullName,
    firstName: rawUser.firstName?.trim() || names.firstName,
    lastName: rawUser.lastName?.trim() || names.lastName,
    netId,
    email: rawUser.email?.trim() || `${netId.toLowerCase()}@utdallas.edu`,
    major: rawUser.major?.trim() || 'Computer Science',
    classLevel: rawUser.classLevel?.trim() || 'Senior',
    courses: Array.isArray(rawUser.courses) && rawUser.courses.length > 0 ? rawUser.courses : DEFAULT_COURSES,
    passwordHash: rawUser.passwordHash?.trim() || '',
  };
}

function readWebValue(key: string) {
  if (typeof localStorage === 'undefined') {
    return '';
  }
  return localStorage.getItem(key) ?? '';
}

function writeWebValue(key: string, value: string) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(key, value);
  }
}

async function ensureNativeFile(path: string) {
  if (!path) {
    throw new Error('Storage is unavailable in this environment.');
  }
  const info = await FileSystem.getInfoAsync(path);
  if (!info.exists) {
    await FileSystem.writeAsStringAsync(path, '');
  }
}

async function readTextStore(key: string, path: string) {
  if (isWeb()) {
    return readWebValue(key);
  }
  await ensureNativeFile(path);
  return FileSystem.readAsStringAsync(path);
}

async function writeTextStore(key: string, path: string, value: string) {
  if (isWeb()) {
    writeWebValue(key, value);
    return;
  }
  await ensureNativeFile(path);
  await FileSystem.writeAsStringAsync(path, value);
}

async function writeUsers(users: StoredUser[]) {
  const serialized = users.map(user => JSON.stringify(user)).join('\n');
  await writeTextStore(USERS_KEY, USERS_FILE, serialized);
}

async function appendLine(key: string, path: string, line: string) {
  const existing = await readTextStore(key, path);
  const next = existing.trim().length > 0 ? `${existing.trim()}\n${line}` : line;
  await writeTextStore(key, path, next);
}

function deserializeUsers(raw: string): StoredUser[] {
  return raw
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => normalizeUser(JSON.parse(line) as Partial<StoredUser>));
}

export async function hashPassword(password: string) {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password);
}

export async function readUsers() {
  const raw = await readTextStore(USERS_KEY, USERS_FILE);
  return deserializeUsers(raw);
}

export async function registerUser(input: {
  fullName: string;
  firstName?: string;
  lastName?: string;
  netId: string;
  password: string;
  major?: string;
  classLevel?: string;
  courses?: string[];
}) {
  const users = await readUsers();
  const normalizedNetId = input.netId.trim().toLowerCase();
  const existing = users.find(user => user.netId.toLowerCase() === normalizedNetId);
  if (existing) {
    throw new Error('An account with that NetID already exists.');
  }

  const names = splitName(input.fullName);
  const user: StoredUser = normalizeUser({
    fullName: input.fullName.trim(),
    firstName: input.firstName?.trim() || names.firstName,
    lastName: input.lastName?.trim() || names.lastName,
    netId: input.netId.trim(),
    email: `${normalizedNetId}@utdallas.edu`,
    major: input.major?.trim() || 'Computer Science',
    classLevel: input.classLevel?.trim() || 'Senior',
    courses: input.courses?.length ? input.courses : DEFAULT_COURSES,
    passwordHash: await hashPassword(input.password),
  });

  await appendLine(USERS_KEY, USERS_FILE, JSON.stringify(user));
  await appendLine(
    AUDIT_KEY,
    AUDIT_FILE,
    `${new Date().toISOString()} | REGISTER | ${user.netId} | ${user.email}`,
  );
  return user;
}

export async function loginUser(netId: string, password: string) {
  const users = await readUsers();
  const normalizedNetId = netId.trim().toLowerCase();
  const passwordHash = await hashPassword(password);
  const user = users.find(
    entry => entry.netId.toLowerCase() === normalizedNetId && entry.passwordHash === passwordHash,
  );

  await appendLine(
    AUDIT_KEY,
    AUDIT_FILE,
    `${new Date().toISOString()} | LOGIN_${user ? 'SUCCESS' : 'FAILED'} | ${normalizedNetId}`,
  );

  if (!user) {
    throw new Error('Incorrect NetID or password.');
  }

  return user;
}

export async function updateUserPassword(input: {
  netId: string;
  currentPassword: string;
  newPassword: string;
}) {
  const users = await readUsers();
  const normalizedNetId = input.netId.trim().toLowerCase();
  const currentPasswordHash = await hashPassword(input.currentPassword);
  const userIndex = users.findIndex(
    entry => entry.netId.toLowerCase() === normalizedNetId && entry.passwordHash === currentPasswordHash,
  );

  if (userIndex === -1) {
    throw new Error('Current password is incorrect.');
  }

  users[userIndex] = {
    ...users[userIndex],
    passwordHash: await hashPassword(input.newPassword),
  };

  await writeUsers(users);
  await appendLine(
    AUDIT_KEY,
    AUDIT_FILE,
    `${new Date().toISOString()} | PASSWORD_UPDATED | ${normalizedNetId}`,
  );

  return users[userIndex];
}
