import { useState, useEffect } from 'react';
import { FiDollarSign, FiTool, FiAlertCircle, FiTrendingUp, FiTrendingDown, FiArrowRight } from 'react-icons/fi';
import { contaPagarService, type ContaPagar } from '../../Services/contaPagarService';
import { contaReceberService, type ContaReceber } from '../../Services/contaReceberService';
import { ordemServicoService, type OrdemServico } from '../../Services/ordemServicoService';
import { clienteService } from '../../Services/clienteService';

interface DashboardHomeProps {
    userName: string;
    onNavigate: (tab: string) => void;
}

function DashboardHome({ userName, onNavigate }: DashboardHomeProps) {
    const [loading, setLoading] = useState(true);
    
    // Metrics
    const [osAbertas, setOsAbertas] = useState(0);
    const [osFinalizadas, setOsFinalizadas] = useState(0);
    const [totalReceberPendente, setTotalReceberPendente] = useState(0);
    const [totalPagarGeral, setTotalPagarGeral] = useState(0);
    const [totalPagarVencido, setTotalPagarVencido] = useState(0);

    // Lists
    const [ultimasOS, setUltimasOS] = useState<OrdemServico[]>([]);
    const [pagarVencidas, setPagarVencidas] = useState<ContaPagar[]>([]);
    const [proximosRecebimentos, setProximosRecebimentos] = useState<ContaReceber[]>([]);
    const [proximosPagamentos, setProximosPagamentos] = useState<ContaPagar[]>([]);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                // Fetch all necessary data
                const [osData, contasPagarData, clientesData] = await Promise.all([
                    ordemServicoService.listar(),
                    contaPagarService.listar(),
                    clienteService.listar()
                ]);

                // --- Ordem de Serviço ---
                const abertas = osData.filter((os: OrdemServico) => os.status === 0 || os.status === 1); // 0=Aberto, 1=Em Andamento (assuming based on common patterns)
                const finalizadas = osData.filter((os: OrdemServico) => os.status === 2); // 2=Finalizada
                setOsAbertas(abertas.length);
                setOsFinalizadas(finalizadas.length);
                
                // Get 5 most recent OS
                const sortedOS = [...osData].sort((a, b) => {
                    const dateA = a.dataAbertura ? new Date(a.dataAbertura).getTime() : 0;
                    const dateB = b.dataAbertura ? new Date(b.dataAbertura).getTime() : 0;
                    return dateB - dateA;
                });
                setUltimasOS(sortedOS.slice(0, 5));

                // --- Contas a Pagar ---
                let totalPagar = 0;
                let totalVencido = 0;
                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0);

                const vencidas: ContaPagar[] = [];
                const pendentesPagamento: ContaPagar[] = [];

                contasPagarData.forEach((cp: ContaPagar) => {
                    totalPagar += cp.vlParcela;
                    const vencimento = new Date(cp.dtVencimento);
                    vencimento.setHours(0, 0, 0, 0);

                    if (vencimento < hoje) {
                        totalVencido += cp.vlParcela;
                        vencidas.push(cp);
                    } else {
                        pendentesPagamento.push(cp);
                    }
                });

                setTotalPagarGeral(totalPagar);
                setTotalPagarVencido(totalVencido);
                
                // Sort vencidas by oldest first
                vencidas.sort((a, b) => new Date(a.dtVencimento).getTime() - new Date(b.dtVencimento).getTime());
                setPagarVencidas(vencidas.slice(0, 5));

                pendentesPagamento.sort((a, b) => new Date(a.dtVencimento).getTime() - new Date(b.dtVencimento).getTime());
                setProximosPagamentos(pendentesPagamento.slice(0, 5));

                // --- Contas a Receber ---
                // As the API requires clienteId to get pending, we need to iterate over clients or find a way.
                // Alternatively, we can fetch all clients, then fetch pending for each, or just use the data we have.
                // To avoid too many requests, let's limit to active clients or a different approach.
                // Wait, ContaReceberService has listarQuitadasPorPeriodo and listarPorClienteEPeriodoVencimento.
                // Let's fetch for the current month across all clients if possible, or we might need to do multiple calls.
                // Since this is a dashboard, let's try to get all pending by fetching for each client (if not too many).
                let totalReceber = 0;
                let allPendentes: ContaReceber[] = [];
                
                // Limiting to first 20 clients to avoid overwhelming the server if there are too many
                const clientsToFetch = clientesData.slice(0, 20);
                
                const pendingPromises = clientsToFetch.map((c: any) => contaReceberService.listarPendentes(c.clienteId).catch(() => []));
                const pendingResults = await Promise.all(pendingPromises);
                
                pendingResults.forEach(clientPendentes => {
                    if (Array.isArray(clientPendentes)) {
                        clientPendentes.forEach((cr: ContaReceber) => {
                            if (!cr.pago) {
                                totalReceber += cr.valorParcela;
                                allPendentes.push(cr);
                            }
                        });
                    }
                });

                setTotalReceberPendente(totalReceber);
                
                // Sort next to receive
                allPendentes.sort((a, b) => new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime());
                setProximosRecebimentos(allPendentes.slice(0, 5));

            } catch (error) {
                console.error("Erro ao carregar dados do dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR').format(date);
    };

    if (loading) {
        return <div style={{ padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>Carregando dados do painel...</div>;
    }

    return (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto', height: '100%' }}>
            <div>
                <h2 style={{ margin: '0 0 8px 0', color: '#333' }}>Olá, {userName}!</h2>
                <p style={{ margin: 0, color: '#666' }}>Aqui está o resumo do seu negócio hoje.</p>
            </div>

            {/* Cards Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                
                <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ backgroundColor: 'rgba(37, 107, 187, 0.1)', padding: '16px', borderRadius: '12px', color: 'var(--blue)' }}>
                        <FiTool size={24} />
                    </div>
                    <div>
                        <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#666', fontWeight: 600, textTransform: 'uppercase' }}>OS em Andamento</p>
                        <h3 style={{ margin: 0, fontSize: '24px', color: '#333' }}>{osAbertas}</h3>
                    </div>
                </div>

                <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ backgroundColor: 'rgba(40, 167, 69, 0.1)', padding: '16px', borderRadius: '12px', color: '#28a745' }}>
                        <FiTool size={24} />
                    </div>
                    <div>
                        <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#666', fontWeight: 600, textTransform: 'uppercase' }}>OS Finalizadas</p>
                        <h3 style={{ margin: 0, fontSize: '24px', color: '#333' }}>{osFinalizadas}</h3>
                    </div>
                </div>

                <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ backgroundColor: 'rgba(40, 167, 69, 0.1)', padding: '16px', borderRadius: '12px', color: '#28a745' }}>
                        <FiTrendingUp size={24} />
                    </div>
                    <div>
                        <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#666', fontWeight: 600, textTransform: 'uppercase' }}>A Receber (Pendente)</p>
                        <h3 style={{ margin: 0, fontSize: '24px', color: '#333' }}>{formatCurrency(totalReceberPendente)}</h3>
                    </div>
                </div>

                <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ backgroundColor: 'rgba(255, 193, 7, 0.1)', padding: '16px', borderRadius: '12px', color: '#ffc107' }}>
                        <FiTrendingDown size={24} />
                    </div>
                    <div>
                        <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#666', fontWeight: 600, textTransform: 'uppercase' }}>Total a Pagar</p>
                        <h3 style={{ margin: 0, fontSize: '24px', color: '#333' }}>{formatCurrency(totalPagarGeral)}</h3>
                    </div>
                </div>

                <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)', padding: '16px', borderRadius: '12px', color: '#dc3545' }}>
                        <FiAlertCircle size={24} />
                    </div>
                    <div>
                        <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#dc3545', fontWeight: 600, textTransform: 'uppercase' }}>Pagar Vencido</p>
                        <h3 style={{ margin: 0, fontSize: '24px', color: '#dc3545' }}>{formatCurrency(totalPagarVencido)}</h3>
                    </div>
                </div>

            </div>

            {/* Lists Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px', marginTop: '10px' }}>
                
                {/* Últimas OS */}
                <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FiTool color="var(--blue)" />
                            <h3 style={{ margin: 0, fontSize: '16px', color: '#333' }}>Últimas Ordens de Serviço</h3>
                        </div>
                        <button 
                            onClick={() => onNavigate('ordemservico')}
                            style={{ background: 'none', border: 'none', color: 'var(--blue)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                            Ver todas <FiArrowRight />
                        </button>
                    </div>
                    <div style={{ padding: '0', flex: 1 }}>
                        {ultimasOS.length > 0 ? (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <tbody>
                                    {ultimasOS.map((os) => (
                                        <tr key={os.ordemServicoId} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                            <td style={{ padding: '12px 20px', fontSize: '14px', color: '#333' }}>
                                                <div style={{ fontWeight: 500 }}>#{os.ordemServicoId} - {os.nomeCliente}</div>
                                                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                                    Aberta em {formatDate(os.dataAbertura || '')}
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px 20px', fontSize: '14px', color: '#666', textAlign: 'right' }}>
                                                <span style={{ 
                                                    backgroundColor: os.status === 2 ? 'rgba(40, 167, 69, 0.1)' : 'rgba(37, 107, 187, 0.1)', 
                                                    color: os.status === 2 ? '#28a745' : 'var(--blue)',
                                                    padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 500
                                                }}>
                                                    {os.statusDescricao || 'Aberto'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '14px' }}>Nenhuma OS encontrada.</div>
                        )}
                    </div>
                </div>

                {/* Contas a Pagar Vencidas */}
                <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FiAlertCircle color="#dc3545" />
                            <h3 style={{ margin: 0, fontSize: '16px', color: '#333' }}>Contas a Pagar Vencidas</h3>
                        </div>
                        <button 
                            onClick={() => onNavigate('contapagar')}
                            style={{ background: 'none', border: 'none', color: '#dc3545', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                            Ver todas <FiArrowRight />
                        </button>
                    </div>
                    <div style={{ padding: '0', flex: 1 }}>
                        {pagarVencidas.length > 0 ? (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <tbody>
                                    {pagarVencidas.map((cp) => (
                                        <tr key={cp.contaPagarId} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                            <td style={{ padding: '12px 20px', fontSize: '14px', color: '#333' }}>
                                                <div style={{ fontWeight: 500 }}>{cp.fornecedor || cp.despesa || 'Despesa'}</div>
                                                <div style={{ fontSize: '12px', color: '#dc3545', marginTop: '4px', fontWeight: 500 }}>
                                                    Venceu em {formatDate(cp.dtVencimento)}
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px 20px', fontSize: '14px', color: '#dc3545', textAlign: 'right', fontWeight: 600 }}>
                                                {formatCurrency(cp.vlParcela)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '14px' }}>Nenhuma conta vencida</div>
                        )}
                    </div>
                </div>

                {/* Próximos Pagamentos */}
                <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FiTrendingDown color="#f39c12" />
                            <h3 style={{ margin: 0, fontSize: '16px', color: '#333' }}>Próximos Pagamentos</h3>
                        </div>
                        <button 
                            onClick={() => onNavigate('contapagar')}
                            style={{ background: 'none', border: 'none', color: '#f39c12', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                            Ver todas <FiArrowRight />
                        </button>
                    </div>
                    <div style={{ padding: '0', flex: 1 }}>
                        {proximosPagamentos.length > 0 ? (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <tbody>
                                    {proximosPagamentos.map((cp) => (
                                        <tr key={cp.contaPagarId} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                            <td style={{ padding: '12px 20px', fontSize: '14px', color: '#333' }}>
                                                <div style={{ fontWeight: 500 }}>{cp.fornecedor || cp.despesa || 'Despesa'}</div>
                                                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                                    Vence em {formatDate(cp.dtVencimento)}
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px 20px', fontSize: '14px', color: '#333', textAlign: 'right', fontWeight: 600 }}>
                                                {formatCurrency(cp.vlParcela)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '14px' }}>Nenhum pagamento próximo.</div>
                        )}
                    </div>
                </div>

                {/* Próximos Recebimentos */}
                <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FiDollarSign color="#28a745" />
                            <h3 style={{ margin: 0, fontSize: '16px', color: '#333' }}>Próximos Recebimentos</h3>
                        </div>
                        <button 
                            onClick={() => onNavigate('contareceber')}
                            style={{ background: 'none', border: 'none', color: '#28a745', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                            Ver todos <FiArrowRight />
                        </button>
                    </div>
                    <div style={{ padding: '0', flex: 1 }}>
                        {proximosRecebimentos.length > 0 ? (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <tbody>
                                    {proximosRecebimentos.map((cr) => (
                                        <tr key={cr.contaReceberId} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                            <td style={{ padding: '12px 20px', fontSize: '14px', color: '#333' }}>
                                                <div style={{ fontWeight: 500 }}>{cr.cliente || `OS #${cr.ordemServicoId}`}</div>
                                                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                                    Vence em {formatDate(cr.dataVencimento)}
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px 20px', fontSize: '14px', color: '#28a745', textAlign: 'right', fontWeight: 600 }}>
                                                {formatCurrency(cr.valorParcela)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '14px' }}>Nenhum recebimento próximo.</div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default DashboardHome;
