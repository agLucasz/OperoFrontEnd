import { useState, useEffect, useRef } from 'react';
import {
    FiSearch, FiShoppingCart, FiTrash2, FiPlus, FiMinus,
    FiCheck, FiX, FiCalendar
} from 'react-icons/fi';
import { vendaService } from '../../Services/vendaService';
import { produtoService, type Produto } from '../../Services/produtoService';
import { notify } from '../../Lib/notify';
import ProdutoSearchModal from '../../Components/ProdutoSearchModal';
import '../../Styles/Venda/venda.css';

interface CartItem {
    produtoId: number;
    nomeProduto: string;
    quantidadeItem: number;
    valorUnitario: number;
}

function LancarVenda() {
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [dtVenda, setDtVenda] = useState(() => new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchProdutos = async () => {
            try {
                const data = await produtoService.listar();
                setProdutos(data);
            } catch (error) {
                notify.error('Erro ao carregar produtos');
                console.error(error);
            }
        };
        fetchProdutos();
        searchRef.current?.focus();
    }, []);

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setModalOpen(true);
        }
    };

    const handleSelectProduto = (produto: Produto) => {
        setSearchTerm('');
        const existing = cart.find(c => c.produtoId === produto.produtoId);
        if (existing) {
            setCart(cart.map(c =>
                c.produtoId === produto.produtoId
                    ? { ...c, quantidadeItem: c.quantidadeItem + 1 }
                    : c
            ));
        } else {
            setCart([...cart, {
                produtoId: produto.produtoId!,
                nomeProduto: produto.nomeProduto,
                quantidadeItem: 1,
                valorUnitario: produto.precoVenda,
            }]);
        }
        setTimeout(() => searchRef.current?.focus(), 80);
    };

    const handleQtyChange = (produtoId: number, qty: number) => {
        if (qty <= 0) {
            handleRemoveItem(produtoId);
            return;
        }
        setCart(cart.map(c =>
            c.produtoId === produtoId ? { ...c, quantidadeItem: qty } : c
        ));
    };

    const handlePriceChange = (produtoId: number, raw: string) => {
        const cleaned = raw.replace(/[^0-9,]/g, '').replace(',', '.');
        const numeric = parseFloat(cleaned);
        setCart(cart.map(c =>
            c.produtoId === produtoId
                ? { ...c, valorUnitario: isNaN(numeric) ? 0 : numeric }
                : c
        ));
    };

    const handleRemoveItem = (produtoId: number) => {
        setCart(cart.filter(c => c.produtoId !== produtoId));
    };

    const handleLimparCarrinho = () => {
        if (!window.confirm('Deseja limpar todos os itens?')) return;
        setCart([]);
    };

    const totalVenda = cart.reduce((acc, i) => acc + i.quantidadeItem * i.valorUnitario, 0);

    const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const handleFinalizar = async () => {
        if (cart.length === 0) {
            notify.error('Adicione pelo menos um produto ao carrinho');
            return;
        }
        setLoading(true);
        try {
            await vendaService.lancar({
                dtVenda,
                items: cart.map(c => ({
                    produtoId: c.produtoId,
                    quantidadeItem: c.quantidadeItem,
                    valorUnitario: c.valorUnitario,
                })),
            });
            notify.success('Venda finalizada com sucesso!');
            setCart([]);
            setDtVenda(new Date().toISOString().split('T')[0]);
            searchRef.current?.focus();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erro ao finalizar venda';
            notify.error(message);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pdv-container">

            {/* ===== TOP BAR ===== */}
            <div className="pdv-topbar">
                {/* Search field */}
                <div className="pdv-search-field">
                    <FiSearch size={20} className="pdv-search-field-icon" />
                    <input
                        ref={searchRef}
                        type="text"
                        className="pdv-search-field-input"
                        placeholder="Digite o nome ou código do produto e pressione Enter..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                    />
                    <button
                        className="pdv-search-field-btn"
                        onClick={() => setModalOpen(true)}
                        title="Buscar produto"
                    >
                        <FiSearch size={18} />
                        Buscar
                    </button>
                </div>

                {/* Date */}
                <div className="pdv-topbar-date">
                    <FiCalendar size={16} />
                    <input
                        type="date"
                        value={dtVenda}
                        onChange={(e) => setDtVenda(e.target.value)}
                        className="pdv-date-input"
                    />
                </div>
            </div>

            {/* ===== MAIN AREA ===== */}
            <div className="pdv-main">

                {/* Cart Table */}
                <div className="pdv-cart-area">
                    <div className="pdv-cart-title">
                        <FiShoppingCart size={18} />
                        Itens da Venda
                        {cart.length > 0 && (
                            <span className="pdv-items-count">{cart.length} {cart.length === 1 ? 'item' : 'itens'}</span>
                        )}
                    </div>

                    {cart.length === 0 ? (
                        <div className="pdv-cart-empty">
                            <FiShoppingCart size={56} />
                            <p>Nenhum item adicionado</p>
                            <span>Use o campo acima para buscar produtos</span>
                        </div>
                    ) : (
                        <div className="pdv-cart-table-wrapper">
                            <table className="pdv-cart-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '35%' }}>Produto</th>
                                        <th style={{ textAlign: 'center', width: '18%' }}>Quantidade</th>
                                        <th style={{ textAlign: 'right', width: '18%' }}>Vlr. Unitário</th>
                                        <th style={{ textAlign: 'right', width: '18%' }}>Subtotal</th>
                                        <th style={{ textAlign: 'center', width: '11%' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cart.map((item) => (
                                        <tr key={item.produtoId}>
                                            <td className="pdv-item-name-cell">{item.nomeProduto}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <div className="pdv-qty-control">
                                                    <button
                                                        className="pdv-qty-btn"
                                                        onClick={() => handleQtyChange(item.produtoId, item.quantidadeItem - 1)}
                                                    >
                                                        <FiMinus size={12} />
                                                    </button>
                                                    <input
                                                        type="number"
                                                        className="pdv-qty-input"
                                                        value={item.quantidadeItem}
                                                        min={1}
                                                        onChange={(e) => handleQtyChange(item.produtoId, Number(e.target.value))}
                                                    />
                                                    <button
                                                        className="pdv-qty-btn"
                                                        onClick={() => handleQtyChange(item.produtoId, item.quantidadeItem + 1)}
                                                    >
                                                        <FiPlus size={12} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <input
                                                    type="text"
                                                    className="pdv-price-input"
                                                    value={item.valorUnitario.toFixed(2).replace('.', ',')}
                                                    onChange={(e) => handlePriceChange(item.produtoId, e.target.value)}
                                                />
                                            </td>
                                            <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--green)', fontSize: 15 }}>
                                                {fmt(item.quantidadeItem * item.valorUnitario)}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button
                                                    className="action-btn delete"
                                                    onClick={() => handleRemoveItem(item.produtoId)}
                                                    title="Remover"
                                                >
                                                    <FiX size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* ===== SIDEBAR: Total + Actions ===== */}
                <div className="pdv-sidebar">
                    <div className="pdv-total-card">
                        <span className="pdv-total-card-label">Total da Venda</span>
                        <span className="pdv-total-card-value">{fmt(totalVenda)}</span>
                        <span className="pdv-total-card-items">
                            {cart.reduce((a, i) => a + i.quantidadeItem, 0)} unidade(s)
                        </span>
                    </div>

                    <button
                        className="pdv-btn-finalizar"
                        onClick={handleFinalizar}
                        disabled={loading || cart.length === 0}
                    >
                        {loading ? 'Processando...' : (
                            <>
                                <FiCheck size={22} />
                                Finalizar Venda
                            </>
                        )}
                    </button>

                    {cart.length > 0 && (
                        <button className="pdv-btn-limpar" onClick={handleLimparCarrinho}>
                            <FiTrash2 size={14} />
                            Limpar Carrinho
                        </button>
                    )}
                </div>
            </div>

            {/* Modal */}
            <ProdutoSearchModal
                isOpen={modalOpen}
                produtos={produtos}
                termoBusca={searchTerm}
                onSelect={handleSelectProduto}
                onClose={() => { setModalOpen(false); setTimeout(() => searchRef.current?.focus(), 80); }}
            />
        </div>
    );
}

export default LancarVenda;
