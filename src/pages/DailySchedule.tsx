import React, { useState } from 'react';
import { Plus, Trash2, MessageCircle, Copy, Edit2, Check, X, Download, Calendar } from 'lucide-react';
import DateSelector from '../components/DateSelector';
import AutocompleteInput from '../components/AutocompleteInput';
import MultiSelectAutocomplete from '../components/MultiSelectAutocomplete';
import { useFirestoreCollection, saveToFirestore, deleteFromFirestore, updateFirestore } from '../hooks/useFirestore';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as XLSX from 'xlsx';

interface Destination {
  id: string;
  name: string;
  time?: string;
  observation?: string;
}

interface Vehicle {
  id: string;
  plate: string;
  driver: string;
  origin: string;
  originTime: string;
  destinations: Destination[];
  status: 'Em Trânsito' | 'Concluído';
  transporteSAP?: string[];
  route?: string;
  weight?: string;
}

interface Schedule {
  id: string;
  name: string;
  vehicles: Vehicle[];
  date: string;
}

interface Driver {
  id: string;
  name: string;
}

interface VehicleData {
  id: string;
  plate: string;
}

interface Location {
  id: string;
  name: string;
  type: 'origin' | 'destination';
}

interface StatusRecord {
  id: string;
  transporteSAP: string;
  rotas: string;
  peso: string;
  caixas: string;
}

const DailySchedule: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editingScheduleName, setEditingScheduleName] = useState<string | null>(null);
  const [tempScheduleName, setTempScheduleName] = useState('');
  
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const { data: schedules } = useFirestoreCollection<Schedule>('schedules', selectedDate);
  
  // Fetch cadastros data
  const { data: drivers } = useFirestoreCollection<Driver>('drivers');
  const { data: vehicles } = useFirestoreCollection<VehicleData>('vehicles');
  const { data: locations } = useFirestoreCollection<Location>('locations');
  const { data: statusRecords } = useFirestoreCollection<StatusRecord>('daily-status', selectedDate);
  
  const [localSchedules, setLocalSchedules] = useState<Schedule[]>(schedules);

  React.useEffect(() => {
    setLocalSchedules(schedules);
  }, [schedules]);

  // Prepare autocomplete options
  const driverOptions = drivers.map(driver => ({
    id: driver.id,
    label: driver.name,
    value: driver.name
  }));

  const vehicleOptions = vehicles.map(vehicle => ({
    id: vehicle.id,
    label: vehicle.plate,
    value: vehicle.plate
  }));

  const originOptions = locations
    .filter(location => location.type === 'origin')
    .map(location => ({
      id: location.id,
      label: location.name,
      value: location.name
    }));

  const destinationOptions = locations
    .filter(location => location.type === 'destination')
    .map(location => ({
      id: location.id,
      label: location.name,
      value: location.name
    }));

  // Get available transport SAP options (not already selected)
  const getAvailableTransportSAP = (currentVehicleTransports: string[] = []) => {
    const allSelectedTransports = localSchedules.flatMap(schedule =>
      schedule.vehicles.flatMap(vehicle => vehicle.transporteSAP || [])
    );
    
    return statusRecords
      .filter(record => 
        record.transporteSAP && 
        (!allSelectedTransports.includes(record.transporteSAP) || 
         currentVehicleTransports.includes(record.transporteSAP))
      )
      .map(record => ({
        id: record.id,
        label: `${record.transporteSAP} - ${record.rotas}`,
        value: record.transporteSAP
      }));
  };

  const addSchedule = async () => {
    const newSchedule: Schedule = {
      id: Date.now().toString(),
      name: `PROGRAMAÇÃO DIÁRIA ${localSchedules.length + 1}`,
      vehicles: [],
      date: dateStr
    };
    
    try {
      await saveToFirestore('schedules', newSchedule.id, newSchedule);
      setLocalSchedules([...localSchedules, newSchedule]);
      toast.success('Programação adicionada!');
    } catch (error) {
      toast.error('Erro ao adicionar programação');
    }
  };

  const updateScheduleName = async (scheduleId: string, newName: string) => {
    try {
      await updateFirestore('schedules', scheduleId, { name: newName });
      setLocalSchedules(localSchedules.map(schedule => 
        schedule.id === scheduleId ? { ...schedule, name: newName } : schedule
      ));
      toast.success('Nome da programação atualizado!');
    } catch (error) {
      toast.error('Erro ao atualizar nome da programação');
    }
  };

  const startEditingScheduleName = (schedule: Schedule) => {
    setEditingScheduleName(schedule.id);
    setTempScheduleName(schedule.name);
  };

  const saveScheduleName = async (scheduleId: string) => {
    if (tempScheduleName.trim()) {
      await updateScheduleName(scheduleId, tempScheduleName.trim());
    }
    setEditingScheduleName(null);
    setTempScheduleName('');
  };

  const cancelEditingScheduleName = () => {
    setEditingScheduleName(null);
    setTempScheduleName('');
  };

  const addVehicle = async (scheduleId: string) => {
    const newVehicle: Vehicle = {
      id: Date.now().toString(),
      plate: '',
      driver: '',
      origin: '',
      originTime: '',
      destinations: [],
      status: 'Em Trânsito',
      transporteSAP: []
    };

    const updatedSchedules = localSchedules.map(schedule => 
      schedule.id === scheduleId
        ? { ...schedule, vehicles: [...schedule.vehicles, newVehicle] }
        : schedule
    );
    
    try {
      const schedule = updatedSchedules.find(s => s.id === scheduleId);
      if (schedule) await saveToFirestore('schedules', scheduleId, schedule);
      setLocalSchedules(updatedSchedules);
    } catch (error) {
      toast.error('Erro ao adicionar veículo');
    }
  };

  const addDestination = async (scheduleId: string, vehicleId: string) => {
    const newDestination: Destination = {
      id: Date.now().toString(),
      name: '',
      time: '',
      observation: ''
    };

    const updatedSchedules = localSchedules.map(schedule => 
      schedule.id === scheduleId
        ? {
            ...schedule,
            vehicles: schedule.vehicles.map(vehicle =>
              vehicle.id === vehicleId
                ? { ...vehicle, destinations: [...vehicle.destinations, newDestination] }
                : vehicle
            )
          }
        : schedule
    );

    try {
      const schedule = updatedSchedules.find(s => s.id === scheduleId);
      if (schedule) await saveToFirestore('schedules', scheduleId, schedule);
      setLocalSchedules(updatedSchedules);
    } catch (error) {
      toast.error('Erro ao adicionar destino');
    }
  };

  const removeVehicle = async (scheduleId: string, vehicleId: string) => {
    const updatedSchedules = localSchedules.map(schedule => 
      schedule.id === scheduleId
        ? { ...schedule, vehicles: schedule.vehicles.filter(v => v.id !== vehicleId) }
        : schedule
    );
    
    try {
      const schedule = updatedSchedules.find(s => s.id === scheduleId);
      if (schedule) await saveToFirestore('schedules', scheduleId, schedule);
      setLocalSchedules(updatedSchedules);
    } catch (error) {
      toast.error('Erro ao remover veículo');
    }
  };

  const removeDestination = async (scheduleId: string, vehicleId: string, destinationId: string) => {
    const updatedSchedules = localSchedules.map(schedule => 
      schedule.id === scheduleId
        ? {
            ...schedule,
            vehicles: schedule.vehicles.map(vehicle =>
              vehicle.id === vehicleId
                ? { ...vehicle, destinations: vehicle.destinations.filter(d => d.id !== destinationId) }
                : vehicle
            )
          }
        : schedule
    );

    try {
      const schedule = updatedSchedules.find(s => s.id === scheduleId);
      if (schedule) await saveToFirestore('schedules', scheduleId, schedule);
      setLocalSchedules(updatedSchedules);
    } catch (error) {
      toast.error('Erro ao remover destino');
    }
  };

  const updateVehicle = async (scheduleId: string, vehicleId: string, field: keyof Vehicle, value: any) => {
    const updatedSchedules = localSchedules.map(schedule => 
      schedule.id === scheduleId
        ? {
            ...schedule,
            vehicles: schedule.vehicles.map(vehicle =>
              vehicle.id === vehicleId
                ? { ...vehicle, [field]: value }
                : vehicle
            )
          }
        : schedule
    );
    
    try {
      const schedule = updatedSchedules.find(s => s.id === scheduleId);
      if (schedule) await saveToFirestore('schedules', scheduleId, schedule);
      setLocalSchedules(updatedSchedules);
    } catch (error) {
      console.error('Erro ao atualizar veículo:', error);
    }
  };

  const updateDestination = async (scheduleId: string, vehicleId: string, destinationId: string, field: keyof Destination, value: string) => {
    const updatedSchedules = localSchedules.map(schedule => 
      schedule.id === scheduleId
        ? {
            ...schedule,
            vehicles: schedule.vehicles.map(vehicle =>
              vehicle.id === vehicleId
                ? {
                    ...vehicle,
                    destinations: vehicle.destinations.map(destination =>
                      destination.id === destinationId
                        ? { ...destination, [field]: value }
                        : destination
                    )
                  }
                : vehicle
            )
          }
        : schedule
    );

    try {
      const schedule = updatedSchedules.find(s => s.id === scheduleId);
      if (schedule) await saveToFirestore('schedules', scheduleId, schedule);
      setLocalSchedules(updatedSchedules);
    } catch (error) {
      console.error('Erro ao atualizar destino:', error);
    }
  };

  const toggleVehicleStatus = async (scheduleId: string, vehicleId: string) => {
    const schedule = localSchedules.find(s => s.id === scheduleId);
    const vehicle = schedule?.vehicles.find(v => v.id === vehicleId);
    
    if (vehicle) {
      const newStatus = vehicle.status === 'Em Trânsito' ? 'Concluído' : 'Em Trânsito';
      await updateVehicle(scheduleId, vehicleId, 'status', newStatus);
    }
  };

  const generateWhatsAppMessage = (schedule: Schedule) => {
    let message = '';
    const dateStr = format(selectedDate, "dd/MM/yyyy", { locale: ptBR });
    
    if (schedule.vehicles.length === 0) return '';
    
    message += `🚛 *${schedule.name}*\n`;
    message += `📅 Data: ${dateStr}\n\n`;

    schedule.vehicles.forEach((vehicle, index) => {
      message += `🚚 Veículo ${index + 1}:\n`;
      message += `   *Placa: ${vehicle.plate}*\n`;
      message += `   👤 Motorista: ${vehicle.driver}\n`;
      message += `   📍 Origem: ${vehicle.origin}\n`;
      
      vehicle.destinations.forEach((dest, destIndex) => {
        message += `   🎯 Destino ${destIndex + 1}: ${dest.name}\n`;
        if (dest.time) {
          message += `   🕐 Horário: ${dest.time}\n`;
        }
        if (dest.observation) {
          message += `   💬 Obs: ${dest.observation}\n`;
        }
      });
      
      message += '\n';
    });

    const totalVehicles = schedule.vehicles.length;
    message += `📈 Total de veículos: ${totalVehicles}\n\n`;

    return message.trim();
  };

  const copyToClipboard = (schedule: Schedule) => {
    const message = generateWhatsAppMessage(schedule);
    if (message) {
      navigator.clipboard.writeText(message);
      toast.success('Mensagem copiada para a área de transferência!');
    } else {
      toast.error('Nenhum veículo para gerar mensagem');
    }
  };

  const exportToExcel = async (type: 'daily' | 'monthly') => {
    try {
      let dataToExport: any[] = [];
      let filename = '';

      if (type === 'daily') {
        // Export daily schedules
        localSchedules.forEach(schedule => {
          schedule.vehicles.forEach(vehicle => {
            const vehicleData = {
              'PROGRAMAÇÃO': schedule.name,
              'DATA': dateStr,
              'PLACA': vehicle.plate,
              'MOTORISTA': vehicle.driver,
              'ORIGEM': vehicle.origin,
              'HORÁRIO ORIGEM': vehicle.originTime,
              'DESTINOS': vehicle.destinations.map(d => d.name).join('; '),
              'HORÁRIOS DESTINOS': vehicle.destinations.map(d => d.time || '').join('; '),
              'OBSERVAÇÕES': vehicle.destinations.map(d => d.observation || '').join('; '),
              'TRANSPORTE SAP': (vehicle.transporteSAP || []).join('; '),
              'STATUS': vehicle.status
            };
            dataToExport.push(vehicleData);
          });
        });
        filename = `Programacao_Diaria_${format(selectedDate, 'dd-MM-yyyy')}.xlsx`;
      } else {
        // Monthly export would need additional logic to fetch all days in month
        // For now, using current day data as example
        dataToExport = localSchedules.flatMap(schedule =>
          schedule.vehicles.map(vehicle => ({
            'PROGRAMAÇÃO': schedule.name,
            'DATA': dateStr,
            'PLACA': vehicle.plate,
            'MOTORISTA': vehicle.driver,
            'ORIGEM': vehicle.origin,
            'HORÁRIO ORIGEM': vehicle.originTime,
            'DESTINOS': vehicle.destinations.map(d => d.name).join('; '),
            'HORÁRIOS DESTINOS': vehicle.destinations.map(d => d.time || '').join('; '),
            'OBSERVAÇÕES': vehicle.destinations.map(d => d.observation || '').join('; '),
            'TRANSPORTE SAP': (vehicle.transporteSAP || []).join('; '),
            'STATUS': vehicle.status
          }))
        );
        filename = `Programacao_Mensal_${format(selectedDate, 'MM-yyyy')}.xlsx`;
      }

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(dataToExport);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Programação');

      // Save file
      XLSX.writeFile(wb, filename);
      
      toast.success(`Relatório ${type === 'daily' ? 'diário' : 'mensal'} exportado com sucesso!`);
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro ao exportar relatório');
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <h1 className="text-3xl font-bold text-white mb-4 lg:mb-0">Programação Diária</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <DateSelector
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
          <div className="flex gap-2">
            <button
              onClick={() => exportToExcel('daily')}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Excel Diário</span>
            </button>
            <button
              onClick={() => exportToExcel('monthly')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Calendar className="h-4 w-4" />
              <span>Excel Mensal</span>
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {localSchedules.map((schedule) => (
          <div key={schedule.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              {editingScheduleName === schedule.id ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={tempScheduleName}
                    onChange={(e) => setTempScheduleName(e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    onKeyPress={(e) => e.key === 'Enter' && saveScheduleName(schedule.id)}
                  />
                  <button
                    onClick={() => saveScheduleName(schedule.id)}
                    className="text-green-400 hover:text-green-300"
                  >
                    <Check className="h-5 w-5" />
                  </button>
                  <button
                    onClick={cancelEditingScheduleName}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-semibold text-white">{schedule.name}</h2>
                  <button
                    onClick={() => startEditingScheduleName(schedule)}
                    className="text-gray-400 hover:text-white"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>
              )}
              <button
                onClick={() => addVehicle(schedule.id)}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Adicionar Veículo</span>
              </button>
            </div>

            <div className="space-y-4">
              {schedule.vehicles.map((vehicle) => (
                <div key={vehicle.id} className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-orange-500">
                      Veículo - {vehicle.plate || 'Nova Placa'}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleVehicleStatus(schedule.id, vehicle.id)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          vehicle.status === 'Em Trânsito'
                            ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {vehicle.status}
                      </button>
                      <button
                        onClick={() => removeVehicle(schedule.id, vehicle.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Placa *
                      </label>
                      <AutocompleteInput
                        value={vehicle.plate}
                        onChange={(value) => updateVehicle(schedule.id, vehicle.id, 'plate', value)}
                        options={vehicleOptions}
                        placeholder="ABC-1234"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Motorista *
                      </label>
                      <AutocompleteInput
                        value={vehicle.driver}
                        onChange={(value) => updateVehicle(schedule.id, vehicle.id, 'driver', value)}
                        options={driverOptions}
                        placeholder="Nome do motorista"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Origem *
                      </label>
                      <AutocompleteInput
                        value={vehicle.origin}
                        onChange={(value) => updateVehicle(schedule.id, vehicle.id, 'origin', value)}
                        options={originOptions}
                        placeholder="Local de partida"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Horário Origem *
                      </label>
                      <input
                        type="time"
                        value={vehicle.originTime}
                        onChange={(e) => updateVehicle(schedule.id, vehicle.id, 'originTime', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  {/* Transport SAP Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Transporte SAP
                    </label>
                    <MultiSelectAutocomplete
                      selectedValues={vehicle.transporteSAP || []}
                      onChange={(values) => updateVehicle(schedule.id, vehicle.id, 'transporteSAP', values)}
                      options={getAvailableTransportSAP(vehicle.transporteSAP)}
                      placeholder="Selecione os transportes SAP"
                      className="w-full"
                    />
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-300">
                        Destinos
                      </label>
                      <button
                        onClick={() => addDestination(schedule.id, vehicle.id)}
                        className="text-orange-500 hover:text-orange-400 text-sm"
                      >
                        + Adicionar Destino
                      </button>
                    </div>

                    <div className="space-y-2">
                      {vehicle.destinations.map((destination, index) => (
                        <div key={destination.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center bg-gray-800 p-3 rounded-lg">
                          <div>
                            <AutocompleteInput
                              value={destination.name}
                              onChange={(value) => updateDestination(schedule.id, vehicle.id, destination.id, 'name', value)}
                              options={destinationOptions}
                              placeholder={`Destino ${index + 1}`}
                              className="w-full"
                            />
                          </div>
                          <input
                            type="time"
                            value={destination.time || ''}
                            onChange={(e) => updateDestination(schedule.id, vehicle.id, destination.id, 'time', e.target.value)}
                            className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:border-orange-500"
                          />
                          <input
                            type="text"
                            value={destination.observation || ''}
                            onChange={(e) => updateDestination(schedule.id, vehicle.id, destination.id, 'observation', e.target.value)}
                            className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:border-orange-500"
                            placeholder="Observação"
                          />
                          <button
                            onClick={() => removeDestination(schedule.id, vehicle.id, destination.id)}
                            className="text-red-400 hover:text-red-300 justify-self-end"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Individual WhatsApp Message */}
            <div className="mt-6 pt-4 border-t border-gray-600">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5 text-green-500" />
                  <h4 className="text-lg font-medium text-white">Mensagem WhatsApp</h4>
                </div>
                <button
                  onClick={() => copyToClipboard(schedule)}
                  className="flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Copy className="h-4 w-4" />
                  <span>Copiar</span>
                </button>
              </div>
              
              {schedule.vehicles.length > 0 ? (
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                    {generateWhatsAppMessage(schedule)}
                  </pre>
                </div>
              ) : (
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-600 text-center text-gray-400">
                  Adicione veículos para gerar a mensagem
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Action Button */}
        <div className="flex justify-center">
          <button
            onClick={addSchedule}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Nova Programação</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailySchedule;