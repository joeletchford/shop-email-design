// Typed wrapper around the Quick client APIs.
//
// The real Quick client API for identity is `quick.id.waitForUser()` which
// returns a user object with email/firstName/fullName fields. There is no
// .get() method. (Old version of this file assumed there was — that was the
// "id.get is not a function" error.)

import type { Tokens, ComponentDef, Draft } from './types';

type QuickCollection = {
  find(): Promise<any>;
  findById(id: string): Promise<any>;
  create(obj: any): Promise<any>;
  update(id: string, data: any, options?: any): Promise<any>;
  delete(id: string): Promise<any>;
};

type QuickFileSystem = {
  uploadImage(file: File, options?: any): Promise<any>;
  getFullUrl(filename: string): string;
};

type QuickIdentity = {
  waitForUser(): Promise<{ email?: string; fullName?: string; firstName?: string } | null>;
  getUser(): { email?: string; fullName?: string; firstName?: string } | null;
  email: string | null;
  fullName: string | null;
};

type QuickClient = {
  db: { collection(name: string): QuickCollection };
  id: QuickIdentity;
  fs: QuickFileSystem;
};

declare global {
  interface Window {
    quick?: QuickClient;
  }
}

function requireQuick(): QuickClient {
  const q = window.quick;
  if (!q) {
    throw new Error('quick client not loaded.');
  }
  return q;
}

// ---- Admin allowlist ------------------------------------------------------
//
// Two tiers:
//   - `*@shopify.com` can see and use the app (Build tab).
//   - Only the explicit `ADMIN_EMAILS` list can edit Tokens + Catalog.
// Adjust `ADMIN_EMAILS` over time as more people need edit access.

const ADMIN_EMAILS = ['joe.letchford@shopify.com'];
const ALLOWED_DOMAIN = 'shopify.com';

export async function getCurrentIdentity(): Promise<{ email: string; name?: string } | null> {
  try {
    const user = await requireQuick().id.waitForUser();
    console.info('[quick] identity:', user);
    if (!user?.email) return null;
    return { email: user.email, name: user.fullName ?? user.firstName };
  } catch (e) {
    console.warn('[quick] waitForUser failed:', e);
    return null;
  }
}

export async function isAdmin(): Promise<boolean> {
  const id = await getCurrentIdentity();
  const email = id?.email?.toLowerCase();
  const ok = !!email && ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(email);
  console.info('[quick] isAdmin?', { email, ok });
  return ok;
}

export async function isShopifolk(): Promise<boolean> {
  const id = await getCurrentIdentity();
  const email = id?.email?.toLowerCase() ?? '';
  return email.endsWith('@' + ALLOWED_DOMAIN);
}

const CONFIG_COLLECTION = 'config';
const TOKENS_ID = 'tokens';

export async function loadTokens(): Promise<Tokens | null> {
  try {
    const row = await requireQuick().db.collection(CONFIG_COLLECTION).findById(TOKENS_ID);
    if (!row) return null;
    const { id: _id, ...value } = row;
    return value as Tokens;
  } catch (e) {
    console.warn('[quick] loadTokens fell through to null:', e);
    return null;
  }
}

export async function saveTokens(tokens: Tokens): Promise<void> {
  const col = requireQuick().db.collection(CONFIG_COLLECTION);
  const body = { id: TOKENS_ID, ...tokens };
  try {
    await col.create(body);
  } catch (e) {
    console.warn('[quick] saveTokens create failed, trying update:', e);
    await col.update(TOKENS_ID, body, { overwrite: true });
  }
}

const COMPONENTS_COLLECTION = 'components';

export async function loadComponents(): Promise<ComponentDef[]> {
  try {
    const result = await requireQuick().db.collection(COMPONENTS_COLLECTION).find();
    const rows: ComponentDef[] = Array.isArray(result)
      ? (result as ComponentDef[])
      : ((result as any)?.items ?? []);
    return rows.sort((a, b) => {
      if (a.category !== b.category) return a.category.localeCompare(b.category);
      return a.name.localeCompare(b.name);
    });
  } catch (e) {
    console.warn('[quick] loadComponents fell through to empty:', e);
    return [];
  }
}

export async function saveComponent(c: ComponentDef): Promise<void> {
  const col = requireQuick().db.collection(COMPONENTS_COLLECTION);
  try {
    await col.create(c);
  } catch (e) {
    console.warn('[quick] saveComponent create failed, trying update:', e);
    await col.update(c.id, c, { overwrite: true });
  }
}

export async function deleteComponent(id: string): Promise<void> {
  await requireQuick().db.collection(COMPONENTS_COLLECTION).delete(id);
}

// Wipe everything in quick.db and re-seed from the canonical seeds.
// Admin-only — used as an escape hatch when stored data drifts from the seed shape.
export async function resetToDefaults(
  seedTokens: Tokens,
  seedComponents: ComponentDef[]
): Promise<void> {
  const components = requireQuick().db.collection(COMPONENTS_COLLECTION);
  // Delete every existing component
  try {
    const existing = await loadComponents();
    for (const c of existing) {
      try { await components.delete(c.id); } catch (e) { console.warn('[reset] delete component', c.id, e); }
    }
  } catch (e) { console.warn('[reset] list components failed:', e); }
  // Delete tokens row
  const config = requireQuick().db.collection(CONFIG_COLLECTION);
  try { await config.delete(TOKENS_ID); } catch (e) { console.warn('[reset] delete tokens:', e); }
  // Re-seed
  await saveTokens(seedTokens);
  for (const c of seedComponents) await saveComponent(c);
}

// ---- Drafts ---------------------------------------------------------------

const DRAFTS_COLLECTION = 'drafts';

export async function loadDrafts(): Promise<Draft[]> {
  try {
    const result = await requireQuick().db.collection(DRAFTS_COLLECTION).find();
    const rows: Draft[] = Array.isArray(result)
      ? (result as Draft[])
      : ((result as any)?.items ?? []);
    return rows.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  } catch (e) {
    console.warn('[quick] loadDrafts fell through to empty:', e);
    return [];
  }
}

export async function loadDraft(id: string): Promise<Draft | null> {
  try {
    const row = await requireQuick().db.collection(DRAFTS_COLLECTION).findById(id);
    return row ? (row as Draft) : null;
  } catch (e) {
    console.warn('[quick] loadDraft fell through to null:', e);
    return null;
  }
}

export async function saveDraft(d: Draft): Promise<void> {
  const col = requireQuick().db.collection(DRAFTS_COLLECTION);
  try {
    await col.create(d);
  } catch (e) {
    await col.update(d.id, d, { overwrite: true });
  }
}

export async function deleteDraft(id: string): Promise<void> {
  await requireQuick().db.collection(DRAFTS_COLLECTION).delete(id);
}

// ---- File uploads ---------------------------------------------------------

export async function uploadImage(file: File): Promise<{ url: string; filename: string }> {
  const result = await requireQuick().fs.uploadImage(file);
  console.info('[quick] upload result:', result);
  const filename = result?.filename ?? result?.name ?? '';
  if (!filename) throw new Error('Upload returned no filename');
  const url = requireQuick().fs.getFullUrl(filename);
  return { url, filename };
}
