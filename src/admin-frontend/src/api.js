const cfg = () => window.gemfindRBAdminConfig || {};

export async function apiGet(path, params = {}) {
  const c = cfg();
  const url = new URL((c.restUrl || "").replace(/\/$/, "") + path, window.location.origin);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
  });
  const res = await fetch(url.toString(), {
    headers: { "X-WP-Nonce": c.nonce || "" },
    credentials: "same-origin",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Request failed");
  return data;
}

export async function apiPost(path, body) {
  const c = cfg();
  const url = (c.restUrl || "").replace(/\/$/, "") + path;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-WP-Nonce": c.nonce || "",
    },
    credentials: "same-origin",
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Request failed");
  return data;
}
