import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { useFirestoreCollection, saveToFirestore, updateFirestore, deleteFromFirestore } from '../hooks/useFirestore';
import toast from 'react-hot-toast';

interface Driver {
  id: string;
  name: string;
  phone: string;
}

interface Vehicle {
  id: string;
  plate: string;
  model: string;
}

interface Operation {
  id: string;
  name: string;
}

interface Industry {
  id: string;
  name: string;
}

interface Location {
  id: string;
  name: string;
  type: 'origin' | 'destination';
}

const Registers: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'drivers' | 'vehicles' | 'operations' | 'industries' | 'locations'>('drivers');
  
  // Fetch data from Firestore
  const { data: drivers } = useFirestoreCollection<Driver>('drivers');
  const { data: vehicles } = useFirestoreCollection<Vehicle>('vehicles');
  const { data: operations } = useFirestoreCollection<Operation>('operations');
  const { data: industries } = useFirestoreCollection<Industry>('industries');
  const { data: locations } = useFirestoreCollection<Location>('locations');

  // Editing states
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [editingOperation, setEditingOperation] = useState<Operation | null>(null);
  const [editingIndustry, setEditingIndustry] = useState<Industry | null>(null);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  const tabs = [
    { key: 'drivers', label: 'Motoristas' },
    { key: 'vehicles', label: 'Placas' },
    { key: 'operations', label: 'Operações' },
    { key: 'industries', label: 'Indústrias' },
    { key: 'locations', label: 'Origens/Destinos' }
  ];

  // Driver functions
  const addDriver = () => {
    setEditingDriver({ id: '', name: '', phone: '' });
  };

  const saveDriver = async () => {
    if (!editingDriver?.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    try {
      if (editingDriver.id) {
        await updateFirestore('drivers', editingDriver.id, editingDriver);
        toast.success('Motorista atualizado!');
      } else {
        const newDriver = { ...editingDriver, id: Date.now().toString() };
        await saveToFirestore('drivers', newDriver.id, newDriver);
        toast.success('Motorista adicionado!');
      }
      setEditingDriver(null);
    } catch (error) {
      toast.error('Erro ao salvar motorista');
    }
  };

  const deleteDriver = async (id: string) => {
    try {
      await deleteFromFirestore('drivers', id);
      toast.success('Motorista removido!');
    } catch (error) {
      toast.error('Erro ao remover motorista');
    }
  };

  // Vehicle functions
  const addVehicle = () => {
    setEditingVehicle({ id: '', plate: '', model: '' });
  };

  const saveVehicle = async () => {
    if (!editingVehicle?.plate.trim()) {
      toast.error('Placa é obrigatória');
      return;
    }

    try {
      if (editingVehicle.id) {
        await updateFirestore('vehicles', editingVehicle.id, editingVehicle);
        toast.success('Veículo atualizado!');
      } else {
        const newVehicle = { ...editingVehicle, id: Date.now().toString() };
        await saveToFirestore('vehicles', newVehicle.id, newVehicle);
        toast.success('Veículo adicionado!');
      }
      setEditingVehicle(null);
    } catch (error) {
      toast.error('Erro ao salvar veículo');
    }
  };

  const deleteVehicle = async (id: string) => {
    try {
      await deleteFromFirestore('vehicles', id);
      toast.success('Veículo removido!');
    } catch (error) {
      toast.error('Erro ao remover veículo');
    }
  };

  // Operation functions
  const addOperation = () => {
    setEditingOperation({ id: '', name: '' });
  };

  const saveOperation = async () => {
    if (!editingOperation?.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    try {
      if (editingOperation.id) {
        await updateFirestore('operations', editingOperation.id, editingOperation);
        toast.success('Operação atualizada!');
      } else {
        const newOperation = { ...editingOperation, id: Date.now().toString() };
        await saveToFirestore('operations', newOperation.id, newOperation);
        toast.success('Operação adicionada!');
      }
      setEditingOperation(null);
    } catch (error) {
      toast.error('Erro ao salvar operação');
    }
  };

  const deleteOperation = async (id: string) => {
    try {
      await deleteFromFirestore('operations', id);
      toast.success('Operação removida!');
    } catch (error) {
      toast.error('Erro ao remover operação');
    }
  };

  // Industry functions
  const addIndustry = () => {
    setEditingIndustry({ id: '', name: '' });
  };

  const saveIndustry = async () => {
    if (!editingIndustry?.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    try {
      if (editingIndustry.id) {
        await updateFirestore('industries', editingIndustry.id, editingIndustry);
        toast.success('Indústria atualizada!');
      } else {
        const newIndustry = { ...editingIndustry, id: Date.now().toString() };
        await saveToFirestore('industries', newIndustry.id, newIndustry);
        toast.success('Indústria adicionada!');
      }
      setEditingIndustry(null);
    } catch (error) {
      toast.error('Erro ao salvar indústria');
    }
  };

  const deleteIndustry = async (id: string) => {
    try {
      await deleteFromFirestore('industries', id);
      toast.success('Indústria removida!');
    } catch (error) {
      toast.error('Erro ao remover indústria');
    }
  };

  // Location functions
  const addLocation = (type: 'origin' | 'destination') => {
    setEditingLocation({ id: '', name: '', type });
  };

  const saveLocation = async () => {
    if (!editingLocation?.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    try {
      if (editingLocation.id) {
        await updateFirestore('locations', editingLocation.id, editingLocation);
        toast.success('Local atualizado!');
      } else {
        const newLocation = { ...editingLocation, id: Date.now().toString() };
        await saveToFirestore('locations', newLocation.id, newLocation);
        toast.success('Local adicionado!');
      }
      setEditingLocation(null);
    } catch (error) {
      toast.error('Erro ao salvar local');
    }
  };

  const deleteLocation = async (id: string) => {
    try {
      await deleteFromFirestore('locations', id);
      toast.success('Local removido!');
    } catch (error) {
      toast.error('Erro ao remover local');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-6">Cadastros</h1>

      {/* Tabs */}
      <div className="border-b border-gray-700 mb-6">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-orange-500 text-orange-500'
                  : 'border-transparent text-gray-300 hover:text-white hover:border-gray-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Drivers Tab */}
      {activeTab === 'drivers' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Motoristas</h2>
            <button
              onClick={addDriver}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Adicionar Motorista</span>
            </button>
          </div>

          {editingDriver && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-medium text-white mb-4">
                {editingDriver.id ? 'Editar Motorista' : 'Novo Motorista'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={editingDriver.name}
                    onChange={(e) => setEditingDriver({ ...editingDriver, name: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    placeholder="Nome do motorista"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={editingDriver.phone}
                    onChange={(e) => setEditingDriver({ ...editingDriver, phone: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setEditingDriver(null)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>Cancelar</span>
                </button>
                <button
                  onClick={saveDriver}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>Salvar</span>
                </button>
              </div>
            </div>
          )}

          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="text-left py-3 px-4 text-orange-500 font-semibold">Nome</th>
                  <th className="text-left py-3 px-4 text-orange-500 font-semibold">Telefone</th>
                  <th className="text-left py-3 px-4 text-orange-500 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((driver) => (
                  <tr key={driver.id} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="py-3 px-4 text-white">{driver.name}</td>
                    <td className="py-3 px-4 text-gray-300">{driver.phone}</td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingDriver(driver)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteDriver(driver.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {drivers.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                Nenhum motorista cadastrado
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vehicles Tab */}
      {activeTab === 'vehicles' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Placas</h2>
            <button
              onClick={addVehicle}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Adicionar Veículo</span>
            </button>
          </div>

          {editingVehicle && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-medium text-white mb-4">
                {editingVehicle.id ? 'Editar Veículo' : 'Novo Veículo'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Placa *
                  </label>
                  <input
                    type="text"
                    value={editingVehicle.plate}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, plate: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    placeholder="ABC-1234"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Modelo
                  </label>
                  <input
                    type="text"
                    value={editingVehicle.model}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, model: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    placeholder="Modelo do veículo"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setEditingVehicle(null)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>Cancelar</span>
                </button>
                <button
                  onClick={saveVehicle}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>Salvar</span>
                </button>
              </div>
            </div>
          )}

          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="text-left py-3 px-4 text-orange-500 font-semibold">Placa</th>
                  <th className="text-left py-3 px-4 text-orange-500 font-semibold">Modelo</th>
                  <th className="text-left py-3 px-4 text-orange-500 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="py-3 px-4 text-white">{vehicle.plate}</td>
                    <td className="py-3 px-4 text-gray-300">{vehicle.model}</td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingVehicle(vehicle)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteVehicle(vehicle.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {vehicles.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                Nenhum veículo cadastrado
              </div>
            )}
          </div>
        </div>
      )}

      {/* Operations Tab */}
      {activeTab === 'operations' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Operações</h2>
            <button
              onClick={addOperation}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Adicionar Operação</span>
            </button>
          </div>

          {editingOperation && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-medium text-white mb-4">
                {editingOperation.id ? 'Editar Operação' : 'Nova Operação'}
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={editingOperation.name}
                  onChange={(e) => setEditingOperation({ ...editingOperation, name: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  placeholder="Nome da operação"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setEditingOperation(null)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>Cancelar</span>
                </button>
                <button
                  onClick={saveOperation}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>Salvar</span>
                </button>
              </div>
            </div>
          )}

          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="text-left py-3 px-4 text-orange-500 font-semibold">Nome</th>
                  <th className="text-left py-3 px-4 text-orange-500 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {operations.map((operation) => (
                  <tr key={operation.id} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="py-3 px-4 text-white">{operation.name}</td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingOperation(operation)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteOperation(operation.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {operations.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                Nenhuma operação cadastrada
              </div>
            )}
          </div>
        </div>
      )}

      {/* Industries Tab */}
      {activeTab === 'industries' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Indústrias</h2>
            <button
              onClick={addIndustry}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Adicionar Indústria</span>
            </button>
          </div>

          {editingIndustry && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-medium text-white mb-4">
                {editingIndustry.id ? 'Editar Indústria' : 'Nova Indústria'}
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={editingIndustry.name}
                  onChange={(e) => setEditingIndustry({ ...editingIndustry, name: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  placeholder="Nome da indústria"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setEditingIndustry(null)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>Cancelar</span>
                </button>
                <button
                  onClick={saveIndustry}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>Salvar</span>
                </button>
              </div>
            </div>
          )}

          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="text-left py-3 px-4 text-orange-500 font-semibold">Nome</th>
                  <th className="text-left py-3 px-4 text-orange-500 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {industries.map((industry) => (
                  <tr key={industry.id} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="py-3 px-4 text-white">{industry.name}</td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingIndustry(industry)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteIndustry(industry.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {industries.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                Nenhuma indústria cadastrada
              </div>
            )}
          </div>
        </div>
      )}

      {/* Locations Tab */}
      {activeTab === 'locations' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Origens e Destinos</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => addLocation('origin')}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Adicionar Origem</span>
              </button>
              <button
                onClick={() => addLocation('destination')}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Adicionar Destino</span>
              </button>
            </div>
          </div>

          {editingLocation && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-medium text-white mb-4">
                {editingLocation.id ? 'Editar Local' : `Novo ${editingLocation.type === 'origin' ? 'Origem' : 'Destino'}`}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={editingLocation.name}
                    onChange={(e) => setEditingLocation({ ...editingLocation, name: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    placeholder="Nome do local"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Tipo
                  </label>
                  <select
                    value={editingLocation.type}
                    onChange={(e) => setEditingLocation({ ...editingLocation, type: e.target.value as 'origin' | 'destination' })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="origin">Origem</option>
                    <option value="destination">Destino</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setEditingLocation(null)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>Cancelar</span>
                </button>
                <button
                  onClick={saveLocation}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>Salvar</span>
                </button>
              </div>
            </div>
          )}

          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="text-left py-3 px-4 text-orange-500 font-semibold">Nome</th>
                  <th className="text-left py-3 px-4 text-orange-500 font-semibold">Tipo</th>
                  <th className="text-left py-3 px-4 text-orange-500 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {locations.map((location) => (
                  <tr key={location.id} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="py-3 px-4 text-white">{location.name}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        location.type === 'origin' 
                          ? 'bg-blue-900 text-blue-300' 
                          : 'bg-orange-900 text-orange-300'
                      }`}>
                        {location.type === 'origin' ? 'Origem' : 'Destino'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingLocation(location)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteLocation(location.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {locations.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                Nenhum local cadastrado
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Registers;
