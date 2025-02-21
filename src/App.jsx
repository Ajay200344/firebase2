import { useState, useEffect } from "react";
import './App.css'

const API_KEY = "AIzaSyAk_muMLxQz93UO7-pVtrNCQMOIvtfqQx4"; // Replace with actual API key
const PROJECT_ID = "database-27176"; // Replace with your Firebase project ID
const COLLECTION_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users?key=${API_KEY}`;

function App() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [editId, setEditId] = useState(null); // Store ID for editing

  // 🔹 Fetch Users
  function fetchUsers() {
    fetch(COLLECTION_URL)
      .then((res) => res.json())
      .then((data) => {
        if (data.documents) {
          const userList = data.documents.map((doc) => ({
            id: doc.name.split("/").pop(), // Extract document ID
            name: doc.fields.name.stringValue,
            email: doc.fields.email.stringValue,
            password: doc.fields.password.stringValue,
          }));
          setUsers(userList);
        } else {
          setUsers([]); // If no users found
        }
      })
      .catch((err) => console.error("Error fetching users:", err));
  }

  useEffect(fetchUsers, []);

  // 🔹 Add or Update User
  function handleSubmit() {
    const userData = {
      fields: {
        name: { stringValue: name },
        email: { stringValue: email },
        password: { stringValue: password },
      },
    };

    const url = editId
      ? `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${editId}?key=${API_KEY}`
      : COLLECTION_URL;

    const method = editId ? "PATCH" : "POST";

    fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    })
      .then(() => {
        setName("");
        setEmail("");
        setPassword("");
        setEditId(null);
        fetchUsers();
      })
      .catch((err) => console.error("Error saving user:", err));
  }

  // 🔹 Delete User
  function deleteUser(id) {
    fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${id}?key=${API_KEY}`,
      { method: "DELETE" }
    )
      .then(fetchUsers)
      .catch((err) => console.error("Error deleting user:", err));
  }

  // 🔹 Edit User
  function editUser(user) {
    setName(user.name);
    setEmail(user.email);
    setPassword(user.password);
    setEditId(user.id);
  }

  return (
    <div>
      <h1>Firestore CRUD Operation</h1>
      <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleSubmit}>{editId ? "Update User" : "Add User"}</button>

      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} - {user.email}
            <button onClick={() => editUser(user)}>Edit</button>
            <button onClick={() => deleteUser(user.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
