import { useState } from 'react';
import { FiPlus, FiList, FiArrowLeft } from 'react-icons/fi';
import LancarContaPagar from './LancarContaPagar';
import ConsultarContaPagar from './ConsultarContaPagar';
import '../../../Styles/Financeiro/contaPagar.css';

type ContaPagarView = 'home' | 'lancar' | 'consultar';

function ContaPagar() {
    const [view, setView] = useState<ContaPagarView>('home');

    const renderContent = () => {
        switch (view) {
            case 'lancar':
                return (
                    <>
                        <div className="standard-sub-page-header">
                            <button className="standard-back-button" onClick={() => setView('home')} title="Voltar">
                                <FiArrowLeft size={24} />
                            </button>
                            <div className="standard-page-header" style={{ marginBottom: 0 }}>
                                <h2>Lançar Conta a Pagar</h2>
                            </div>
                        </div>
                        <LancarContaPagar />
                    </>
                );
            case 'consultar':
                return (
                    <>
                        <div className="standard-sub-page-header">
                            <button className="standard-back-button" onClick={() => setView('home')} title="Voltar">
                                <FiArrowLeft size={24} />
                            </button>
                            <div className="standard-page-header" style={{ marginBottom: 0 }}>
                                <h2>Consultar Contas a Pagar</h2>
                            </div>
                        </div>
                        <ConsultarContaPagar />
                    </>
                );
            default:
                return (
                    <>
                        <div className="standard-page-header">
                            <div>
                                <h2>Gestão de Contas a Pagar</h2>
                            </div>
                        </div>
                        
                        <div className="standard-page-cards-container">
                            <div 
                                className="standard-page-card"
                                onClick={() => setView('lancar')}
                            >
                                <div className="standard-page-card-icon">
                                    <FiPlus size={32} />
                                </div>
                                <h3 className="standard-page-card-title">Lançar Conta</h3>
                                <p className="standard-page-card-description">
                                    Adicione novas contas a pagar, configure parcelas e vincule a despesas e fornecedores.
                                </p>
                            </div>

                            <div 
                                className="standard-page-card"
                                onClick={() => setView('consultar')}
                            >
                                <div className="standard-page-card-icon">
                                    <FiList size={32} />
                                </div>
                                <h3 className="standard-page-card-title">Consultar Contas</h3>
                                <p className="standard-page-card-description">
                                    Visualize e filtre contas a pagar por período, fornecedor, despesa e tipo de despesa.
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

export default ContaPagar;
