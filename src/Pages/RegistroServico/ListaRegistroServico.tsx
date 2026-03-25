import React, { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiSearch, FiX } from 'react-icons/fi';
import { registroServicoService, type RegistroServico } from '../../Services/registroServicoService';
import { formaPagamentoService, type FormaPagamento } from '../../Services/formaPagamentoService';
import { notify } from '../../Lib/notify';
import '../../Styles/RegistroServico/registroServico.css';

function ListaRegistroServico() {
    const [registros, setRegistros] = useState<RegistroServico[]>([]);
    const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Filtros
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filterPago, setFilterPago] = useState(true);
    const [filterNaoPago, setFilterNaoPago] = useState(true);

    // Modal state
    const [selectedRegistro, setSelectedRegistro] = useState<RegistroServico | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editStatusPagamento, setEditStatusPagamento] = useState<'pago' | 'nao_pago'>('nao_pago');

    const fetchFormasPagamento = async () => {
        try {
            const formasData = await formaPagamentoService.listar();
            setFormasPagamento(formasData);
        } catch (error) {
            console.error("Erro ao carregar formas de pagamento", error);
        }
    };

    const handleSearch = async () => {
        if (!startDate || !endDate) {
            notify.error('Por favor, selecione o período (Data Início e Data Fim)');
            return;
        }

        setLoading(true);
        try {
            const registrosData = await registroServicoService.listar(startDate, endDate);
            setRegistros(registrosData);
        } catch (error) {
            notify.error('Erro ao buscar registros');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFormasPagamento();
    }, []);

    const handleDelete = async (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir este registro?')) {
            try {
                await registroServicoService.excluir(id);
                notify.success('Registro excluído com sucesso');
                // Recarregar com os filtros atuais
                if (startDate && endDate) {
                    handleSearch();
                }
            } catch (error) {
                notify.error('Erro ao excluir registro');
                console.error(error);
            }
        }
    };

    const handleEdit = (registro: RegistroServico) => {
        // Date handling for input date type
        const dateObj = new Date(registro.dataServico);
        const formattedDate = dateObj.toISOString().split('T')[0];

        setSelectedRegistro({ 
            ...registro, 
            dataServico: formattedDate 
        });
        setEditStatusPagamento(registro.formaPagamentoId ? 'pago' : 'nao_pago');
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRegistro || !selectedRegistro.registroServicoId) return;

        if (!selectedRegistro.nomeServico) {
            notify.error('O nome do serviço é obrigatório');
            return;
        }
        if (selectedRegistro.valorServico <= 0) {
            notify.error('O valor do serviço deve ser maior que zero');
            return;
        }
        if (!selectedRegistro.dataServico) {
            notify.error('A data do serviço é obrigatória');
            return;
        }

        if (editStatusPagamento === 'pago' && !selectedRegistro.formaPagamentoId) {
            notify.error('Selecione uma forma de pagamento');
            return;
        }

        setIsSaving(true);
        try {
            const submitData = { ...selectedRegistro };
            if (editStatusPagamento === 'nao_pago') {
                submitData.formaPagamentoId = undefined;
            }

            await registroServicoService.atualizar(selectedRegistro.registroServicoId, submitData);
            notify.success('Registro atualizado com sucesso');
            setIsEditModalOpen(false);
            if (startDate && endDate) {
                handleSearch();
            }
        } catch (error) {
            notify.error('Erro ao atualizar registro');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (name === 'statusPagamento') {
            setEditStatusPagamento(value as 'pago' | 'nao_pago');
            if (value === 'nao_pago' && selectedRegistro) {
                setSelectedRegistro({ ...selectedRegistro, formaPagamentoId: undefined });
            }
            return;
        }

        if (selectedRegistro) {
            setSelectedRegistro({
                ...selectedRegistro,
                [name]: type === 'number' ? Number(value) : value
            });
        }
    };

    const getFormaPagamentoDescricao = (id?: number) => {
        if (!id) return '-';
        const fp = formasPagamento.find(f => f.formaPagamentoId === id);
        return fp ? fp.descricaoPagamento : '-';
    };

    const filteredRegistros = registros.filter(reg => {
        // Filtro de texto
        const matchesSearch = reg.nomeServico.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (reg.nomeCliente && reg.nomeCliente.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (reg.veiculo && reg.veiculo.toLowerCase().includes(searchTerm.toLowerCase()));

        // Filtro de data
        const regDate = new Date(reg.dataServico).toISOString().split('T')[0];
        const matchesDate = (!startDate || regDate >= startDate) && 
                          (!endDate || regDate <= endDate);

        // Filtro de pagamento
        const isPago = !!reg.formaPagamentoId;
        const matchesPayment = (filterPago && isPago) || (filterNaoPago && !isPago);

        return matchesSearch && matchesDate && matchesPayment;
    });

    // Agrupar registros por data
    const groupedRegistros = filteredRegistros.reduce((acc, reg) => {
        const dateKey = new Date(reg.dataServico).toISOString().split('T')[0];
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(reg);
        return acc;
    }, {} as Record<string, RegistroServico[]>);

    // Ordenar as datas (mais recente primeiro)
    const sortedDates = Object.keys(groupedRegistros).sort((a, b) => b.localeCompare(a));

    if (loading) {
        return <div className="loading-state">Carregando registros...</div>;
    }

    return (
        <div className="form-container" style={{ maxWidth: '100%' }}>
            <div className="search-container" style={{ flexDirection: 'column', gap: '16px', alignItems: 'stretch' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <FiSearch className="search-icon" size={20} style={{ position: 'absolute', left: '16px', top: '28px' }} />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Buscar por serviço, cliente ou veículo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: '40px' }}
                    />
                </div>
                
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label htmlFor="startDate" style={{ fontSize: '12px', marginBottom: '4px' }}>Data Início</label>
                            <input
                                type="date"
                                id="startDate"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label htmlFor="endDate" style={{ fontSize: '12px', marginBottom: '4px' }}>Data Fim</label>
                            <input
                                type="date"
                                id="endDate"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>
                    </div>

                    <div style={{ height: '40px', width: '1px', backgroundColor: '#ddd' }}></div>

                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#666' }}>Status:</span>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={filterPago}
                                onChange={(e) => setFilterPago(e.target.checked)}
                            />
                            <span className="status-badge status-pago" style={{ padding: '4px 8px' }}>Pago</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={filterNaoPago}
                                onChange={(e) => setFilterNaoPago(e.target.checked)}
                            />
                            <span className="status-badge status-nao-pago" style={{ padding: '4px 8px' }}>Não Pago</span>
                        </label>
                    </div>

                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                        <button 
                            className="btn-primary" 
                            onClick={handleSearch}
                            disabled={loading}
                            style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <FiSearch size={14} />
                            Filtrar
                        </button>
                        <button 
                            className="btn-secondary" 
                            onClick={() => {
                                setStartDate('');
                                setEndDate('');
                                setFilterPago(true);
                                setFilterNaoPago(true);
                                setSearchTerm('');
                                setRegistros([]);
                            }}
                            style={{ padding: '8px 16px', fontSize: '13px' }}
                        >
                            Limpar
                        </button>
                    </div>
                </div>
            </div>

            <div className="table-container">
                {sortedDates.length > 0 ? (
                    sortedDates.map(date => (
                        <div key={date} style={{ marginBottom: '32px' }}>
                            <h3 style={{ 
                                padding: '12px 16px', 
                                backgroundColor: '#e9ecef', 
                                color: '#495057',
                                borderRadius: '8px 8px 0 0',
                                borderBottom: '2px solid #dee2e6',
                                fontSize: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <span>📅</span>
                                {new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { 
                                    weekday: 'long', 
                                    day: 'numeric', 
                                    month: 'long', 
                                    year: 'numeric' 
                                })}
                                <span style={{ 
                                    marginLeft: 'auto', 
                                    fontSize: '12px', 
                                    backgroundColor: '#fff', 
                                    padding: '2px 8px', 
                                    borderRadius: '12px',
                                    border: '1px solid #dee2e6'
                                }}>
                                    {groupedRegistros[date].length} registro(s)
                                </span>
                            </h3>
                            <table className="registro-servico-table" style={{ marginTop: 0 }}>
                                <thead>
                                    <tr>
                                        <th style={{ width: '25%' }}>Serviço</th>
                                        <th style={{ width: '20%' }}>Cliente</th>
                                        <th style={{ width: '15%' }}>Veículo</th>
                                        <th style={{ width: '15%' }}>Valor (R$)</th>
                                        <th style={{ width: '10%' }}>Status</th>
                                        <th style={{ width: '15%' }}>Forma Pgto</th>
                                        <th style={{ width: '100px', textAlign: 'center' }}>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groupedRegistros[date].map((reg) => (
                                        <tr key={reg.registroServicoId}>
                                            <td style={{ fontWeight: 500 }}>{reg.nomeServico}</td>
                                            <td>{reg.nomeCliente || '-'}</td>
                                            <td>{reg.veiculo || '-'}</td>
                                            <td style={{ fontFamily: 'monospace', fontSize: '14px' }}>
                                                {reg.valorServico.toFixed(2).replace('.', ',')}
                                            </td>
                                            <td>
                                                {reg.formaPagamentoId ? (
                                                    <span className="status-badge status-pago">Pago</span>
                                                ) : (
                                                    <span className="status-badge status-nao-pago">Não Pago</span>
                                                )}
                                            </td>
                                            <td>{getFormaPagamentoDescricao(reg.formaPagamentoId)}</td>
                                            <td className="actions-cell">
                                                <button 
                                                    className="action-btn edit" 
                                                    title="Editar"
                                                    onClick={() => handleEdit(reg)}
                                                >
                                                    <FiEdit2 size={18} />
                                                </button>
                                                <button 
                                                    className="action-btn delete" 
                                                    title="Excluir"
                                                    onClick={() => reg.registroServicoId && handleDelete(reg.registroServicoId)}
                                                >
                                                    <FiTrash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', padding: '48px', color: '#666' }}>
                        {!startDate || !endDate ? (
                            <p>Selecione um período (Data Início e Fim) e clique em Filtrar para ver os registros.</p>
                        ) : (
                            <p>Nenhum registro encontrado com os filtros selecionados.</p>
                        )}
                    </div>
                )}
            </div>

            {/* Modal de Edição */}
            {isEditModalOpen && selectedRegistro && (
                <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
                        <div className="modal-header">
                            <h2>Editar Registro de Serviço</h2>
                            <button className="close-btn" onClick={() => setIsEditModalOpen(false)}>
                                <FiX size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSaveEdit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="edit-nomeServico">Nome do Serviço *</label>
                                    <input
                                        type="text"
                                        id="edit-nomeServico"
                                        name="nomeServico"
                                        value={selectedRegistro.nomeServico}
                                        onChange={handleEditChange}
                                        disabled={isSaving}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="edit-nomeCliente">Nome do Cliente</label>
                                    <input
                                        type="text"
                                        id="edit-nomeCliente"
                                        name="nomeCliente"
                                        value={selectedRegistro.nomeCliente || ''}
                                        onChange={handleEditChange}
                                        disabled={isSaving}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="edit-veiculo">Veículo / Placa</label>
                                    <input
                                        type="text"
                                        id="edit-veiculo"
                                        name="veiculo"
                                        value={selectedRegistro.veiculo || ''}
                                        onChange={handleEditChange}
                                        disabled={isSaving}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="edit-valorServico">Valor do Serviço (R$) *</label>
                                    <input
                                        type="number"
                                        id="edit-valorServico"
                                        name="valorServico"
                                        value={selectedRegistro.valorServico}
                                        onChange={handleEditChange}
                                        step="0.01"
                                        min="0"
                                        disabled={isSaving}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="edit-dataServico">Data do Serviço *</label>
                                    <input
                                        type="date"
                                        id="edit-dataServico"
                                        name="dataServico"
                                        value={selectedRegistro.dataServico}
                                        onChange={handleEditChange}
                                        disabled={isSaving}
                                    />
                                </div>
                            </div>

                            <div className="form-grid" style={{ marginTop: '24px', borderTop: '1px solid #eee', paddingTop: '24px' }}>
                                <div className="form-group">
                                    <label>Status de Pagamento</label>
                                    <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'normal' }}>
                                            <input
                                                type="radio"
                                                name="statusPagamento"
                                                value="pago"
                                                checked={editStatusPagamento === 'pago'}
                                                onChange={handleEditChange}
                                                disabled={isSaving}
                                            />
                                            Pago
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'normal' }}>
                                            <input
                                                type="radio"
                                                name="statusPagamento"
                                                value="nao_pago"
                                                checked={editStatusPagamento === 'nao_pago'}
                                                onChange={handleEditChange}
                                                disabled={isSaving}
                                            />
                                            Não Pago
                                        </label>
                                    </div>
                                </div>

                                {editStatusPagamento === 'pago' && (
                                    <div className="form-group">
                                        <label htmlFor="edit-formaPagamentoId">Forma de Pagamento *</label>
                                        <select
                                            id="edit-formaPagamentoId"
                                            name="formaPagamentoId"
                                            value={selectedRegistro.formaPagamentoId || ''}
                                            onChange={handleEditChange}
                                            disabled={isSaving}
                                            style={{
                                                padding: '12px 16px',
                                                borderRadius: '10px',
                                                border: '1px solid #e0e0e0',
                                                fontSize: '14px',
                                                outline: 'none'
                                            }}
                                        >
                                            <option value="">Selecione a forma de pagamento</option>
                                            {formasPagamento.map(fp => (
                                                <option key={fp.formaPagamentoId} value={fp.formaPagamentoId}>
                                                    {fp.descricaoPagamento}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="form-actions">
                                <button 
                                    type="button" 
                                    className="btn-secondary"
                                    onClick={() => setIsEditModalOpen(false)}
                                    disabled={isSaving}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn-primary"
                                    disabled={isSaving}
                                >
                                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ListaRegistroServico;