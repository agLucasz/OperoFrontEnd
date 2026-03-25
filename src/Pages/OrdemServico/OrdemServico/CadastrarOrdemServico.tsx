import { useState, useEffect, useRef, type KeyboardEvent } from 'react';
import '../../../Styles/OrdemServico/OrdemServico/ordemServico.css';
import { ordemServicoService, type OrdemServicoItem, type OrdemServico, type CondicaoPagamentoParcela } from '../../../Services/ordemServicoService';
import { clienteService, type Cliente } from '../../../Services/clienteService';
import { servicoService, type Servico } from '../../../Services/servicoService';
import { produtoService, type Produto } from '../../../Services/produtoService';
import { formaPagamentoService, type FormaPagamento } from '../../../Services/formaPagamentoService';
import { notify } from '../../../Lib/notify';
import { FiTrash2, FiPlus, FiSearch, FiRotateCcw, FiDollarSign, FiClock, FiCreditCard, FiUser, FiX } from 'react-icons/fi';

function CadastrarOrdemServico() {
    const [loading, setLoading] = useState(false);
    
    // Header states
    const [clienteId, setClienteId] = useState<number>(0);
    const [clienteNome, setClienteNome] = useState('');
    const [veiculo, setVeiculo] = useState('');
    const [placa, setPlaca] = useState('');
    const [dataAbertura] = useState(new Date().toLocaleDateString('pt-BR'));
    const [clientes, setClientes] = useState<Cliente[]>([]);

    // Item form states
    const [itens, setItens] = useState<OrdemServicoItem[]>([]);

    const [newItem, setNewItem] = useState({ tipo: 'produto', codigo: '', descricao: '', quantidade: 1, valorUnitario: 0 });

    const itemCodigoInputRef = useRef<HTMLInputElement>(null);

    const handleNewItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewItem(prev => ({ ...prev, [name]: value }));
        if (name === 'quantidade') setCurrentItemQtd(Number(value));
        if (name === 'valorUnitario') setCurrentItemValor(Number(value));
        if (name === 'descricao') setCurrentItemDescricao(value);
        if (name === 'codigo') setCurrentItemId(value);
    };
    
    // Current item inputs
    const [currentItemId, setCurrentItemId] = useState(''); // Text input for ID
    const [currentItemDescricao, setCurrentItemDescricao] = useState('');
    const [currentItemValor, setCurrentItemValor] = useState<number>(0);
    const [currentItemQtd, setCurrentItemQtd] = useState<number>(1);
    
    // Modal states
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [isClienteModalOpen, setIsClienteModalOpen] = useState(false);
    const [isPagamentoModalOpen, setIsPagamentoModalOpen] = useState(false);
    const [modalSearch, setModalSearch] = useState('');
    const [servicos, setServicos] = useState<Servico[]>([]);
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
    const [ordemServicoCriada, setOrdemServicoCriada] = useState<OrdemServico | null>(null);
    const [tipoPagamento, setTipoPagamento] = useState<'avista' | 'prazo'>('avista');
    const [formaPagamentoSelecionadaId, setFormaPagamentoSelecionadaId] = useState<number | null>(null);
    const [quantidadeParcelas, setQuantidadeParcelas] = useState<number>(1);
    const [dataPrimeiroVencimento, setDataPrimeiroVencimento] = useState<string>(new Date().toISOString().slice(0, 10));
    const [parcelasPrazo, setParcelasPrazo] = useState<CondicaoPagamentoParcela[]>([]);
    const [loadingPagamento, setLoadingPagamento] = useState(false);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            const [clientesData, servicosData, produtosData, formasPagamentoData] = await Promise.all([
                clienteService.listar(),
                servicoService.listar(),
                produtoService.listar(),
                formaPagamentoService.listar()
            ]);
            setClientes(clientesData.filter((c: Cliente) => c.ativo !== false));
            setServicos(servicosData);
            setProdutos(produtosData);
            setFormasPagamento(formasPagamentoData);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            notify.error('Erro ao carregar dados iniciais');
        }
    };

    const handleItemKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setIsItemModalOpen(true);
            setModalSearch('');
        }
    };

    const handleClienteKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setIsClienteModalOpen(true);
            setModalSearch('');
        }
    };

    const selectItemFromModal = (item: any) => {
        if (newItem.tipo === 'produto') {
            setCurrentItemId(item.produtoId.toString());
            setCurrentItemDescricao(item.nomeProduto);
            setCurrentItemValor(item.precoVenda);
            setNewItem(prev => ({
                ...prev,
                codigo: item.codigoProduto ?? '',
                descricao: item.nomeProduto ?? '',
                valorUnitario: item.precoVenda ?? 0,
                quantidade: 1
            }));
        } else {
            setCurrentItemId(item.servicoId.toString());
            setCurrentItemDescricao(item.nomeServico);
            setCurrentItemValor(item.valorServico);
            setNewItem(prev => ({
                ...prev,
                codigo: (item.servicoId?.toString() ?? ''),
                descricao: item.nomeServico ?? '',
                valorUnitario: item.valorServico ?? 0,
                quantidade: 1
            }));
        }
        setIsItemModalOpen(false);
    };

    const selectClienteFromModal = (cliente: Cliente) => {
        setClienteId(cliente.clienteId ?? 0);
        setClienteNome(`${cliente.nome} (${cliente.documento})`);
        setIsClienteModalOpen(false);
    };
    
    const handleClearItemInputs = () => {
        setNewItem(prev => ({ ...prev, codigo: '', descricao: '', quantidade: 1, valorUnitario: 0 }));
        setCurrentItemId('');
        setCurrentItemDescricao('');
        setCurrentItemValor(0);
        setCurrentItemQtd(1);
        itemCodigoInputRef.current?.focus();
    };

    const handleAddItem = () => {
        if (!currentItemDescricao) {
            notify.error('A descrição do item é obrigatória');
            return;
        }

        const idNum = parseInt(currentItemId);
        const hasValidId = !isNaN(idNum) && idNum > 0;

        const newItemToAdd: OrdemServicoItem = {
            descricao: currentItemDescricao,
            valorItem: currentItemValor,
            quantidadeItem: currentItemQtd,
            produtoId: newItem.tipo === 'produto' && hasValidId ? idNum : undefined,
            servicoId: newItem.tipo !== 'produto' && hasValidId ? idNum : undefined,
        };

        setItens([...itens, newItemToAdd]);
        
        // Reset form
        setCurrentItemId('');
        setCurrentItemDescricao('');
        setCurrentItemValor(0);
        setCurrentItemQtd(1);
        setNewItem(prev => ({ ...prev, codigo: '', descricao: '', quantidade: 1, valorUnitario: 0 }));
        itemCodigoInputRef.current?.focus();
    };

    const handleRemoveItem = (index: number) => {
        setItens(itens.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (clienteId === 0) {
            notify.error('Selecione um cliente');
            return;
        }

        if (itens.length === 0) {
            notify.error('Adicione pelo menos um item à Ordem de Serviço');
            return;
        }

        setLoading(true);
        try {
            const criada: OrdemServico = await ordemServicoService.cadastrar({
                clienteId,
                veiculo,
                placa,
                itens
            });
            setOrdemServicoCriada(criada);
            setTipoPagamento('avista');
            setFormaPagamentoSelecionadaId(null);
            setQuantidadeParcelas(1);
            setDataPrimeiroVencimento(new Date().toISOString().slice(0, 10));
            setParcelasPrazo([]);
            setIsPagamentoModalOpen(true);
            notify.success('Ordem de Serviço criada com sucesso! Selecione a forma de pagamento.');
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erro ao criar ordem de serviço';
            notify.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleFecharPagamentoModal = () => {
        setIsPagamentoModalOpen(false);
        setParcelasPrazo([]);
        setTipoPagamento('avista');
        setFormaPagamentoSelecionadaId(null);
        setQuantidadeParcelas(1);
        setDataPrimeiroVencimento(new Date().toISOString().slice(0, 10));
        setOrdemServicoCriada(null);
        setClienteId(0);
        setClienteNome('');
        setVeiculo('');
        setPlaca('');
        setItens([]);
    };

    const handleGerarParcelasPrazo = async () => {
        if (!ordemServicoCriada || !ordemServicoCriada.ordemServicoId) {
            notify.error('Ordem de Serviço não encontrada para gerar parcelas');
            return;
        }

        if (!formaPagamentoSelecionadaId) {
            notify.error('Selecione uma forma de pagamento');
            return;
        }

        if (quantidadeParcelas <= 0) {
            notify.error('Quantidade de parcelas deve ser maior que zero');
            return;
        }

        setLoadingPagamento(true);
        try {
            const parcelas = await ordemServicoService.gerarCondicaoPagamentoClientePrazoPreview(
                ordemServicoCriada.ordemServicoId,
                {
                    quantidadeParcelas,
                    dataPrimeiroVencimento,
                    formaPagamentoId: formaPagamentoSelecionadaId
                }
            );
            setParcelasPrazo(parcelas);
            notify.success('Condição de pagamento gerada com sucesso');
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erro ao gerar condição de pagamento';
            notify.error(message);
        } finally {
            setLoadingPagamento(false);
        }
    };

    const handleConfirmarAvista = () => {
        if (!formaPagamentoSelecionadaId) {
            notify.error('Selecione uma forma de pagamento');
            return;
        }

        notify.success('Pagamento registrado (à vista)');
        handleFecharPagamentoModal();
    };

    const renderIconFormaPagamento = (descricao: string) => {
        const desc = descricao.toLowerCase();
        if (desc.includes('crédito') || desc.includes('credito') || desc.includes('débito') || desc.includes('debito') || desc.includes('cartão') || desc.includes('cartao')) {
            return <FiCreditCard size={24} />;
        }
        if (desc.includes('pix')) {
            return <FiDollarSign size={24} />;
        }
        if (desc.includes('prazo') || desc.includes('boleto')) {
            return <FiClock size={24} />;
        }
        return <FiDollarSign size={24} />;
    };

    const filteredModalItems = newItem.tipo === 'produto' 
        ? produtos.filter(p => p.nomeProduto.toLowerCase().includes(modalSearch.toLowerCase()) || p.codigoProduto?.toLowerCase().includes(modalSearch.toLowerCase()))
        : servicos.filter(s => s.nomeServico.toLowerCase().includes(modalSearch.toLowerCase()));

    const filteredClientes = clientes.filter(c => 
        c.nome.toLowerCase().includes(modalSearch.toLowerCase()) || 
        c.documento?.toLowerCase().includes(modalSearch.toLowerCase())
    );

    const totalOS = itens.reduce((acc, item) => acc + (item.valorItem * item.quantidadeItem), 0);
    const totalDaOrdem = ordemServicoCriada?.valorTotal ?? totalOS;

    return (
        <div className="form-container-os">
            <form onSubmit={handleSubmit}>
                <div className="section-title">Dados Gerais</div>
                <div className="form-grid-header">
                    <div className="form-group cliente-group">
                        <label htmlFor="clienteId">Cliente * (Pressione Enter para buscar)</label>
                        <input 
                            type="text" 
                            id="clienteId" 
                            value={clienteNome}
                            onKeyDown={handleClienteKeyDown}
                            placeholder="Digite o nome ou Enter para buscar"
                            onChange={(e) => setClienteNome(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group data-group">
                        <label htmlFor="dataAbertura">Data de Abertura</label>
                        <input 
                            type="text" 
                            id="dataAbertura" 
                            value={dataAbertura}
                            readOnly
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="veiculo">Veículo</label>
                        <input 
                            type="text" 
                            id="veiculo" 
                            value={veiculo}
                            onChange={(e) => setVeiculo(e.target.value)}
                            placeholder="Ex: Honda Civic"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="placa">Placa</label>
                        <input 
                            type="text" 
                            id="placa" 
                            value={placa}
                            onChange={(e) => setPlaca(e.target.value)}
                            placeholder="Ex: ABC-1234"
                        />
                    </div>
                </div>

                <div className="section-title" style={{ marginTop: '24px' }}>Itens da OS</div>
                
                <div className="items-table-container">
                    <table className="items-table">
                        <thead>
                            <tr>
                                <th>Tipo</th>
                                <th>Descrição</th>
                                <th>Qtd</th>
                                <th>V. Unitário</th>
                                <th>Subtotal</th>
                                <th style={{ width: '80px', textAlign: 'center' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody className='itens-grid'>
                            {itens.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                                        Nenhum item adicionado ainda.
                                    </td>
                                </tr>
                            ) : (
                                itens.map((item, index) => (
                                    <tr key={index} className="item-row">
                                        <td>
                                            <span className="status-badge" style={{ background: item.produtoId ? '#e3f2fd' : '#f8f9fa', color: item.produtoId ? '#0d6efd' : '#666' }}>
                                                {item.produtoId ? 'Produto' : 'Serviço'}
                                            </span>
                                        </td>
                                        <td>{item.descricao}</td>
                                        <td>{item.quantidadeItem}</td>
                                        <td>
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valorItem)}
                                        </td>
                                        <td>
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valorItem * item.quantidadeItem)}
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button 
                                                    type="button"
                                                    className="btn-icon btn-delete" 
                                                    onClick={() => handleRemoveItem(index)}
                                                >
                                                    <FiTrash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                
                    </table>
                </div>
                <div className='item-footer'>
                     {itens.length > 0 && (
                            <tfoot>
                                <tr>
                                    <td colSpan={4} style={{ textAlign: 'right', fontWeight: 'bold' }}>Total:</td>
                                    <td colSpan={2} style={{ fontWeight: 'bold', color: 'var(--blue)', fontSize: '16px' }}>
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalOS)}
                                    </td>
                                </tr>
                            </tfoot>
                        )}
                </div>
                <div className="add-item-box">
                    <div className="add-item-form-grid">
                        <div className="form-group" style={{ flex: 0.5 }}>
                            <label htmlFor="tipoItem">Tipo</label>
                            <select id="tipoItem" name="tipo" value={newItem.tipo} onChange={handleNewItemChange}>
                                <option value="produto">Produto</option>
                                <option value="servico">Serviço</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ flex: 0.5 }}>
                            <label htmlFor="codigo">Código</label>
                            <input
                                type="text"
                                id="codigo"
                                name="codigo"
                                value={newItem.codigo}
                                onChange={handleNewItemChange}
                                onKeyDown={handleItemKeyDown}
                                ref={itemCodigoInputRef}
                                placeholder="Enter para buscar"
                            />
                        </div>
                        <div className="form-group" style={{ flex: 9 }}>
                            <label htmlFor="descricao">Descrição</label>
                            <input type="text" id="descricao" name="descricao" value={newItem.descricao} readOnly />
                        </div>
                        <div className="form-group" style={{ flex: 0.8 }}>
                            <label htmlFor="quantidade">Qtd</label>
                            <input type="number" id="quantidade" name="quantidade" value={newItem.quantidade} onChange={handleNewItemChange} />
                        </div>
                        <div className="form-group" style={{ flex: 1.2 }}>
                            <label htmlFor="valorUnitario">V. Unitário</label>
                            <input type="number" id="valorUnitario" name="valorUnitario" value={newItem.valorUnitario} onChange={handleNewItemChange} />
                        </div>
                        <div className="form-group">
                            <label>&nbsp;</label> 
                            <button type="button" className="btn-primary add-item-button" onClick={handleAddItem}>
                                <FiPlus size={18} />
                                Adicionar
                            </button>
                        </div>
                        <div className="form-group">
                            <label>&nbsp;</label> 
                            <button type="button" className="btn-secondary add-item-button" onClick={handleClearItemInputs}>
                                <FiRotateCcw size={18} />
                                Limpar
                            </button>
                        </div>
                    </div>
        
                </div>
                <div className='form-button'>
                    <button 
                        type="button" 
                        className="btn-secondary"
                        onClick={() => window.location.reload()} 
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        className="btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Salvando...' : 'Criar Ordem de Serviço'}
                    </button>
                </div>
            </form>
            {isPagamentoModalOpen && ordemServicoCriada && (
                <div className="modal-overlay">
                    <div className="modal-content payment-modal">
                        <div className="modal-header payment-modal-header">
                            <div>
                                <h3>Pagamento da Ordem #{ordemServicoCriada.ordemServicoId}</h3>
                                <p className="payment-subtitle">
                                    Selecione a forma de pagamento como em um PDV
                                </p>
                            </div>
                            <button className="btn-close" onClick={handleFecharPagamentoModal}>
                                <FiX size={22} />
                            </button>
                        </div>
                        <div className="modal-body payment-modal-body">
                            <div className="payment-summary">
                                <div className="payment-total">
                                    <span>Total da OS</span>
                                    <strong>
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalDaOrdem)}
                                    </strong>
                                </div>
                                <div className="payment-client">
                                    <div className="payment-client-icon">
                                        <FiUser size={20} />
                                    </div>
                                    <div className="payment-client-info">
                                        <span>Cliente</span>
                                        <strong>{clienteNome || 'Cliente selecionado'}</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="payment-type-grid">
                                <button
                                    type="button"
                                    className={`payment-type-card ${tipoPagamento === 'avista' ? 'active' : ''}`}
                                    onClick={() => {
                                        setTipoPagamento('avista');
                                        setParcelasPrazo([]);
                                    }}
                                >
                                    <div className="payment-type-icon">
                                        <FiDollarSign size={24} />
                                    </div>
                                    <div className="payment-type-text">
                                        <span>Pagamento à vista</span>
                                        <small>Receber o valor total em uma única vez</small>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    className={`payment-type-card ${tipoPagamento === 'prazo' ? 'active' : ''}`}
                                    onClick={() => {
                                        setTipoPagamento('prazo');
                                        setParcelasPrazo([]);
                                    }}
                                >
                                    <div className="payment-type-icon">
                                        <FiClock size={24} />
                                    </div>
                                    <div className="payment-type-text">
                                        <span>Cliente a prazo</span>
                                        <small>Gerar parcelas para o cliente a prazo</small>
                                    </div>
                                </button>
                            </div>

                            {tipoPagamento === 'avista' && (
                                <div className="payment-section">
                                    <div className="form-group full-width">
                                        <label>Formas de pagamento cadastradas</label>
                                        <div className="payment-formas-grid">
                                            {formasPagamento.map(forma => (
                                                <div
                                                    key={forma.formaPagamentoId}
                                                    className={`payment-form-card ${formaPagamentoSelecionadaId === forma.formaPagamentoId ? 'selected' : ''}`}
                                                    onClick={() => setFormaPagamentoSelecionadaId(forma.formaPagamentoId ?? null)}
                                                >
                                                    <div className="payment-form-icon">
                                                        {renderIconFormaPagamento(forma.descricaoPagamento)}
                                                    </div>
                                                    <div className="payment-form-info">
                                                        <span>{forma.descricaoPagamento}</span>
                                                    </div>
                                                </div>
                                            ))}
                                            {formasPagamento.length === 0 && (
                                                <div className="payment-empty">
                                                    Nenhuma forma de pagamento cadastrada.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {tipoPagamento === 'prazo' && (
                                <div className="payment-section">
                                    <div className="form-group full-width">
                                        <label>Forma de pagamento</label>
                                        <select
                                            value={formaPagamentoSelecionadaId ?? ''}
                                            onChange={(e) =>
                                                setFormaPagamentoSelecionadaId(
                                                    e.target.value ? Number(e.target.value) : null
                                                )
                                            }
                                        >
                                            <option value="">Selecione...</option>
                                            {formasPagamento.map(forma => (
                                                <option
                                                    key={forma.formaPagamentoId}
                                                    value={forma.formaPagamentoId}
                                                >
                                                    {forma.descricaoPagamento}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="payment-fields-grid">
                                        <div className="form-group">
                                            <label>Quantidade de parcelas</label>
                                            <input
                                                type="number"
                                                min={1}
                                                value={quantidadeParcelas}
                                                onChange={(e) => setQuantidadeParcelas(Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Data do primeiro vencimento</label>
                                            <input
                                                type="date"
                                                value={dataPrimeiroVencimento}
                                                onChange={(e) => setDataPrimeiroVencimento(e.target.value)}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>&nbsp;</label>
                                            <button
                                                type="button"
                                                className="btn-primary"
                                                onClick={handleGerarParcelasPrazo}
                                                disabled={loadingPagamento}
                                            >
                                                {loadingPagamento ? 'Gerando...' : 'Gerar parcelas'}
                                            </button>
                                        </div>
                                    </div>

                                    {parcelasPrazo.length > 0 && (
                                        <div className="parcelas-container">
                                            <div className="parcelas-header">
                                                <span>Parcelas geradas</span>
                                                <span>
                                                    Total:{' '}
                                                    {new Intl.NumberFormat('pt-BR', {
                                                        style: 'currency',
                                                        currency: 'BRL'
                                                    }).format(
                                                        parcelasPrazo.reduce(
                                                            (acc, parcela) => acc + parcela.valorParcela,
                                                            0
                                                        )
                                                    )}
                                                </span>
                                            </div>
                                            <div className="parcelas-list">
                                                {parcelasPrazo.map(parcela => (
                                                    <div key={parcela.numeroParcela} className="parcela-card">
                                                        <div className="parcela-number">
                                                            <span>Parcela {parcela.numeroParcela}</span>
                                                            <strong>
                                                                {new Intl.NumberFormat('pt-BR', {
                                                                    style: 'currency',
                                                                    currency: 'BRL'
                                                                }).format(parcela.valorParcela)}
                                                            </strong>
                                                        </div>
                                                        <div className="parcela-info">
                                                            <span>
                                                                Vencimento:{' '}
                                                                {new Date(parcela.dataVencimento).toLocaleDateString(
                                                                    'pt-BR'
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="payment-modal-footer">
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={handleFecharPagamentoModal}
                                disabled={loadingPagamento}
                            >
                                Fechar
                            </button>
                            {tipoPagamento === 'avista' && (
                                <button
                                    type="button"
                                    className="btn-primary"
                                    onClick={handleConfirmarAvista}
                                    disabled={loadingPagamento}
                                >
                                    Confirmar pagamento
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Modal de Busca de Itens */}
            {isItemModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Buscar {newItem.tipo === 'produto' ? 'Produto' : 'Serviço'}</h3>
                            <button className="btn-close" onClick={() => setIsItemModalOpen(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div style={{ position: 'relative' }}>
                                <FiSearch style={{ position: 'absolute', left: '12px', top: '12px', color: '#999' }} />
                                <input 
                                    type="text" 
                                    className="search-modal-input" 
                                    style={{ paddingLeft: '36px' }}
                                    placeholder={`Digite para buscar...`}
                                    value={modalSearch}
                                    onChange={(e) => setModalSearch(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            
                            <ul className="selection-list">
                                {filteredModalItems.length === 0 ? (
                                    <li style={{ textAlign: 'center', padding: '20px', color: '#999' }}>Nenhum resultado encontrado</li>
                                ) : (
                                    filteredModalItems.map((item: any) => (
                                        <li 
                                            key={newItem.tipo === 'produto' ? item.produtoId : item.servicoId} 
                                            className="selection-item"
                                            onClick={() => selectItemFromModal(item)}
                                        >
                                            <div>
                                                <strong>{newItem.tipo === 'produto' ? item.nomeProduto : item.nomeServico}</strong>
                                                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                                    {newItem.tipo === 'produto' ? `Código: ${item.codigoProduto} | Estoque: ${item.quantidadeProduto}` : item.descricaoServico}
                                                </div>
                                            </div>
                                            <div style={{ fontWeight: '600', color: 'var(--blue)' }}>
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(newItem.tipo === 'produto' ? item.precoVenda : item.valorServico)}
                                            </div>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Busca de Clientes */}
            {isClienteModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Buscar Cliente</h3>
                            <button className="btn-close" onClick={() => setIsClienteModalOpen(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div style={{ position: 'relative' }}>
                                <FiSearch style={{ position: 'absolute', left: '12px', top: '12px', color: '#999' }} />
                                <input 
                                    type="text" 
                                    className="search-modal-input" 
                                    style={{ paddingLeft: '36px' }}
                                    placeholder="Buscar por nome ou documento..."
                                    value={modalSearch}
                                    onChange={(e) => setModalSearch(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            
                            <ul className="selection-list">
                                {filteredClientes.length === 0 ? (
                                    <li style={{ textAlign: 'center', padding: '20px', color: '#999' }}>Nenhum cliente encontrado</li>
                                ) : (
                                    filteredClientes.map((cliente: Cliente) => (
                                        <li 
                                            key={cliente.clienteId} 
                                            className="selection-item"
                                            onClick={() => selectClienteFromModal(cliente)}
                                        >
                                            <div>
                                                <strong>{cliente.nome}</strong>
                                                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                                    Documento: {cliente.documento}
                                                </div>
                                            </div>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CadastrarOrdemServico;
