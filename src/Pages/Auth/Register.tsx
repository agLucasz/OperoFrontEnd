import '../../Styles/Auth/auth.css';
import logo from '../../Assets/logo.svg';
import { Link, useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { useState } from 'react';
import { cadastrar } from '../../Services/authService';
import { notify } from '../../Lib/notify';

import { FiUser, FiMail, FiLock } from 'react-icons/fi';

function Register() {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);
        try {
            await cadastrar({ nome, email, senha });
            notify.success('Cadastro realizado com sucesso.');
            setSuccess('Cadastro realizado com sucesso.');
            navigate('/login', { replace: true });
        } catch (err: unknown) {
            const message =
                (err as AxiosError<{ message?: string }>)?.response?.data?.message ??
                'Erro ao cadastrar';
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
                        <FiUser className="input-icon" />
                        <input
                            type="text"
                            placeholder="Nome"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <FiMail className="input-icon" />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <FiLock className="input-icon" />
                        <input
                            type="password"
                            placeholder="Senha"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" disabled={loading}>
                        {loading ? 'Cadastrando...' : 'Cadastrar'}
                    </button>
                </form>
                {error && <p className='auth-error'>{error}</p>}
                {success && <p className='auth-success'>{success}</p>}
                <p className='auth-text'>
                    Já tem conta? <Link to="/login">Fazer Login</Link>
                </p>
            </div>
            
        </div>
    );
}

export default Register;
