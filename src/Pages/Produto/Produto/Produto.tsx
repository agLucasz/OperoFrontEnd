import { useState } from 'react';
import { FiPlus, FiList, FiArrowLeft } from 'react-icons/fi';
import CadastrarProduto from './CadastrarProduto';
import ListaProduto from './ListaProduto';
import '../../../Styles/Produto/Produto/produto.css';

type ProdutoView = 'home' | 'cadastrar' | 'listar';

function Produto() {
    const [view, setView] = useState<ProdutoView>('home');

    const renderContent = () => {
        switch (view) {
            case 'cadastrar':
                return (
                    <>
                        <div className="standard-sub-page-header">
                            <button className="standard-back-button" onClick={() => setView('home')}>
                                <FiArrowLeft size={24} />
                            </button>
                            <div className="standard-page-header" style={{ marginBottom: 0 }}>
                                <h2>Cadastrar Produto</h2>
                            </div>
                        </div>
                        <CadastrarProduto />
                    </>
                );
            case 'listar':
                return (
                    <>
                        <div className="standard-sub-page-header">
                            <button className="standard-back-button" onClick={() => setView('home')}>
                                <FiArrowLeft size={24} />
                            </button>
                            <div className="standard-page-header" style={{ marginBottom: 0 }}>
                                <h2>Listar Produtos</h2>
                            </div>
                        </div>
                        <ListaProduto />
                    </>
                );
            default:
                return (
                    <>
                        <div className="standard-page-header">
                            <div>
                                <h2>Produtos</h2>
                            </div>
                        </div>

                        <div className="standard-page-cards-container">
                            <div className="standard-page-card" onClick={() => setView('cadastrar')}>
                                <div className="standard-page-card-icon">
                                    <FiPlus size={32} />
                                </div>
                                <h3 className="standard-page-card-title">Cadastrar Produto</h3>
                                <p className="standard-page-card-description">
                                    Adicione novos produtos ao estoque do sistema.
                                </p>
                            </div>

                            <div className="standard-page-card" onClick={() => setView('listar')}>
                                <div className="standard-page-card-icon">
                                    <FiList size={32} />
                                </div>
                                <h3 className="standard-page-card-title">Listar Produtos</h3>
                                <p className="standard-page-card-description">
                                    Visualize, edite e remova produtos cadastrados.
                                </p>
                            </div>
                        </div>
                    </>
                );
        }
    };

    return (
        <div className="standard-page-container">
            {renderContent()}
        </div>
    );
}

export default Produto;
