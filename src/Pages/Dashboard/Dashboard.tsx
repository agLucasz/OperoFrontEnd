import '../../Styles/Dashboard/dashboard.css';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FiHome, FiUsers, FiTruck, FiLogOut, FiHexagon, FiTag, FiCreditCard, FiBriefcase, FiPackage, FiTool, FiChevronDown, FiDollarSign } from 'react-icons/fi';
import Cliente from '../Cliente/Cliente';
import Fornecedor from '../Fornecedor/Fornecedor';
import Despesa from '../Despesa/Despesa';
import CategoriaDespesa from '../Despesa/CategoriaDespesa';
import FormaPagamento from '../FormaPagamento/FormaPagamento';
import RegistroServico from '../RegistroServico/RegistroServico';
import Servico from '../Servico/Servico';
import CategoriaProduto from '../Produto/CategoriaProduto/CategoriaProduto';
import OrdemServico from '../OrdemServico/OrdemServico/OrdemServico';
import Produto from '../Produto/Produto/Produto';
import ContaPagar from '../Financeiro/ContaPagar/ContaPagar';
import ContaReceber from '../Financeiro/ContaReceber/ContaReceber';
import DashboardHome from './DashboardHome';

function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [cadastrosOpen, setCadastrosOpen] = useState(true);
  const [financeiroOpen, setFinanceiroOpen] = useState(true);
  const [servicosOpen, setServicosOpen] = useState(true);
  const [userName, setUserName] = useState('Usuário');

  useEffect(() => {
    try {
        const token = localStorage.getItem('token');
        if (token) {
            const payload = token.split('.')[1];
            // Decode base64url
            const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
            const decoded = JSON.parse(window.atob(base64));
            // In ASP.NET Core, the name claim is usually http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name or unique_name
            const name = decoded.name || 
                         decoded.unique_name || 
                         decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 
                         'Usuário';
            setUserName(name);
        }
    } catch (e) {
        console.error('Error decoding token', e);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  return (
    <div className="dashboard-layout">
      {/* Menu Lateral */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-icon">
              <FiHexagon size={16} />
            </div>
            Opero
          </div>
        </div>

        <nav className="sidebar-menu">
          <a
            className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}
            href="#"
          >
            <FiHome size={18} />
            Dashboard
          </a>

          <div
            className={`sidebar-section-title ${cadastrosOpen ? 'open' : ''}`}
            onClick={() => setCadastrosOpen(!cadastrosOpen)}
            role="button"
            aria-expanded={cadastrosOpen}
          >
            Cadastros
            <FiChevronDown size={14} className="chevron" />
          </div>

          <div className={`sidebar-group ${cadastrosOpen ? 'open' : 'closed'}`}>
            <a
              className={`sidebar-link ${activeTab === 'clientes' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('clientes'); }}
              href="#"
            >
              <FiUsers size={18} />
              Clientes
            </a>

            <a
              className={`sidebar-link ${activeTab === 'fornecedores' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('fornecedores'); }}
              href="#"
            >
              <FiTruck size={18} />
              Fornecedores
            </a>

            <a
              className={`sidebar-link ${activeTab === 'servicos' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('servicos'); }}
              href="#"
            >
              <FiBriefcase size={18} />
              Serviços
            </a>

            <a
              className={`sidebar-link ${activeTab === 'categoriaproduto' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('categoriaproduto'); }}
              href="#"
            >
              <FiTag size={18} />
              Categoria Produto
            </a>

            <a
              className={`sidebar-link ${activeTab === 'produtos' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('produtos'); }}
              href="#"
            >
              <FiPackage size={18} />
              Produtos
            </a>

            <a
              className={`sidebar-link ${activeTab === 'formapagamento' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('formapagamento'); }}
              href="#"
            >
              <FiCreditCard size={18} />
              Formas de Pagamento
            </a>

            <a
              className={`sidebar-link ${activeTab === 'despesas' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('despesas'); }}
              href="#"
            >
              <FiTag size={18} />
              Despesas
            </a>

            <a
              className={`sidebar-link ${activeTab === 'categoriadespesa' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('categoriadespesa'); }}
              href="#"
            >
              <FiTag size={18} />
              Categorias Despesa
            </a>
          </div>

          <div
            className={`sidebar-section-title ${financeiroOpen ? 'open' : ''}`}
            onClick={() => setFinanceiroOpen(!financeiroOpen)}
            role="button"
            aria-expanded={financeiroOpen}
          >
            Financeiro
            <FiChevronDown size={14} className="chevron" />
          </div>

          <div className={`sidebar-group ${financeiroOpen ? 'open' : 'closed'}`}>
            <a
              className={`sidebar-link ${activeTab === 'contareceber' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('contareceber'); }}
              href="#"
            >
              <FiDollarSign size={18} />
              Contas a Receber
            </a>
            <a
              className={`sidebar-link ${activeTab === 'contapagar' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('contapagar'); }}
              href="#"
            >
              <FiDollarSign size={18} />
              Contas a Pagar
            </a>
          </div>

          <div
            className={`sidebar-section-title ${servicosOpen ? 'open' : ''}`}
            onClick={() => setServicosOpen(!servicosOpen)}
            role="button"
            aria-expanded={servicosOpen}
          >
            Serviços
            <FiChevronDown size={14} className="chevron" />
          </div>

          <div className={`sidebar-group ${servicosOpen ? 'open' : 'closed'}`}>
            <a
              className={`sidebar-link ${activeTab === 'registroservico' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('registroservico'); }}
              href="#"
            >
              <FiBriefcase size={18} />
              Registro de Serviços
            </a>

            <a
              className={`sidebar-link ${activeTab === 'ordemservico' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('ordemservico'); }}
              href="#"
            >
              <FiTool size={18} />
              Ordem de Serviço
            </a>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile" onClick={handleLogout} title="Sair">
            <div className="user-avatar">
              U
            </div>
            <div className="user-info">
              <span className="user-name">{userName}</span>
              <span className="user-role">Administrador</span>
            </div>
            <FiLogOut size={16} style={{ marginLeft: 'auto', color: '#888' }} />
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="dashboard-content">
        <div className="content-wrapper" style={{ backgroundColor: activeTab === 'dashboard' ? 'var(--background)' : 'var(--white)' }}>
          {activeTab === 'dashboard' && (
            <DashboardHome userName={userName} onNavigate={setActiveTab} />
          )}
          {activeTab === 'clientes' && (
            <Cliente />
          )}
          {activeTab === 'servicos' && (
            <Servico />
          )}
          {activeTab === 'categoriaproduto' && (
            <CategoriaProduto />
          )}
          {activeTab === 'produtos' && (
            <Produto />
          )}
          {activeTab === 'ordemservico' && (
            <OrdemServico />
          )}
          {activeTab === 'fornecedores' && (
            <Fornecedor />
          )}
          {activeTab === 'despesas' && (
            <Despesa />
          )}
          {activeTab === 'categoriadespesa' && (
            <CategoriaDespesa />
          )}
          {activeTab === 'formapagamento' && (
            <FormaPagamento />
          )}
          {activeTab === 'registroservico' && (
            <RegistroServico />
          )}
          {activeTab === 'contapagar' && (
            <ContaPagar />
          )}
          {activeTab === 'contareceber' && (
            <ContaReceber />
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
