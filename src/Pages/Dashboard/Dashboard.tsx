import '../../Styles/Dashboard/dashboard.css';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  FiHome, FiUsers, FiTruck, FiLogOut, FiHexagon, FiTag, FiCreditCard,
  FiBriefcase, FiPackage, FiTool, FiChevronDown, FiDollarSign,
  FiShoppingCart, FiTrendingUp
} from 'react-icons/fi';
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
import Venda from '../Venda/Venda';
import EntradaEstoque from '../EntradaEstoque/EntradaEstoque';
import DashboardHome from './DashboardHome';

function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Sidebar group states
  const [cadastrosOpen, setCadastrosOpen] = useState(false);
  const [produtosOpen, setProdutosOpen] = useState(false);
  const [despesaOpen, setDespesaOpen] = useState(false);
  const [financeiroOpen, setFinanceiroOpen] = useState(false);
  const [servicosOpen, setServicosOpen] = useState(false);
  const [movimentacoesOpen, setMovimentacoesOpen] = useState(false);

  const [userName, setUserName] = useState('Usuário');

  useEffect(() => {
    try {
        const token = localStorage.getItem('token');
        if (token) {
            const payload = token.split('.')[1];
            const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
            const decoded = JSON.parse(window.atob(base64));
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

  const link = (tab: string, label: string, icon: React.ReactNode) => (
    <a
      className={`sidebar-link ${activeTab === tab ? 'active' : ''}`}
      onClick={(e) => { e.preventDefault(); setActiveTab(tab); }}
      href="#"
    >
      {icon}
      {label}
    </a>
  );

  const sectionTitle = (label: string, isOpen: boolean, toggle: () => void) => (
    <div
      className={`sidebar-section-title ${isOpen ? 'open' : ''}`}
      onClick={toggle}
      role="button"
      aria-expanded={isOpen}
    >
      {label}
      <FiChevronDown size={14} className="chevron" />
    </div>
  );

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
          {link('dashboard', 'Dashboard', <FiHome size={18} />)}

          {/* ── Cadastros ── */}
          {sectionTitle('Cadastros', cadastrosOpen, () => setCadastrosOpen(!cadastrosOpen))}
          <div className={`sidebar-group ${cadastrosOpen ? 'open' : 'closed'}`}>
            {link('clientes', 'Clientes', <FiUsers size={18} />)}
            {link('fornecedores', 'Fornecedores', <FiTruck size={18} />)}
            {link('formapagamento', 'Formas de Pagamento', <FiCreditCard size={18} />)}
            {link('servicos', 'Serviços', <FiBriefcase size={18} />)}
          </div>

          {/* ── Produtos ── */}
          {sectionTitle('Produtos', produtosOpen, () => setProdutosOpen(!produtosOpen))}
          <div className={`sidebar-group ${produtosOpen ? 'open' : 'closed'}`}>
            {link('produtos', 'Produtos', <FiPackage size={18} />)}
            {link('categoriaproduto', 'Categorias de Produto', <FiTag size={18} />)}
          </div>

          {/* ── Despesas ── */}
          {sectionTitle('Despesas', despesaOpen, () => setDespesaOpen(!despesaOpen))}
          <div className={`sidebar-group ${despesaOpen ? 'open' : 'closed'}`}>
            {link('despesas', 'Despesas', <FiTag size={18} />)}
            {link('categoriadespesa', 'Categorias de Despesa', <FiTag size={18} />)}
          </div>

          {/* ── Financeiro ── */}
          {sectionTitle('Financeiro', financeiroOpen, () => setFinanceiroOpen(!financeiroOpen))}
          <div className={`sidebar-group ${financeiroOpen ? 'open' : 'closed'}`}>
            {link('contareceber', 'Contas a Receber', <FiDollarSign size={18} />)}
            {link('contapagar', 'Contas a Pagar', <FiDollarSign size={18} />)}
          </div>

          {/* ── Serviços ── */}
          {sectionTitle('Serviços', servicosOpen, () => setServicosOpen(!servicosOpen))}
          <div className={`sidebar-group ${servicosOpen ? 'open' : 'closed'}`}>
            {link('registroservico', 'Registro de Serviços', <FiBriefcase size={18} />)}
            {link('ordemservico', 'Ordem de Serviço', <FiTool size={18} />)}
          </div>

          {/* ── Movimentações ── */}
          {sectionTitle('Movimentações', movimentacoesOpen, () => setMovimentacoesOpen(!movimentacoesOpen))}
          <div className={`sidebar-group ${movimentacoesOpen ? 'open' : 'closed'}`}>
            {link('venda', 'Vendas', <FiShoppingCart size={18} />)}
            {link('entradaestoque', 'Entrada de Estoque', <FiTrendingUp size={18} />)}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile" onClick={handleLogout} title="Sair">
            <div className="user-avatar">U</div>
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
          {activeTab === 'dashboard' && <DashboardHome userName={userName} onNavigate={setActiveTab} />}
          {activeTab === 'clientes' && <Cliente />}
          {activeTab === 'servicos' && <Servico />}
          {activeTab === 'categoriaproduto' && <CategoriaProduto />}
          {activeTab === 'produtos' && <Produto />}
          {activeTab === 'ordemservico' && <OrdemServico />}
          {activeTab === 'fornecedores' && <Fornecedor />}
          {activeTab === 'despesas' && <Despesa />}
          {activeTab === 'categoriadespesa' && <CategoriaDespesa />}
          {activeTab === 'formapagamento' && <FormaPagamento />}
          {activeTab === 'registroservico' && <RegistroServico />}
          {activeTab === 'contapagar' && <ContaPagar />}
          {activeTab === 'contareceber' && <ContaReceber />}
          {activeTab === 'venda' && <Venda />}
          {activeTab === 'entradaestoque' && <EntradaEstoque />}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
