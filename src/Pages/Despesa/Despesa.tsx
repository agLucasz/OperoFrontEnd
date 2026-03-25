import { useState } from 'react';
import { FiPlus, FiList, FiArrowLeft } from 'react-icons/fi';
import CadastrarDespesa from './CadastrarDespesa';
import ListaDespesa from './ListaDespesa';
import '../../Styles/Despesa/despesa.css';

type DespesaView = 'home' | 'cadastrar' | 'listar';

function Despesa() {
    const [view, setView] = useState<DespesaView>('home');

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
                                <h2>Cadastro de Despesa</h2>
                            </div>
                        </div>
                        <CadastrarDespesa />
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
                                <h2>Lista de Despesas</h2>
                            </div>
                        </div>
                        <ListaDespesa />
                    </>
                );
            default:
                return (
                    <>
                        <div className="standard-page-header">
                            <div>
                                <h2>Gestão de Despesas</h2>
             
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
                                <h3 className="standard-page-card-title">Cadastrar Despesa</h3>
                                <p className="standard-page-card-description">
                                    Adicione novas despesas para organizar seus gastos.
                                </p>
                            </div>

                            <div 
                                className="standard-page-card"
                                onClick={() => setView('listar')}
                            >
                                <div className="standard-page-card-icon">
                                    <FiList size={32} />
                                </div>
                                <h3 className="standard-page-card-title">Listar Despesas</h3>
                                <p className="standard-page-card-description">
                                    Visualize, edite ou remova despesas cadastradas.
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

export default Despesa;