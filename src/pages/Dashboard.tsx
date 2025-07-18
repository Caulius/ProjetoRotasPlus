import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import DateSelector from '../components/DateSelector';
import { Truck, CheckCircle, Clock, ClipboardList, X } from 'lucide-react';
import { useFirestoreCollection } from '../hooks/useFirestore';
import { format } from 'date-fns';
import { updateFirestore } from '../hooks/useFirestore';
import toast from 'react-hot-toast';

interface Vehicle {
  id: string;
  status: 'Em Trânsito' | 'Concluído';
}

interface Schedule {
  id: string;
  vehicles: Vehicle[];
  date: string;
}

interface StatusRecord {
  id: string;
  status: 'Pendente' | 'Concluído';
  date: string;
}

interface VehicleInTransit {
  id: string;
  plate: string;
  driver: string;
  origin: string;
  destinations: string[];
  scheduleName: string;
  scheduleId: string;
}

const Dashboard: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showTransitModal, setShowTransitModal] = useState(false);
  
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  
  // Fetch data from Firestore
  const { data: schedules } = useFirestoreCollection<Schedule>('schedules', selectedDate);
  const { data: statusRecords } = useFirestoreCollection<StatusRecord>('daily-status', selectedDate);

  // Calculate vehicle statistics from Daily Schedule
  const vehicleStats = useMemo(() => {
    const allVehicles = schedules.flatMap(schedule => schedule.vehicles || []);
    
    const programmed = allVehicles.length;
    const inTransit = allVehicles.filter(v => v.status === 'Em Trânsito').length;
    const completed = allVehicles.filter(v => v.status === 'Concluído').length;

    return { programmed, inTransit, completed };
  }, [schedules]);

  // Calculate operations statistics from Daily Status
  const operationsStats = useMemo(() => {
    const pending = statusRecords.filter(record => record.status === 'Pendente').length;
    const completed = statusRecords.filter(record => record.status === 'Concluído').length;

    return { pending, completed };
  }, [statusRecords]);

  // Get vehicles in transit for modal
  const vehiclesInTransit = useMemo(() => {
    const vehicles: VehicleInTransit[] = [];
    
    schedules.forEach(schedule => {
      schedule.vehicles
        .filter(vehicle => vehicle.status === 'Em Trânsito')
        .forEach(vehicle => {
          vehicles.push({
            id: vehicle.id,
            plate: vehicle.plate,
            driver: vehicle.driver,
            origin: vehicle.origin,
            destinations: vehicle.destinations.map(d => d.name),
            scheduleName: schedule.name,
            scheduleId: schedule.id
          });
        });
    });
    
    return vehicles;
  }, [schedules]);

  const vehicleChartData = [
    { name: 'Programados', value: vehicleStats.programmed, color: '#3b82f6' },
    { name: 'Em Trânsito', value: vehicleStats.inTransit, color: '#f59e0b' },
    { name: 'Concluídos', value: vehicleStats.completed, color: '#10b981' }
  ];

  const operationsChartData = [
    { name: 'Pendentes', value: operationsStats.pending, color: '#ef4444' },
    { name: 'Concluídas', value: operationsStats.completed, color: '#10b981' }
  ];

  const stats = [
    { title: 'Veículos Programados', value: vehicleStats.programmed, icon: Truck, color: 'bg-blue-600' },
    { title: 'Em Trânsito', value: vehicleStats.inTransit, icon: Clock, color: 'bg-yellow-600', clickable: true },
    { title: 'Concluídos', value: vehicleStats.completed, icon: CheckCircle, color: 'bg-green-600' },
    { title: 'Operações', value: operationsStats.pending + operationsStats.completed, icon: ClipboardList, color: 'bg-orange-600' }
  ];

  const handleCompleteVehicle = async (scheduleId: string, vehicleId: string) => {
    try {
      // Find the schedule and update the vehicle status
      const schedule = schedules.find(s => s.id === scheduleId);
      if (schedule) {
        const updatedVehicles = schedule.vehicles.map(vehicle =>
          vehicle.id === vehicleId
            ? { ...vehicle, status: 'Concluído' as const }
            : vehicle
        );
        
        const updatedSchedule = { ...schedule, vehicles: updatedVehicles };
        await updateFirestore('schedules', scheduleId, updatedSchedule);
        toast.success('Veículo marcado como concluído!');
      }
    } catch (error) {
      toast.error('Erro ao atualizar status do veículo');
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <h1 className="text-3xl font-bold text-white mb-4 lg:mb-0">Dashboard</h1>
        <DateSelector
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${
              stat.clickable ? 'cursor-pointer hover:bg-gray-750 transition-colors' : ''
            }`}
            onClick={stat.clickable ? () => setShowTransitModal(true) : undefined}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                <p className={`text-3xl font-bold mt-2 ${
                  stat.clickable ? 'text-yellow-400 hover:text-yellow-300' : 'text-white'
                }`}>
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle Status Pie Chart */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">Status dos Veículos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={vehicleChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {vehicleChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-1 gap-2">
            {vehicleChartData.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-300">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Operations Status */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">Status das Operações</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={operationsChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {operationsChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {operationsChartData.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-300">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vehicles in Transit Modal */}
      {showTransitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Veículos em Trânsito</h2>
              <button
                onClick={() => setShowTransitModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {vehiclesInTransit.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                Nenhum veículo em trânsito no momento
              </div>
            ) : (
              <div className="space-y-4">
                {vehiclesInTransit.map((vehicle) => (
                  <div key={`${vehicle.scheduleId}-${vehicle.id}`} className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-orange-500">{vehicle.plate}</h3>
                        <p className="text-sm text-gray-400">{vehicle.scheduleName}</p>
                      </div>
                      <button
                        onClick={() => handleCompleteVehicle(vehicle.scheduleId, vehicle.id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        Marcar como Concluído
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Motorista:</span>
                        <p className="text-white">{vehicle.driver}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Origem:</span>
                        <p className="text-white">{vehicle.origin}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Destinos:</span>
                        <p className="text-white">{vehicle.destinations.join(', ')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;