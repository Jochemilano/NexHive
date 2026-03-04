import "./LoginBox.css";
import Input from "components/input/Input";

const LoginBox = ({
  title,
  email,
  password,
  setEmail,
  setPassword,
  onSubmit,
  error,
  success
}) => {
  return (
    <div className="login-container">
      <div className="center-box">
        <h2>{title}</h2>

        <form onSubmit={onSubmit}>
                    
          <Input
            label="Correo"
            type="email"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

<button type="submit">Entrar</button>

          {error && <p className="error-message active">{error}</p>}
          {success && (
            <p className="success-message active">
              ¡Login exitoso! Redirigiendo...
            </p>
             )}
        </form>
      </div>
    </div>
  );
};

export default LoginBox;