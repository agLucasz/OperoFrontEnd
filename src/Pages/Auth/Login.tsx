import '../../Styles/Auth/auth.css';
import logo from '../../Assets/logo.svg';
import { Link, useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { useState } from 'react';
import { login } from '../../Services/authService';
import { notify } from '../../Lib/notify';



import { FiMail, FiLock } from 'react-icons/fi';

function Login() {
    const [email, setEmail] = useState(localStorage.getItem('savedEmail') ?? '');
    const [senha, setSenha] = useState(localStorage.getItem('savedSenha') ?? '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await login(email, senha);
            notify.success('Login realizado com sucesso.');
            localStorage.setItem('savedEmail', email);
            localStorage.setItem('savedSenha', senha);
            navigate('/dashboard', { replace: true });
        } catch (err: unknown) {
            const message =
                (err as AxiosError<{ message?: string }>)?.response?.data?.message ??
                'Erro ao fazer login';
            notify.error(message);
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='auth'>
            <img src={logo} alt='Logo' className='logo'/>
            <div className='auth-container'>
                <form className='auth-form' onSubmit={handleSubmit}>
                    <div className="input-group">
                        <FiMail className="input-icon" />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                localStorage.setItem('savedEmail', e.target.value);
                            }}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <FiLock className="input-icon" />
                        <input
                            type="password"
                            placeholder="Senha"
                            value={senha}
                            onChange={(e) => {
                                setSenha(e.target.value);
                                localStorage.setItem('savedSenha', e.target.value);
                            }}
                            required
                        />
                    </div>
                    <button type="submit" disabled={loading}>
                        {loading ? 'Entrando...' : 'Login'}
                    </button>
                </form>
                {error && <p className='auth-error'>{error}</p>}
                <p className='auth-text'>
                    Não tem conta? <Link to="/register">Criar Conta</Link>
                </p>
            </div>
            
        </div>
    );
}

export default Login;
