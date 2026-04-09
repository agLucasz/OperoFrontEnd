import { useEffect, useRef, useState } from 'react';
import { FiX, FiSearch, FiPackage, FiPlus } from 'react-icons/fi';
import { type Produto } from '../Services/produtoService';

interface Props {
    isOpen: boolean;
    produtos: Produto[];
    termoBusca: string;
    onSelect: (produto: Produto) => void;
    onClose: () => void;
}

function ProdutoSearchModal({ isOpen, produtos, termoBusca, onSelect, onClose }: Props) {
    const [filtro, setFiltro] = useState(termoBusca);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setFiltro(termoBusca);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen, termoBusca]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const filtrados = produtos.filter(p =>
        p.nomeProduto.toLowerCase().includes(filtro.toLowerCase()) ||
        p.codigoProduto.toLowerCase().includes(filtro.toLowerCase())
    );

    const formatCurrency = (v: number) =>
        v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <div
            className="modal-overlay"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="modal-content" style={{ maxWidth: 720, width: '95%' }}>
                <div className="modal-header">
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FiPackage size={20} />
                        Selecionar Produto
                    </h2>
                    <button className="close-btn" onClick={onClose}>
                        <FiX size={24} />
                    </button>
                </div>

                {/* Search inside modal */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    padding: '10px 14px',
                    marginBottom: 16,
                }}>
                    <FiSearch size={16} color="#9ca3af" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Filtrar por nome ou código..."
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                        style={{
                            border: 'none',
                            outline: 'none',
                            background: 'transparent',
                            fontSize: 15,
                            width: '100%',
                            fontFamily: 'var(--font)',
                            color: '#111827',
                        }}
                    />
                    {filtro && (
                        <button
                            onClick={() => setFiltro('')}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#9ca3af', display: 'flex' }}
                        >
                            <FiX size={14} />
                        </button>
                    )}
                </div>

                {/* Product list */}
                <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                    {filtrados.length === 0 ? (
                        <div style={{ padding: '40px 24px', textAlign: 'center', color: '#9ca3af' }}>
                            <FiPackage size={40} style={{ opacity: 0.3, display: 'block', margin: '0 auto 12px' }} />
                            <p style={{ margin: 0 }}>Nenhum produto encontrado</p>
                        </div>
                    ) : (
                        <table className="items-table" style={{ fontSize: 14 }}>
                            <thead>
                                <tr>
                                    <th>Produto</th>
                                    <th>Código</th>
                                    <th style={{ textAlign: 'right' }}>Preço</th>
                                    <th style={{ textAlign: 'center' }}>Estoque</th>
                                    <th style={{ textAlign: 'center', width: 60 }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtrados.map((produto) => (
                                    <tr
                                        key={produto.produtoId}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => { onSelect(produto); onClose(); }}
                                    >
                                        <td style={{ fontWeight: 500, color: '#111827' }}>{produto.nomeProduto}</td>
                                        <td style={{ fontFamily: 'monospace', color: '#6b7280' }}>{produto.codigoProduto}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--green)' }}>
                                            {formatCurrency(produto.precoVenda)}
                                        </td>
                                        <td style={{
                                            textAlign: 'center',
                                            color: produto.quantidadeProduto <= 5 ? '#ef4444' : '#6b7280',
                                            fontWeight: produto.quantidadeProduto <= 5 ? 600 : 400,
                                        }}>
                                            {produto.quantidadeProduto}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <button
                                                className="action-btn edit"
                                                title="Adicionar"
                                                onClick={(e) => { e.stopPropagation(); onSelect(produto); onClose(); }}
                                            >
                                                <FiPlus size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div style={{ marginTop: 16, textAlign: 'right' }}>
                    <button className="btn-secondary" onClick={onClose}>
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProdutoSearchModal;
