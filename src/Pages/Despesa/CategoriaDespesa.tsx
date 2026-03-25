import { useState } from 'react';
import { FiPlus, FiList, FiArrowLeft } from 'react-icons/fi';
import CadastrarCategoriaDespesa from './CadastrarCategoriaDespesa';
import ListaCategoriaDespesa from './ListarCategoriaDespesa';
import '../../Styles/Despesa/despesa.css';

type CategoriaDespesaView = 'home' | 'cadastrar' | 'listar';

function CategoriaDespesa() {
    const [view, setView] = useState<CategoriaDespesaView>('home');

    const renderContent = () => {
        switch (view) {
            case 'cadastrar':
                return (
                    <>
                        <div className="standard-sub-page-header">
                            <button className="standard-back-button" onClick={() => setView('home')} title="Voltar">
                                <FiArrowLeft size={24} />
                            </button>
                            <div className="standard-page-header" style={{ marginBottom: 0 }}>
                                <h2>Cadastro de Categoria</h2>
                            </div>
                        </div>
                        <CadastrarCategoriaDespesa />
                    </>
                );
            case 'listar':
                return (
                    <>
                        <div className="standard-sub-page-header">
                            <button className="standard-back-button" onClick={() => setView('home')} title="Voltar">
                                <FiArrowLeft size={24} />
                            </button>
                            <div className="standard-page-header" style={{ marginBottom: 0 }}>
                                <h2>Lista de Categorias</h2>
                            </div>
                        </div>
                        <ListaCategoriaDespesa />
                    </>
                );
            default:
                return (
                    <>
                        <div className="standard-page-header">
                            <div>
                                <h2>Gestão de Categorias de Despesa</h2>
           
                            </div>
                        </div>
                        
                        <div className="standard-page-cards-container">
                            <div 
                                className="standard-page-card"
                                onClick={() => setView('cadastrar')}
                            >
                                <div className="standard-page-card-icon">
                                    <FiPlus size={32} />
                                </div>
                                <h3 className="standard-page-card-title">Cadastrar Categoria</h3>
                                <p className="standard-page-card-description">
                                    Adicione novas categorias de despesa para organizar seus gastos.
                                </p>
                            </div>

                            <div 
                                className="standard-page-card"
                                onClick={() => setView('listar')}
                            >
                                <div className="standard-page-card-icon">
                                    <FiList size={32} />
                                </div>
                                <h3 className="standard-page-card-title">Listar Categorias</h3>
                                <p className="standard-page-card-description">
                                    Visualize, edite ou remova categorias de despesa cadastradas.
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

export default CategoriaDespesa;
