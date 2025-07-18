import React, { useState } from 'react';
import { Upload, Check, X } from 'lucide-react';
import DateSelector from '../components/DateSelector';
import { saveToFirestore } from '../hooks/useFirestore';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface ImportData {
  transporteSAP: string;
  rotas: string;
  peso: string;
  caixas: string;
}

const Import: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [pastedData, setPastedData] = useState('');
  const [parsedData, setParsedData] = useState<ImportData[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const handlePaste = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const data = e.target.value;
    setPastedData(data);
    
    if (data.trim()) {
      parseData(data);
    } else {
      setParsedData([]);
      setShowPreview(false);
    }
  };

  const parseData = (data: string) => {
    try {
      const lines = data.trim().split('\n');
      const parsed: ImportData[] = [];

      lines.forEach((line, index) => {
        if (index === 0) return; // Skip header
        
        const columns = line.split('\t');
        if (columns.length >= 4) {
          parsed.push({
            transporteSAP: columns[0]?.trim() || '',
            rotas: columns[1]?.trim() || '',
            peso: columns[2]?.trim() || '',
            caixas: columns[3]?.trim() || ''
          });
        }
      });

      setParsedData(parsed);
      setShowPreview(parsed.length > 0);
    } catch (error) {
      toast.error('Erro ao processar os dados. Verifique o formato.');
      setParsedData([]);
      setShowPreview(false);
    }
  };

  const handleImport = async () => {
    if (parsedData.length === 0) {
      toast.error('Nenhum dado para importar');
      return;
    }

    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      // Import each record to Daily Status
      for (const [index, item] of parsedData.entries()) {
        const recordId = `${dateStr}-${Date.now()}-${index}`;
        const statusRecord = {
          id: recordId,
          date: dateStr,
          transporteSAP: item.transporteSAP,
          rotas: item.rotas,
          peso: item.peso,
          caixas: item.caixas,
          // Initialize other fields as empty
          operacao: '',
          numero: '',
          industria: '',
          horarioPrev: '',
          placa: '',
          motorista: '',
          origem: '',
          destino: '',
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
        
        await saveToFirestore('daily-status', recordId, statusRecord);
      }
      
      toast.success(`${parsedData.length} registros importados com sucesso!`);
      
      // Clear form
      setPastedData('');
      setParsedData([]);
      setShowPreview(false);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Erro ao importar dados');
    }
  };

  const clearData = () => {
    setPastedData('');
    setParsedData([]);
    setShowPreview(false);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <h1 className="text-3xl font-bold text-white mb-4 lg:mb-0">Importação</h1>
        <DateSelector
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />
      </div>

      <div className="space-y-6">
        {/* Instructions */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-3">Instruções</h2>
          <p className="text-gray-300 mb-4">
            Cole os dados no formato Excel com as seguintes colunas separadas por TAB:
          </p>
          <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
            <div className="text-orange-500 font-semibold">Transporte SAP | ROTAS | PESO | Caixas</div>
            <div className="text-gray-400 mt-2">52736285 | RAH8604-SC / BOA MESA | 4.965,30 | 1.295</div>
          </div>
        </div>

        {/* Import Area */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center space-x-2 mb-4">
            <Upload className="h-6 w-6 text-orange-500" />
            <h2 className="text-xl font-semibold text-white">Área de Importação</h2>
          </div>

          <textarea
            value={pastedData}
            onChange={handlePaste}
            placeholder="Cole aqui os dados do Excel..."
            className="w-full h-40 bg-gray-900 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 resize-none font-mono text-sm"
          />

          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={clearData}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
              <span>Limpar</span>
            </button>
            <button
              onClick={handleImport}
              disabled={parsedData.length === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <Check className="h-4 w-4" />
              <span>Confirmar Importação</span>
            </button>
          </div>
        </div>

        {/* Preview Table */}
        {showPreview && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">
              Pré-visualização ({parsedData.length} registros)
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-3 px-4 text-orange-500 font-semibold">Transporte SAP</th>
                    <th className="text-left py-3 px-4 text-orange-500 font-semibold">Rotas</th>
                    <th className="text-left py-3 px-4 text-orange-500 font-semibold">Peso</th>
                    <th className="text-left py-3 px-4 text-orange-500 font-semibold">Caixas</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.map((row, index) => (
                    <tr key={index} className="border-b border-gray-700 hover:bg-gray-700">
                      <td className="py-3 px-4 text-white">{row.transporteSAP}</td>
                      <td className="py-3 px-4 text-gray-300">{row.rotas}</td>
                      <td className="py-3 px-4 text-gray-300">{row.peso}</td>
                      <td className="py-3 px-4 text-gray-300">{row.caixas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Import;