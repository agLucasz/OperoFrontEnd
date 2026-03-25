import { useState, useEffect } from 'react';
import { FiDollarSign, FiTag, FiFileText, FiCheckSquare, FiSearch, FiX } from 'react-icons/fi';
import { contaPagarService } from '../../../Services/contaPagarService';
import { fornecedorService, type Fornecedor } from '../../../Services/fornecedorService';
import { despesaService, categoriaDespesaService, type Despesa, type CategoriaDespesa } from '../../../Services/despesaService';
import { notify } from '../../../Lib/notify';
import '../../../Styles/Financeiro/contaPagar.css';
import '../../../Styles/Fornecedor/fornecedor.css'; // For the modal table if needed, or we reuse our own

function LancarContaPagar() {
    const [loading, setLoading] = useState(false);
    
    // Data sources
    const [despesas, setDespesas] = useState<Despesa[]>([]);
    const [categorias, setCategorias] = useState<CategoriaDespesa[]>([]);
    const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
    
    // Form State
    const [isParcelado, setIsParcelado] = useState(false);
    const [quantidadeParcelas, setQuantidadeParcelas] = useState(1);
    const [valorParcela, setValorParcela] = useState('');
    const [valorParcelaDisplay, setValorParcelaDisplay] = useState('');
    const [dtVencimento, setDtVencimento] = useState('');

    // Função para formatar moeda
    const formatCurrency = (value: string) => {
        // Remove tudo que não for dígito
        let v = value.replace(/\D/g, '');
        if (v === '') return '';
        
        // Converte para número e divide por 100 para ter os decimais
        const numericValue = parseInt(v) / 100;
        
        // Formata para o padrão BRL (R$ 0.000,00)
        return numericValue.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedValue = formatCurrency(e.target.value);
        setValorParcelaDisplay(formattedValue);
        
        // Salva o valor numérico para o backend (ex: "1.234,56" -> "1234.56")
        if (formattedValue) {
            const numericString = formattedValue.replace(/\./g, '').replace(',', '.');
            setValorParcela(numericString);
        } else {
            setValorParcela('');
        }
    };
    const [numDocumento, setNumDocumento] = useState('');
    const [tpDocumento, setTpDocumento] = useState(1); // 1: Dinheiro, 2: Pix, etc
    
    const [despesaId, setDespesaId] = useState('');
    const [categoriaId, setCategoriaId] = useState('');
    
    // Fornecedor Modal State
    const [isFornecedor, setIsFornecedor] = useState(false);
    const [selectedFornecedorId, setSelectedFornecedorId] = useState<number | null>(null);
    const [selectedFornecedorNome, setSelectedFornecedorNome] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                const [despesasData, categoriasData, fornecedoresData] = await Promise.all([
                    despesaService.listar(),
                    categoriaDespesaService.listar(),
                    fornecedorService.listar()
                ]);
                setDespesas(despesasData);
                setCategorias(categoriasData);
                setFornecedores(fornecedoresData);
            } catch (error) {
                notify.error('Erro ao carregar dados auxiliares');
                console.error(error);
            }
        };
        loadData();
    }, []);

    const handleSalvar = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!valorParcela || !dtVencimento || !despesaId || !categoriaId) {
            notify.error('Preencha os campos obrigatórios');
            return;
        }

        if (isFornecedor && !selectedFornecedorId) {
            notify.error('Selecione um fornecedor');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                categoriaId: parseInt(categoriaId),
                despesaId: parseInt(despesaId),
                fornecedorId: isFornecedor ? selectedFornecedorId : null,
                vlParcela: parseFloat(valorParcela.replace(',', '.')),
                parcela: isParcelado ? quantidadeParcelas : 1,
                dtVencimento: dtVencimento,
                numDocumento: numDocumento ? parseInt(numDocumento) : null,
                tpDocumento: parseInt(tpDocumento.toString())
            };

            await contaPagarService.cadastrar(payload as any);
            notify.success('Conta a pagar lançada com sucesso!');
            
            // Reset form
            setValorParcela('');
            setValorParcelaDisplay('');
            setDtVencimento('');
            setNumDocumento('');
            setDespesaId('');
            setCategoriaId('');
            setIsParcelado(false);
            setQuantidadeParcelas(1);
            setIsFornecedor(false);
            setSelectedFornecedorId(null);
            setSelectedFornecedorNome('');
            
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Erro ao lançar conta a pagar';
            notify.error(message);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectFornecedor = (fornecedor: Fornecedor) => {
        setSelectedFornecedorId(fornecedor.fornecedorId || null);
        setSelectedFornecedorNome(fornecedor.nomeFornecedor);
        setIsModalOpen(false);
    };

    const filteredFornecedores = fornecedores.filter(f => 
        f.nomeFornecedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.documentoFornecedor.includes(searchTerm)
    );

    return (
        <div className="cp-form-container">
            <form onSubmit={handleSalvar}>
                
                {/* Seção 1: Valores e Parcelas */}
                <div className="cp-form-section">
                    <h3 className="cp-form-section-title"><FiDollarSign /> Detalhes do Valor</h3>
                    
                    <div className="cp-checkbox-group">
                        <input 
                            type="checkbox" 
                            id="isParcelado" 
                            checked={isParcelado} 
                            onChange={(e) => setIsParcelado(e.target.checked)} 
                        />
                        <label htmlFor="isParcelado">Esta conta é parcelada?</label>
                    </div>

                    <div className="cp-form-row">
                        <div className="cp-form-group small">
                            <label>Valor {isParcelado ? 'por Parcela' : 'Total'} (R$)*</label>
                            <input 
                                type="text" 
                                placeholder="0,00"
                                value={valorParcelaDisplay} 
                                onChange={handleValorChange} 
                                required
                            />
                        </div>

                        {isParcelado && (
                            <div className="cp-form-group small">
                                <label>Quantidade de Parcelas*</label>
                                <input 
                                    type="number" 
                                    min="2" 
                                    max="120"
                                    value={quantidadeParcelas} 
                                    onChange={(e) => setQuantidadeParcelas(parseInt(e.target.value))} 
                                    required
                                />
                            </div>
                        )}

                        <div className="cp-form-group small">
                            <label>Data de Vencimento {isParcelado ? '(1ª Parcela)' : ''}*</label>
                            <input 
                                type="date" 
                                value={dtVencimento} 
                                onChange={(e) => setDtVencimento(e.target.value)} 
                                required
                            />
                        </div>
                    </div>

                    <div className="cp-form-row" style={{ marginTop: '16px' }}>
                        <div className="cp-form-group small">
                            <label>Número do Documento</label>
                            <input 
                                type="number" 
                                placeholder="Ex: 123456"
                                value={numDocumento} 
                                onChange={(e) => setNumDocumento(e.target.value)} 
                            />
                        </div>
                        <div className="cp-form-group small">
                            <label>Forma de Pagamento*</label>
                            <select value={tpDocumento} onChange={(e) => setTpDocumento(parseInt(e.target.value))}>
                                <option value={1}>Dinheiro</option>
                                <option value={2}>Pix</option>
                                <option value={3}>Cheque</option>
                                <option value={4}>Boleto</option>
                                <option value={5}>Outros</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Seção 2: Classificação */}
                <div className="cp-form-section">
                    <h3 className="cp-form-section-title"><FiTag /> Classificação da Despesa</h3>
                    
                    <div className="cp-form-row">
                        <div className="cp-form-group medium">
                            <label>Despesa*</label>
                            <select value={despesaId} onChange={(e) => setDespesaId(e.target.value)} required>
                                <option value="">Selecione a despesa...</option>
                                {despesas.map(d => (
                                    <option key={d.despesaId} value={d.despesaId}>{d.nomeDespesa}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="cp-form-group medium">
                            <label>Tipo de Despesa*</label>
                            <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} required>
                                <option value="">Selecione o tipo...</option>
                                {categorias.map(c => (
                                    <option key={c.categoriaId} value={c.categoriaId}>{c.nomeCategoria}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Seção 3: Fornecedor */}
                <div className="cp-form-section">
                    <h3 className="cp-form-section-title"><FiFileText /> Vínculo com Fornecedor</h3>
                    
                    <div className="cp-checkbox-group">
                        <input 
                            type="checkbox" 
                            id="isFornecedor" 
                            checked={isFornecedor} 
                            onChange={(e) => {
                                setIsFornecedor(e.target.checked);
                                if (e.target.checked) {
                                    setIsModalOpen(true);
                                } else {
                                    setSelectedFornecedorId(null);
                                    setSelectedFornecedorNome('');
                                }
                            }} 
                        />
                        <label htmlFor="isFornecedor">Esta conta é referente a um fornecedor?</label>
                    </div>

                    {isFornecedor && selectedFornecedorNome && (
                        <div style={{ 
                            marginTop: '12px', 
                            padding: '12px', 
                            backgroundColor: '#e0f2fe', 
                            borderRadius: '8px',
                            border: '1px solid #bae6fd',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <span style={{ color: '#0369a1', fontSize: '14px', fontWeight: 500 }}>Fornecedor Selecionado:</span>
                                <div style={{ color: '#0c4a6e', fontSize: '16px', fontWeight: 600 }}>{selectedFornecedorNome}</div>
                            </div>
                            <button 
                                type="button" 
                                onClick={() => setIsModalOpen(true)}
                                style={{
                                    background: 'white',
                                    border: '1px solid #bae6fd',
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    color: '#0369a1',
                                    cursor: 'pointer',
                                    fontWeight: 500
                                }}
                            >
                                Alterar
                            </button>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                    <button type="submit" className="cp-btn-primary" disabled={loading} style={{ width: 'auto', minWidth: '200px' }}>
                        <FiCheckSquare size={20} />
                        {loading ? 'Salvando...' : 'Lançar Conta'}
                    </button>
                </div>
            </form>

            {/* Modal de Fornecedores */}
            {isModalOpen && (
                <div className="cp-modal-overlay">
                    <div className="cp-modal-content">
                        <button className="cp-modal-close" onClick={() => {
                            setIsModalOpen(false);
                            if (!selectedFornecedorId) setIsFornecedor(false);
                        }}>
                            <FiX size={24} />
                        </button>
                        
                        <h2 style={{ marginTop: 0, marginBottom: '24px' }}>Selecione o Fornecedor</h2>
                        
                        <div className="search-bar" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', background: '#f3f4f6', padding: '8px 16px', borderRadius: '8px' }}>
                            <FiSearch color="#6b7280" />
                            <input 
                                type="text" 
                                placeholder="Buscar por nome ou documento..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ border: 'none', background: 'transparent', width: '100%', padding: '8px', outline: 'none', marginLeft: '8px' }}
                            />
                        </div>

                        <div className="cp-grid" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            <table className="cp-table">
                                <thead>
                                    <tr>
                                        <th>Nome</th>
                                        <th>Documento</th>
                                        <th>Telefone</th>
                                        <th>Ação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredFornecedores.length > 0 ? (
                                        filteredFornecedores.map(fornecedor => (
                                            <tr key={fornecedor.fornecedorId}>
                                                <td>{fornecedor.nomeFornecedor}</td>
                                                <td>{fornecedor.documentoFornecedor}</td>
                                                <td>{fornecedor.telefoneFornecedor}</td>
                                                <td>
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleSelectFornecedor(fornecedor)}
                                                        style={{
                                                            background: '#10b981',
                                                            color: 'white',
                                                            border: 'none',
                                                            padding: '6px 12px',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            fontWeight: 500,
                                                            fontSize: '13px'
                                                        }}
                                                    >
                                                        Selecionar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} style={{ textAlign: 'center', padding: '24px' }}>
                                                Nenhum fornecedor encontrado.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LancarContaPagar;
