import { useState } from 'react';
import { FiPlus, FiList, FiArrowLeft } from 'react-icons/fi';
import CadastrarCategoriaProduto from './CadastrarCategoriaProduto';
import ListaCategoriaProduto from './ListaCategoriaProduto';
import '../../../Styles/Produto/CategoriaProduto/categoriaProduto.css';

type CategoriaProdutoView = 'home' | 'cadastrar' | 'listar';

function CategoriaProduto() {
    const [view, setView] = useState<CategoriaProdutoView>('home');

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
                                <h2>Cadastrar Categoria de Produto</h2>
                            </div>
                        </div>
                        <CadastrarCategoriaProduto />
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
                                <h2>Listar Categorias de Produto</h2>
                            </div>
                        </div>
                        <ListaCategoriaProduto />
                    </>
                );
            default:
                return (
                    <>
                        <div className="standard-page-header">
                            <div>
                                <h2>Categoria de Produtos</h2>
                            </div>
                        </div>

                        <div className="standard-page-cards-container">
                            <div className="standard-page-card" onClick={() => setView('cadastrar')}>
                                <div className="standard-page-card-icon">
                                    <FiPlus size={32} />
                                </div>
                                <h3 className="standard-page-card-title">Cadastrar Categoria</h3>
                                <p className="standard-page-card-description">
                                    Adicione novas categorias de produtos ao sistema.
                                </p>
                            </div>

                            <div className="standard-page-card" onClick={() => setView('listar')}>
                                <div className="standard-page-card-icon">
                                    <FiList size={32} />
                                </div>
                                <h3 className="standard-page-card-title">Listar Categorias</h3>
                                <p className="standard-page-card-description">
                                    Visualize, edite e remova categorias cadastradas.
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

export default CategoriaProduto;
