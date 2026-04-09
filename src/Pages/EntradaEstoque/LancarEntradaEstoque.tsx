import { useState, useEffect, useRef } from 'react';
import { FiPackage, FiCalendar, FiHash, FiSearch, FiCheckCircle } from 'react-icons/fi';
import { entradaEstoqueService } from '../../Services/entradaEstoqueService';
import { produtoService, type Produto } from '../../Services/produtoService';
import { notify } from '../../Lib/notify';
import ProdutoSearchModal from '../../Components/ProdutoSearchModal';
import '../../Styles/EntradaEstoque/entradaEstoque.css';

const emptyForm = {
    produtoId: 0,
    nomeProduto: '',
    quantidadeProduto: 1,
    dataEntrada: new Date().toISOString().split('T')[0],
};

function LancarEntradaEstoque() {
    const [form, setForm] = useState(emptyForm);
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        produtoService.listar()
            .then(setProdutos)
            .catch(() => notify.error('Erro ao carregar produtos'));
    }, []);

    const handleSelectProduto = (produto: Produto) => {
        setForm(f => ({ ...f, produtoId: produto.produtoId!, nomeProduto: produto.nomeProduto }));
        setSearchTerm('');
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setModalOpen(true);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.produtoId) {
            notify.error('Selecione um produto');
            return;
        }
        if (form.quantidadeProduto <= 0) {
            notify.error('A quantidade deve ser maior que zero');
            return;
        }

        setLoading(true);
        try {
            await entradaEstoqueService.lancar({
                produtoId: form.produtoId,
                quantidadeProduto: form.quantidadeProduto,
                dataEntrada: form.dataEntrada,
            });
            notify.success('Entrada de estoque registrada com sucesso!');
            setForm(emptyForm);
            setSearchTerm('');
            searchRef.current?.focus();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erro ao registrar entrada';
            notify.error(message);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="estoque-form-wrapper">
                <form onSubmit={handleSubmit} className="estoque-form-card">

                    {/* Produto */}
                    <div className="estoque-field-group">
                        <label className="estoque-label">
                            <FiPackage size={15} />
                            Produto
                        </label>
                        {form.produtoId ? (
                            <div className="estoque-produto-selected">
                                <span className="estoque-produto-name">{form.nomeProduto}</span>
                                <button
                                    type="button"
                                    className="estoque-produto-change"
                                    onClick={() => {
                                        setForm(f => ({ ...f, produtoId: 0, nomeProduto: '' }));
                                        setTimeout(() => searchRef.current?.focus(), 50);
                                    }}
                                >
                                    Alterar
                                </button>
                            </div>
                        ) : (
                            <div className="estoque-search-row">
                                <div className="estoque-search-box">
                                    <FiSearch size={16} className="estoque-search-icon" />
                                    <input
                                        ref={searchRef}
                                        type="text"
                                        placeholder="Buscar produto por nome ou código — pressione Enter"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyDown={handleSearchKeyDown}
                                        className="estoque-search-input"
                                        autoFocus
                                    />
                                </div>
                                <button
                                    type="button"
                                    className="estoque-search-btn"
                                    onClick={() => setModalOpen(true)}
                                >
                                    <FiSearch size={16} />
                                    Buscar
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Quantidade e Data lado a lado */}
                    <div className="estoque-row">
                        <div className="estoque-field-group">
                            <label className="estoque-label">
                                <FiHash size={15} />
                                Quantidade
                            </label>
                            <input
                                type="number"
                                min={1}
                                className="estoque-input"
                                value={form.quantidadeProduto}
                                onChange={(e) => setForm(f => ({ ...f, quantidadeProduto: Number(e.target.value) }))}
                                required
                            />
                        </div>

                        <div className="estoque-field-group">
                            <label className="estoque-label">
                                <FiCalendar size={15} />
                                Data de Entrada
                            </label>
                            <input
                                type="date"
                                className="estoque-input"
                                value={form.dataEntrada}
                                onChange={(e) => setForm(f => ({ ...f, dataEntrada: e.target.value }))}
                                required
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="estoque-btn-submit"
                        disabled={loading || !form.produtoId}
                    >
                        {loading ? 'Registrando...' : (
                            <>
                                <FiCheckCircle size={18} />
                                Registrar Entrada
                            </>
                        )}
                    </button>
                </form>
            </div>

            <ProdutoSearchModal
                isOpen={modalOpen}
                produtos={produtos}
                termoBusca={searchTerm}
                onSelect={handleSelectProduto}
                onClose={() => setModalOpen(false)}
            />
        </>
    );
}

export default LancarEntradaEstoque;
