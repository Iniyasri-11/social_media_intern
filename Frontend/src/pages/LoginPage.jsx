import React, { useRef, useState, useCallback } from "react";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Heart,
  MessageCircle,
  UserPlus,
  Users,
  TrendingUp,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
  Globe as Github,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

/* ==================================================================
   PULSE — social auth experience
=================================================================== */

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap";

const BG = { a: "#050816", b: "#0A1024", c: "#10182F" };
const TEXT = { white: "#FFFFFF", soft: "#AEB4C7", faint: "rgba(174,180,199,0.55)" };
const GRAD = "linear-gradient(135deg, #6C63FF 0%, #8B5CF6 38%, #EC4899 72%, #FF5C93 100%)";
const STATE = { success: "#22C55E", warning: "#FACC15", error: "#EF4444" };
const GLASS = {
  fill: "rgba(16,24,47,0.55)",
  fillLight: "rgba(255,255,255,0.045)",
  border: "rgba(255,255,255,0.10)",
  borderStrong: "rgba(255,255,255,0.18)",
};

/* ---------- Brand Glyphs ---------- */
function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22.5 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.9a5.05 5.05 0 0 1-2.19 3.32v2.76h3.55c2.08-1.92 3.24-4.74 3.24-8.09Z" fill="currentColor" opacity="0.9" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.55-2.76c-.98.66-2.24 1.05-3.73 1.05-2.87 0-5.3-1.94-6.17-4.53H2.16v2.85A11 11 0 0 0 12 23Z" fill="currentColor" opacity="0.7" />
      <path d="M5.83 14.1a6.6 6.6 0 0 1 0-4.2V7.05H2.16a11 11 0 0 0 0 9.9l3.67-2.85Z" fill="currentColor" opacity="0.5" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.96 1 12 1a11 11 0 0 0-9.84 6.05l3.67 2.85C6.7 7.32 9.13 5.38 12 5.38Z" fill="currentColor" opacity="0.85" />
    </svg>
  );
}

function AppleGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 384 512" fill="currentColor" aria-hidden="true">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141 8 184.8 8 273.5c0 26.2 4.8 53.3 14.4 81.2 12.8 37.6 59 129.3 107.2 127.8 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-84.1 102.6-121.8-65.2-30.7-65.7-90-65.7-91.9zm-56.6-164.2c27-32.1 24.5-61.2 23.7-71.5-23.8 1.4-51.3 16.4-67 34.9-17.3 19.8-27.5 44.3-25.3 71.9 26.4 2 50.3-11.4 68.6-35.3z" />
    </svg>
  );
}

/* ---------- Floating Glass Card ---------- */
function FloatingCard({ style, depth = 1, delay = 0, duration = 7, className = "", children }) {
  return (
    <div
      className={`float-card ${className}`.trim()}
      style={{
        position: "absolute",
        borderRadius: 16,
        border: `1px solid ${GLASS.border}`,
        backgroundColor: GLASS.fill,
        backdropFilter: "blur(18px) saturate(150%)",
        WebkitBackdropFilter: "blur(18px) saturate(150%)",
        boxShadow: "0 18px 40px rgba(0,0,0,0.4)",
        padding: "0.65rem 0.85rem",
        display: "flex",
        alignItems: "center",
        gap: 10,
        animation: `cardFloat ${duration}s ease-in-out ${delay}s infinite`,
        opacity: 1 - depth * 0.08,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ---------- Floating Label Input ---------- */
function FloatingLabelInput({
  id,
  label,
  type = "text",
  icon,
  value,
  onChange,
  onBlurValidate,
  status,
  hint,
  trailing,
  autoComplete,
  name,
}) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;
  const stateColor =
    status === "error"
      ? STATE.error
      : status === "success"
      ? STATE.success
      : focused
      ? "#EC4899"
      : "rgba(174,180,199,0.7)";
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          position: "relative",
          height: 56,
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          gap: "0.7rem",
          padding: "0 1rem",
          backgroundColor: GLASS.fillLight,
          border: `1.5px solid ${
            status === "error"
              ? STATE.error
              : status === "success"
              ? STATE.success
              : focused
              ? "transparent"
              : GLASS.border
          }`,
          backgroundImage:
            focused && !status
              ? "linear-gradient(#0A1024,#0A1024), linear-gradient(135deg,#6C63FF,#EC4899)"
              : "none",
          backgroundOrigin: "border-box",
          backgroundClip: focused && !status ? "padding-box, border-box" : "border-box",
          boxShadow: focused
            ? `0 0 0 4px ${
                status === "error" ? "rgba(239,68,68,0.14)" : "rgba(139,92,246,0.16)"
              }, 0 0 26px ${
                status === "error" ? "rgba(239,68,68,0.18)" : "rgba(236,72,153,0.2)"
              }`
            : "none",
          transition: "box-shadow 220ms ease, border-color 220ms ease",
        }}
      >
        <span
          style={{
            display: "flex",
            flexShrink: 0,
            color: stateColor,
            transition: "color 180ms ease",
          }}
        >
          {icon}
        </span>
        <div style={{ position: "relative", flex: 1, height: "100%" }}>
          <label
            htmlFor={id}
            style={{
              position: "absolute",
              left: 0,
              top: active ? 6 : "50%",
              transform: active ? "translateY(0)" : "translateY(-50%)",
              fontSize: active ? 11.5 : 15,
              fontWeight: active ? 600 : 400,
              letterSpacing: active ? "0.05em" : "0",
              textTransform: active ? "uppercase" : "none",
              color: active ? TEXT.faint : "rgba(174,180,199,0.65)",
              transition: "all 160ms ease",
              pointerEvents: "none",
            }}
          >
            {label}
          </label>
          <input
            id={id}
            name={name}
            type={type}
            autoComplete={autoComplete}
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false);
              onBlurValidate && onBlurValidate();
            }}
            aria-invalid={status === "error"}
            aria-describedby={hintId}
            style={{
              width: "100%",
              height: "100%",
              paddingTop: active ? 16 : 0,
              background: "transparent",
              border: "none",
              outline: "none",
              color: TEXT.white,
              fontSize: 15,
            }}
          />
        </div>
        {trailing}
        {status === "success" && (
          <CheckCircle2 size={17} color={STATE.success} aria-hidden="true" />
        )}
        {status === "error" && <AlertCircle size={17} color={STATE.error} aria-hidden="true" />}
      </div>
      {hint && (
        <p
          id={hintId}
          role={status === "error" ? "alert" : undefined}
          style={{
            margin: "6px 2px 0",
            fontSize: 12.5,
            lineHeight: 1.4,
            color:
              status === "error"
                ? STATE.error
                : status === "success"
                ? STATE.success
                : TEXT.faint,
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

/* ---------- Password Strength Meter ---------- */
function scorePassword(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

const STRENGTH_META = [
  { label: "Too short", color: STATE.error },
  { label: "Weak", color: STATE.error },
  { label: "Fair", color: STATE.warning },
  { label: "Good", color: "#22C55E" },
  { label: "Strong", color: "#22C55E" },
];

function PasswordStrengthMeter({ password }) {
  if (!password) return null;
  const score = scorePassword(password);
  const meta = STRENGTH_META[score];
  return (
    <div style={{ marginTop: -4 }}>
      <div
        style={{ display: "flex", gap: 5 }}
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={4}
        aria-label="Password strength"
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <span
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 4,
              backgroundColor: i < score ? meta.color : GLASS.border,
              transition: "background-color 200ms ease",
            }}
          />
        ))}
      </div>
      <p style={{ margin: "6px 2px 0", fontSize: 12, color: meta.color, fontWeight: 600 }}>
        {meta.label}
      </p>
    </div>
  );
}

/* ---------- Primary CTA Button ---------- */
function PrimaryButton({ loading, disabled, children, ...rest }) {
  const [ripples, setRipples] = useState([]);

  const spawnRipple = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples((r) => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples((r) => r.filter((rp) => rp.id !== id)), 650);
  };

  return (
    <button
      type="submit"
      disabled={disabled || loading}
      onClick={spawnRipple}
      className="cta-btn"
      style={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        height: 56,
        borderRadius: 16,
        border: "none",
        backgroundImage: GRAD,
        color: "#fff",
        fontSize: 15.5,
        fontWeight: 600,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        boxShadow: "0 14px 36px rgba(139,92,246,0.38)",
      }}
      {...rest}
    >
      {ripples.map((r) => (
        <span
          key={r.id}
          style={{
            position: "absolute",
            left: r.x,
            top: r.y,
            width: 12,
            height: 12,
            marginLeft: -6,
            marginTop: -6,
            borderRadius: "9999px",
            backgroundColor: "rgba(255,255,255,0.55)",
            animation: "rippleOut 0.65s ease-out forwards",
            pointerEvents: "none",
          }}
        />
      ))}
      {children}
    </button>
  );
}

/* ---------- Social Login Button ---------- */
function SocialButton({ label, icon }) {
  return (
    <button
      type="button"
      className="social-btn"
      aria-label={`Continue with ${label}`}
      style={{
        flex: 1,
        height: 50,
        borderRadius: 14,
        border: `1px solid ${GLASS.border}`,
        backgroundColor: GLASS.fillLight,
        color: TEXT.white,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        fontSize: 13.5,
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      <span className="social-icon">{icon}</span>
      {label}
    </button>
  );
}

/* ---------- Ambient particle dot (drifting spark) ---------- */
function Particle({ left, top, size = 4, delay = 0, duration = 9, color = "#EC4899" }) {
  return (
    <span
      aria-hidden="true"
      style={{
        position: "absolute",
        left,
        top,
        width: size,
        height: size,
        borderRadius: "9999px",
        backgroundColor: color,
        boxShadow: `0 0 8px ${color}`,
        animation: `particleDrift ${duration}s ease-in-out ${delay}s infinite`,
      }}
    />
  );
}

/* ================================ MAIN PAGE ================================ */

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // null | 'error' | 'success'
  const [message, setMessage] = useState("");
  const [idTouched, setIdTouched] = useState(false);
  const [pwTouched, setPwTouched] = useState(false);

  const idLooksValid = identifier.trim().length >= 3;
  const idStatus =
    status === "error" && !identifier.trim()
      ? "error"
      : idTouched && identifier.trim() && !idLooksValid
      ? "error"
      : idTouched && idLooksValid
      ? "success"
      : null;
  const idHint =
    idStatus === "error"
      ? identifier.trim()
        ? "Must be at least 3 characters."
        : "Enter your email or username."
      : null;

  const pwStatus =
    status === "error" && !password ? "error" : status === "success" ? "success" : null;
  const pwHint = pwStatus === "error" ? "Enter your password." : null;

  const glowRef = useRef(null);
  const blobRef = useRef(null);
  const cardsRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const nx = px - 0.5;
    const ny = py - 0.5;

    if (glowRef.current) {
      glowRef.current.style.left = `${px * 100}%`;
      glowRef.current.style.top = `${py * 100}%`;
    }
    if (blobRef.current) {
      blobRef.current.style.transform = `translate(${nx * 22}px, ${ny * 22}px)`;
    }
    if (cardsRef.current) {
      cardsRef.current.style.transform = `translate(${nx * -14}px, ${ny * -14}px)`;
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIdTouched(true);
    setPwTouched(true);
    if (!identifier.trim() || !idLooksValid || !password) {
      setStatus("error");
      setMessage("Check the highlighted fields and try again.");
      return;
    }
    setStatus(null);
    setMessage("");
    setLoading(true);
    try {
      await login(identifier, password);
      setStatus("success");
      setMessage("Welcome back — redirecting you now.");
      setTimeout(() => navigate("/post"), 800);
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "Invalid login credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        backgroundColor: BG.a,
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('${FONT_URL}');
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; }
        .pulse-root, .pulse-root * { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }

        @keyframes auroraDrift { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(3%,-3%) scale(1.06); } }
        @keyframes breathe { 0%,100% { transform: scale(1); opacity: 0.9; } 50% { transform: scale(1.07); opacity: 1; } }
        @keyframes spinSlow { to { transform: rotate(360deg); } }
        @keyframes spinSlowRev { to { transform: rotate(-360deg); } }
        @keyframes cardFloat { 0%,100% { transform: translateY(0) rotate(var(--tilt,0deg)); } 50% { transform: translateY(-14px) rotate(var(--tilt,0deg)); } }
        @keyframes particleDrift { 0% { transform: translateY(0); opacity: 0; } 12% { opacity: .9; } 88% { opacity: .5; } 100% { transform: translateY(-100px); opacity: 0; } }
        @keyframes dashFlow { to { stroke-dashoffset: -240; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes rippleOut { to { width: 260px; height: 260px; margin-left: -130px; margin-top: -130px; opacity: 0; } }
        @keyframes shimmerSweep { 0% { background-position: -220% 0; } 100% { background-position: 220% 0; } }
        @keyframes cardFloatSubtle { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
        @keyframes reflectionSweep { 0% { background-position: 0% 0%; } 50% { background-position: 100% 100%; } 100% { background-position: 0% 0%; } }
        @keyframes glowPulseSoft { 0%,100% { opacity: 0.32; transform: scale(1); } 50% { opacity: 0.62; transform: scale(1.1); } }
        @keyframes seamDrift { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-2%,3%) scale(1.05); } }

        .fade-up { opacity: 0; animation: fadeUp 0.7s cubic-bezier(.2,.8,.2,1) forwards; }

        .cta-btn::after { content:''; position:absolute; inset:0; background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%); background-size: 220% 100%; animation: shimmerSweep 3.4s linear infinite; pointer-events:none; }
        .cta-btn { transition: transform 160ms ease, box-shadow 220ms ease; }
        .cta-btn:hover:not(:disabled) { transform: translateY(-2px) scale(1.012); box-shadow: 0 18px 46px rgba(139,92,246,0.45), 0 6px 18px rgba(236,72,153,0.3); }
        .cta-btn:active:not(:disabled) { transform: translateY(0) scale(0.99); }
        .cta-btn:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }

        .social-btn { transition: transform 160ms ease, background-color 160ms ease, border-color 160ms ease; }
        .social-btn:hover { transform: translateY(-3px); background-color: rgba(255,255,255,0.08); border-color: ${GLASS.borderStrong}; }
        .social-btn:hover .social-icon { transform: rotate(-8deg) scale(1.08); }
        .social-icon { display: inline-flex; transition: transform 200ms ease; }
        .social-btn:focus-visible, .cta-btn:focus-visible, input:focus-visible, .link-underline:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }

        .link-underline { position: relative; font-weight: 700; text-decoration: none; cursor: pointer; background-image: ${GRAD}; -webkit-background-clip: text; background-clip: text; color: transparent; }
        .link-underline::after { content: ''; position: absolute; left: 0; bottom: -2px; width: 100%; height: 1.5px; background: ${GRAD}; transform: scaleX(0); transform-origin: right; transition: transform 260ms ease; }
        .link-underline:hover::after, .link-underline:focus-visible::after { transform: scaleX(1); transform-origin: left; }

        .checkbox-custom { appearance: none; -webkit-appearance: none; width: 19px; height: 19px; border-radius: 6px; border: 1.5px solid ${GLASS.border}; background: rgba(255,255,255,0.04); cursor: pointer; position: relative; transition: all 160ms ease; flex-shrink: 0; }
        .checkbox-custom:checked { background: ${GRAD}; border-color: transparent; }
        .checkbox-custom:checked::after { content: ''; position: absolute; left: 6px; top: 2px; width: 5px; height: 10px; border: solid white; border-width: 0 2px 2px 0; transform: rotate(45deg); }

        input::placeholder { color: transparent; }

        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px #0A1024 inset !important;
          -webkit-text-fill-color: #FFFFFF !important;
          transition: background-color 5000s ease-in-out 0s;
        }

        .auth-card-anim { animation: fadeUp 0.7s cubic-bezier(.2,.8,.2,1) both, cardFloatSubtle 6.5s ease-in-out 1.1s infinite; }
        .glass-card-premium { transition: transform 280ms ease, box-shadow 280ms ease; }
        .glass-card-premium:hover { transform: translateY(-7px); box-shadow: 0 54px 130px rgba(0,0,0,0.5), 0 0 110px rgba(139,92,246,0.24), inset 0 1px 0 rgba(255,255,255,0.16), inset 0 -1px 0 rgba(0,0,0,0.2); }
        .glass-card-premium::before {
          content: ''; position: absolute; inset: 0; z-index: 0; pointer-events: none;
          background: linear-gradient(120deg, transparent 35%, rgba(255,255,255,0.10) 50%, transparent 65%);
          background-size: 240% 240%;
          animation: reflectionSweep 11s ease-in-out infinite;
        }

        .brand-orb { animation: breathe 4.5s ease-in-out infinite; }
        .glow-accent { animation: glowPulseSoft 6s ease-in-out infinite; }
        .pulse-wave { animation: dashFlow 5.5s linear infinite; }

        @media (prefers-reduced-motion: reduce) {
          .fade-up, .cta-btn::after, .float-card, .brand-orb, .glow-accent, .pulse-wave, [style*="animation"] { animation: none !important; }
        }

        @media (max-width: 1080px) {
          .hero-panel { flex-basis: 52% !important; max-width: 52% !important; }
          .card-panel { flex-basis: 48% !important; max-width: 48% !important; }
          .hero-title { font-size: 2.6rem !important; }
        }
        @media (max-width: 900px) {
          .pulse-shell { flex-direction: column !important; }
          .hero-panel, .card-panel { flex-basis: auto !important; max-width: 100% !important; width: 100%; }
          .hero-panel { min-height: 46vh !important; padding: 2.5rem 1.5rem !important; }
          .card-panel { padding: 2rem 1.25rem 3rem !important; }
          .deco-card { display: none !important; }
        }
        @media (max-width: 560px) {
          .hero-panel { min-height: 38vh !important; }
          .hero-title { font-size: 2rem !important; }
          .glass-card { padding: 1.85rem 1.4rem !important; border-radius: 22px !important; }
          .card-title { font-size: 1.9rem !important; }
          .social-row { flex-direction: column !important; }
        }
      `}</style>

      {/*
        Single shared background for the WHOLE page — spans behind both the
        hero copy and the login card, so there's no seam where the two
        panels meet. Panels themselves no longer paint their own background.
      */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        {/* Base vignette wash — one continuous gradient across full width */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(150% 120% at 22% 12%, ${BG.c} 0%, ${BG.b} 42%, ${BG.a} 76%)`,
          }}
        />

        {/* Mouse-parallax aurora blobs (driven by hero onMouseMove), now full-bleed */}
        <div
          ref={blobRef}
          style={{ position: "absolute", inset: 0, transition: "transform 300ms ease-out" }}
        >
          <div
            style={{
              position: "absolute",
              top: "-12%",
              left: "-4%",
              width: "42%",
              height: "48%",
              borderRadius: "9999px",
              filter: "blur(120px)",
              background: "#6C63FF",
              opacity: 0.4,
              animation: "auroraDrift 13s ease-in-out infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-14%",
              left: "20%",
              width: "40%",
              height: "42%",
              borderRadius: "9999px",
              filter: "blur(130px)",
              background: "#EC4899",
              opacity: 0.28,
              animation: "auroraDrift 16s ease-in-out infinite reverse",
            }}
          />
          {/* extra bleed so the light carries under the card panel too */}
          <div
            style={{
              position: "absolute",
              top: "6%",
              right: "-8%",
              width: "46%",
              height: "58%",
              borderRadius: "9999px",
              filter: "blur(150px)",
              background: "#8B5CF6",
              opacity: 0.22,
              animation: "seamDrift 20s ease-in-out infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-8%",
              right: "6%",
              width: "44%",
              height: "46%",
              borderRadius: "9999px",
              filter: "blur(150px)",
              background: "#EC4899",
              opacity: 0.16,
              animation: "seamDrift 24s ease-in-out infinite reverse",
            }}
          />
        </div>

        {/* Soft pulsing accent glow, positioned to sit behind the login card */}
        <div
          className="glow-accent"
          style={{
            position: "absolute",
            top: "18%",
            right: "10%",
            width: 360,
            height: 360,
            borderRadius: "9999px",
            filter: "blur(110px)",
            background: "radial-gradient(circle, #EC4899 0%, transparent 70%)",
          }}
        />

        {/* Drifting particles across the whole width, behind the glass card too */}
        <Particle left="8%" top="82%" size={3} delay={0} duration={8} color="#8B5CF6" />
        <Particle left="18%" top="70%" size={4} delay={1.4} duration={10} color="#EC4899" />
        <Particle left="34%" top="88%" size={3} delay={2.6} duration={9} color="#6C63FF" />
        <Particle left="52%" top="76%" size={4} delay={0.8} duration={11} color="#FF5C93" />
        <Particle left="68%" top="90%" size={3} delay={3.2} duration={8.5} color="#8B5CF6" />
        <Particle left="80%" top="72%" size={4} delay={1.8} duration={9.5} color="#EC4899" />
        <Particle left="92%" top="86%" size={3} delay={2.2} duration={10.5} color="#6C63FF" />

        {/* Signature element: a faint animated "pulse" (heartbeat) waveform, on-brand for Pulse */}
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            left: 0,
            bottom: "12%",
            width: "100%",
            height: 90,
            opacity: 0.16,
          }}
        >
          <defs>
            <linearGradient id="pulseLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6C63FF" />
              <stop offset="50%" stopColor="#EC4899" />
              <stop offset="100%" stopColor="#FF5C93" />
            </linearGradient>
          </defs>
          <path
            className="pulse-wave"
            d="M0,60 L180,60 L210,20 L240,100 L270,60 L1200,60"
            fill="none"
            stroke="url(#pulseLineGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="14 10"
          />
        </svg>
      </div>

      <div
        className="pulse-root pulse-shell"
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          width: "100%",
          minHeight: "100vh",
        }}
      >
        {/* HERO SECTION */}
        <section
          className="hero-panel"
          aria-label="About Pulse"
          onMouseMove={handleMouseMove}
          style={{
            flexBasis: "65%",
            maxWidth: "65%",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            padding: "3rem",
            background: "transparent",
          }}
        >
          <div
            ref={glowRef}
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 420,
              height: 420,
              marginLeft: -210,
              marginTop: -210,
              borderRadius: "9999px",
              background: "radial-gradient(circle, rgba(236,72,153,0.16) 0%, transparent 70%)",
              transition: "left 400ms ease-out, top 400ms ease-out",
              pointerEvents: "none",
            }}
          />

          <div
            ref={cardsRef}
            className="deco-card"
            style={{ position: "absolute", inset: 0, transition: "transform 300ms ease-out" }}
          >
            <FloatingCard delay={0} duration={7.5} style={{ top: "12%", left: "6%" }}>
              <div style={{ display: "flex" }}>
                {["#6C63FF", "#8B5CF6", "#EC4899", "#FF5C93"].map((c, i) => (
                  <span
                    key={i}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "9999px",
                      background: c,
                      border: "2px solid #10182F",
                      marginLeft: i ? -8 : 0,
                    }}
                  />
                ))}
              </div>
              <span
                style={{
                  color: TEXT.white,
                  fontSize: 12.5,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <Users size={13} color="#22C55E" /> 3 friends online
              </span>
            </FloatingCard>

            <FloatingCard delay={1.4} duration={6.5} style={{ top: "30%", left: "1%" }}>
              <Heart size={16} color="#FF5C93" fill="#FF5C93" />
              <span style={{ color: TEXT.white, fontSize: 12.5 }}>
                Someone liked your post
              </span>
            </FloatingCard>

            <FloatingCard delay={2.1} duration={9} style={{ bottom: "30%", right: "2%" }}>
              <MessageCircle size={16} color="#8B5CF6" />
              <span style={{ color: TEXT.white, fontSize: 12.5 }}>
                Anna commented: "love this 🔥"
              </span>
            </FloatingCard>
          </div>

          <div style={{ position: "relative", maxWidth: 620, textAlign: "left" }}>
            <div
              className="fade-up"
              style={{
                position: "relative",
                width: 132,
                height: 132,
                marginBottom: "2rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                className="brand-orb"
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "9999px",
                  background: GRAD,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow:
                    "0 18px 44px rgba(236,72,153,0.45), inset 0 2px 4px rgba(255,255,255,0.4)",
                  position: "relative",
                  zIndex: 2,
                }}
              >
                <span
                  style={{
                    color: TEXT.white,
                    fontSize: 32,
                    fontWeight: 800,
                    letterSpacing: "-0.05em",
                  }}
                >
                  P
                </span>
              </div>
            </div>

            <h1
              className="hero-title fade-up"
              style={{
                animationDelay: "0.1s",
                fontSize: "3.25rem",
                fontWeight: 800,
                letterSpacing: "-0.035em",
                lineHeight: 1.08,
                color: TEXT.white,
                margin: 0,
              }}
            >
              See what’s happening on{" "}
              <span
                style={{
                  backgroundImage: GRAD,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                Pulse
              </span>{" "}
              right now.
            </h1>

            <p
              className="fade-up"
              style={{
                animationDelay: "0.2s",
                marginTop: "1.25rem",
                fontSize: "1.125rem",
                lineHeight: 1.6,
                color: TEXT.soft,
                maxWidth: 480,
              }}
            >
              Connect with creator communities, share stories, and drop into live conversations — all in real time.
            </p>
          </div>
        </section>

        {/* LOGIN FORM SECTION */}
        <section
          className="card-panel"
          aria-label="Sign in to your account"
          style={{
            flexBasis: "35%",
            maxWidth: "35%",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2.5rem 2rem",
            background: "transparent",
          }}
        >
          <div
            className="auth-card-anim glass-card glass-card-premium"
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 420,
              borderRadius: 28,
              border: `1px solid ${GLASS.border}`,
              backgroundColor: GLASS.fill,
              backdropFilter: "blur(24px) saturate(160%)",
              WebkitBackdropFilter: "blur(24px) saturate(160%)",
              boxShadow:
                "0 32px 80px rgba(0,0,0,0.55), 0 0 80px rgba(139,92,246,0.12), inset 0 1px 0 rgba(255,255,255,0.12)",
              padding: "2.5rem 2.25rem",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ marginBottom: "1.75rem" }}>
                <h2
                  className="card-title"
                  style={{
                    fontSize: "2.1rem",
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    color: TEXT.white,
                    margin: 0,
                  }}
                >
                  Welcome back
                </h2>
                <p
                  style={{
                    marginTop: "0.4rem",
                    fontSize: 14,
                    color: TEXT.soft,
                    lineHeight: 1.5,
                  }}
                >
                  Please enter your details to sign in.
                </p>
              </div>

              <div
                className="social-row"
                style={{
                  display: "flex",
                  gap: "0.65rem",
                  marginBottom: "1.5rem",
                }}
              >
                <SocialButton label="Google" icon={<GoogleGlyph />} />
                <SocialButton label="Apple" icon={<AppleGlyph />} />
                <SocialButton label="GitHub" icon={<Github size={17} />} />
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div style={{ flex: 1, height: 1, backgroundColor: GLASS.border }} />
                <span style={{ fontSize: 11.5, fontWeight: 600, color: TEXT.faint }}>OR</span>
                <div style={{ flex: 1, height: 1, backgroundColor: GLASS.border }} />
              </div>

              {message && (
                <div
                  role="alert"
                  style={{
                    marginBottom: "1.25rem",
                    padding: "0.85rem 1rem",
                    borderRadius: 14,
                    backgroundColor:
                      status === "error"
                        ? "rgba(239,68,68,0.12)"
                        : "rgba(34,197,94,0.12)",
                    border: `1px solid ${
                      status === "error"
                        ? "rgba(239,68,68,0.3)"
                        : "rgba(34,197,94,0.3)"
                    }`,
                    color: status === "error" ? STATE.error : STATE.success,
                    fontSize: 13.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {status === "error" ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                  <span>{message}</span>
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                noValidate
                style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
              >
                <FloatingLabelInput
                  id="pulse-identifier"
                  name="identifier"
                  label="Username"
                  type="text"
                  autoComplete="username"
                  icon={<User size={18} />}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  onBlurValidate={() => setIdTouched(true)}
                  status={idStatus}
                  hint={idHint}
                />

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <FloatingLabelInput
                    id="pulse-password"
                    name="password"
                    label="Password"
                    type={showPw ? "text" : "password"}
                    autoComplete="current-password"
                    icon={<Lock size={18} />}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlurValidate={() => setPwTouched(true)}
                    status={pwStatus}
                    hint={pwHint}
                    trailing={
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: TEXT.faint,
                        }}
                      >
                        {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    }
                  />
                  <PasswordStrengthMeter password={password} />
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: 13.5,
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      color: TEXT.soft,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      className="checkbox-custom"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                    />
                    <span>Remember me</span>
                  </label>

                  <a href="#forgot" className="link-underline">
                    Forgot password?
                  </a>
                </div>

                <PrimaryButton loading={loading}>
                  {loading ? (
                    <>
                      <Loader2
                        size={19}
                        style={{ animation: "spinSlow 1s linear infinite" }}
                      />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </PrimaryButton>
              </form>

              <div
                style={{
                  marginTop: "2rem",
                  textAlign: "center",
                  fontSize: 14,
                  color: TEXT.soft,
                }}
              >
                Don't have an account?{" "}
                <a href="\register" className="link-underline">
                  Sign up now
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}