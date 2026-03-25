import { useState, useEffect } from 'react';
import { FiSearch, FiCalendar, FiDollarSign, FiUser, FiTag, FiEdit2, FiTrash2, FiX, FiCheckSquare } from 'react-icons/fi';
import { contaPagarService, type ContaPagar } from '../../../Services/contaPagarService';
import { fornecedorService, type Fornecedor } from '../../../Services/fornecedorService';
import { despesaService, categoriaDespesaService, type Despesa, type CategoriaDespesa } from '../../../Services/despesaService';
import { notify } from '../../../Lib/notify';

function ConsultarContaPagar() {
    const [contas, setContas] = useState<ContaPagar[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
    const [despesas, setDespesas] = useState<Despesa[]>([]);
    const [categorias, setCategorias] = useState<CategoriaDespesa[]>([]);

    const [filterPeriodoInicio, setFilterPeriodoInicio] = useState('');
    const [filterPeriodoFim, setFilterPeriodoFim] = useState('');
    const [filterFornecedor, setFilterFornecedor] = useState('');
    const [filterDespesa, setFilterDespesa] = useState('');
    const [filterCategoria, setFilterCategoria] = useState('');

    // Edit Modal States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [contaToEdit, setContaToEdit] = useState<ContaPagar | null>(null);
    const [editForm, setEditForm] = useState({
        vlParcela: '',
        parcela: '',
        dtVencimento: '',
        numDocumento: '',
        tpDocumento: 1
    });
    const [saving, setSaving] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const [contasData, fornecedoresData, despesasData, categoriasData] = await Promise.all([
                contaPagarService.listar(),
                fornecedorService.listar(),
                despesaService.listar(),
                categoriaDespesaService.listar()
            ]);

            setContas(contasData);
            setFornecedores(fornecedoresData);
            setDespesas(despesasData);
            setCategorias(categoriasData);
        } catch (error) {
            notify.error('Erro ao carregar dados');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR').format(date);
    };

    const getTipoDocumentoLabel = (tpDocumento: number | string) => {
        const tipos: { [key: string]: string } = {
            '1': 'Dinheiro', 'Dinheiro': 'Dinheiro',
            '2': 'Pix', 'Pix': 'Pix',
            '3': 'Cheque', 'Cheque': 'Cheque',
            '4': 'Boleto', 'Boleto': 'Boleto',
            '5': 'Outros', 'Outros': 'Outros'
        };
        return tipos[tpDocumento.toString()] || 'Outros';
    };

    const handleEditClick = (conta: ContaPagar) => {
        setContaToEdit(conta);
        setEditForm({
            vlParcela: conta.vlParcela.toString(),
            parcela: conta.parcela.toString(),
            dtVencimento: conta.dtVencimento.split('T')[0], // Extract just the date part
            numDocumento: conta.numDocumento ? conta.numDocumento.toString() : '',
            tpDocumento: typeof conta.tpDocumento === 'string' ? 
                (conta.tpDocumento === 'Dinheiro' ? 1 : conta.tpDocumento === 'Pix' ? 2 : conta.tpDocumento === 'Cheque' ? 3 : conta.tpDocumento === 'Boleto' ? 4 : 5) 
                : conta.tpDocumento as number
        });
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = async (id: number) => {
        if (!window.confirm('Tem certeza que deseja excluir esta conta a pagar? Esta ação não pode ser desfeita.')) return;

        try {
            await contaPagarService.excluir(id);
            notify.success('Conta a pagar excluída com sucesso!');
            loadData();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erro ao excluir conta a pagar';
            notify.error(message);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!contaToEdit?.contaPagarId) return;

        setSaving(true);
        try {
            const payload = {
                categoriaId: contaToEdit.categoriaId,
                despesaId: contaToEdit.despesaId,
                fornecedorId: contaToEdit.fornecedorId,
                vlParcela: parseFloat(editForm.vlParcela.replace(',', '.')),
                parcela: parseInt(editForm.parcela),
                dtVencimento: editForm.dtVencimento,
                numDocumento: editForm.numDocumento ? parseInt(editForm.numDocumento) : null,
                tpDocumento: parseInt(editForm.tpDocumento.toString()),
                dataCadastro: contaToEdit.dataCadastro || new Date().toISOString()
            };

            await contaPagarService.atualizar(contaToEdit.contaPagarId, payload as any);
            notify.success('Conta a pagar atualizada com sucesso!');
            setIsEditModalOpen(false);
            loadData();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erro ao atualizar conta a pagar';
            notify.error(message);
        } finally {
            setSaving(false);
        }
    };

    const filteredContas = contas.filter(conta => {
        let match = true;

        if (filterFornecedor && conta.fornecedorId?.toString() !== filterFornecedor) {
            match = false;
        }
        if (filterDespesa && conta.despesaId.toString() !== filterDespesa) {
            match = false;
        }
        if (filterCategoria && conta.categoriaId.toString() !== filterCategoria) {
            match = false;
        }
        if (filterPeriodoInicio) {
            const dataConta = new Date(conta.dtVencimento).getTime();
            const dataInicio = new Date(filterPeriodoInicio).getTime();
            if (dataConta < dataInicio) match = false;
        }
        if (filterPeriodoFim) {
            const dataConta = new Date(conta.dtVencimento).getTime();
            const dataFim = new Date(filterPeriodoFim).getTime();
            if (dataConta > dataFim) match = false;
        }

        return match;
    });

    if (loading) {
        return <div style={{ padding: 40, textAlign: 'center' }}>Carregando...</div>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <div className="cp-filters">
                <div className="cp-form-group">
                    <label><FiCalendar style={{ marginRight: 6 }} /> Período Início</label>
                    <input 
                        type="date" 
                        value={filterPeriodoInicio} 
                        onChange={e => setFilterPeriodoInicio(e.target.value)} 
                    />
                </div>
                <div className="cp-form-group">
                    <label><FiCalendar style={{ marginRight: 6 }} /> Período Fim</label>
                    <input 
                        type="date" 
                        value={filterPeriodoFim} 
                        onChange={e => setFilterPeriodoFim(e.target.value)} 
                    />
                </div>
                <div className="cp-form-group">
                    <label><FiUser style={{ marginRight: 6 }} /> Fornecedor</label>
                    <select value={filterFornecedor} onChange={e => setFilterFornecedor(e.target.value)}>
                        <option value="">Todos</option>
                        {fornecedores.map(f => (
                            <option key={f.fornecedorId} value={f.fornecedorId}>{f.nomeFornecedor}</option>
                        ))}
                    </select>
                </div>
                <div className="cp-form-group">
                    <label><FiDollarSign style={{ marginRight: 6 }} /> Despesa</label>
                    <select value={filterDespesa} onChange={e => setFilterDespesa(e.target.value)}>
                        <option value="">Todas</option>
                        {despesas.map(d => (
                            <option key={d.despesaId} value={d.despesaId}>{d.nomeDespesa}</option>
                        ))}
                    </select>
                </div>
                <div className="cp-form-group">
                    <label><FiTag style={{ marginRight: 6 }} /> Tipo de Despesa</label>
                    <select value={filterCategoria} onChange={e => setFilterCategoria(e.target.value)}>
                        <option value="">Todos</option>
                        {categorias.map(c => (
                            <option key={c.categoriaId} value={c.categoriaId}>{c.nomeCategoria}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="cp-grid">
                <table className="cp-table">
                    <thead>
                        <tr>
                            <th>Vencimento</th>
                            <th>Fornecedor</th>
                            <th>Despesa / Categoria</th>
                            <th>Documento</th>
                            <th>Tipo Pag.</th>
                            <th>Parcela</th>
                            <th>Valor</th>
                            <th style={{ width: '100px', textAlign: 'center' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredContas.length > 0 ? (
                            filteredContas.map((conta, index) => (
                                <tr key={conta.contaPagarId || index}>
                                    <td>{formatDate(conta.dtVencimento)}</td>
                                    <td>{conta.fornecedor || '-'}</td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: 500 }}>{conta.despesa}</span>
                                            <span style={{ fontSize: 12, color: '#6b7280' }}>{conta.categoria}</span>
                                        </div>
                                    </td>
                                    <td>{conta.numDocumento || '-'}</td>
                                    <td>
                                        <span className="cp-badge status-pendente">
                                            {getTipoDocumentoLabel(conta.tpDocumento)}
                                        </span>
                                    </td>
                                    <td>{conta.parcela}</td>
                                    <td style={{ fontWeight: 600 }}>{formatCurrency(conta.vlParcela)}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                            <button 
                                                className="cp-action-btn edit" 
                                                onClick={() => handleEditClick(conta)}
                                                title="Editar"
                                            >
                                                <FiEdit2 size={18} />
                                            </button>
                                            <button 
                                                className="cp-action-btn" 
                                                onClick={() => conta.contaPagarId && handleDeleteClick(conta.contaPagarId)}
                                                title="Excluir"
                                            >
                                                <FiTrash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} style={{ textAlign: 'center', padding: '32px' }}>
                                    <div style={{ color: '#6b7280', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                                        <FiSearch size={32} />
                                        <span>Nenhuma conta a pagar encontrada com os filtros atuais.</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal de Edição */}
            {isEditModalOpen && contaToEdit && (
                <div className="cp-modal-overlay">
                    <div className="cp-modal-content" style={{ maxWidth: '600px' }}>
                        <button className="cp-modal-close" onClick={() => setIsEditModalOpen(false)}>
                            <FiX size={24} />
                        </button>
                        
                        <h2 style={{ marginTop: 0, marginBottom: '24px' }}>Editar Parcela</h2>
                        
                        <form onSubmit={handleUpdate}>
                            <div className="cp-form-section">
                                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                    <div className="cp-form-group" style={{ flex: 1 }}>
                                        <label>Valor da Parcela (R$)*</label>
                                        <input 
                                            type="number" 
                                            step="0.01" 
                                            min="0.01" 
                                            value={editForm.vlParcela} 
                                            onChange={(e) => setEditForm({...editForm, vlParcela: e.target.value})} 
                                            required
                                        />
                                    </div>
                                    <div className="cp-form-group" style={{ flex: 1 }}>
                                        <label>Data de Vencimento*</label>
                                        <input 
                                            type="date" 
                                            value={editForm.dtVencimento} 
                                            onChange={(e) => setEditForm({...editForm, dtVencimento: e.target.value})} 
                                            required
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '16px' }}>
                                    <div className="cp-form-group" style={{ flex: 1 }}>
                                        <label>Número do Documento</label>
                                        <input 
                                            type="number" 
                                            value={editForm.numDocumento} 
                                            onChange={(e) => setEditForm({...editForm, numDocumento: e.target.value})} 
                                        />
                                    </div>
                                    <div className="cp-form-group" style={{ flex: 1 }}>
                                        <label>Forma de Pagamento*</label>
                                        <select 
                                            value={editForm.tpDocumento} 
                                            onChange={(e) => setEditForm({...editForm, tpDocumento: parseInt(e.target.value)})}
                                        >
                                            <option value={1}>Dinheiro</option>
                                            <option value={2}>Pix</option>
                                            <option value={3}>Cheque</option>
                                            <option value={4}>Boleto</option>
                                            <option value={5}>Outros</option>
                                        </select>
                                    </div>
                                    <div className="cp-form-group" style={{ flex: 1 }}>
                                        <label>Parcela N°*</label>
                                        <input 
                                            type="number" 
                                            min="1"
                                            value={editForm.parcela} 
                                            onChange={(e) => setEditForm({...editForm, parcela: e.target.value})} 
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                                <button type="submit" className="cp-btn-primary" disabled={saving} style={{ width: 'auto', minWidth: '150px' }}>
                                    <FiCheckSquare size={20} />
                                    {saving ? 'Salvando...' : 'Salvar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ConsultarContaPagar;
