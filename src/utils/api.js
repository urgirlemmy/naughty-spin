// ── Central API client ────────────────────────────────────────────────────────
// All requests go through here. Handles:
// - Base URL from env
// - Auth token injection
// - Response normalisation → always returns { ok, data, error }
// - Token persistence in localStorage

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
const TOKEN_KEY = 'ns_token';

// ── Token helpers ─────────────────────────────────────────────────────────────
export const tokenStore = {
    get: () => localStorage.getItem(TOKEN_KEY),
    set: (token) => localStorage.setItem(TOKEN_KEY, token),
    clear: () => localStorage.removeItem(TOKEN_KEY),
};

// ── Core fetch wrapper ────────────────────────────────────────────────────────
async function request(method, path, body = null, auth = true) {
    const headers = { 'Content-Type': 'application/json' };

    if (auth) {
        const token = tokenStore.get();
        if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    try {
        const res = await fetch(`${BASE_URL}${path}`, options);
        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
            return {
                ok: false,
                error: json.error ?? json.message ?? `Request failed (${res.status})`,
                details: json.details ?? null,
                status: res.status,
            };
        }

        return { ok: true, data: json };
    } catch (err) {
        return {
            ok: false,
            error: 'Network error — is the API server running?',
            status: 0,
        };
    }
}

// ── Convenience methods ───────────────────────────────────────────────────────
const get = (path, auth = true) => request('GET', path, null, auth);
const post = (path, body, auth = true) => request('POST', path, body, auth);
const patch = (path, body, auth = true) => request('PATCH', path, body, auth);
const del = (path, body = null, auth = true) => request('DELETE', path, body, auth);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
    register: (username, password) =>
        post('/auth/register', { username, password }, false),

    login: (username, password) =>
        post('/auth/login', { username, password }, false),

    logout: () =>
        post('/auth/logout'),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersApi = {
    me: () => get('/users/me'),
    updateUsername: (username) => patch('/users/me/username', { username }),
    updateEmail: (email) => patch('/users/me/email', { email }),
    updatePassword: (current_password, new_password) =>
        patch('/users/me/password', { current_password, new_password }),
    deleteAccount: (password) => del('/users/me', { password }),
};

// ── Prizes ────────────────────────────────────────────────────────────────────
export const prizesApi = {
    list: () => get('/prizes', false),      // public
    listAll: () => get('/prizes/all'),          // admin
    create: (prize) => post('/prizes', prize),      // admin
    update: (id, data) => patch(`/prizes/${id}`, data),// admin
    remove: (id) => del(`/prizes/${id}`),        // admin
};

// ── Spins ─────────────────────────────────────────────────────────────────────
export const spinsApi = {
    perform: () => post('/spins/perform'),
    history: (limit = 20, offset = 0) => get(`/spins/history?limit=${limit}&offset=${offset}`),
    claims: (limit = 20, offset = 0) => get(`/spins/claims?limit=${limit}&offset=${offset}`),
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminApi = {
    users: () => get('/admin/users'),
    giveSpins: (user_id, amount) => post('/admin/give-spins', { user_id, amount }),
    claims: (status, limit = 20, offset = 0) =>
        get(`/admin/claims?limit=${limit}&offset=${offset}${status ? `&status=${status}` : ''}`),
    markClaimed: (id) => patch(`/admin/claims/${id}/claim`),
    log: (limit = 20, offset = 0) =>
        get(`/admin/log?limit=${limit}&offset=${offset}`),
    stats: () => get('/admin/stats'),
    reset: () => post('/admin/reset'),
};