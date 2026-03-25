import { useState, useEffect } from 'react';
import '../../../Styles/Produto/Produto/produto.css';
import { produtoService, type Produto } from '../../../Services/produtoService';
import { categoriaProdutoService, type CategoriaProduto } from '../../../Services/categoriaProdutoService';
import { notify } from '../../../Lib/notify';

function CadastrarProduto() {
    const [loading, setLoading] = useState(false);
    const [categorias, setCategorias] = useState<CategoriaProduto[]>([]);
    
    // Displays states for currency formatting
    const [precoCompraDisplay, setPrecoCompraDisplay] = useState('');
    const [precoVendaDisplay, setPrecoVendaDisplay] = useState('');
    
    const [formData, setFormData] = useState<Produto>({
        nomeProduto: '',
        codigoProduto: '',
        precoVenda: 0,
        precoCompra: 0,
        quantidadeProduto: 0,
        descricaoProduto: '',
        categoriaId: 0
    });

    // Função para formatar moeda
    const formatCurrency = (value: string) => {
        let v = value.replace(/\D/g, '');
        if (v === '') return '';
        const numericValue = parseInt(v) / 100;
        return numericValue.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const handlePrecoCompraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedValue = formatCurrency(e.target.value);
        setPrecoCompraDisplay(formattedValue);
        
        if (formattedValue) {
            const numericString = formattedValue.replace(/\./g, '').replace(',', '.');
            setFormData(prev => ({ ...prev, precoCompra: Number(numericString) }));
        } else {
            setFormData(prev => ({ ...prev, precoCompra: 0 }));
        }
    };

    const handlePrecoVendaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedValue = formatCurrency(e.target.value);
        setPrecoVendaDisplay(formattedValue);
        
        if (formattedValue) {
            const numericString = formattedValue.replace(/\./g, '').replace(',', '.');
            setFormData(prev => ({ ...prev, precoVenda: Number(numericString) }));
        } else {
            setFormData(prev => ({ ...prev, precoVenda: 0 }));
        }
    };

    useEffect(() => {
        const loadCategorias = async () => {
            try {
                const data = await categoriaProdutoService.listar();
                setCategorias(data);
            } catch (error) {
                console.error('Erro ao carregar categorias:', error);
                notify.error('Erro ao carregar categorias');
            }
        };
        loadCategorias();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        
        // Handle numeric fields
        if (id === 'precoVenda' || id === 'precoCompra' || id === 'quantidadeProduto' || id === 'categoriaId') {
            const numValue = Number(value);
            setFormData(prev => ({ ...prev, [id]: value === "" || isNaN(numValue) ? 0 : numValue }));
        } else {
            setFormData(prev => ({ ...prev, [id]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.nomeProduto || !formData.codigoProduto || formData.categoriaId === 0) {
            notify.error('Preencha os campos obrigatórios');
            return;
        }

        setLoading(true);
        try {
            await produtoService.cadastrar(formData);
            notify.success('Produto cadastrado com sucesso!');
 
            setFormData({
                nomeProduto: '',
                codigoProduto: '',
                precoVenda: 0,
                precoCompra: 0,
                quantidadeProduto: 0,
                descricaoProduto: '',
                categoriaId: 0
            });
            setPrecoCompraDisplay('');
            setPrecoVendaDisplay('');
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erro ao cadastrar produto';
            notify.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="standard-form-container">
            <div className="produto-header" style={{ marginBottom: 32 }}>
                <h2>Novo Produto</h2>
            </div>
            
            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="nomeProduto">Nome do Produto *</label>
                        <input 
                            type="text" 
                            id="nomeProduto" 
                            value={formData.nomeProduto}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="codigoProduto">Código do Produto *</label>
                        <input 
                            type="text" 
                            id="codigoProduto" 
                            value={formData.codigoProduto}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="categoriaId">Categoria *</label>
                        <select 
                            id="categoriaId" 
                            value={formData.categoriaId || ""}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Selecione uma categoria</option>
                            {categorias.map((cat, index) => (
                                <option key={cat.categoriaId || `cat-${index}`} value={cat.categoriaId}>
                                    {cat.nomeCategoria}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="quantidadeProduto">Quantidade Inicial *</label>
                        <input 
                            type="number" 
                            id="quantidadeProduto" 
                            value={formData.quantidadeProduto}
                            onChange={handleChange}
                            min="0"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="precoCompra">Preço de Compra (R$)</label>
                        <input 
                            type="text" 
                            id="precoCompra" 
                            value={precoCompraDisplay}
                            onChange={handlePrecoCompraChange}
                            placeholder="0,00"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="precoVenda">Preço de Venda (R$)</label>
                        <input 
                            type="text" 
                            id="precoVenda" 
                            value={precoVendaDisplay}
                            onChange={handlePrecoVendaChange}
                            placeholder="0,00"
                        />
                    </div>

                    <div className="form-group full-width">
                        <label htmlFor="descricaoProduto">Descrição</label>
                        <textarea 
                            id="descricaoProduto" 
                            value={formData.descricaoProduto}
                            onChange={handleChange}
                            rows={4}
                        />
                    </div>
                </div>

                <div className="form-actions">
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
                        {loading ? 'Salvando...' : 'Salvar Produto'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CadastrarProduto;
