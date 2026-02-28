import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useLoginWithEmail } from "../hooks/auth/useLoginWithEmail";
import { useCurrentUser } from "../hooks/auth/useCurrentUser";

export default function Login() {
  const navigate = useNavigate();
  const { data: currentUser } = useCurrentUser();
  const [email, setEmail] = useState("");

  const loginMutation = useLoginWithEmail();

  // if already logged in, send to home
  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await loginMutation.mutateAsync(email);
      // redirect on success
      navigate("/");
    } catch (err) {
      // error handled by mutation (could display)
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", padding: 16 }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 8 }}>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        <button
          type="submit"
          disabled={(loginMutation.status as any) === "pending"}
        >
          {(loginMutation.status as any) === "pending"
            ? "Logging in..."
            : "Login"}
        </button>
        {loginMutation.isError && (
          <p style={{ color: "red" }}>
            {(loginMutation.error as Error)?.message || "Login failed"}
          </p>
        )}
      </form>
    </div>
  );
}
