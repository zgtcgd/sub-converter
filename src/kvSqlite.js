import Database from 'better-sqlite3';
import fs from 'fs';

if (!fs.existsSync('database')) {
  fs.mkdirSync('database');
}

const db = new Database('database/sublink_kv.db');

// 创建 KV 存储表
db.prepare(`
  CREATE TABLE IF NOT EXISTS kv (
    key TEXT PRIMARY KEY,
    value TEXT,
    expire_at INTEGER
  )
`).run();

// 创建自动更新任务表
db.prepare(`
CREATE TABLE IF NOT EXISTS auto_update_tasks (
  shortCode TEXT PRIMARY KEY,
  originalUrl TEXT NOT NULL,
  selectedRules TEXT,
  customRules TEXT,
  userAgent TEXT,
  configId TEXT,
  lastUpdate INTEGER NOT NULL,
  intervalMs INTEGER NOT NULL,
  created_at INTEGER DEFAULT (unixepoch())
)
`).run();

function now() {
  return Math.floor(Date.now() / 1000);
}

export function kvPut(key, value, { expirationTtl } = {}) {
  let expire_at = null;
  if (expirationTtl) {
    expire_at = now() + expirationTtl;
  }
  db.prepare(`
    INSERT INTO kv (key, value, expire_at)
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value=excluded.value, expire_at=excluded.expire_at
  `).run(key, value, expire_at);
}

export function kvGet(key) {
  const row = db.prepare('SELECT value, expire_at FROM kv WHERE key = ?').get(key);
  if (!row) return null;
  if (row.expire_at && row.expire_at < now()) {
    db.prepare('DELETE FROM kv WHERE key = ?').run(key);
    return null;
  }
  return row.value;
}

// 新增：保存自动更新任务
export function saveAutoUpdateTask(taskData) {
  const { shortCode, originalUrl, selectedRules, customRules, userAgent, configId, lastUpdate, intervalMs } = taskData;

  db.prepare(`
  INSERT OR REPLACE INTO auto_update_tasks
  (shortCode, originalUrl, selectedRules, customRules, userAgent, configId, lastUpdate, intervalMs)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    shortCode,
    originalUrl,
    JSON.stringify(selectedRules || []),
    JSON.stringify(customRules || []),
    userAgent || '',
    configId || '',
    Math.floor(lastUpdate.getTime() / 1000), // 存储为时间戳
    intervalMs
  );
}

// 新增：获取所有自动更新任务
export function getAllAutoUpdateTasks() {
  const rows = db.prepare('SELECT * FROM auto_update_tasks').all();

  return rows.map(row => ({
    shortCode: row.shortCode,
    originalUrl: row.originalUrl,
    selectedRules: row.selectedRules ? JSON.parse(row.selectedRules) : [],
    customRules: row.customRules ? JSON.parse(row.customRules) : [],
    userAgent: row.userAgent || '',
    configId: row.configId || '',
    lastUpdate: new Date(row.lastUpdate * 1000), // 从时间戳恢复为 Date 对象
    intervalMs: row.intervalMs
  }));
}

// 新增：删除自动更新任务
export function deleteAutoUpdateTask(shortCode) {
  const result = db.prepare('DELETE FROM auto_update_tasks WHERE shortCode = ?').run(shortCode);
  return result.changes;
}

// 新增：清理过期任务（可选）
export function cleanupExpiredTasks() {
  // 这里可以根据需要添加清理逻辑，比如清理长时间未更新的任务
  // 暂时保留所有任务
  return 0;
}
