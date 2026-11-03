
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  PlusCircle,
  LogIn,
  LogOut,
  PackageSearch,
  MapPin,
  CalendarDays,
  User,
  X,
  ClipboardList
} from "lucide-react";
import "./App.css";

const API = "http://localhost:5001/api";

const emptyForm = {
  title: "",
  type: "lost",
  category: "Electronics",
  description: "",
  location: "",
  date: new Date().toISOString().slice(0, 10),
  imageUrl: ""
};

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("cc_token") || "");
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("cc_user") || "null")
  );
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState("home");
  const [form, setForm] = useState(emptyForm);
  const [auth, setAuth] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [authMode, setAuthMode] = useState("login");
  const [claim, setClaim] = useState(null);
  const [proof, setProof] = useState("");
  const [notice, setNotice] = useState("");

  const headers = useMemo(() => ({
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }), [token]);

  async function request(path, options = {}) {
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {})
      }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || `Request failed: ${response.status}`);
    }

    return data;
  }

  async function loadItems() {
    try {
      const params = new URLSearchParams();

      if (filter !== "all") params.set("type", filter);
      if (search.trim()) params.set("search", search.trim());

      const data = await request(`/items?${params.toString()}`);

      setItems(
        Array.isArray(data)
          ? data
          : Array.isArray(data.items)
            ? data.items
            : []
      );
    } catch (error) {
      setNotice(error.message);
    }
  }

  async function loadClaims() {
    try {
      const data = await request("/claims/mine");
      const myClaims = Array.isArray(data)
        ? data
        : data.claims || [];

      setClaims(myClaims);
      setPage("claims");
      setNotice(
        myClaims.length
          ? ""
          : "You have not submitted any claims yet."
      );
    } catch (error) {
      setNotice(error.message);
    }
  }

  useEffect(() => {
    loadItems();
  }, [token, filter, search]);

  function saveSession(data) {
    if (!data.token || !data.user) {
      setNotice("Login response is missing user or token.");
      return;
    }

    localStorage.setItem("cc_token", data.token);
    localStorage.setItem("cc_user", JSON.stringify(data.user));

    setToken(data.token);
    setUser(data.user);
    setPage("home");
    setNotice("Welcome to CampusConnect!");
  }

  async function submitAuth(event) {
    event.preventDefault();

    try {
      const path = authMode === "login"
        ? "/auth/login"
        : "/auth/register";

      const data = await request(path, {
        method: "POST",
        body: JSON.stringify(auth)
      });

      saveSession(data);
    } catch (error) {
      setNotice(error.message);
    }
  }

  async function submitItem(event) {
    event.preventDefault();

    try {
      await request("/items", {
        method: "POST",
        body: JSON.stringify(form)
      });

      setForm(emptyForm);
      setPage("home");
      setNotice("Your item report was published.");
      await loadItems();
    } catch (error) {
      setNotice(error.message);
    }
  }

  async function submitClaim(event) {
    event.preventDefault();

    if (!claim?._id || !proof.trim()) {
      setNotice("Please enter ownership proof.");
      return;
    }

    try {
      await request("/claims", {
        method: "POST",
        body: JSON.stringify({
          item: claim._id,
          proofDescription: proof.trim()
        })
      });

      setClaim(null);
      setProof("");
      setNotice("Claim submitted successfully for review.");
    } catch (error) {
      setNotice(error.message);
    }
  }

  function logout() {
    localStorage.removeItem("cc_token");
    localStorage.removeItem("cc_user");

    setToken("");
    setUser(null);
    setItems([]);
    setClaims([]);
    setPage("home");
    setNotice("You have logged out.");
  }

  const visibleItems = items.filter(item => {
    const text = [
      item.title,
      item.description,
      item.category,
      item.location
    ].join(" ").toLowerCase();

    const matchesSearch = text.includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      item.type?.toLowerCase() === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="app-shell">
      <header className="topbar">
        <a
          className="brand"
          href="#"
          onClick={e => {
            e.preventDefault();
            setPage("home");
          }}
        >
          <span className="brand-mark">
            <PackageSearch size={23} />
          </span>

          <span>
            Campus<span className="brand-light">Connect</span>
            <small>SMART LOST & FOUND</small>
          </span>
        </a>

        <nav>
          <button
            className="nav-link"
            onClick={() => setPage("home")}
          >
            Browse Items
          </button>

          {token && (
            <button
              className="nav-link"
              onClick={() => setPage("report")}
            >
              Report Item
            </button>
          )}

          {token && (
            <button
              className="nav-link"
              onClick={loadClaims}
            >
              My Claims
            </button>
          )}

          {token ? (
            <button className="nav-cta" onClick={logout}>
              <LogOut size={16} /> Logout
            </button>
          ) : (
            <button
              className="nav-cta"
              onClick={() => {
                setAuthMode("login");
                setPage("auth");
              }}
            >
              <LogIn size={16} /> Login
            </button>
          )}
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">YOUR CAMPUS. CONNECTED.</span>

            <h1>
              Lost something?
              <br />
              <em>Find it here.</em>
            </h1>

            <p>
              A smarter way for students to report lost belongings,
              share found items, and reunite people with what matters.
            </p>

            <div className="hero-actions">
              <button
                className="primary-btn"
                onClick={() => {
                  if (token) {
                    setPage("report");
                  } else {
                    setAuthMode("login");
                    setPage("auth");
                  }
                }}
              >
                <PlusCircle size={18} /> Report an item
              </button>

              <button
                className="secondary-btn"
                onClick={() => {
                  setPage("home");
                  document.getElementById("listings")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Explore listings
              </button>
            </div>

            <div className="hero-stats">
              <div>
                <b>01</b>
                <span>Report an item</span>
              </div>
              <div>
                <b>02</b>
                <span>Connect with students</span>
              </div>
              <div>
                <b>03</b>
                <span>Get it back</span>
              </div>
            </div>
          </div>

          <div className="hero-art">
            <div className="orbit orbit-one"></div>
            <div className="orbit orbit-two"></div>

            <div className="art-card">
              <PackageSearch size={70} />
              <span>FOUND IT?</span>
              <strong>Let's reconnect.</strong>
              <small>Campus lost & found hub</small>
            </div>

            <div className="float-tag tag-one">
              ✓ Safe & simple
            </div>

            <div className="float-tag tag-two">
              ✦ Student community
            </div>
          </div>
        </section>

        {notice && (
          <div className="notice">
            <span>{notice}</span>
            <button onClick={() => setNotice("")}>
              <X size={16} />
            </button>
          </div>
        )}

        {page === "auth" && (
          <section className="panel narrow">
            <span className="eyebrow">
              WELCOME TO CAMPUSCONNECT
            </span>

            <h2>
              {authMode === "login"
                ? "Sign in to continue"
                : "Create your student account"}
            </h2>

            <form onSubmit={submitAuth} className="stack-form">
              {authMode === "register" && (
                <input
                  placeholder="Full name"
                  value={auth.name}
                  onChange={e =>
                    setAuth({ ...auth, name: e.target.value })
                  }
                  required
                />
              )}

              <input
                type="email"
                placeholder="College email"
                value={auth.email}
                onChange={e =>
                  setAuth({ ...auth, email: e.target.value })
                }
                required
              />

              <input
                type="password"
                placeholder="Password"
                value={auth.password}
                onChange={e =>
                  setAuth({ ...auth, password: e.target.value })
                }
                minLength="6"
                required
              />

              <button className="primary-btn full" type="submit">
                {authMode === "login" ? "Login" : "Register"}
              </button>
            </form>

            <p className="switch-auth">
              {authMode === "login"
                ? "New here?"
                : "Already registered?"}

              <button
                type="button"
                onClick={() =>
                  setAuthMode(
                    authMode === "login" ? "register" : "login"
                  )
                }
              >
                {authMode === "login"
                  ? "Create account"
                  : "Login"}
              </button>
            </p>
          </section>
        )}

        {page === "report" && (
          <section className="panel">
            <span className="eyebrow">HELP THE COMMUNITY</span>
            <h2>Report a lost or found item</h2>

            <form className="report-form" onSubmit={submitItem}>
              <label>
                Item name
                <input
                  placeholder="e.g. Black water bottle"
                  value={form.title}
                  onChange={e =>
                    setForm({ ...form, title: e.target.value })
                  }
                  required
                />
              </label>

              <label>
                Report type
                <select
                  value={form.type}
                  onChange={e =>
                    setForm({ ...form, type: e.target.value })
                  }
                >
                  <option value="lost">I lost this</option>
                  <option value="found">I found this</option>
                </select>
              </label>

              <label>
                Category
                <select
                  value={form.category}
                  onChange={e =>
                    setForm({ ...form, category: e.target.value })
                  }
                >
                  {[
                    "Electronics",
                    "Books & Notes",
                    "ID Cards",
                    "Accessories",
                    "Clothing",
                    "Other"
                  ].map(x => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>

              <label>
                Location
                <input
                  placeholder="Where was it lost/found?"
                  value={form.location}
                  onChange={e =>
                    setForm({ ...form, location: e.target.value })
                  }
                  required
                />
              </label>

              <label>
                Date
                <input
                  type="date"
                  value={form.date}
                  onChange={e =>
                    setForm({ ...form, date: e.target.value })
                  }
                  required
                />
              </label>

              <label className="wide">
                Description
                <textarea
                  placeholder="Add identifying details..."
                  value={form.description}
                  onChange={e =>
                    setForm({ ...form, description: e.target.value })
                  }
                  required
                />
              </label>

              <label className="wide">
                Image URL (optional)
                <input
                  placeholder="https://..."
                  value={form.imageUrl}
                  onChange={e =>
                    setForm({ ...form, imageUrl: e.target.value })
                  }
                />
              </label>

              <button className="primary-btn wide" type="submit">
                Publish report
              </button>
            </form>
          </section>
        )}

        {page === "claims" && (
          <section className="listings">
            <div className="section-heading">
              <div>
                <span className="eyebrow">YOUR ACTIVITY</span>
                <h2>My Claims</h2>
                <p>Track the status of your submitted claims.</p>
              </div>

              <button
                className="secondary-btn"
                onClick={loadClaims}
              >
                Refresh claims
              </button>
            </div>

            {claims.length === 0 ? (
              <div className="empty-state">
                <ClipboardList size={42} />
                <h3>No claims submitted yet</h3>
                <p>Your submitted claims will appear here.</p>
                <button
                  className="primary-btn"
                  onClick={() => setPage("home")}
                >
                  Browse Items
                </button>
              </div>
            ) : (
              <div className="item-grid">
                {claims.map(c => (
                  <article className="item-card" key={c._id}>
                    <div className="item-content">
                      <div className="item-category">
                        CLAIM DETAILS
                      </div>

                      <h3>{c.item?.title || "Item unavailable"}</h3>

                      <p>
                        {c.proofDescription || "No proof description"}
                      </p>

                      <div className="item-meta">
                        <span>
                          <CalendarDays size={14} />
                          {c.createdAt
                            ? new Date(c.createdAt).toLocaleDateString()
                            : "Date unavailable"}
                        </span>
                      </div>

                      <div className="item-footer">
                        <small>Claim status</small>
                        <strong>
                          {(c.status || "pending").toUpperCase()}
                        </strong>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {page === "home" && (
          <section className="listings" id="listings">
            <div className="section-heading">
              <div>
                <span className="eyebrow">COMMUNITY BOARD</span>
                <h2>Recent reports</h2>
                <p>
                  Browse items shared by your campus community.
                </p>
              </div>

              <div className="list-tools">
                <div className="search-box">
                  <Search size={17} />
                  <input
                    placeholder="Search items..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>

                <div className="filters">
                  {["all", "lost", "found"].map(x => (
                    <button
                      key={x}
                      className={filter === x ? "active" : ""}
                      onClick={() => setFilter(x)}
                    >
                      {x[0].toUpperCase() + x.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {!token ? (
              <div className="empty-state">
                <PackageSearch size={42} />
                <h3>Sign in to view campus reports</h3>
                <p>
                  Create an account or log in to browse and report items.
                </p>

                <button
                  className="primary-btn"
                  onClick={() => {
                    setAuthMode("login");
                    setPage("auth");
                  }}
                >
                  Login / Register
                </button>
              </div>
            ) : visibleItems.length === 0 ? (
              <div className="empty-state">
                <PackageSearch size={42} />
                <h3>No reports found</h3>
                <p>Be the first to add a lost or found item.</p>

                <button
                  className="primary-btn"
                  onClick={() => setPage("report")}
                >
                  Report an item
                </button>
              </div>
            ) : (
              <div className="item-grid">
                {visibleItems.map(item => (
                  <article className="item-card" key={item._id}>
                    <div className="item-visual">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} />
                      ) : (
                        <PackageSearch size={44} />
                      )}

                      <span className={item.type?.toLowerCase()}>
                        {item.type}
                      </span>
                    </div>

                    <div className="item-content">
                      <div className="item-category">
                        {item.category}
                      </div>

                      <h3>{item.title}</h3>
                      <p>{item.description}</p>

                      <div className="item-meta">
                        <span>
                          <MapPin size={14} />
                          {item.location}
                        </span>

                        <span>
                          <CalendarDays size={14} />
                          {item.date
                            ? new Date(item.date).toLocaleDateString()
                            : "Date unavailable"}
                        </span>
                      </div>

                      <div className="item-footer">
                        <small>
                          <User size={14} />
                          {item.user?.name ||
                            item.reportedBy?.name ||
                            "Campus student"}
                        </small>

                        {item.type?.toLowerCase() === "found" &&
                          ["open", "active"].includes(
                            item.status?.toLowerCase()
                          ) && (
                            <button
                              type="button"
                              onClick={() => {
                                setClaim(item);
                                setProof("");
                              }}
                            >
                              Claim
                            </button>
                          )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {claim && (
          <div className="modal-backdrop">
            <section className="panel modal">
              <button
                className="modal-close"
                onClick={() => setClaim(null)}
              >
                <X />
              </button>

              <span className="eyebrow">
                OWNERSHIP VERIFICATION
              </span>

              <h2>Claim {claim.title}</h2>

              <form className="stack-form" onSubmit={submitClaim}>
                <textarea
                  placeholder="Describe proof of ownership (colour, marks, contents, etc.)"
                  value={proof}
                  onChange={e => setProof(e.target.value)}
                  required
                />

                <button
                  className="primary-btn full"
                  type="submit"
                >
                  Submit claim
                </button>
              </form>
            </section>
          </div>
        )}
      </main>

      <footer>
        <span>CampusConnect</span>
        <span>
          Helping campus belongings find their way home.
        </span>
      </footer>
    </div>
  );
}
