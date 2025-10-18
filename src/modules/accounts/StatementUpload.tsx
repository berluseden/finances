import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useUploadStatement } from './hooks/useStatements';
import { useAccount } from './hooks/useAccounts';
import { Upload, FileText, X, AlertCircle, Loader2, Sparkles } from 'lucide-react';

interface StatementUploadProps {
  accountId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function StatementUpload({ accountId, onClose, onSuccess }: StatementUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadStatement();
  const { data: account } = useAccount(accountId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      toast.error('Por favor selecciona un archivo PDF válido');
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error('Por favor selecciona un archivo PDF');
      return;
    }

    const uploadToast = toast.loading('Subiendo estado de cuenta...');

    try {
      setExtracting(true);
      
      // Llamar al hook con useAI=true para extraer datos automáticamente
      const result = await uploadMutation.mutateAsync({
        accountId,
        file,
        useAI: true, // Activar extracción con OpenAI
      });

      console.log('✅ Statement subido:', result);
      
      toast.dismiss(uploadToast);
      
      if (result.aiExtracted) {
        toast.success(`Estado de cuenta procesado con IA (Confianza: ${result.extractedData?.confidence})`, {
          duration: 5000,
        });
      } else {
        toast.success('Estado de cuenta subido correctamente');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error uploading statement:', error);
      toast.dismiss(uploadToast);
      toast.error('Error al subir el estado de cuenta. Inténtalo de nuevo.');
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Subir Estado de Cuenta
              </CardTitle>
              <CardDescription>
                Solo sube el PDF, las fechas se calculan automáticamente
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload Area */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              
              {file ? (
                <div className="border-2 border-green-500 bg-green-50 dark:bg-green-950/20 rounded-lg p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                      <FileText className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-green-900 dark:text-green-100">
                        {file.name}
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFile(null)}
                      className="text-green-700 hover:text-green-900 dark:text-green-300 dark:hover:text-green-100"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleButtonClick}
                  className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all duration-200 cursor-pointer group"
                >
                  <Upload className="w-16 h-16 text-gray-400 group-hover:text-purple-500 mx-auto mb-4 transition-colors" />
                  <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                    Haz clic para seleccionar el PDF
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    o arrastra y suelta el archivo aquí
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    Solo archivos PDF (máximo 10 MB)
                  </p>
                </button>
              )}
            </div>

            {/* Información Calculada Automáticamente */}
            {account && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                      🤖 Extracción automática con IA:
                    </p>
                    <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                      <li>
                        📅 <strong>Fechas de corte y vencimiento</strong>
                      </li>
                      <li>
                        💰 <strong>Saldos en DOP y USD</strong>
                      </li>
                      <li>
                        💳 <strong>Pagos mínimos</strong>
                      </li>
                      <li>
                        � <strong>Resumen de transacciones</strong>
                      </li>
                      <li>
                        ✨ <strong>Recomendaciones financieras personalizadas</strong>
                      </li>
                    </ul>
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                      Solo sube el PDF y la IA extraerá toda la información automáticamente
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={uploadMutation.isPending}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!file || uploadMutation.isPending || extracting}
                className="flex-1"
              >
                {uploadMutation.isPending || extracting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {extracting ? 'Extrayendo datos con IA...' : 'Subiendo...'}
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Subir Estado de Cuenta
                  </>
                )}
              </Button>
            </div>

            {/* Status Messages */}
            {uploadMutation.isError && (
              <div className="flex items-start gap-2 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                    Error al subir el estado de cuenta
                  </p>
                  <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                    Por favor, inténtalo de nuevo. Si el problema persiste, contacta con soporte.
                  </p>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}