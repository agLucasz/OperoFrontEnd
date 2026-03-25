import { useState } from 'react';
import { FiPlus, FiList, FiArrowLeft } from 'react-icons/fi';
import '../../Styles/FormaPagamento/formaPagamento.css';
import CadastrarFormaPagamento from './CadastrarFormaPagamento';
import ListaFormaPagamento from './ListaFormaPagamento';

type FormaPagamentoView = 'home' | 'cadastrar' | 'listar';

function FormaPagamento() {
    const [view, setView] = useState<FormaPagamentoView>('home');

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
                                <h2>Cadastro de Forma de Pagamento</h2>
                            </div>
                        </div>
                        <CadastrarFormaPagamento />
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
                                <h2>Lista de Formas de Pagamento</h2>
                            </div>
                        </div>
                        <ListaFormaPagamento />
                    </>
                );
            default:
                return (
                    <>
                        <div className="standard-page-header">
                            <div>
                                <h2>Formas de Pagamento</h2>
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
                                <div className="standard-page-card-title">
                                    Cadastrar Nova
                                </div>
                                <div className="standard-page-card-description">
                                    Adicione uma nova forma de pagamento ao sistema
                                </div>
                            </div>

                            <div 
                                className="standard-page-card"
                                onClick={() => setView('listar')}
                            >
                                <div className="standard-page-card-icon">
                                    <FiList size={32} />
                                </div>
                                <div className="standard-page-card-title">
                                    Ver Formas de Pagamento
                                </div>
                                <div className="standard-page-card-description">
                                    Visualize, edite ou exclua formas de pagamento existentes
                                </div>
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

export default FormaPagamento;
