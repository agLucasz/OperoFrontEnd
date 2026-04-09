import { useState } from 'react';
import { FiShoppingCart, FiList, FiArrowLeft } from 'react-icons/fi';
import LancarVenda from './LancarVenda';
import ListarVenda from './ListarVenda';
import '../../Styles/Venda/venda.css';

type VendaView = 'home' | 'lancar' | 'listar';

function Venda() {
    const [view, setView] = useState<VendaView>('home');

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
                                <h2>PDV - Lançar Venda</h2>
                            </div>
                        </div>
                        <LancarVenda />
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
                                <h2>Histórico de Vendas</h2>
                            </div>
                        </div>
                        <ListarVenda />
                    </>
                );
            default:
                return (
                    <>
                        <div className="standard-page-header">
                            <div>
                                <h2>Vendas</h2>
                            </div>
                        </div>

                        <div className="standard-page-cards-container">
                            <div
                                className="standard-page-card"
                                onClick={() => setView('lancar')}
                            >
                                <div className="standard-page-card-icon">
                                    <FiShoppingCart size={32} />
                                </div>
                                <h3 className="standard-page-card-title">Lançar Venda</h3>
                                <p className="standard-page-card-description">
                                    Abra o caixa PDV para registrar uma nova venda, adicionar produtos e finalizar a operação.
                                </p>
                            </div>

                            <div
                                className="standard-page-card"
                                onClick={() => setView('listar')}
                            >
                                <div className="standard-page-card-icon">
                                    <FiList size={32} />
                                </div>
                                <h3 className="standard-page-card-title">Histórico de Vendas</h3>
                                <p className="standard-page-card-description">
                                    Consulte e gerencie todas as vendas já realizadas no sistema.
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

export default Venda;
