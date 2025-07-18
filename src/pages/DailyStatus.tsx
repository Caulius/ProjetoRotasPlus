import React, { useState, useMemo } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, Download, Calendar } from 'lucide-react';
import DateSelector from '../components/DateSelector';
import AutocompleteInput from '../components/AutocompleteInput';
import { useFirestoreCollection, saveToFirestore, updateFirestore, deleteFromFirestore } from '../hooks/useFirestore';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

interface StatusRecord {
  id: string;
  operacao: string;
  numero: string;
  industria: string;
  horarioPrev: string;
  placa: string;
  motorista: string;
  origem: string;
  destino: string;
  transporteSAP: string;
  rotas: string;
  peso: string;
  caixas: string;
  responsavel: string;
  inicio: string;
  fim: string;
  palletsRefrig: string;
  palletsSecos: string;
  qtdPallets: string;
  separacao: string;
  observacao: string;
  termoPallet: string;
  cte: string;
  mdfe: string;
  ae: string;
  saidaOrigem: string;
  chegadaDest: string;
  docRelFin: boolean;
  docTermoPallet: boolean;
  docProtoc: boolean;
  docCanhotos: boolean;
  status: 'Pendente' | 'Concluído';
  date: string;
}

interface Driver {
  id: string;
  name: string;
}

interface Vehicle {
  id: string;
  plate: string;
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

interface Responsible {
  id: string;
  name: string;
}

type SortDirection = 'asc' | 'desc' | null;

const DailyStatus: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [selectedWeightRecords, setSelectedWeightRecords] = useState<Set<string>>(new Set());
  
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const { data: records } = useFirestoreCollection<StatusRecord>('daily-status', selectedDate);
  
  // Fetch cadastros data
  const { data: drivers } = useFirestoreCollection<Driver>('drivers');
  const { data: vehicles } = useFirestoreCollection<Vehicle>('vehicles');
  const { data: operations } = useFirestoreCollection<Operation>('operations');
  const { data: industries } = useFirestoreCollection<Industry>('industries');
  const { data: locations } = useFirestoreCollection<Location>('locations');
  const { data: responsibles } = useFirestoreCollection<Responsible>('responsibles');

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

  const operationOptions = operations.map(operation => ({
    id: operation.id,
    label: operation.name,
    value: operation.name
  }));

  const industryOptions = industries.map(industry => ({
    id: industry.id,
    label: industry.name,
    value: industry.name
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

  const responsibleOptions = responsibles.map(responsible => ({
    id: responsible.id,
    label: responsible.name,
    value: responsible.name
  }));

  const addRecord = async () => {
    const newRecord: StatusRecord = {
      id: `${dateStr}-${Date.now()}`,
      date: dateStr,
      operacao: '',
      numero: '',
      industria: '',
      horarioPrev: '',
      placa: '',
      motorista: '',
      origem: '',
      destino: '',
      transporteSAP: '',
      rotas: '',
      peso: '',
      caixas: '',
      responsavel: '',
      inicio: '',
      fim: '',
      palletsRefrig: '',
      palletsSecos: '',
      qtdPallets: '',
      separacao: '',
      observacao: '',
      termoPallet: '',
      cte: '',
      mdfe: '',
      ae: '',
      saidaOrigem: '',
      chegadaDest: '',
      docRelFin: false,
      docTermoPallet: false,
      docProtoc: false,
      docCanhotos: false,
      status: 'Pendente'
    };

    try {
      await saveToFirestore('daily-status', newRecord.id, newRecord);
      toast.success('Registro adicionado!');
    } catch (error) {
      toast.error('Erro ao adicionar registro');
    }
  };

  const removeRecord = async (id: string) => {
    try {
      await deleteFromFirestore('daily-status', id);
      toast.success('Registro removido!');
    } catch (error) {
      toast.error('Erro ao remover registro');
    }
  };

  const updateRecord = async (id: string, field: keyof StatusRecord, value: any) => {
    try {
      const updateData: any = { [field]: value };
      
      // Auto-calculate qtdPallets when pallet fields change
      if (field === 'palletsRefrig' || field === 'palletsSecos') {
        const record = records.find(r => r.id === id);
        if (record) {
          const refrig = field === 'palletsRefrig' ? (parseInt(value) || 0) : (parseInt(record.palletsRefrig) || 0);
          const secos = field === 'palletsSecos' ? (parseInt(value) || 0) : (parseInt(record.palletsSecos) || 0);
          updateData.qtdPallets = (refrig + secos).toString();
        }
      }
      
      await updateFirestore('daily-status', id, updateData);
    } catch (error) {
      console.error('Erro ao atualizar registro:', error);
      toast.error('Erro ao atualizar registro');
    }
  };

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const sortedRecords = useMemo(() => {
    if (!sortColumn || !sortDirection) return records;

    return [...records].sort((a, b) => {
      const aValue = a[sortColumn as keyof StatusRecord];
      const bValue = b[sortColumn as keyof StatusRecord];
      
      // Handle empty values - put them at the end for ascending order
      if (!aValue && !bValue) return 0;
      if (!aValue) return sortDirection === 'asc' ? 1 : -1;
      if (!bValue) return sortDirection === 'asc' ? -1 : 1;
      
      // Handle boolean values
      if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        if (sortDirection === 'asc') {
          return aValue === bValue ? 0 : aValue ? 1 : -1;
        } else {
          return aValue === bValue ? 0 : aValue ? -1 : 1;
        }
      }
      
      // Handle string/number values
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      // Special handling for numeric strings (like "10" should come after "9")
      const aNum = parseFloat(aStr);
      const bNum = parseFloat(bStr);
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        if (sortDirection === 'asc') {
          return aNum - bNum;
        } else {
          return bNum - aNum;
        }
      }
      
      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }, [records, sortColumn, sortDirection]);

  const exportToExcel = async (type: 'daily' | 'monthly') => {
    try {
      let dataToExport: StatusRecord[] = [];
      let filename = '';

      if (type === 'daily') {
        dataToExport = records;
        filename = `Status_Diario_${format(selectedDate, 'dd-MM-yyyy')}.xlsx`;
      } else {
        // Monthly export
        const startDate = startOfMonth(selectedDate);
        const endDate = endOfMonth(selectedDate);
        const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });
        
        // Fetch all records for the month
        const monthlyRecords: StatusRecord[] = [];
        for (const day of daysInMonth) {
          const dayStr = format(day, 'yyyy-MM-dd');
          // This would need to be optimized in a real app to fetch all at once
          // For now, we'll just use the current day's data as an example
          if (dayStr === dateStr) {
            monthlyRecords.push(...records);
          }
        }
        
        dataToExport = monthlyRecords;
        filename = `Status_Mensal_${format(selectedDate, 'MM-yyyy')}.xlsx`;
      }

      // Prepare data for Excel
      const excelData = dataToExport.map(record => ({
        'OPERAÇÃO': record.operacao,
        'INDÚSTRIA': record.industria,
        'HORÁRIO PREV.': record.horarioPrev,
        'PLACA': record.placa,
        'MOTORISTA': record.motorista,
        'ORIGEM': record.origem,
        'DESTINO': record.destino,
        'TRANSPORTE SAP': record.transporteSAP,
        'ROTAS': record.rotas,
        'PESO': record.peso,
        'CAIXAS': record.caixas,
        'RESPONSÁVEL': record.responsavel,
        'INÍCIO': record.inicio,
        'FIM': record.fim,
        'PALLETS REFRIG.': record.palletsRefrig,
        'PALLETS SECOS': record.palletsSecos,
        'QTD PALLETS': record.qtdPallets,
        'SEPARAÇÃO': record.separacao,
        'OBSERVAÇÃO': record.observacao,
        'TERMO PALLET': record.termoPallet,
        'CTE': record.cte,
        'MDFE': record.mdfe,
        'AE': record.ae,
        'SAÍDA ORIGEM': record.saidaOrigem,
        'CHEGADA DEST.': record.chegadaDest,
        'DOC. REL. FIN.': record.docRelFin ? 'Sim' : 'Não',
        'DOC. TERMO PALLET': record.docTermoPallet ? 'Sim' : 'Não',
        'DOC PROTOC.': record.docProtoc ? 'Sim' : 'Não',
        'DOC CANHOTOS': record.docCanhotos ? 'Sim' : 'Não',
        'STATUS': record.status,
        'DATA': record.date
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Status');

      // Save file
      XLSX.writeFile(wb, filename);
      
      toast.success(`Relatório ${type === 'daily' ? 'diário' : 'mensal'} exportado com sucesso!`);
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro ao exportar relatório');
    }
  };

  // Calculate weight totals
  const calculateWeightTotals = () => {
    const selectedRecords = records.filter(record => selectedWeightRecords.has(record.id));
    
    const totalWeight = selectedRecords.reduce((sum, record) => {
      const weight = parseFloat(record.peso.replace(/\./g, '').replace(',', '.')) || 0;
      return sum + weight;
    }, 0);

    // Weight by industry for all records (not just selected)
    const weightByIndustry = records.reduce((acc, record) => {
      if (record.industria) {
        const weight = parseFloat(record.peso.replace(/\./g, '').replace(',', '.')) || 0;
        acc[record.industria] = (acc[record.industria] || 0) + weight;
      }
      return acc;
    }, {} as Record<string, number>);

    return { totalWeight, weightByIndustry };
  };

  const { totalWeight, weightByIndustry } = calculateWeightTotals();

  const toggleWeightSelection = (recordId: string) => {
    const newSelection = new Set(selectedWeightRecords);
    if (newSelection.has(recordId)) {
      newSelection.delete(recordId);
    } else {
      newSelection.add(recordId);
    }
    setSelectedWeightRecords(newSelection);
  };

  const formatWeight = (weight: number) => {
    return weight.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const columns = [
    { key: 'operacao', label: 'OPERAÇÃO', minWidth: 150, type: 'autocomplete', options: operationOptions },
    { key: 'numero', label: 'Nº', minWidth: 80 },
    { key: 'industria', label: 'INDÚSTRIA', minWidth: 150, type: 'autocomplete', options: industryOptions },
    { key: 'horarioPrev', label: 'HORÁRIO PREV.', minWidth: 130, type: 'time' },
    { key: 'placa', label: 'PLACA', minWidth: 100, type: 'autocomplete', options: vehicleOptions },
    { key: 'motorista', label: 'MOTORISTA', minWidth: 150, type: 'autocomplete', options: driverOptions },
    { key: 'origem', label: 'ORIGEM', minWidth: 150, type: 'autocomplete', options: originOptions },
    { key: 'destino', label: 'DESTINO', minWidth: 150, type: 'autocomplete', options: destinationOptions },
    { key: 'transporteSAP', label: 'TRANSPORTE SAP', minWidth: 150 },
    { key: 'rotas', label: 'ROTAS', minWidth: 200 },
    { key: 'peso', label: 'PESO', minWidth: 100, hasFlag: true },
    { key: 'caixas', label: 'CAIXAS', minWidth: 100 },
    { key: 'responsavel', label: 'RESPONSÁVEL', minWidth: 150, type: 'autocomplete', options: responsibleOptions },
    { key: 'inicio', label: 'INÍCIO', minWidth: 120, type: 'time' },
    { key: 'fim', label: 'FIM', minWidth: 120, type: 'time' },
    { key: 'palletsRefrig', label: 'PALLETS REFRIG.', minWidth: 130, type: 'number' },
    { key: 'palletsSecos', label: 'PALLETS SECOS', minWidth: 130, type: 'number' },
    { key: 'qtdPallets', label: 'QTD PALLETS', minWidth: 120, calculated: true },
    { key: 'separacao', label: 'SEPARAÇÃO', minWidth: 130 },
    { key: 'observacao', label: 'OBSERVAÇÃO', minWidth: 200 },
    { key: 'termoPallet', label: 'TERMO PALLET', minWidth: 130 },
    { key: 'cte', label: 'CTE', minWidth: 100 },
    { key: 'mdfe', label: 'MDFE', minWidth: 100 },
    { key: 'ae', label: 'AE', minWidth: 100 },
    { key: 'saidaOrigem', label: 'ORIGEM', minWidth: 160, type: 'datetime-local' },
    { key: 'chegadaDest', label: 'DESTINO', minWidth: 160, type: 'datetime-local' },
    { key: 'docRelFin', label: 'DOC. REL. FIN.', minWidth: 130, type: 'checkbox' },
    { key: 'docTermoPallet', label: 'DOC. TERMO PALLET', minWidth: 170, type: 'checkbox' },
    { key: 'docProtoc', label: 'DOC PROTOC.', minWidth: 120, type: 'checkbox' },
    { key: 'docCanhotos', label: 'DOC CANHOTOS', minWidth: 140, type: 'checkbox' },
    { key: 'status', label: 'STATUS', minWidth: 120, type: 'select', options: ['Pendente', 'Concluído'] }
  ];

  return (
    <div className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6 gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          <h1 className="text-3xl font-bold text-white">Status Diário</h1>
          
          {/* Weight Information Panel */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-semibold text-orange-500 mb-2">Informações de Peso</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Selected Weight Info */}
              <div>
                <p className="text-orange-500 font-medium mb-2">Peso Selecionado:</p>
                {selectedWeightRecords.size > 0 ? (
                  <div>
                    <p className="text-gray-300 text-sm">
                      <span className="font-medium">Total:</span> {formatWeight(totalWeight)} kg
                    </p>
                    <p className="text-gray-400 text-xs">
                      ({selectedWeightRecords.size} registro{selectedWeightRecords.size !== 1 ? 's' : ''})
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">Selecione registros na coluna PESO</p>
                )}
              </div>
              
              {/* Weight by Industry - Always visible */}
              <div>
                <p className="text-orange-500 font-medium mb-2">Peso por Indústria:</p>
                {Object.keys(weightByIndustry).length > 0 ? (
                  <div className="space-y-1">
                    {Object.entries(weightByIndustry).map(([industry, weight]) => (
                      <p key={industry} className="text-gray-300 text-sm">
                        <span className="font-medium">{industry}:</span> {formatWeight(weight)} kg
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">Nenhum peso informado</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
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
            <button
              onClick={addRecord}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Adicionar</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto max-h-[70vh]">
          <table className="w-full text-sm">
            <colgroup>
              <col style={{ width: '48px' }} />
              {columns.map((column) => (
                <col key={column.key} style={{ minWidth: column.minWidth }} />
              ))}
            </colgroup>
            <thead className="bg-gray-700 sticky top-0 z-10">
              <tr>
                <th className="w-12 px-2 py-3 text-orange-500 font-semibold">Ações</th>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="text-left py-3 px-2 text-orange-500 font-semibold border-l border-gray-600 cursor-pointer hover:bg-gray-600 transition-colors whitespace-nowrap"
                    style={{ minWidth: column.minWidth }}
                    onClick={() => handleSort(column.key)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.label}</span>
                      {sortColumn === column.key && (
                        <div className="flex flex-col">
                          {sortDirection === 'asc' ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedRecords.map((record, index) => (
                <tr key={record.id} className="border-b border-gray-700 hover:bg-gray-750">
                  <td className="px-2 py-2">
                    <button
                      onClick={() => removeRecord(record.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                  {columns.map((column) => (
                    <td key={column.key} className="py-2 px-2 border-l border-gray-700">
                      {column.hasFlag ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedWeightRecords.has(record.id)}
                            onChange={() => toggleWeightSelection(record.id)}
                            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            value={record[column.key as keyof StatusRecord] as string}
                            onChange={(e) => updateRecord(record.id, column.key as keyof StatusRecord, e.target.value)}
                            className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs focus:border-orange-500"
                          />
                        </div>
                      ) : column.calculated ? (
                        <span className="text-gray-300 whitespace-nowrap">
                          {((parseInt(record.palletsRefrig) || 0) + (parseInt(record.palletsSecos) || 0)).toString()}
                        </span>
                      ) : column.type === 'checkbox' ? (
                        <input
                          type="checkbox"
                          checked={record[column.key as keyof StatusRecord] as boolean}
                          onChange={(e) => updateRecord(record.id, column.key as keyof StatusRecord, e.target.checked)}
                          className="w-4 h-4 text-orange-600 bg-gray-700 border-gray-600 rounded focus:ring-orange-500"
                        />
                      ) : column.type === 'select' ? (
                        <select
                          value={record[column.key as keyof StatusRecord] as string}
                          onChange={(e) => updateRecord(record.id, column.key as keyof StatusRecord, e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs focus:border-orange-500"
                        >
                          {column.options?.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : column.type === 'autocomplete' ? (
                        <AutocompleteInput
                          value={record[column.key as keyof StatusRecord] as string}
                          onChange={(value) => updateRecord(record.id, column.key as keyof StatusRecord, value)}
                          options={column.options || []}
                          placeholder=""
                          className="w-full"
                        />
                      ) : (
                        <input
                          type={column.type || 'text'}
                          value={record[column.key as keyof StatusRecord] as string}
                          onChange={(e) => updateRecord(record.id, column.key as keyof StatusRecord, e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs focus:border-orange-500"
                        />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {records.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>Nenhum registro encontrado. Clique em "Adicionar" para criar um novo registro.</p>
        </div>
      )}
    </div>
  );
};

export default DailyStatus;
